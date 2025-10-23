const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Temporary directory for LaTeX compilation
const TEMP_DIR = '/tmp/latex';

// Ensure temp directory exists
(async () => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating temp directory:', err);
  }
})();

// Get the LaTeX template
async function getTemplate() {
  const templatePath = path.join(__dirname, 'template.tex');
  return await fs.readFile(templatePath, 'utf-8');
}

// Compile LaTeX to PDF
async function compileLaTeX(texContent, jobId) {
  const workDir = path.join(TEMP_DIR, jobId);
  await fs.mkdir(workDir, { recursive: true });
  
  const texFile = path.join(workDir, 'document.tex');
  const pdfFile = path.join(workDir, 'document.pdf');
  
  // Write the .tex file
  await fs.writeFile(texFile, texContent);
  
  // Compile with pdflatex (run twice for references)
  try {
    await execAsync(`cd ${workDir} && pdflatex -interaction=nonstopmode document.tex`, {
      timeout: 30000
    });
    await execAsync(`cd ${workDir} && pdflatex -interaction=nonstopmode document.tex`, {
      timeout: 30000
    });
    
    // Check if PDF was created
    await fs.access(pdfFile);
    
    return {
      success: true,
      pdfPath: pdfFile,
      jobId
    };
  } catch (error) {
    // Read log file for error details
    let logContent = '';
    try {
      const logFile = path.join(workDir, 'document.log');
      logContent = await fs.readFile(logFile, 'utf-8');
    } catch (e) {
      // Log file might not exist
    }
    
    return {
      success: false,
      error: error.message,
      log: logContent
    };
  }
}

// Parse exercises from content by finding \exercisetitle{} boundaries
function parseExercises(content) {
  // Find all \exercisetitle occurrences
  const exerciseTitleRegex = /\\exercisetitle\{[^}]*\}/g;
  const matches = [];
  let match;
  
  while ((match = exerciseTitleRegex.exec(content)) !== null) {
    matches.push({
      index: match.index,
      text: match[0]
    });
  }
  
  if (matches.length === 0) {
    return [];
  }
  
  // Split content into individual exercises
  const exercises = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
    const exerciseContent = content.substring(start, end).trim();
    
    exercises.push({
      number: i + 1,
      content: exerciseContent
    });
  }
  
  return exercises;
}

// Create a complete LaTeX document for a single exercise
function compileExerciseWithTemplate(exerciseContent, template, sheetNumber) {
  // Inject exercise content into template
  const fullDocument = template
    .replace('% Content will be inserted here by the editor', exerciseContent)
    .replace('\\newcommand{\\exercisenum}{X}', `\\newcommand{\\exercisenum}{${sheetNumber}}`);
  
  return fullDocument;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Get template
app.get('/api/template', async (req, res) => {
  try {
    const template = await getTemplate();
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load template' });
  }
});

// Compile LaTeX
app.post('/api/compile', async (req, res) => {
  const { content, sheetNumber } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }
  
  const jobId = uuidv4();
  const sheetNum = sheetNumber || 1;
  
  try {
    const result = await compileLaTeX(content, jobId);
    
    if (result.success) {
      // Read the PDF file and send it
      const pdfBuffer = await fs.readFile(result.pdfPath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=sheet_${sheetNum}.pdf`,
        'Content-Length': pdfBuffer.length
      });
      
      res.send(pdfBuffer);
      
      // Cleanup after sending
      setTimeout(async () => {
        try {
          await fs.rm(path.join(TEMP_DIR, jobId), { recursive: true, force: true });
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }, 5000);
    } else {
      res.status(400).json({
        error: 'Compilation failed',
        details: result.error,
        log: result.log
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Split and compile individual exercises as zip
app.post('/api/compile-split', async (req, res) => {
  const { content, sheetNumber } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }
  
  const sheetNum = sheetNumber || 1;
  const jobId = uuidv4();
  const workDir = path.join(TEMP_DIR, jobId);
  
  try {
    await fs.mkdir(workDir, { recursive: true });
    
    // Get template
    const template = await getTemplate();
    
    // Parse exercises from content
    const exercises = parseExercises(content);
    
    if (exercises.length === 0) {
      return res.status(400).json({ 
        error: 'No exercises found',
        details: 'No \\exercisetitle{} commands found in the content'
      });
    }
    
    const pdfPaths = [];
    
    // Compile each exercise separately
    for (const exercise of exercises) {
      const exerciseJobId = `${jobId}_ex${exercise.number}`;
      const exerciseDoc = compileExerciseWithTemplate(exercise.content, template, sheetNum);
      
      const result = await compileLaTeX(exerciseDoc, exerciseJobId);
      
      if (result.success) {
        const filename = `sheet_${sheetNum}_exercise_${exercise.number}.pdf`;
        const targetPath = path.join(workDir, filename);
        
        // Copy PDF to work directory with proper name
        await fs.copyFile(result.pdfPath, targetPath);
        pdfPaths.push({ filename, path: targetPath });
      } else {
        console.error(`Failed to compile exercise ${exercise.number}:`, result.error);
        // Continue with other exercises
      }
    }
    
    if (pdfPaths.length === 0) {
      return res.status(400).json({ 
        error: 'Compilation failed',
        details: 'All exercises failed to compile'
      });
    }
    
    // Create zip file
    const zipFilename = `sheet_${sheetNum}_exercises.zip`;
    const zipPath = path.join(workDir, zipFilename);
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Handle zip completion
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      
      archive.pipe(output);
      
      // Add each PDF to the zip
      for (const pdf of pdfPaths) {
        archive.file(pdf.path, { name: pdf.filename });
      }
      
      archive.finalize();
    });
    
    // Read the zip file and send it
    const zipBuffer = await fs.readFile(zipPath);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${zipFilename}`,
      'Content-Length': zipBuffer.length
    });
    
    res.send(zipBuffer);
    
    // Cleanup after sending
    setTimeout(async () => {
      try {
        await fs.rm(path.join(TEMP_DIR, jobId), { recursive: true, force: true });
        // Clean up individual exercise directories
        for (const exercise of exercises) {
          await fs.rm(path.join(TEMP_DIR, `${jobId}_ex${exercise.number}`), { recursive: true, force: true });
        }
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }, 5000);
    
  } catch (error) {
    console.error('Split compilation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
