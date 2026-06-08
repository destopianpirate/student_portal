import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BookOpen, Zap, Clock, Plus, Trash2, RotateCcw, Play, Pause, SkipForward, ChevronLeft, ChevronRight, Search, Copy, Check, MessageSquare, Code, Edit3, Type, Sparkles, Layout, PenTool, Terminal, CheckCircle, Lightbulb, Link2, Languages, RefreshCw, Scissors, Book, Map, Calculator, Database, FileText, GitCommit, ListTodo, FileCheck, CheckSquare, Target, Moon, Sun, Heart, AlignLeft } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// --- Quiz Player Component ---
const QuizPlayer = ({ quizData, onReset }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (showResult) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Quiz Complete!</h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>You scored {score} out of {quizData.length}</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-primary" onClick={() => { setCurrentQ(0); setSelected(null); setScore(0); setShowResult(false); }}>Try Again</button>
           <button className="btn btn-outline" onClick={onReset}>Create New Quiz</button>
        </div>
      </div>
    );
  }

  const q = quizData[currentQ];

  const handleSelect = (opt) => {
    if (selected) return; // Prevent multiple selections
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Question {currentQ + 1} of {quizData.length}</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>Score: {score}</span>
      </div>
      
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', lineHeight: 1.5 }}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.q}</ReactMarkdown>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.answer;
            const isSelected = selected === opt;
            let borderCol = 'var(--border)';
            let bgCol = 'transparent';
            if (selected) {
              if (isCorrect) { borderCol = '#22c55e'; bgCol = 'rgba(34, 197, 94, 0.1)'; }
              else if (isSelected) { borderCol = '#ef4444'; bgCol = 'rgba(239, 68, 68, 0.1)'; }
            }
            return (
              <div key={i} onClick={() => handleSelect(opt)} style={{ padding: '1rem', border: `2px solid ${borderCol}`, backgroundColor: bgCol, borderRadius: '0.5rem', cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</ReactMarkdown>
              </div>
            );
          })}
        </div>
        
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', borderLeft: `4px solid ${selected === q.answer ? '#22c55e' : '#ef4444'}` }}>
              <strong>{selected === q.answer ? 'Correct!' : 'Incorrect.'}</strong> {q.explanation && <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.explanation}</ReactMarkdown></span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn btn-primary" disabled={!selected} onClick={handleNext}>
          {currentQ < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
};

