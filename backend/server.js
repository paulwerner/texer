const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

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
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }
  
  const jobId = uuidv4();
  
  try {
    const result = await compileLaTeX(content, jobId);
    
    if (result.success) {
      // Read the PDF file and send it
      const pdfBuffer = await fs.readFile(result.pdfPath);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=document.pdf',
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

// Split and compile individual exercises
app.post('/api/compile-exercises', async (req, res) => {
  const { content, exerciseNumbers } = req.body;
  
  if (!content || !Array.isArray(exerciseNumbers)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const jobId = uuidv4();
  const results = [];
  
  for (const exerciseNum of exerciseNumbers) {
    try {
      // Extract exercise content (simplified - you may need more sophisticated parsing)
      const exerciseRegex = new RegExp(
        `\\\\exercisetitle\\{Exercise ${exerciseNum}:.*?\\}([\\s\\S]*?)(?=\\\\exercisetitle|\\\\end\\{document\\})`,
        'i'
      );
      
      const match = content.match(exerciseRegex);
      if (!match) continue;
      
      // Create a document with just this exercise
      const singleExerciseContent = content.replace(
        /\\exercisetitle\{Exercise \d+:.*?\}[\s\S]*?(?=\\end{document})/gi,
        `\\exercisetitle{Exercise ${exerciseNum}:${match[0].split(':')[1].split('}')[0]}}${match[1]}`
      );
      
      const result = await compileLaTeX(singleExerciseContent, `${jobId}_ex${exerciseNum}`);
      
      if (result.success) {
        const pdfBuffer = await fs.readFile(result.pdfPath);
        results.push({
          exerciseNumber: exerciseNum,
          pdf: pdfBuffer.toString('base64')
        });
      }
    } catch (error) {
      console.error(`Error compiling exercise ${exerciseNum}:`, error);
    }
  }
  
  res.json({ results });
  
  // Cleanup
  setTimeout(async () => {
    try {
      for (const exerciseNum of exerciseNumbers) {
        await fs.rm(path.join(TEMP_DIR, `${jobId}_ex${exerciseNum}`), { recursive: true, force: true });
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }, 5000);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
