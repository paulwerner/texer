import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { FileDown, Play, Code, Eye } from 'lucide-react';
import axios from 'axios';

const LATEX_COMMANDS = {
  '\\BigO{}': { label: 'Big O', description: 'O(n)' },
  '\\BigOmega{}': { label: 'Big Omega', description: 'Ω(n)' },
  '\\BigTheta{}': { label: 'Big Theta', description: 'Θ(n)' },
  '\\floor{}': { label: 'Floor', description: '⌊x⌋' },
  '\\ceil{}': { label: 'Ceiling', description: '⌈x⌉' },
  '\\abs{}': { label: 'Absolute', description: '|x|' },
  '\\set{}': { label: 'Set', description: '{1,2,3}' },
  '\\card{}': { label: 'Cardinality', description: '|A|' },
  '$x \\gets y$': { label: 'Assignment', description: 'x ← y' },
  '$\\AND$': { label: 'Logical AND', description: '∧' },
  '$\\OR$': { label: 'Logical OR', description: '∨' },
  '$\\NOT$': { label: 'Logical NOT', description: '¬' },
  '\\N': { label: 'Natural Numbers', description: 'ℕ' },
  '\\Z': { label: 'Integers', description: 'ℤ' },
  '\\R': { label: 'Real Numbers', description: 'ℝ' },
  '\\TRUE': { label: 'True', description: 'TRUE' },
  '\\FALSE': { label: 'False', description: 'FALSE' },
  '\\exercisetitle{}': { label: 'Exercise Title', description: 'Start new exercise' },
  '\\exercisepart{}': { label: 'Exercise Part', description: 'Part (a)' },
};

const ALGORITHM_TEMPLATE = `
\\begin{algorithm}
\\caption{Algorithm Name}\\label{alg:label}
\\begin{algorithmic}[1]
\\Require Input specification
\\Ensure Output specification
\\State $x \\gets 0$
\\While{$condition$}
    \\State do something
\\EndWhile
\\State \\Return $x$
\\end{algorithmic}
\\end{algorithm}
`;

function LatexEditor() {
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [exerciseNumber, setExerciseNumber] = useState(1);
  const editorRef = useRef(null);
  const compileTimeoutRef = useRef(null);
  const hasInitiallyCompiled = useRef(false);
  const previousPdfUrl = useRef(null);

  const loadTemplate = async () => {
    try {
      const response = await axios.get('/api/template');
      setTemplate(response.data.template);
      
      // Initialize with a basic exercise structure
      const initialContent = `
\\exercisetitle{Exercise 1: Your Title Here}

\\exercisepart{Part (a)}

\\textbf{Problem:} State your problem here.

\\textbf{Solution:}

Write your solution here. You can use inline math like $\\BigO{n \\log n}$ or display math:

\\[
    T(n) = 2T\\left(\\frac{n}{2}\\right) + \\BigO{n}
\\]
`;
      setContent(initialContent);
    } catch (err) {
      setError('Failed to load template');
      console.error(err);
    }
  };

  const compileLatex = useCallback(async () => {
    // Don't compile if template hasn't loaded yet
    if (!template || template.length === 0) {
      console.log('Template not loaded yet, skipping compilation');
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      // Inject content into template
      const fullDocument = template.replace(
        '% Content will be inserted here by the editor',
        content
      ).replace(
        '\\newcommand{\\exercisenum}{1}',
        `\\newcommand{\\exercisenum}{${exerciseNumber}}`
      );

      const response = await axios.post('/api/compile', {
        content: fullDocument
      }, {
        responseType: 'blob'
      });

      // Create blob URL for PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      
      // Revoke old URL if exists
      if (previousPdfUrl.current) {
        URL.revokeObjectURL(previousPdfUrl.current);
      }
      
      previousPdfUrl.current = url;
      setPdfUrl(url);
    } catch (err) {
      let errorMessage = 'Compilation failed';
      
      // Handle blob error responses
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error('LaTeX compilation details:', errorData.details);
          }
        } catch (e) {
          // If parsing fails, use default message
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      console.error('Compilation error:', err);
    } finally {
      setIsCompiling(false);
    }
  }, [template, content, exerciseNumber]);

  // Load template on mount
  useEffect(() => {
    loadTemplate();
  }, []);

  // Auto-compile on content change
  useEffect(() => {
    if (content && content.length > 50) {
      // Clear existing timeout
      if (compileTimeoutRef.current) {
        clearTimeout(compileTimeoutRef.current);
      }

      // Set new timeout for auto-compile
      compileTimeoutRef.current = setTimeout(() => {
        compileLatex();
      }, 2000); // Wait 2 seconds after user stops typing
    }

    return () => {
      if (compileTimeoutRef.current) {
        clearTimeout(compileTimeoutRef.current);
      }
    };
  }, [content, compileLatex]);

  // Initial compilation after template and content are loaded
  useEffect(() => {
    // Trigger initial compilation once template and content are both loaded
    if (template && content && !hasInitiallyCompiled.current) {
      hasInitiallyCompiled.current = true;
      const timer = setTimeout(() => {
        compileLatex();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [template, content, compileLatex]);

  const insertCommand = (command) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;

    const newText = text.substring(0, start) + command + text.substring(end);
    setContent(newText);

    // Set cursor position after inserted command
    setTimeout(() => {
      const cursorPos = start + command.length - 1; // Position before closing brace
      textarea.setSelectionRange(cursorPos, cursorPos);
      textarea.focus();
    }, 0);
  };

  const insertAlgorithm = () => {
    insertCommand(ALGORITHM_TEMPLATE);
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `exercise_${exerciseNumber}.pdf`;
    link.click();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">TeXer Exercise Editor</h1>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Exercise Sheet #:</label>
                <input
                  type="number"
                  min="1"
                  value={exerciseNumber}
                  onChange={(e) => setExerciseNumber(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 bg-input border border-border rounded text-sm text-foreground focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <Code className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Editor Only' : 'Show Preview'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={compileLatex}
                disabled={isCompiling}
              >
                <Play className="w-4 h-4 mr-2" />
                {isCompiling ? 'Compiling...' : 'Compile'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={downloadPDF}
                disabled={!pdfUrl}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Command Toolbar */}
      <div className="bg-card border-b border-border overflow-x-auto scrollbar-thin">
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(LATEX_COMMANDS).map(([cmd, info]) => (
              <Button
                key={cmd}
                variant="ghost"
                size="sm"
                onClick={() => insertCommand(cmd)}
                className="text-xs"
                title={info.description}
              >
                {info.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={insertAlgorithm}
              className="text-xs"
            >
              Algorithm Block
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-screen-2xl mx-auto p-4 flex gap-4">
          {/* Editor */}
          <Card className={`flex-1 flex flex-col ${showPreview ? 'w-1/2' : 'w-full'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">LaTeX Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full px-4 py-2 font-mono text-sm bg-card text-foreground border-none outline-none resize-none scrollbar-thin"
                placeholder="Start writing your exercise solution..."
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="flex-1 w-1/2 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  PDF Preview
                  {isCompiling && <span className="text-sm text-muted-foreground ml-2">(Compiling...)</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive text-sm border-l-4 border-destructive">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {pdfUrl && !error && (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                )}
                {!pdfUrl && !error && !isCompiling && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Preview will appear here</p>
                      <p className="text-sm mt-2">Write some content and wait 2 seconds for auto-compile</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default LatexEditor;