// --- Tool Configurations & Prompts ---
const CATEGORIES = [
  {
    id: 'writing',
    label: 'Writing & Language',
    icon: Type,
    tools: [
      {
        id: 'summarizer', label: 'Summarizer', icon: Edit3, desc: 'Extract key points from long texts',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'Paste long text to summarize...',
        getPrompt: (input) => `Summarize the following text into key bullet points:\n\n${input}`
      },
      {
        id: 'grammar', label: 'Grammar Checker', icon: CheckCircle, desc: 'Find and fix grammatical errors',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'Paste text to check for grammar...',
        getPrompt: (input) => `Check the following text for grammatical errors and provide corrections and explanations:\n\n${input}`
      },
      {
        id: 'essay', label: 'Essay Outliner', icon: PenTool, desc: 'Generate structured essay outlines',
        inputType: 'short-text', outputType: 'markdown', placeholder: 'Enter an essay topic...',
        getPrompt: (input) => `Generate a structured essay outline for the topic: "${input}". Include an Introduction, Body Paragraphs, and a Conclusion.`
      },
      {
        id: 'translator', label: 'Translator', icon: Languages, desc: 'Translate text between languages',
        inputType: 'with-options', outputType: 'markdown', placeholder: 'Paste text to translate...',
        options: ['Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese'],
        getPrompt: (input, option) => `Translate the following text into ${option}:\n\n${input}`
      },
      {
        id: 'paraphraser', label: 'Paraphraser', icon: RefreshCw, desc: 'Rewrite text for better flow',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'Paste text to paraphrase...',
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
        id: 'flashcards', label: 'Flashcard Gen', icon: Zap, desc: 'Turn notes into Q&A flashcards',
        inputType: 'textarea', outputType: 'flashcards-ui', placeholder: 'Paste study notes...',
        getPrompt: (input) => `Create 5 to 10 flashcards from the following text. Respond strictly with a JSON array of objects, where each object has a "q" (question) and "a" (answer) string property. Text:\n\n${input}`
      },
      {
        id: 'quiz', label: 'Quiz Maker', icon: Layout, desc: 'Generate practice questions',
        inputType: 'textarea', outputType: 'quiz-ui', placeholder: 'Paste material to generate a quiz...',
        getPrompt: (input) => `Create a 10-question multiple-choice quiz from the following text. Wrap ANY mathematical equations or expressions in standard LaTeX delimiters (use $...$ for inline math and $$...$$ for block math). Respond strictly with a JSON array of objects, where each object has "q" (question string), "options" (array of exactly 4 strings), "answer" (the exact string of the correct option), and "explanation" (a brief string explaining why the answer is correct). Text:\n\n${input}`
      },
      {
        id: 'explainer', label: 'Concept Explainer', icon: Lightbulb, desc: 'Simplify complex academic concepts',
        inputType: 'short-text', outputType: 'markdown', placeholder: 'Enter a complex concept...',
        getPrompt: (input) => `Explain the concept of "${input}" in simple, easy-to-understand terms suitable for a high school student. Use an analogy if possible.`
      },
      {
        id: 'syllabus', label: 'Syllabus Planner', icon: Book, desc: 'Create study schedules from syllabus',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'Paste your syllabus...',
        getPrompt: (input) => `Create a structured weekly study plan based on the following syllabus text. Break it down into weekly manageable chunks:\n\n${input}`
      },
      {
        id: 'math', label: 'Math Solver', icon: Calculator, desc: 'Step-by-step math problem explanations',
        inputType: 'short-text', outputType: 'markdown', placeholder: 'Enter a math problem (e.g. integrate x^2)...',
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
        id: 'bugfinder', label: 'Bug Finder', icon: Terminal, desc: 'Analyze code for potential issues',
        inputType: 'code', outputType: 'markdown', placeholder: 'Paste your buggy code here...',
        getPrompt: (input) => `Analyze the following code for bugs, syntax errors, and anti-patterns. Provide a list of issues and suggested fixes:\n\n\`\`\`\n${input}\n\`\`\``
      },
      {
        id: 'converter', label: 'Code Converter', icon: RefreshCw, desc: 'Translate code between languages',
        inputType: 'with-options', outputType: 'code-block', placeholder: 'Paste code to convert...',
        options: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust'],
        getPrompt: (input, option) => `Convert the following code into ${option}. Provide ONLY the converted code inside a markdown block without explanation:\n\n\`\`\`\n${input}\n\`\`\``
      },
      {
        id: 'regex', label: 'Regex Generator', icon: Sparkles, desc: 'Create regular expressions from text',
        inputType: 'short-text', outputType: 'code-block', placeholder: 'E.g. Match a valid email address...',
        getPrompt: (input) => `Generate a regular expression for the following requirement: "${input}". Provide ONLY the raw regex string in a code block, followed by a brief explanation.`
      },
      {
        id: 'schema', label: 'Schema Generator', icon: Database, desc: 'Design database schemas from text',
        inputType: 'textarea', outputType: 'code-block', placeholder: 'Describe the entities and relationships...',
        getPrompt: (input) => `Design a database schema for the following requirements. Provide the SQL CREATE TABLE statements in a code block:\n\n${input}`
      },
      {
        id: 'git', label: 'Git Helper', icon: GitCommit, desc: 'Find the right git commands',
        inputType: 'short-text', outputType: 'code-block', placeholder: 'E.g. Undo my last commit but keep changes...',
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
        id: 'pomodoro', label: 'Pomodoro Plan', icon: Clock, desc: 'Generate a focused study block schedule',
        inputType: 'short-text', outputType: 'markdown', placeholder: 'What do you want to study today?',
        getPrompt: (input) => `Generate a 4-block Pomodoro focus plan (25 min work, 5 min break) for studying: "${input}". Provide actionable steps for each block.`
      },
      {
        id: 'prioritizer', label: 'Task Prioritizer', icon: ListTodo, desc: 'Sort tasks by Eisenhower Matrix',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'List your tasks (one per line)...',
        getPrompt: (input) => `Categorize the following tasks into an Eisenhower Matrix (Urgent & Important, Important Not Urgent, Urgent Not Important, Neither). Format as a structured markdown list:\n\n${input}`
      },
      {
        id: 'resume', label: 'Resume Review', icon: FileCheck, desc: 'Get AI feedback on your resume',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'Paste your resume text...',
        getPrompt: (input) => `Review the following resume content and provide actionable feedback on action verbs, impact quantification, and formatting:\n\n${input}`
      },
      {
        id: 'formulas', label: 'Formula Generator', icon: Brain, desc: 'Generate key formulas for a topic',
        inputType: 'short-text', outputType: 'json-formulas', placeholder: 'E.g. Thermodynamics, Calculus...',
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
        id: 'meditation', label: 'Meditation Guide', icon: Moon, desc: 'Generate quick mindfulness exercises',
        inputType: 'short-text', outputType: 'markdown', placeholder: 'How are you feeling right now?',
        getPrompt: (input) => `Generate a 2-minute guided meditation script tailored for someone feeling: "${input}".`
      },
      {
        id: 'stress', label: 'Stress Tips', icon: Sun, desc: 'Get customized stress relief tips',
        inputType: 'textarea', outputType: 'markdown', placeholder: 'What is stressing you out?',
        getPrompt: (input) => `Provide 3 actionable, science-based tips to manage stress related to: "${input}". Be empathetic and concise.`
      }
    ]
  }
];

