import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { FileDown, Play, Code, Eye, ChevronDown, PlayCircle, Check, FileText, ClipboardCheck } from 'lucide-react';
import axios from 'axios';
import CommandAutocomplete from './CommandAutocomplete';

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

const MULTILINE_FUNCTION_TEMPLATE = `
\\begin{multilinefunction}[label]
    T(n) = \\begin{cases}
        \\Theta(1) & \\text{if } n = 1\\\\
        f(n) & \\text{if } n > 1
    \\end{cases}
\\end{multilinefunction}
`;

// Enhanced commands with keywords, symbols, and math mode requirements
const LATEX_COMMANDS = {
  // Math-mode commands (require $ $ or \[ \])
  '\\BigO{}': { 
    label: 'Big O', 
    description: 'O(n) complexity notation',
    keywords: ['bigo', 'complexity', 'time', 'big', 'o'],
    symbol: '⊙',
    requiresMathMode: true
  },
  '\\BigOmega{}': { 
    label: 'Big Omega', 
    description: 'Ω(n) lower bound',
    keywords: ['bigomega', 'omega', 'complexity', 'lower'],
    symbol: 'Ω',
    requiresMathMode: true
  },
  '\\BigTheta{}': { 
    label: 'Big Theta', 
    description: 'Θ(n) tight bound',
    keywords: ['bigtheta', 'theta', 'complexity', 'tight'],
    symbol: 'Θ',
    requiresMathMode: true
  },
  '\\floor{}': { 
    label: 'Floor', 
    description: '⌊x⌋ round down',
    keywords: ['floor', 'round', 'down'],
    symbol: '⌊⌋',
    requiresMathMode: true
  },
  '\\ceil{}': { 
    label: 'Ceiling', 
    description: '⌈x⌉ round up',
    keywords: ['ceil', 'ceiling', 'round', 'up'],
    symbol: '⌈⌉',
    requiresMathMode: true
  },
  '\\abs{}': { 
    label: 'Absolute Value', 
    description: '|x| absolute value',
    keywords: ['abs', 'absolute', 'value'],
    symbol: '|x|',
    requiresMathMode: true
  },
  '\\set{}': { 
    label: 'Set', 
    description: '{1,2,3} set notation',
    keywords: ['set', 'collection'],
    symbol: '{ }',
    requiresMathMode: true
  },
  '\\card{}': { 
    label: 'Cardinality', 
    description: '|A| set cardinality',
    keywords: ['card', 'cardinality', 'size'],
    symbol: '|A|',
    requiresMathMode: true
  },
  'x \\gets y': { 
    label: 'Assignment', 
    description: 'x ← y assignment',
    keywords: ['assignment', 'gets', 'assign', 'arrow'],
    symbol: '←',
    requiresMathMode: true
  },
  '\\AND': { 
    label: 'Logical AND', 
    description: '∧ logical and',
    keywords: ['and', 'logical', 'conjunction'],
    symbol: '∧',
    requiresMathMode: true
  },
  '\\OR': { 
    label: 'Logical OR', 
    description: '∨ logical or',
    keywords: ['or', 'logical', 'disjunction'],
    symbol: '∨',
    requiresMathMode: true
  },
  '\\NOT': { 
    label: 'Logical NOT', 
    description: '¬ logical not',
    keywords: ['not', 'logical', 'negation'],
    symbol: '¬',
    requiresMathMode: true
  },
  '\\N': { 
    label: 'Natural Numbers', 
    description: 'ℕ natural numbers',
    keywords: ['natural', 'numbers', 'n', 'positive'],
    symbol: 'ℕ',
    requiresMathMode: true
  },
  '\\Z': { 
    label: 'Integers', 
    description: 'ℤ integers',
    keywords: ['integers', 'z', 'whole'],
    symbol: 'ℤ',
    requiresMathMode: true
  },
  '\\R': { 
    label: 'Real Numbers', 
    description: 'ℝ real numbers',
    keywords: ['real', 'numbers', 'r'],
    symbol: 'ℝ',
    requiresMathMode: true
  },
  '\\TRUE': { 
    label: 'True', 
    description: 'TRUE boolean value',
    keywords: ['true', 'boolean', 'bool'],
    symbol: '⊤',
    requiresMathMode: true
  },
  '\\FALSE': { 
    label: 'False', 
    description: 'FALSE boolean value',
    keywords: ['false', 'boolean', 'bool'],
    symbol: '⊥',
    requiresMathMode: true
  },
  
  // Comparison operators
  '\\leq': {
    label: 'Less or Equal',
    description: '≤ less than or equal to',
    keywords: ['leq', 'less', 'equal', 'le'],
    symbol: '≤',
    requiresMathMode: true
  },
  '\\geq': {
    label: 'Greater or Equal',
    description: '≥ greater than or equal to',
    keywords: ['geq', 'greater', 'equal', 'ge'],
    symbol: '≥',
    requiresMathMode: true
  },
  '\\neq': {
    label: 'Not Equal',
    description: '≠ not equal to',
    keywords: ['neq', 'not', 'equal', 'ne'],
    symbol: '≠',
    requiresMathMode: true
  },
  '\\approx': {
    label: 'Approximately',
    description: '≈ approximately equal',
    keywords: ['approx', 'approximately', 'about'],
    symbol: '≈',
    requiresMathMode: true
  },
  '\\equiv': {
    label: 'Equivalent',
    description: '≡ equivalent to',
    keywords: ['equiv', 'equivalent', 'congruent'],
    symbol: '≡',
    requiresMathMode: true
  },
  
  // Set operations
  '\\in': {
    label: 'Element Of',
    description: '∈ element of set',
    keywords: ['in', 'element', 'member'],
    symbol: '∈',
    requiresMathMode: true
  },
  '\\notin': {
    label: 'Not Element Of',
    description: '∉ not element of set',
    keywords: ['notin', 'not', 'element'],
    symbol: '∉',
    requiresMathMode: true
  },
  '\\subset': {
    label: 'Subset',
    description: '⊂ proper subset',
    keywords: ['subset', 'sub'],
    symbol: '⊂',
    requiresMathMode: true
  },
  '\\subseteq': {
    label: 'Subset or Equal',
    description: '⊆ subset or equal',
    keywords: ['subseteq', 'subset', 'equal'],
    symbol: '⊆',
    requiresMathMode: true
  },
  '\\cup': {
    label: 'Union',
    description: '∪ set union',
    keywords: ['cup', 'union'],
    symbol: '∪',
    requiresMathMode: true
  },
  '\\cap': {
    label: 'Intersection',
    description: '∩ set intersection',
    keywords: ['cap', 'intersection', 'inter'],
    symbol: '∩',
    requiresMathMode: true
  },
  '\\emptyset': {
    label: 'Empty Set',
    description: '∅ empty set',
    keywords: ['emptyset', 'empty', 'null'],
    symbol: '∅',
    requiresMathMode: true
  },
  
  // Math functions and operators
  '\\sum_{i=0}^{n}': {
    label: 'Summation',
    description: 'Σ summation with limits',
    keywords: ['sum', 'summation', 'sigma'],
    symbol: 'Σ',
    requiresMathMode: true
  },
  '\\prod_{i=0}^{n}': {
    label: 'Product',
    description: 'Π product with limits',
    keywords: ['prod', 'product', 'pi'],
    symbol: 'Π',
    requiresMathMode: true
  },
  '\\lim_{n \\to \\infty}': {
    label: 'Limit',
    description: 'lim limit as n approaches',
    keywords: ['lim', 'limit', 'approaches'],
    symbol: 'lim',
    requiresMathMode: true
  },
  '\\infty': {
    label: 'Infinity',
    description: '∞ infinity symbol',
    keywords: ['infty', 'infinity', 'inf'],
    symbol: '∞',
    requiresMathMode: true
  },
  '\\log_{}': {
    label: 'Logarithm',
    description: 'log with base',
    keywords: ['log', 'logarithm'],
    symbol: 'log',
    requiresMathMode: true
  },
  '\\ln': {
    label: 'Natural Log',
    description: 'ln natural logarithm',
    keywords: ['ln', 'natural', 'log'],
    symbol: 'ln',
    requiresMathMode: true
  },
  '\\sqrt{}': {
    label: 'Square Root',
    description: '√x square root',
    keywords: ['sqrt', 'square', 'root'],
    symbol: '√',
    requiresMathMode: true
  },
  '\\frac{}{}': {
    label: 'Fraction',
    description: 'a/b fraction',
    keywords: ['frac', 'fraction', 'divide'],
    symbol: '⁄',
    requiresMathMode: true
  },
  
  // Logic quantifiers
  '\\forall': {
    label: 'For All',
    description: '∀ for all (universal quantifier)',
    keywords: ['forall', 'all', 'universal'],
    symbol: '∀',
    requiresMathMode: true
  },
  '\\exists': {
    label: 'There Exists',
    description: '∃ there exists (existential quantifier)',
    keywords: ['exists', 'exist', 'existential'],
    symbol: '∃',
    requiresMathMode: true
  },
  
  // Arrows and implications
  '\\rightarrow': {
    label: 'Right Arrow',
    description: '→ right arrow',
    keywords: ['rightarrow', 'arrow', 'right', 'to'],
    symbol: '→',
    requiresMathMode: true
  },
  '\\leftarrow': {
    label: 'Left Arrow',
    description: '← left arrow',
    keywords: ['leftarrow', 'arrow', 'left'],
    symbol: '←',
    requiresMathMode: true
  },
  '\\Rightarrow': {
    label: 'Implies',
    description: '⇒ implies (logical implication)',
    keywords: ['implies', 'rightarrow', 'implication'],
    symbol: '⇒',
    requiresMathMode: true
  },
  '\\Leftrightarrow': {
    label: 'If and Only If',
    description: '⇔ if and only if (iff)',
    keywords: ['iff', 'leftrightarrow', 'equivalent', 'biconditional'],
    symbol: '⇔',
    requiresMathMode: true
  },
  
  // Text-mode commands (no math wrapping needed)
  '\\textbf{}': {
    label: 'Bold Text',
    description: 'Bold formatting',
    keywords: ['bold', 'textbf', 'strong', 'format'],
    symbol: '𝐁',
    requiresMathMode: false
  },
  '\\textit{}': {
    label: 'Italic Text',
    description: 'Italic formatting',
    keywords: ['italic', 'textit', 'emphasis', 'format'],
    symbol: '𝐼',
    requiresMathMode: false
  },
  '\\emph{}': {
    label: 'Emphasized Text',
    description: 'Emphasized formatting',
    keywords: ['emph', 'emphasis', 'italic', 'format'],
    symbol: '𝐸',
    requiresMathMode: false
  },
  '\\underline{}': {
    label: 'Underlined Text',
    description: 'Underline formatting',
    keywords: ['underline', 'under', 'format'],
    symbol: 'U̲',
    requiresMathMode: false
  },
  '\\texttt{}': {
    label: 'Monospace Text',
    description: 'Monospace/code formatting',
    keywords: ['monospace', 'texttt', 'code', 'mono', 'format'],
    symbol: '⌨',
    requiresMathMode: false
  },
  '\\section{}': {
    label: 'Section',
    description: 'Section heading',
    keywords: ['section', 'heading', 'title'],
    symbol: '§',
    requiresMathMode: false
  },
  '\\subsection{}': {
    label: 'Subsection',
    description: 'Subsection heading',
    keywords: ['subsection', 'heading', 'subtitle'],
    symbol: '§§',
    requiresMathMode: false
  },
  '\\exercisetitle{}': { 
    label: 'Exercise Title', 
    description: 'Start new exercise section',
    keywords: ['exercise', 'title', 'heading'],
    symbol: '📝',
    requiresMathMode: false
  },
  '\\exercisepart{}': { 
    label: 'Exercise Part', 
    description: 'Part (a), (b), etc.',
    keywords: ['exercise', 'part', 'section'],
    symbol: '📋',
    requiresMathMode: false
  },
  '\\points{}': {
    label: 'Points',
    description: '[5 points] for a section',
    keywords: ['points', 'score', 'marks'],
    symbol: '✓',
    requiresMathMode: false
  },
  '\\totalpoints{}': {
    label: 'Total Points',
    description: 'Total: 20 points',
    keywords: ['total', 'points', 'sum', 'score'],
    symbol: '∑',
    requiresMathMode: false
  },
  '\\score{}{}': {
    label: 'Score',
    description: 'Points: 2/3 format',
    keywords: ['score', 'grade', 'marks', 'review', 'points'],
    symbol: '✎',
    requiresMathMode: false
  },
  '\\begin{itemize}\n    \\item {}\n\\end{itemize}': {
    label: 'List',
    description: 'Bulleted list with one item',
    keywords: ['list', 'itemize', 'bullet', 'items', 'ul'],
    symbol: '•',
    requiresMathMode: false
  },
  [ALGORITHM_TEMPLATE]: {
    label: 'Algorithm Block',
    description: 'Complete algorithm environment',
    keywords: ['algorithm', 'alg', 'pseudocode', 'block'],
    symbol: '🔧',
    isTemplate: true,
    requiresMathMode: false
  },
  [MULTILINE_FUNCTION_TEMPLATE]: {
    label: 'Multiline Function',
    description: 'Numbered multi-line equation environment',
    keywords: ['multiline', 'function', 'equation', 'cases', 'numbered', 'recurrence'],
    symbol: '🔢',
    isTemplate: true,
    requiresMathMode: false
  }
};

