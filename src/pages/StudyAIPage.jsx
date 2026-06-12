import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, BookOpen, Zap, Clock, Type, Code,
  Edit3, PenTool, CheckCircle, Lightbulb, Languages,
  RefreshCw, Book, Calculator, Terminal, Sparkles,
  Database, GitCommit, ListTodo, FileCheck, Moon, Sun,
  Heart, Layout, ChevronLeft, ChevronRight, Copy, Check,
  ArrowLeft, Send, Cpu, Activity, Plus
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// ============================================================
//  CATEGORY & TOOL CONFIGURATIONS — All 22 Tools + Prompts
// ============================================================

const CAT_COLORS = {
  writing: { gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', solid: '#8b5cf6' },
  study: { gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', solid: '#3b82f6' },
  coding: { gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', solid: '#22c55e' },
  productivity: { gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', solid: '#f59e0b' },
  wellness: { gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)', solid: '#06b6d4' },
};

const CATEGORIES = [
  {
    id: 'writing',
    label: 'Writing & Language',
    icon: Type,
    tools: [
      {
        id: 'summarizer', label: 'Summarizer', icon: Edit3,
        desc: 'Extract key points from long texts instantly',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'Paste long text to summarize...',
        power: 4,
        getPrompt: (input) => `Summarize the following text into key bullet points:\n\n${input}`
      },
      {
        id: 'grammar', label: 'Grammar Checker', icon: CheckCircle,
        desc: 'Find and fix grammatical errors with explanations',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'Paste text to check for grammar...',
        power: 4,
        getPrompt: (input) => `Check the following text for grammatical errors and provide corrections and explanations:\n\n${input}`
      },
      {
        id: 'essay', label: 'Essay Outliner', icon: PenTool,
        desc: 'Generate structured essay outlines from any topic',
        inputType: 'short-text', outputType: 'markdown',
        placeholder: 'Enter an essay topic...',
        power: 3,
        getPrompt: (input) => `Generate a structured essay outline for the topic: "${input}". Include an Introduction, Body Paragraphs, and a Conclusion.`
      },
      {
        id: 'translator', label: 'Translator', icon: Languages,
        desc: 'Translate text between 6+ world languages',
        inputType: 'with-options', outputType: 'markdown',
        placeholder: 'Paste text to translate...',
        options: ['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'],
        power: 5,
        getPrompt: (input, option) => `Translate the following text into ${option}:\n\n${input}`
      },
      {
        id: 'paraphraser', label: 'Paraphraser', icon: RefreshCw,
        desc: 'Rewrite text for better clarity and flow',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'Paste text to paraphrase...',
        power: 3,
        getPrompt: (input) => `Rewrite the following text to improve flow, clarity, and vocabulary while maintaining the original meaning:\n\n${input}`
      }
    ]
  },
  {
    id: 'study',
    label: 'Study Aids',
    icon: BookOpen,
    tools: [
      {
        id: 'flashcards', label: 'Flashcard Gen', icon: Zap,
        desc: 'Turn notes into Q&A flashcards for revision',
        inputType: 'textarea', outputType: 'flashcards-ui',
        placeholder: 'Paste study notes...',
        power: 5,
        getPrompt: (input) => `Create 5 to 10 flashcards from the following text. Respond strictly with a JSON array of objects, where each object has a "q" (question) and "a" (answer) string property. Text:\n\n${input}`
      },
      {
        id: 'quiz', label: 'Quiz Maker', icon: Layout,
        desc: 'Generate 10-question practice quizzes',
        inputType: 'textarea', outputType: 'quiz-ui',
        placeholder: 'Paste material to generate a quiz...',
        power: 5,
        getPrompt: (input) => `Create a 10-question multiple-choice quiz from the following text. Wrap ANY mathematical equations or expressions in standard LaTeX delimiters (use $...$ for inline math and $$...$$ for block math). Respond strictly with a JSON array of objects, where each object has "q" (question string), "options" (array of exactly 4 strings), "answer" (the exact string of the correct option), and "explanation" (a brief string explaining why the answer is correct). Text:\n\n${input}`
      },
      {
        id: 'explainer', label: 'Concept Explainer', icon: Lightbulb,
        desc: 'Simplify complex academic concepts with analogies',
        inputType: 'short-text', outputType: 'markdown',
        placeholder: 'Enter a complex concept...',
        power: 4,
        getPrompt: (input) => `Explain the concept of "${input}" in simple, easy-to-understand terms suitable for a high school student. Use an analogy if possible.`
      },
      {
        id: 'syllabus', label: 'Syllabus Planner', icon: Book,
        desc: 'Create study schedules from your syllabus',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'Paste your syllabus...',
        power: 4,
        getPrompt: (input) => `Create a structured weekly study plan based on the following syllabus text. Break it down into weekly manageable chunks:\n\n${input}`
      },
      {
        id: 'math', label: 'Math Solver', icon: Calculator,
        desc: 'Step-by-step math problem solutions',
        inputType: 'short-text', outputType: 'markdown',
        placeholder: 'Enter a math problem (e.g. integrate x^2)...',
        power: 5,
        getPrompt: (input) => `Solve the following math problem step-by-step and provide the final answer:\n\n${input}`
      }
    ]
  },
  {
    id: 'coding',
    label: 'Coding & Tech',
    icon: Code,
    tools: [
      {
        id: 'bugfinder', label: 'Bug Finder', icon: Terminal,
        desc: 'Analyze code for bugs and anti-patterns',
        inputType: 'code', outputType: 'markdown',
        placeholder: 'Paste your buggy code here...',
        power: 5,
        getPrompt: (input) => `Analyze the following code for bugs, syntax errors, and anti-patterns. Provide a list of issues and suggested fixes:\n\n\`\`\`\n${input}\n\`\`\``
      },
      {
        id: 'converter', label: 'Code Converter', icon: RefreshCw,
        desc: 'Translate code between programming languages',
        inputType: 'with-options', outputType: 'code-block',
        placeholder: 'Paste code to convert...',
        options: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust'],
        power: 4,
        getPrompt: (input, option) => `Convert the following code into ${option}. Provide ONLY the converted code inside a markdown block without explanation:\n\n\`\`\`\n${input}\n\`\`\``
      },
      {
        id: 'regex', label: 'Regex Generator', icon: Sparkles,
        desc: 'Create regular expressions from plain English',
        inputType: 'short-text', outputType: 'code-block',
        placeholder: 'E.g. Match a valid email address...',
        power: 3,
        getPrompt: (input) => `Generate a regular expression for the following requirement: "${input}". Provide ONLY the raw regex string in a code block, followed by a brief explanation.`
      },
      {
        id: 'schema', label: 'Schema Generator', icon: Database,
        desc: 'Design database schemas from descriptions',
        inputType: 'textarea', outputType: 'code-block',
        placeholder: 'Describe the entities and relationships...',
        power: 4,
        getPrompt: (input) => `Design a database schema for the following requirements. Provide the SQL CREATE TABLE statements in a code block:\n\n${input}`
      },
      {
        id: 'git', label: 'Git Helper', icon: GitCommit,
        desc: 'Find the right git commands for any task',
        inputType: 'short-text', outputType: 'code-block',
        placeholder: 'E.g. Undo my last commit but keep changes...',
        power: 3,
        getPrompt: (input) => `Provide the exact Git commands needed to accomplish the following task: "${input}". Output the commands in a bash code block.`
      }
    ]
  },
  {
    id: 'productivity',
    label: 'Productivity',
    icon: Clock,
    tools: [
      {
        id: 'pomodoro', label: 'Pomodoro Plan', icon: Clock,
        desc: 'Generate a focused study block schedule',
        inputType: 'short-text', outputType: 'markdown',
        placeholder: 'What do you want to study today?',
        power: 3,
        getPrompt: (input) => `Generate a 4-block Pomodoro focus plan (25 min work, 5 min break) for studying: "${input}". Provide actionable steps for each block.`
      },
      {
        id: 'prioritizer', label: 'Task Prioritizer', icon: ListTodo,
        desc: 'Sort tasks using the Eisenhower Matrix',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'List your tasks (one per line)...',
        power: 3,
        getPrompt: (input) => `Categorize the following tasks into an Eisenhower Matrix (Urgent & Important, Important Not Urgent, Urgent Not Important, Neither). Format as a structured markdown list:\n\n${input}`
      },
      {
        id: 'resume', label: 'Resume Review', icon: FileCheck,
        desc: 'Get AI feedback on your resume content',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'Paste your resume text...',
        power: 4,
        getPrompt: (input) => `Review the following resume content and provide actionable feedback on action verbs, impact quantification, and formatting:\n\n${input}`
      },
      {
        id: 'formulas', label: 'Formula Generator', icon: Brain,
        desc: 'Generate key formulas for any subject',
        inputType: 'short-text', outputType: 'json-formulas',
        placeholder: 'E.g. Thermodynamics, Calculus...',
        power: 4,
        getPrompt: (input) => `Provide the 5 most important mathematical/scientific formulas for the topic: "${input}". Respond strictly with a JSON array of objects, where each object has "subject" (string), "name" (string), and "formula" (string) properties.`
      }
    ]
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: Heart,
    tools: [
      {
        id: 'meditation', label: 'Meditation Guide', icon: Moon,
        desc: 'Generate quick guided mindfulness exercises',
        inputType: 'short-text', outputType: 'markdown',
        placeholder: 'How are you feeling right now?',
        power: 3,
        getPrompt: (input) => `Generate a 2-minute guided meditation script tailored for someone feeling: "${input}".`
      },
      {
        id: 'stress', label: 'Stress Tips', icon: Sun,
        desc: 'Get personalized, science-based stress relief',
        inputType: 'textarea', outputType: 'markdown',
        placeholder: 'What is stressing you out?',
        power: 3,
        getPrompt: (input) => `Provide 3 actionable, science-based tips to manage stress related to: "${input}". Be empathetic and concise.`
      }
    ]
  }
];

// ============================================================
//  QUIZ PLAYER — Gamified with progress bar + streak
// ============================================================

const QuizPlayer = ({ quizData, onReset }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!Array.isArray(quizData) || quizData.length === 0) {
    return <div className="arai-empty-state"><p>No quiz data available.</p></div>;
  }

  if (showResult) {
    const pct = Math.round((score / quizData.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
    return (
      <div className="arai-quiz-result">
        <div style={{ fontSize: '2.5rem' }}>{emoji}</div>
        <div className="arai-quiz-result-big">{score}/{quizData.length}</div>
        <div className="arai-quiz-result-title">Quiz Complete!</div>
        <div className="arai-quiz-result-sub">You scored {pct}% — {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort, keep practicing!' : 'Review the material and try again!'}</div>
        <div className="arai-quiz-result-btns">
          <button className="arai-btn arai-btn-primary" onClick={() => { setCurrentQ(0); setSelected(null); setScore(0); setShowResult(false); }}>
            <RefreshCw size={14} /> Try Again
          </button>
          <button className="arai-btn arai-btn-outline" onClick={onReset}>New Quiz</button>
        </div>
      </div>
    );
  }

  const q = quizData[currentQ];
  if (!q) return null;

  const handleSelect = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(p => p + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const progress = ((currentQ + (selected ? 1 : 0)) / quizData.length) * 100;

  return (
    <div className="arai-quiz">
      {/* Progress bar */}
      <div className="arai-quiz-bar">
        <span className="arai-quiz-num">Q{currentQ + 1}/{quizData.length}</span>
        <div className="arai-quiz-progress">
          <div className="arai-quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="arai-quiz-score-badge">Score: {score}</span>
      </div>

      {/* Question card */}
      <div className="arai-quiz-q-card">
        <div className="arai-quiz-q-text">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.q}</ReactMarkdown>
        </div>
        <div className="arai-quiz-opts">
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.answer;
            const isSelected = selected === opt;
            let cls = 'arai-quiz-opt';
            if (selected) {
              cls += ' locked';
              if (isCorrect) cls += ' correct';
              else if (isSelected) cls += ' incorrect';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(opt)}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</ReactMarkdown>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && q.explanation && (
            <motion.div
              className="arai-quiz-explain"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <strong>{selected === q.answer ? '✓ Correct!' : '✗ Incorrect.'}</strong>{' '}
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.explanation}</ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next button */}
      <div className="arai-quiz-footer">
        <button className="arai-btn arai-btn-primary" disabled={!selected} onClick={handleNext}>
          {currentQ < quizData.length - 1 ? 'Next Question →' : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
//  FLASHCARD PLAYER — 3D flip with navigation
// ============================================================

const FlashcardPlayer = ({ cards }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!Array.isArray(cards) || cards.length === 0) {
    return <div className="arai-empty-state"><p>No flashcards available.</p></div>;
  }

  return (
    <div className="arai-fc-container">
      <div className="arai-fc-counter">{idx + 1} / {cards.length}</div>

      <div className="arai-fc-scene" onClick={() => setFlipped(!flipped)}>
        <div className={`arai-fc-card ${flipped ? 'flipped' : ''}`}>
          <div className="arai-fc-face arai-fc-front">
            <div className="arai-fc-label">Question</div>
            <div className="arai-fc-text">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {cards[idx]?.q || ''}
              </ReactMarkdown>
            </div>
            <div className="arai-fc-hint">Tap to flip</div>
          </div>
          <div className="arai-fc-face arai-fc-back">
            <div className="arai-fc-label">Answer</div>
            <div className="arai-fc-text">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {cards[idx]?.a || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="arai-fc-nav">
        <button
          className="arai-btn arai-btn-outline"
          disabled={idx === 0}
          onClick={() => { setIdx(i => i - 1); setFlipped(false); }}
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          className="arai-btn arai-btn-outline"
          disabled={idx >= cards.length - 1}
          onClick={() => { setIdx(i => i + 1); setFlipped(false); }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ============================================================
//  MAIN COMPONENT
// ============================================================

const StudyAIPage = () => {
  const { addNotification } = useNotifications();

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // View state: 'launcher' or 'workspace'
  const [view, setView] = useState('launcher');
  const [activeCategory, setActiveCategory] = useState('writing');
  const [activeToolId, setActiveToolId] = useState(null);

  // Tool I/O state
  const [inputText, setInputText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [rawOutput, setRawOutput] = useState(null);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Derived
  const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const filteredTools = activeCategoryObj?.tools || [];
  const activeToolObj = useMemo(() => {
    for (const cat of CATEGORIES) {
      const t = cat.tools.find(t => t.id === activeToolId);
      if (t) return { ...t, catId: cat.id };
    }
    return null;
  }, [activeToolId]);

  // Set default option when tool changes
  useEffect(() => {
    if (activeToolObj?.inputType === 'with-options' && activeToolObj.options?.length > 0) {
      setSelectedOption(activeToolObj.options[0]);
    }
  }, [activeToolObj]);

  // Open a tool
  const openTool = (toolId, catId) => {
    setActiveToolId(toolId);
    setActiveCategory(catId);
    setInputText('');
    setRawOutput(null);
    setCopied(false);
    setView('workspace');
  };

  // Back to launcher
  const goBack = () => {
    setView('launcher');
    setActiveToolId(null);
    setRawOutput(null);
    setInputText('');
  };

  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addNotification('success', 'Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================
  //  GEMINI API — Process tool input
  // ============================================================
  const handleProcess = async () => {
    if (!inputText.trim()) {
      addNotification('warning', 'Empty Input', 'Please enter some text first.');
      return;
    }
    if (!activeToolObj) return;

    setIsProcessing(true);
    setRawOutput(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key is missing. Configure your .env file.');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Append strict LaTeX requirement to prompt
      const basePrompt = activeToolObj.getPrompt(inputText, selectedOption);
      const prompt = basePrompt + "\n\nIMPORTANT: Write any and all mathematical equations, formulas, symbols, or expressions strictly in LaTeX format using inline $...$ or block $$...$$ delimiters (e.g., use $E=mc^2$ or $\\int_a^b x^2 \\, dx$).";

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();

      // Parse structured outputs
      if (activeToolObj.outputType.includes('ui') || activeToolObj.outputType === 'json-formulas') {
        responseText = responseText.replace(/^```json/im, '').replace(/^```/m, '').trim();
        if (responseText.endsWith('```')) responseText = responseText.slice(0, -3).trim();
        setRawOutput(JSON.parse(responseText));
      } else if (activeToolObj.outputType === 'code-block') {
        responseText = responseText.replace(/^```[a-z]*\n/i, '');
        if (responseText.endsWith('```')) responseText = responseText.slice(0, -3).trim();
        setRawOutput(responseText);
      } else {
        setRawOutput(responseText);
      }

      addNotification('success', 'Done', 'A.R.A.I. has generated your results.');
    } catch (e) {
      console.error('A.R.A.I. Error:', e);
      addNotification('warning', 'API Busy', 'Showing fallback data. Try again later.');

      // Fallback mock data
      if (activeToolObj.outputType === 'flashcards-ui') {
        setRawOutput([
          { q: 'What is the core concept of $E=mc^2$?', a: 'Energy equals mass times the speed of light squared.' },
          { q: 'What is the derivative of $x^2$?', a: 'The derivative is $2x$.' },
          { q: 'Solve for x: $2x + 4 = 10$.', a: '$x = 3$' }
        ]);
      } else if (activeToolObj.outputType === 'quiz-ui') {
        setRawOutput(Array(5).fill().map((_, i) => ({
          q: `Sample Question ${i + 1}: What is $\\int ${i + 1}x \\, dx$?`,
          options: [`$\\frac{${i + 1}}{2}x^2 + C$`, `$${i + 1}x^2 + C$`, `$\\frac{${i + 1}}{3}x^3 + C$`, `$${i + 1} + C$`],
          answer: `$\\frac{${i + 1}}{2}x^2 + C$`,
          explanation: `Using the power rule: add 1 to the exponent and divide by the new exponent.`
        })));
      } else if (activeToolObj.outputType === 'json-formulas') {
        setRawOutput([
          { subject: 'Physics', name: "Newton's Second Law", formula: 'F = ma' },
          { subject: 'Physics', name: 'Kinetic Energy', formula: 'KE = ½mv²' },
          { subject: 'Physics', name: "Einstein's Mass-Energy", formula: 'E = mc²' }
        ]);
      } else if (activeToolObj.outputType === 'code-block') {
        setRawOutput(`// API is currently busy — fallback response\nfunction example() {\n  console.log("Hello, World!");\n}`);
      } else {
        setRawOutput(`### ⚠️ API Temporarily Unavailable\n\nThe Gemini model is experiencing high demand. Please try again later.\n\n*This is a temporary fallback response.*`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  //  GEMINI API — Create More / Extend output
  // ============================================================
  const handleCreateMore = async () => {
    if (!activeToolObj || !rawOutput) return;

    setIsExpanding(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key is missing. Configure your .env file.');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      let prompt = '';
      const isList = activeToolObj.outputType.includes('ui') || activeToolObj.outputType === 'json-formulas';
      const latexInstruction = "\n\nIMPORTANT: Write any and all mathematical equations, formulas, symbols, or expressions strictly in LaTeX format using inline $...$ or block $$...$$ delimiters.";

      if (isList) {
        prompt = `Here is the original input prompt:\n"${inputText}"\n\nHere is the current list of items generated so far:\n${JSON.stringify(rawOutput)}\n\nPlease generate MORE new, unique additional items (do not duplicate the questions, flashcards, or formulas that are already listed). Respond strictly with a JSON array containing ONLY the new items in the exact same format (e.g., array of objects with the exact same keys).${latexInstruction}`;
      } else {
        prompt = `Here is the original input:\n"${inputText}"\n\nHere is the output generated so far:\n"${rawOutput}"\n\nPlease generate additional content to extend or expand this output. Do not duplicate or repeat what is already written. Continue the flow and style seamlessly. Respond with ONLY the new, additional content to be appended.${latexInstruction}`;
      }

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();

      if (isList) {
        responseText = responseText.replace(/^```json/im, '').replace(/^```/m, '').trim();
        if (responseText.endsWith('```')) responseText = responseText.slice(0, -3).trim();
        const newItems = JSON.parse(responseText);
        if (Array.isArray(newItems)) {
          setRawOutput(prev => [...(Array.isArray(prev) ? prev : []), ...newItems]);
        }
      } else if (activeToolObj.outputType === 'code-block') {
        responseText = responseText.replace(/^```[a-z]*\n/i, '');
        if (responseText.endsWith('```')) responseText = responseText.slice(0, -3).trim();
        setRawOutput(prev => prev + '\n' + responseText);
      } else {
        setRawOutput(prev => prev + '\n\n' + responseText);
      }

      addNotification('success', 'Extended', 'A.R.A.I. has added more results.');
    } catch (e) {
      console.error('A.R.A.I. Extension Error:', e);
      addNotification('warning', 'API Busy', 'Failed to generate more. Showing fallback items.');

      // Fallback mock additions
      if (activeToolObj.outputType === 'flashcards-ui') {
        setRawOutput(prev => [
          ...(Array.isArray(prev) ? prev : []),
          { q: 'What is the speed of light in a vacuum ($c$)?', a: '$c \\approx 3 \\times 10^8 \\text{ m/s}$' },
          { q: 'Define the Golden Ratio ($\\phi$).', a: '$\\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618$' }
        ]);
      } else if (activeToolObj.outputType === 'quiz-ui') {
        const currentLen = Array.isArray(rawOutput) ? rawOutput.length : 0;
        setRawOutput(prev => [
          ...(Array.isArray(prev) ? prev : []),
          {
            q: `Extra Question ${currentLen + 1}: What is the derivative of $\\sin(x)$?`,
            options: ['$\\cos(x)$', '$-\\cos(x)$', '$\\tan(x)$', '$\\csc(x)$'],
            answer: '$\\cos(x)$',
            explanation: 'The derivative of sine is cosine.'
          }
        ]);
      } else if (activeToolObj.outputType === 'json-formulas') {
        setRawOutput(prev => [
          ...(Array.isArray(prev) ? prev : []),
          { subject: 'Mathematics', name: 'Euler\'s Identity', formula: 'e^{i\\pi} + 1 = 0' }
        ]);
      } else {
        setRawOutput(prev => prev + '\n\n*A.R.A.I. was unable to contact the server for more details, but here is a reminder to review the concepts!*');
      }
    } finally {
      setIsExpanding(false);
    }
  };

  // ============================================================
  //  RENDER: Input Area
  // ============================================================
  const renderInput = () => {
    if (!activeToolObj) return null;
    const { inputType, placeholder, options } = activeToolObj;

    return (
      <div className="arai-section-body">
        {/* Option selector for tools that need it */}
        {inputType === 'with-options' && options && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target:</span>
            <select
              className="arai-option-select"
              value={selectedOption}
              onChange={e => setSelectedOption(e.target.value)}
            >
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}

        {/* Input field */}
        {inputType === 'short-text' ? (
          <input
            className="arai-short-input"
            type="text"
            placeholder={placeholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isProcessing) handleProcess(); }}
          />
        ) : (
          <textarea
            className={`arai-textarea ${inputType === 'code' ? 'code-mode' : ''}`}
            placeholder={placeholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            spellCheck={inputType !== 'code'}
          />
        )}

        {/* Generate button */}
        <button
          className="arai-generate-btn"
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><div className="arai-btn-spinner" /> Processing...</>
          ) : (
            <><Sparkles size={16} /> Generate Output</>
          )}
        </button>
      </div>
    );
  };

  // ============================================================
  //  RENDER: Output Area
  // ============================================================
  const renderOutput = () => {
    if (!activeToolObj) return null;

    // Empty state
    if (!rawOutput && !isProcessing) {
      return (
        <div className="arai-empty-state">
          <Cpu size={40} />
          <p>Ready to generate.<br />Output will appear here.</p>
        </div>
      );
    }

    // Processing state
    if (isProcessing) {
      return (
        <div className="arai-processing">
          <div className="arai-processing-rings">
            <div className="ring" />
            <div className="ring" />
            <div className="ring" />
          </div>
          <div className="arai-processing-text">A.R.A.I. is thinking...</div>
        </div>
      );
    }

    // Flashcards
    if (activeToolObj.outputType === 'flashcards-ui') {
      return <FlashcardPlayer cards={rawOutput} />;
    }

    // Quiz
    if (activeToolObj.outputType === 'quiz-ui') {
      return <QuizPlayer quizData={rawOutput} onReset={() => setRawOutput(null)} />;
    }

    // Formulas
    if (activeToolObj.outputType === 'json-formulas' && Array.isArray(rawOutput)) {
      return (
        <div className="arai-formula-grid" style={{ padding: '0.5rem' }}>
          {rawOutput.map((f, i) => (
            <div key={i} className="arai-formula-card">
              <div className="arai-formula-subject">{f.subject}</div>
              <div className="arai-formula-name">{f.name}</div>
              <div className="arai-formula-expr">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {`$${f.formula}$`}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Code block
    if (activeToolObj.outputType === 'code-block') {
      return (
        <div className="arai-code-output">
          <div className="arai-code-top">
            <div className="arai-code-dots">
              <div className="arai-code-dot" style={{ background: '#ff5f57' }} />
              <div className="arai-code-dot" style={{ background: '#febc2e' }} />
              <div className="arai-code-dot" style={{ background: '#28c840' }} />
            </div>
            <button className="arai-code-copy" onClick={() => handleCopy(rawOutput)}>
              {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
          <pre className="arai-code-body">{rawOutput}</pre>
        </div>
      );
    }

    // Default: Markdown
    return (
      <div className="arai-md-output">
        <div className="arai-md-top">
          <button className="arai-copy-float" onClick={() => handleCopy(rawOutput)}>
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        </div>
        <div className="arai-md-body">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {rawOutput}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  // ============================================================
  //  RENDER: Launcher View (Category orbs + tool grid)
  // ============================================================
  const renderLauncher = () => {
    const totalTools = CATEGORIES.reduce((s, c) => s + c.tools.length, 0);

    return (
      <>
        {/* Header */}
        <div className="arai-header">
          <div className="arai-header-glow" />
          <div className="arai-logo-row">
            <div className="arai-logo-icon">
              <Brain size={26} />
            </div>
            <h1 className="arai-title">A.R.A.I.</h1>
          </div>
          <p className="arai-subtitle">Advanced Resource & Artificial Intelligence Companion</p>
          <div className="arai-stats-row">
            <div className="arai-stat">
              <div className="arai-stat-dot" />
              <span>Online</span>
            </div>
            <div className="arai-stat">
              <Cpu size={13} />
              <span className="arai-stat-value">{totalTools}</span> Tools
            </div>
            <div className="arai-stat">
              <Activity size={13} />
              <span className="arai-stat-value">{CATEGORIES.length}</span> Categories
            </div>
          </div>
        </div>

        {/* Category Orbs */}
        <div className="arai-orbs-container">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`arai-orb ${activeCategory === cat.id ? 'active' : ''}`}
                data-cat={cat.id}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div className="arai-orb-circle">
                  <CatIcon size={isMobile ? 18 : 22} />
                  <div className="arai-orb-ring" />
                </div>
                <span className="arai-orb-count">{cat.tools.length}</span>
                <span className="arai-orb-label">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tool Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="arai-tool-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {filteredTools.map((tool, i) => {
              const ToolIcon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  className="arai-tool-card"
                  data-accent={activeCategory}
                  onClick={() => openTool(tool.id, activeCategory)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <div className="arai-tool-card-inner">
                    <div className={`arai-tool-icon arai-icon-${activeCategory}`}>
                      <ToolIcon size={20} />
                    </div>
                    <div className="arai-tool-info">
                      <h3 className="arai-tool-name">{tool.label}</h3>
                      <p className="arai-tool-desc">{tool.desc}</p>
                      <div className="arai-tool-meta">
                        <span className={`arai-tool-badge arai-badge-${activeCategory}`}>
                          {tool.outputType === 'markdown' ? 'Text' :
                           tool.outputType === 'code-block' ? 'Code' :
                           tool.outputType === 'flashcards-ui' ? 'Cards' :
                           tool.outputType === 'quiz-ui' ? 'Quiz' :
                           tool.outputType === 'json-formulas' ? 'Math' : 'AI'}
                        </span>
                        <div className="arai-tool-power">
                          <span>Power</span>
                          <div className="arai-power-bar">
                            {[1, 2, 3, 4, 5].map(n => (
                              <div key={n} className={`arai-power-seg ${n <= (tool.power || 3) ? 'on' : ''}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </>
    );
  };

  // ============================================================
  //  RENDER: Workspace View (focused tool interaction)
  // ============================================================
  const renderWorkspace = () => {
    if (!activeToolObj) return null;
    const ToolIcon = activeToolObj.icon;
    const catColor = CAT_COLORS[activeToolObj.catId] || CAT_COLORS.writing;

    return (
      <div className="arai-workspace">
        {/* Workspace Header */}
        <div className="arai-workspace-header">
          <button className="arai-back-btn" onClick={goBack} title="Back to tools">
            <ArrowLeft size={18} />
          </button>
          <div className="arai-ws-tool-icon" style={{ background: catColor.gradient }}>
            <ToolIcon size={20} />
          </div>
          <div className="arai-ws-tool-info">
            <div className="arai-ws-tool-name">
              {activeToolObj.label}
              <span className={`arai-ws-cat-badge arai-badge-${activeToolObj.catId}`}>
                {activeCategoryObj?.label}
              </span>
            </div>
            <p className="arai-ws-tool-desc">{activeToolObj.desc}</p>
          </div>
        </div>

        {/* Split Pane */}
        <div className="arai-split-pane">
          {/* Input Section */}
          <div className="arai-input-section">
            <div className="arai-section-bar">
              <div className="arai-section-label">
                <Send size={13} /> Input
              </div>
            </div>
            {renderInput()}
          </div>

          {/* Output Section */}
          <div className="arai-output-section">
            <div className="arai-section-bar">
              <div className="arai-section-label">
                <Sparkles size={13} /> A.R.A.I. Output
              </div>
              {rawOutput && !isProcessing && (
                <button
                  className="arai-extend-btn"
                  onClick={handleCreateMore}
                  disabled={isExpanding}
                >
                  {isExpanding ? (
                    <><div className="arai-btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Extending...</>
                  ) : (
                    <><Plus size={11} /> Create More</>
                  )}
                </button>
              )}
            </div>
            <div className="arai-section-body" style={{ overflow: 'auto' }}>
              {renderOutput()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  //  MAIN RENDER
  // ============================================================
  return (
    <motion.div
      className="arai-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {view === 'launcher' ? (
          <motion.div
            key="launcher"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {renderLauncher()}
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderWorkspace()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudyAIPage;