// --- Mock AI Generator Logic (Simulating Gemini JSON/Markdown parsing) ---
const simulateAIResponse = (toolConfig, input, option) => {
  const prompt = toolConfig.getPrompt(input, option);
  console.log("SENDING TO AI:\n", prompt); // Logs the prompt generated for Gemini

  // Mock returning strictly formatted responses based on outputType
  if (toolConfig.outputType === 'flashcards-ui') {
    return JSON.stringify([
      { q: `Mock Flashcard 1 based on: ${input.substring(0, 10)}...`, a: "Mock Answer 1" },
      { q: "Mock Flashcard 2", a: "Mock Answer 2" }
    ]);
  }
  if (toolConfig.outputType === 'quiz-ui') {
    return JSON.stringify([
      { q: `Mock Quiz Question 1?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option B" }
    ]);
  }
  if (toolConfig.outputType === 'json-formulas') {
    return JSON.stringify([
      { subject: input || "Physics", name: "Mock Formula", formula: "E = mc^2" }
    ]);
  }
  if (toolConfig.outputType === 'code-block') {
    return `// Generated code for: ${input}\nfunction mock() {\n  return "success";\n}`;
  }
  
  // Default Markdown fallback
  return `### Mock Generated Response\n\nBased on your input: *${input}*\n\n- Point 1\n- Point 2\n\n(This is a mock response matching outputType: **${toolConfig.outputType}**)\n\n**System Prompt Generated:**\n\`\`\`\n${prompt}\n\`\`\``;
};


// --- Main Component ---
const StudyAIPage = () => {
  const { addNotification } = useNotifications();
  const [activeCategory, setActiveCategory] = useState('writing');
  const [activeTool, setActiveTool] = useState('summarizer');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Shared state for all tools
  const [inputText, setInputText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Output state
  const [rawOutput, setRawOutput] = useState(null); // The raw string/json returned by AI

  // UI-specific interaction states
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const currentToolObj = currentCategoryObj?.tools.find(t => t.id === activeTool);

  // Initialize selectedOption when tool changes
  useEffect(() => {
    if (currentToolObj?.inputType === 'with-options' && currentToolObj.options?.length > 0) {
      setSelectedOption(currentToolObj.options[0]);
    }
  }, [currentToolObj]);

  const handleProcess = async () => {
    if (!inputText.trim()) {
      addNotification('warning', 'Empty Input', 'Please enter some text first.');
      return;
    }
    setIsProcessing(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please configure your .env file.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const prompt = currentToolObj.getPrompt(inputText, selectedOption);
      console.log("SENDING TO AI:\n", prompt);

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();

      // Clean up markdown wrappers for structured outputs
      if (currentToolObj.outputType.includes('ui') || currentToolObj.outputType === 'json-formulas') {
        responseText = responseText.replace(/^```json/im, '').replace(/^```/m, '').trim();
        if (responseText.endsWith('```')) {
          responseText = responseText.slice(0, -3).trim();
        }
        const parsed = JSON.parse(responseText);
        setRawOutput(parsed);
      } else if (currentToolObj.outputType === 'code-block') {
        responseText = responseText.replace(/^```[a-z]*\n/i, '');
        if (responseText.endsWith('```')) {
          responseText = responseText.slice(0, -3).trim();
        }
        setRawOutput(responseText);
      } else {
        setRawOutput(responseText);
      }
      
      setCurrentCard(0);
      setFlipped(false);
      addNotification('success', 'Processing Complete', 'A.R.A.I. has generated your results.');
    } catch (e) {
      console.error(e);
      addNotification('warning', 'API Busy', 'Gemini is experiencing high demand. Showing mock data instead.');
      
      // --- Fallback Mock Logic ---
      let fallbackOutput;
      if (currentToolObj.outputType === 'flashcards-ui') {
        fallbackOutput = [
          { q: `What is the core concept of $E=mc^2$?`, a: "Energy equals mass times the speed of light squared." },
          { q: `What is the derivative of $x^2$?`, a: "The derivative is $2x$." },
          { q: `Solve for x: $2x + 4 = 10$.`, a: "$x = 3$" }
        ];
      } else if (currentToolObj.outputType === 'quiz-ui') {
        fallbackOutput = Array(10).fill().map((_, i) => ({
          q: `Sample Math Question ${i+1}: What is $\\int ${i+1}x \\, dx$?`,
          options: [`$\\frac{${i+1}}{2}x^2 + C$`, `$${i+1}x^2 + C$`, `$\\frac{${i+1}}{3}x^3 + C$`, `$${i+1} + C$`],
          answer: `$\\frac{${i+1}}{2}x^2 + C$`,
          explanation: `Using the power rule for integration, you add 1 to the exponent (making it 2) and divide the coefficient by the new exponent, resulting in $\\frac{${i+1}}{2}x^2 + C$.`
        }));
      } else if (currentToolObj.outputType === 'json-formulas') {
        fallbackOutput = [{ subject: "Mock Subject", name: "Mock Formula", formula: "E = mc^2" }];
      } else if (currentToolObj.outputType === 'code-block') {
        fallbackOutput = `// API is currently busy.\n// Here is a mock code block fallback.\nfunction helloWorld() {\n  console.log("Hello!");\n}`;
      } else {
        fallbackOutput = `### ⚠️ API Unavailable\n\nThe Gemini model is currently experiencing high demand. Please try again later.\n\n*This is a temporary fallback response.*`;
      }
      
      setRawOutput(fallbackOutput);
      setCurrentCard(0);
      setFlipped(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAvatarForCategory = () => {
    switch (activeCategory) {
      case 'writing': return '/avatars/translator.png';
      case 'study': return '/avatars/study.png';
      case 'coding': return '/avatars/coding.png';
      case 'productivity': return '/avatars/productivity.png';
      case 'wellness': return '/avatars/wellness.png';
      default: return '/arai_avatar.png';
    }
  };

  // --- Render Helpers ---
  const renderInputArea = () => {
    if (!currentToolObj) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Input</label>
           {currentToolObj.inputType === 'with-options' && (
             <select 
               className="form-input" 
               style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem', height: 'auto' }}
               value={selectedOption}
               onChange={e => setSelectedOption(e.target.value)}
             >
               {currentToolObj.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
           )}
        </div>

        {currentToolObj.inputType === 'textarea' || currentToolObj.inputType === 'with-options' ? (
          <textarea
            style={{ flex: 1, minHeight: isMobile ? '150px' : '300px', resize: 'vertical', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', color: 'var(--text)', outline: 'none' }}
            placeholder={currentToolObj.placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        ) : currentToolObj.inputType === 'code' ? (
          <textarea
            style={{ flex: 1, minHeight: isMobile ? '150px' : '300px', resize: 'vertical', background: '#1e1e1e', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', color: '#d4d4d4', outline: 'none', fontFamily: 'monospace' }}
            placeholder={currentToolObj.placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <input
            type="text"
            className="form-input"
            style={{ padding: '1rem', height: 'auto' }}
            placeholder={currentToolObj.placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        )}

        <button 
          className="btn btn-primary" 
          style={{ height: '48px', fontSize: '1rem' }}
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }} /> : <><Sparkles size={18} /> Generate Output</>}
        </button>
      </div>
    );
  };

  const renderOutputArea = () => {
    if (!currentToolObj) return null;

    if (!rawOutput && !isProcessing) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '0.75rem' }}>
          <Brain size={48} />
          <p style={{ textAlign: 'center', padding: '0 1rem' }}>Ready to generate.<br/>Output will be formatted as <strong>{currentToolObj.outputType}</strong>.</p>
        </div>
      );
    }

    if (isProcessing) {
      return (
         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--primary)' }}>
           <div className="loading-spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }} />
           <p className="pulse-anim">A.R.A.I. is thinking...</p>
         </div>
      );
    }

    // --- Dynamic Renderers based on OutputType ---
    if (currentToolObj.outputType === 'flashcards-ui' && Array.isArray(rawOutput)) {
      return (
        <div className="flashcard-viewer" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div className="flashcard-counter" style={{ marginBottom: '1rem' }}>{currentCard + 1} / {rawOutput.length}</div>
          <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} style={{ width: '100%', maxWidth: '400px', height: '250px' }}>
            <div className="flashcard-front">
              <div className="flashcard-label">Q</div>
              <div className="flashcard-text">{rawOutput[currentCard]?.q}</div>
              <div className="flashcard-hint">Click to flip</div>
            </div>
            <div className="flashcard-back">
              <div className="flashcard-label">A</div>
              <div className="flashcard-text">{rawOutput[currentCard]?.a}</div>
            </div>
          </div>
          <div className="flashcard-nav" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.5rem', gap: '1rem' }}>
            <button className="btn btn-outline btn-sm" disabled={currentCard === 0} onClick={() => { setCurrentCard(p => p - 1); setFlipped(false); }}><ChevronLeft size={14} /> Prev</button>
            <button className="btn btn-outline btn-sm" disabled={currentCard >= rawOutput.length - 1} onClick={() => { setCurrentCard(p => p + 1); setFlipped(false); }}>Next <ChevronRight size={14} /></button>
          </div>
        </div>
      );
    }

    if (currentToolObj.outputType === 'quiz-ui' && Array.isArray(rawOutput)) {
      return <QuizPlayer quizData={rawOutput} onReset={() => setRawOutput(null)} />;
    }

    if (currentToolObj.outputType === 'json-formulas' && Array.isArray(rawOutput)) {
      return (
        <div className="formula-list" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr', flex: 1, overflowY: 'auto', alignContent: 'start' }}>
          {rawOutput.map((f, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid var(--primary)' }}>
              <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.subject}</span><h4 style={{ margin: '0.25rem 0 0.5rem 0' }}>{f.name}</h4></div>
              <code style={{ display: 'block', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', overflowX: 'auto', marginTop: '0.5rem' }}>{f.formula}</code>
            </div>
          ))}
        </div>
      );
    }

    if (currentToolObj.outputType === 'code-block') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
             <button className="btn-icon-sm" onClick={() => { navigator.clipboard.writeText(rawOutput); addNotification('success', 'Code copied'); }}><Copy size={14} /></button>
          </div>
          <textarea readOnly style={{ flex: 1, resize: 'none', background: '#1e1e1e', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', color: '#d4d4d4', outline: 'none', fontFamily: 'monospace' }} value={rawOutput} />
        </div>
      );
    }

    // Default Markdown View
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button className="btn-icon-sm" onClick={() => { navigator.clipboard.writeText(rawOutput); addNotification('success', 'Copied to clipboard'); }}><Copy size={14} /></button>
        </div>
        <div style={{ flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{rawOutput}</ReactMarkdown>
        </div>
      </div>
    );
  };


  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="page-container" variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* A.R.A.I. Header */}
      <motion.div variants={itemVariants} className="dashboard-premium-header" style={{ alignItems: 'center', padding: isMobile ? '1.5rem 1rem' : '2rem' }}>
        <div className="dashboard-premium-header-content" style={{ flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeCategory}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                src={getAvatarForCategory()} 
                alt="A.R.A.I. Avatar" 
                style={{ width: isMobile ? 70 : 90, height: isMobile ? 70 : 90, borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover', boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)' }} 
                onError={(e) => { e.target.src = '/arai_avatar.png'; }} // Fallback
              />
            </AnimatePresence>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: isMobile ? 14 : 18, height: isMobile ? 14 : 18, background: '#22c55e', borderRadius: '50%', border: '3px solid var(--card-bg)' }} />
          </div>
          <div>
            <h2 className="dashboard-premium-title" style={{ fontSize: isMobile ? '2rem' : '2.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              A.R.A.I.
            </h2>
            <p className="dashboard-premium-subtitle" style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', marginTop: '0.5rem' }}>Your Advanced Resource & Artificial Intelligence Companion</p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '2rem', marginTop: '2rem' }}>
        {/* Sidebar Categories & Tools */}
        <motion.div variants={itemVariants} style={{ width: isMobile ? '100%' : '260px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '1rem', position: isMobile ? 'relative' : 'sticky', top: '2rem', maxHeight: isMobile ? 'none' : 'calc(100vh - 4rem)', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem', paddingLeft: '0.5rem', display: isMobile ? 'none' : 'block' }}>A.R.A.I. Tools</h3>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '1.5rem' : '1.5rem', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '0.5rem' : 0 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0, minWidth: isMobile ? '180px' : 'auto' }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <cat.icon size={14} /> {cat.label}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {cat.tools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => { setActiveCategory(cat.id); setActiveTool(tool.id); setInputText(''); setRawOutput(null); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                          background: activeTool === tool.id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))' : 'transparent',
                          border: '1px solid',
                          borderColor: activeTool === tool.id ? 'var(--primary)' : 'transparent',
                          borderRadius: '0.5rem',
                          color: activeTool === tool.id ? 'var(--primary)' : 'var(--text)',
                          fontWeight: activeTool === tool.id ? 600 : 500,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <tool.icon size={14} /> {tool.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div variants={itemVariants} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          <div className="glass-card" style={{ padding: isMobile ? '1.5rem' : '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
                {currentToolObj?.icon && <currentToolObj.icon size={24} style={{ color: 'var(--primary)' }} />}
                {currentToolObj?.label}
              </h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: isMobile ? '0.85rem' : '1rem' }}>{currentToolObj?.desc}</p>
            </div>

            {/* General Input/Output Interface */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem', flex: 1 }}>
              {renderInputArea()}
              <div style={{ width: isMobile ? '100%' : '1px', height: isMobile ? '1px' : 'auto', background: 'var(--border)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>A.R.A.I. Output</label>
                {renderOutputArea()}
              </div>
            </div>

          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default StudyAIPage;