// Helper: Check if cursor is already inside math mode
const isInMathMode = (content, cursorPosition) => {
  // Scan backwards to find unmatched delimiters
  let inInlineMath = false;
  let inDisplayMath = false;
  
  for (let i = 0; i < cursorPosition; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    // Check for display math \[
    if (char === '\\' && nextChar === '[') {
      inDisplayMath = true;
      inInlineMath = false;
      i++; // Skip next char
    }
    // Check for closing display math \]
    else if (char === '\\' && nextChar === ']') {
      inDisplayMath = false;
      i++; // Skip next char
    }
    // Check for inline math $ (but not \$)
    else if (char === '$' && (i === 0 || content[i - 1] !== '\\')) {
      inInlineMath = !inInlineMath;
    }
  }
  
  return inInlineMath || inDisplayMath;
};

// Helper: Determine if we should use inline vs block math mode
const shouldUseBlockMode = (content, slashPosition, currentCursorPosition) => {
  // Find the current line, excluding the slash trigger and query
  const beforeSlash = content.substring(0, slashPosition);
  const afterCursor = content.substring(currentCursorPosition);
  
  const lastNewline = beforeSlash.lastIndexOf('\n');
  const nextNewline = afterCursor.indexOf('\n');
  
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const lineEnd = nextNewline === -1 ? content.length : currentCursorPosition + nextNewline;
  
  // Check text BEFORE the slash (on same line)
  const beforeSlashOnLine = content.substring(lineStart, slashPosition);
  // Check text AFTER the current cursor (on same line)
  const afterCursorOnLine = content.substring(currentCursorPosition, lineEnd);
  
  // Check if there's non-whitespace text on the line (excluding the /command trigger)
  const hasTextBefore = beforeSlashOnLine.trim().length > 0;
  const hasTextAfter = afterCursorOnLine.trim().length > 0;
  
  // Use block mode if:
  // The line is empty except for the slash command trigger
  return !hasTextBefore && !hasTextAfter;
};

// Fuzzy search implementation
const fuzzyMatch = (query, text, keywords = []) => {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();
  
  if (!normalizedQuery) return { matches: true, score: 0 };
  
  // Check exact match first (highest score)
  if (normalizedText.includes(normalizedQuery)) {
    return { matches: true, score: 100 };
  }
  
  // Check keyword matches
  for (const keyword of keywords) {
    if (keyword.toLowerCase().includes(normalizedQuery)) {
      return { matches: true, score: 80 };
    }
  }
  
  // Fuzzy match: check if all query characters appear in order
  let textIndex = 0;
  let queryIndex = 0;
  let lastMatchIndex = -1;
  let matchGaps = 0;
  
  while (queryIndex < normalizedQuery.length && textIndex < normalizedText.length) {
    if (normalizedQuery[queryIndex] === normalizedText[textIndex]) {
      if (lastMatchIndex >= 0) {
        matchGaps += textIndex - lastMatchIndex - 1;
      }
      lastMatchIndex = textIndex;
      queryIndex++;
    }
    textIndex++;
  }
  
  if (queryIndex === normalizedQuery.length) {
    // All characters found, score based on how close together they are
    const score = Math.max(0, 50 - matchGaps * 2);
    return { matches: true, score };
  }
  
  return { matches: false, score: 0 };
};

function LatexEditor() {
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [exerciseNumber, setExerciseNumber] = useState(1);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [compileMode, setCompileMode] = useState('auto'); // 'auto' | 'manual'
  const [showCompileDropdown, setShowCompileDropdown] = useState(false);
  const [documentMode, setDocumentMode] = useState('solution'); // 'solution' | 'review'
  const [showDocumentModeDropdown, setShowDocumentModeDropdown] = useState(false);
  
  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0 });
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [slashStartPosition, setSlashStartPosition] = useState(-1);
  
  const editorRef = useRef(null);
  const autocompleteRef = useRef(null);
  const downloadDropdownRef = useRef(null);
  const compileDropdownRef = useRef(null);
  const compileShowTimeoutRef = useRef(null);
  const compileHideTimeoutRef = useRef(null);
  const documentModeDropdownRef = useRef(null);
  const documentModeShowTimeoutRef = useRef(null);
  const documentModeHideTimeoutRef = useRef(null);
  const compileTimeoutRef = useRef(null);
  const hasInitiallyCompiled = useRef(false);
  const previousPdfUrl = useRef(null);

  // Generate mode-specific example content
  const getExampleContent = useCallback((mode) => {
    if (mode === 'review') {
      return `
\\exercisetitle{Exercise 1: Algorithm Analysis}

\\textbf{Review Comments:}

Overall, the solution demonstrates a solid understanding of asymptotic analysis. However, there are some areas that need improvement:

\\begin{itemize}
    \\item \\textbf{Correctness:} The recursive relation is correctly identified. The base case is properly handled.
    \\item \\textbf{Analysis:} The time complexity derivation is mostly correct, but the explanation could be more detailed.
    \\item \\textbf{Notation:} Good use of Big-O notation throughout. Minor: use $\\BigO{n \\log n}$ instead of writing it out.
    \\item \\textbf{Clarity:} The proof structure is clear but could benefit from more intermediate steps.
\\end{itemize}

\\textbf{Suggestions for improvement:}
\\begin{itemize}
    \\item Add more explanation when applying the Master Theorem
    \\item Show the recursion tree for visual clarity
    \\item Verify edge cases more explicitly
\\end{itemize}

\\vspace{1em}
\\score{7}{10}
`;
    } else {
      // Solution mode - clean example without review commands
      return `
\\exercisetitle{Exercise 1: Your Title Here}

\\exercisepart{Part (a)}

\\textbf{Problem:} State your problem here.

\\textbf{Solution:}

Write your solution here. Use / for commands.

You can use inline math like $\\BigO{n \\log n}$ or display math:

\\[
    T(n) = 2T\\left(\\frac{n}{2}\\right) + \\BigO{n}
\\]

\\exercisepart{Part (b)}

\\textbf{Problem:} Another problem.

\\textbf{Solution:}

Your solution for part (b) goes here.
`;
    }
  }, []);

  const loadTemplate = async () => {
    try {
      const response = await axios.get('/api/template');
      setTemplate(response.data.template);
      
      const initialContent = getExampleContent(documentMode);
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
        '\\newcommand{\\exercisenum}{X}',
        `\\newcommand{\\exercisenum}{${exerciseNumber}}`
      ).replace(
        '\\reviewmodefalse',
        documentMode === 'review' ? '\\reviewmodetrue' : '\\reviewmodefalse'
      );

      const response = await axios.post('/api/compile', {
        content: fullDocument,
        sheetNumber: exerciseNumber
      }, {
        responseType: 'blob'
      });

      // Create blob URL for PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      
      // Add parameters to hide PDF viewer UI elements
      const urlWithParams = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
      
      // Revoke old URL if exists
      if (previousPdfUrl.current) {
        URL.revokeObjectURL(previousPdfUrl.current);
      }
      
      previousPdfUrl.current = url;
      setPdfUrl(urlWithParams);
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
  }, [template, content, exerciseNumber, documentMode]);

  // Calculate cursor position for autocomplete dropdown
  const calculateCursorPosition = useCallback(() => {
    if (!editorRef.current) return { x: 0, y: 0 };
    
    const textarea = editorRef.current;
    const textareaRect = textarea.getBoundingClientRect();
    
    // Simple approach: position relative to textarea
    // This is more reliable than trying to measure exact cursor position
    const scrollTop = textarea.scrollTop;
    const lineHeight = 20; // Approximate line height in pixels
    
    // Count newlines before cursor to estimate line number
    const textBeforeCursor = content.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    const currentColumn = lines[lines.length - 1].length;
    
    // Calculate approximate position
    const x = textareaRect.left + 16 + (currentColumn * 8); // 16px padding + approx char width
    const y = textareaRect.top + 40 + (currentLine * lineHeight) - scrollTop; // 40px for header
    
    return { x: Math.max(x, textareaRect.left + 16), y };
  }, [content]);

  // Update filtered commands based on query
  useEffect(() => {
    if (!showAutocomplete) return;
    
    const commandArray = Object.entries(LATEX_COMMANDS).map(([cmd, info]) => ({
      command: cmd,
      label: info.label,
      description: info.description,
      symbol: info.symbol,
      keywords: info.keywords || [],
      isTemplate: info.isTemplate || false,
      requiresMathMode: info.requiresMathMode || false
    }));
    
    // If query is empty, show all commands
    if (!autocompleteQuery || autocompleteQuery.trim() === '') {
      setFilteredCommands(commandArray);
      setSelectedCommandIndex(0);
      return;
    }
    
    // Filter and sort by relevance
    const filtered = commandArray
      .map(cmd => {
        const labelMatch = fuzzyMatch(autocompleteQuery, cmd.label, cmd.keywords);
        const keywordMatch = cmd.keywords.length > 0 
          ? Math.max(...cmd.keywords.map(kw => fuzzyMatch(autocompleteQuery, kw).score))
          : 0;
        const score = Math.max(labelMatch.score, keywordMatch);
        
        return { ...cmd, score, matches: labelMatch.matches || keywordMatch > 0 };
      })
      .filter(cmd => cmd.matches)
      .sort((a, b) => b.score - a.score);
    
    setFilteredCommands(filtered);
    setSelectedCommandIndex(0);
  }, [autocompleteQuery, showAutocomplete]);

  // Insert command at cursor position with smart math mode wrapping
  const insertCommandAtCursor = useCallback((commandText, isTemplate = false, requiresMathMode = false) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = slashStartPosition;
    const end = textarea.selectionStart;
    
    let finalCommand = commandText;
    
    // Handle math mode wrapping for commands that require it
    if (requiresMathMode && !isInMathMode(content, start)) {
      const useBlock = shouldUseBlockMode(content, start, end);
      
      if (useBlock) {
        // Use display math mode with newlines
        finalCommand = `\\[\n    ${commandText}\n\\]`;
      } else {
        // Use inline math mode
        finalCommand = `$${commandText}$`;
      }
    }
    
    // Replace from slash to current position with the command
    const newContent = content.substring(0, start) + finalCommand + content.substring(end);
    setContent(newContent);
    
    // Position cursor intelligently
    setTimeout(() => {
      let cursorPos;
      
      if (isTemplate) {
        // For templates, find first occurrence of "Algorithm Name" or similar placeholder
        const templatePlaceholders = ['Algorithm Name', 'Input specification', 'Output specification'];
        let firstPlaceholder = -1;
        
        for (const placeholder of templatePlaceholders) {
          const index = finalCommand.indexOf(placeholder);
          if (index !== -1 && (firstPlaceholder === -1 || index < firstPlaceholder)) {
            firstPlaceholder = index;
          }
        }
        
        if (firstPlaceholder !== -1) {
          cursorPos = start + firstPlaceholder;
        } else {
          cursorPos = start + finalCommand.length;
        }
      } else if (commandText.includes('{}')) {
        // For commands with braces, position inside the first set of braces
        const braceIndex = finalCommand.indexOf('{}');
        cursorPos = start + braceIndex + 1;
      } else if (commandText.includes('_{')) {
        // For subscript commands like \sum_{i=0}^{n}, position after the equals sign
        // This allows user to immediately edit the starting value
        const equalsIndex = finalCommand.indexOf('=');
        if (equalsIndex !== -1) {
          cursorPos = start + equalsIndex + 1;
        } else {
          // If no equals sign, position after the opening brace
          const subscriptIndex = finalCommand.indexOf('_{');
          cursorPos = start + subscriptIndex + 2;
        }
      } else {
        // For other commands, position at the end
        cursorPos = start + finalCommand.length;
      }
      
      textarea.setSelectionRange(cursorPos, cursorPos);
      textarea.focus();
    }, 0);
    
    // Close autocomplete
    setShowAutocomplete(false);
    setAutocompleteQuery('');
    setSlashStartPosition(-1);
  }, [content, slashStartPosition]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    // Detect slash command trigger
    if (e.key === '/' && !showAutocomplete) {
      const cursorPos = e.target.selectionStart;
      
      setSlashStartPosition(cursorPos);
      setShowAutocomplete(true);
      setAutocompleteQuery('');
      setSelectedCommandIndex(0);
      
      // Calculate position after slash is typed
      setTimeout(() => {
        const position = calculateCursorPosition();
        setAutocompletePosition(position);
        console.log('Autocomplete triggered at position:', position);
      }, 10);
      return;
    }
    
    // Handle autocomplete interactions
    if (showAutocomplete) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
        setAutocompleteQuery('');
        setSlashStartPosition(-1);
        return;
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => prev > 0 ? prev - 1 : 0);
        return;
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (filteredCommands.length > 0) {
          e.preventDefault();
          const selected = filteredCommands[selectedCommandIndex];
          insertCommandAtCursor(selected.command, selected.isTemplate, selected.requiresMathMode);
        }
        return;
      }
      
      if (e.key === 'Backspace') {
        const cursorPos = e.target.selectionStart;
        if (cursorPos <= slashStartPosition) {
          // Backspaced past the slash, close autocomplete
          setShowAutocomplete(false);
          setAutocompleteQuery('');
          setSlashStartPosition(-1);
        }
        return;
      }
      
      // Close autocomplete on space (completing the command trigger)
      if (e.key === ' ') {
        setShowAutocomplete(false);
        setAutocompleteQuery('');
        setSlashStartPosition(-1);
        return;
      }
    }
  }, [showAutocomplete, filteredCommands, selectedCommandIndex, insertCommandAtCursor, 
      content, slashStartPosition, calculateCursorPosition]);

  // Update autocomplete query as user types
  const handleContentChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (showAutocomplete && slashStartPosition >= 0) {
      const cursorPos = e.target.selectionStart;
      
      // Check if the slash character still exists at the expected position
      const slashChar = newContent[slashStartPosition];
      if (slashChar !== '/' || cursorPos < slashStartPosition) {
        // Slash was deleted or cursor moved before it, close autocomplete
        setShowAutocomplete(false);
        setAutocompleteQuery('');
        setSlashStartPosition(-1);
        return;
      }
      
      // Get text after the trigger character (/)
      const textAfterSlash = newContent.substring(slashStartPosition + 1, cursorPos);
      
      console.log('Query after slash:', textAfterSlash, 'at position', cursorPos);
      
      // Check if query contains invalid characters (newline, multiple spaces)
      if (textAfterSlash.includes('\n') || textAfterSlash.match(/\s{2,}/)) {
        setShowAutocomplete(false);
        setAutocompleteQuery('');
        setSlashStartPosition(-1);
      } else {
        setAutocompleteQuery(textAfterSlash);
        
        // Update position as user types
        setTimeout(() => {
          const position = calculateCursorPosition();
          setAutocompletePosition(position);
        }, 0);
      }
    }
  }, [showAutocomplete, slashStartPosition, calculateCursorPosition]);

  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((cmd) => {
    insertCommandAtCursor(cmd.command, cmd.isTemplate, cmd.requiresMathMode);
  }, [insertCommandAtCursor]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutocomplete && 
          autocompleteRef.current && 
          !autocompleteRef.current.contains(e.target) &&
          editorRef.current &&
          !editorRef.current.contains(e.target)) {
        setShowAutocomplete(false);
        setAutocompleteQuery('');
        setSlashStartPosition(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAutocomplete]);

  // Close download dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDownloadDropdown && 
          downloadDropdownRef.current && 
          !downloadDropdownRef.current.contains(e.target)) {
        setShowDownloadDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadDropdown]);

  // Close compile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCompileDropdown && 
          compileDropdownRef.current && 
          !compileDropdownRef.current.contains(e.target)) {
        setShowCompileDropdown(false);
        
        // Clear any pending timers when closing via click outside
        if (compileShowTimeoutRef.current) {
          clearTimeout(compileShowTimeoutRef.current);
          compileShowTimeoutRef.current = null;
        }
        if (compileHideTimeoutRef.current) {
          clearTimeout(compileHideTimeoutRef.current);
          compileHideTimeoutRef.current = null;
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCompileDropdown]);

  // Close document mode dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDocumentModeDropdown && 
          documentModeDropdownRef.current && 
          !documentModeDropdownRef.current.contains(e.target)) {
        setShowDocumentModeDropdown(false);
        
        // Clear any pending timers when closing via click outside
        if (documentModeShowTimeoutRef.current) {
          clearTimeout(documentModeShowTimeoutRef.current);
          documentModeShowTimeoutRef.current = null;
        }
        if (documentModeHideTimeoutRef.current) {
          clearTimeout(documentModeHideTimeoutRef.current);
          documentModeHideTimeoutRef.current = null;
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDocumentModeDropdown]);

  // Auto-switch to manual mode when in Editor-only mode
  useEffect(() => {
    if (!showPreview && compileMode === 'auto') {
      setCompileMode('manual');
    }
  }, [showPreview, compileMode]);

  // Load template on mount
  useEffect(() => {
    loadTemplate();
  }, []);

  // Update example content when switching modes (only if content is still an example)
  useEffect(() => {
    // Skip if template hasn't loaded yet
    if (!template) return;
    
    // Check if current content matches either example template
    const solutionExample = getExampleContent('solution').trim();
    const reviewExample = getExampleContent('review').trim();
    const currentContent = content.trim();
    
    // Only update if content is still one of the examples (not edited by user)
    if (currentContent === solutionExample || currentContent === reviewExample) {
      const newContent = getExampleContent(documentMode);
      if (newContent.trim() !== currentContent) {
        setContent(newContent);
      }
    }
  }, [documentMode, template, getExampleContent, content]);

  // Cleanup dropdown timers on unmount
  useEffect(() => {
    return () => {
      if (compileShowTimeoutRef.current) {
        clearTimeout(compileShowTimeoutRef.current);
      }
      if (compileHideTimeoutRef.current) {
        clearTimeout(compileHideTimeoutRef.current);
      }
      if (documentModeShowTimeoutRef.current) {
        clearTimeout(documentModeShowTimeoutRef.current);
      }
      if (documentModeHideTimeoutRef.current) {
        clearTimeout(documentModeHideTimeoutRef.current);
      }
    };
  }, []);

  // Auto-compile on content change (only when in auto mode)
  useEffect(() => {
    if (content && content.length > 50 && compileMode === 'auto') {
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
  }, [content, compileLatex, compileMode]);

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

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `sheet_${exerciseNumber}.pdf`;
    link.click();
  };

  const downloadSplitExercises = async () => {
    if (!template || template.length === 0) {
      setError('Template not loaded yet');
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
        '\\newcommand{\\exercisenum}{X}',
        `\\newcommand{\\exercisenum}{${exerciseNumber}}`
      ).replace(
        '\\reviewmodefalse',
        documentMode === 'review' ? '\\reviewmodetrue' : '\\reviewmodefalse'
      );

      const response = await axios.post('/api/compile-split', {
        content: fullDocument,
        sheetNumber: exerciseNumber
      }, {
        responseType: 'blob'
      });

      // Create blob URL for ZIP
      const zipBlob = new Blob([response.data], { type: 'application/zip' });
      const url = URL.createObjectURL(zipBlob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `sheet_${exerciseNumber}_exercises.zip`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (err) {
      let errorMessage = 'Split compilation failed';
      
      // Handle blob error responses
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error('Split compilation details:', errorData.details);
          }
        } catch (e) {
          // If parsing fails, use default message
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      console.error('Split compilation error:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  // Compile button hover handlers (professional pattern with grace period)
  const handleCompileButtonMouseEnter = () => {
    // Don't show dropdown in Editor-only mode (always manual mode)
    if (!showPreview) {
      return;
    }
    
    // Cancel any pending hide timer (user came back)
    if (compileHideTimeoutRef.current) {
      clearTimeout(compileHideTimeoutRef.current);
      compileHideTimeoutRef.current = null;
    }
    
    // If dropdown is already shown, keep it shown
    if (showCompileDropdown) {
      return;
    }
    
    // Start timer to show dropdown after 500ms hover
    if (!compileShowTimeoutRef.current) {
      compileShowTimeoutRef.current = setTimeout(() => {
        setShowCompileDropdown(true);
        compileShowTimeoutRef.current = null;
      }, 500);
    }
  };

  const handleCompileButtonMouseLeave = () => {
    // Cancel any pending show timer (user left before it showed)
    if (compileShowTimeoutRef.current) {
      clearTimeout(compileShowTimeoutRef.current);
      compileShowTimeoutRef.current = null;
    }
    
    // If dropdown is shown, start grace period before hiding
    if (showCompileDropdown) {
      compileHideTimeoutRef.current = setTimeout(() => {
        setShowCompileDropdown(false);
        compileHideTimeoutRef.current = null;
      }, 300); // 300ms grace period to move from button to dropdown
    }
  };

  const handleCompileModeChange = (mode) => {
    setCompileMode(mode);
    setShowCompileDropdown(false);
    
    // Clear any pending timers
    if (compileShowTimeoutRef.current) {
      clearTimeout(compileShowTimeoutRef.current);
      compileShowTimeoutRef.current = null;
    }
    if (compileHideTimeoutRef.current) {
      clearTimeout(compileHideTimeoutRef.current);
      compileHideTimeoutRef.current = null;
    }
  };

  // Document mode button hover handlers (same pattern as compile button)
  const handleDocumentModeButtonMouseEnter = () => {
    // Cancel any pending hide timer (user came back)
    if (documentModeHideTimeoutRef.current) {
      clearTimeout(documentModeHideTimeoutRef.current);
      documentModeHideTimeoutRef.current = null;
    }
    
    // If dropdown is already shown, keep it shown
    if (showDocumentModeDropdown) {
      return;
    }
    
    // Start timer to show dropdown after 500ms hover
    if (!documentModeShowTimeoutRef.current) {
      documentModeShowTimeoutRef.current = setTimeout(() => {
        setShowDocumentModeDropdown(true);
        documentModeShowTimeoutRef.current = null;
      }, 500);
    }
  };

  const handleDocumentModeButtonMouseLeave = () => {
    // Cancel any pending show timer (user left before it showed)
    if (documentModeShowTimeoutRef.current) {
      clearTimeout(documentModeShowTimeoutRef.current);
      documentModeShowTimeoutRef.current = null;
    }
    
    // If dropdown is shown, start grace period before hiding
    if (showDocumentModeDropdown) {
      documentModeHideTimeoutRef.current = setTimeout(() => {
        setShowDocumentModeDropdown(false);
        documentModeHideTimeoutRef.current = null;
      }, 300); // 300ms grace period to move from button to dropdown
    }
  };

  const handleDocumentModeChange = (mode) => {
    setDocumentMode(mode);
    setShowDocumentModeDropdown(false);
    
    // Clear any pending timers
    if (documentModeShowTimeoutRef.current) {
      clearTimeout(documentModeShowTimeoutRef.current);
      documentModeShowTimeoutRef.current = null;
    }
    if (documentModeHideTimeoutRef.current) {
      clearTimeout(documentModeHideTimeoutRef.current);
      documentModeHideTimeoutRef.current = null;
    }
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
              <div 
                className="relative" 
                ref={documentModeDropdownRef}
                onMouseEnter={handleDocumentModeButtonMouseEnter}
                onMouseLeave={handleDocumentModeButtonMouseLeave}
              >
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDocumentModeChange(documentMode === 'solution' ? 'review' : 'solution')}
                >
                  {documentMode === 'solution' ? (
                    <FileText className="w-4 h-4 mr-2" />
                  ) : (
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                  )}
                  {documentMode === 'solution' ? 'Solution' : 'Review'}
                </Button>
                
                {showDocumentModeDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleDocumentModeChange('solution')}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Solution Mode
                        </span>
                        {documentMode === 'solution' && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDocumentModeChange('review')}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Review Mode
                        </span>
                        {documentMode === 'review' && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div 
                className="relative" 
                ref={compileDropdownRef}
                onMouseEnter={handleCompileButtonMouseEnter}
                onMouseLeave={handleCompileButtonMouseLeave}
              >
                <Button
                  variant="default"
                  size="sm"
                  onClick={compileLatex}
                  disabled={isCompiling}
                >
                  {compileMode === 'auto' ? (
                    <PlayCircle className="w-4 h-4 mr-2 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isCompiling ? 'Compiling...' : 'Compile'}
                </Button>
                
                {showCompileDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleCompileModeChange('auto')}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <PlayCircle className="w-4 h-4 mr-2 fill-current" />
                          Auto Compile
                        </span>
                        {compileMode === 'auto' && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCompileModeChange('manual')}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <Play className="w-4 h-4 mr-2" />
                          Manual Compile
                        </span>
                        {compileMode === 'manual' && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={downloadDropdownRef}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  disabled={!pdfUrl}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                
                {showDownloadDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          downloadPDF();
                          setShowDownloadDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        Complete Sheet
                      </button>
                      <button
                        onClick={() => {
                          downloadSplitExercises();
                          setShowDownloadDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        disabled={isCompiling}
                      >
                        Split Exercises
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-screen-2xl mx-auto p-4 flex gap-4">
          {/* Editor - Takes more space (58%) */}
          <Card className={`flex flex-col ${showPreview ? 'w-[58%]' : 'w-full'}`}>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full px-4 py-2 font-mono text-sm bg-card text-foreground border-none outline-none resize-none overflow-y-auto scrollbar-hide"
                placeholder="Start writing your exercise solution... Type / for commands"
                spellCheck={false}
              />
              
              {/* Autocomplete Dropdown */}
              <div ref={autocompleteRef}>
                <CommandAutocomplete
                  commands={filteredCommands}
                  isOpen={showAutocomplete}
                  position={autocompletePosition}
                  searchQuery={autocompleteQuery}
                  selectedIndex={selectedCommandIndex}
                  onSelect={handleAutocompleteSelect}
                  onClose={() => {
                    setShowAutocomplete(false);
                    setAutocompleteQuery('');
                    setSlashStartPosition(-1);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview - Takes less space (42%) */}
          {showPreview && (
            <Card className="w-[42%] flex flex-col overflow-hidden">
              <CardContent className="flex-1 p-1 overflow-hidden flex items-center justify-center">
                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive text-sm border-l-4 border-destructive">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {pdfUrl && !error && (
                  <div className="w-full h-full overflow-y-auto scrollbar-hide flex items-start justify-center">
                    {/* A4 proportions container: 210mm × 297mm = 1:1.414 ratio */}
                    <div 
                      className="bg-white shadow-lg"
                      style={{
                        width: '100%',
                        maxWidth: 'min(100%, calc((100vh - 6rem) * 0.707))', // A4 width based on height
                        aspectRatio: '1 / 1.414',
                        maxHeight: 'calc(100vh - 6rem)',
                      }}
                    >
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>
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
