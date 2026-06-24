import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  StickyNote, Plus, Search, Pin, Trash2, Edit3, X, Save, Tag, Folder, Star,
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Code2, Quote, Minus, Image as ImageIcon,
  Table, Pencil, Download, ChevronDown, FileText, FileDown, Type, Hash,
  MoreVertical, GripVertical, Clock, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Palette, Link, Eraser, FolderPlus, ChevronRight, Menu,
  ArrowLeft, PanelLeftClose, RotateCcw, Sparkles, BookOpen, Copy, Undo,
  Redo, Highlighter, Subscript, Superscript, Lock, Unlock, Maximize,
  Minimize, Indent, Outdent, Smile, Sliders, Volume2, VolumeX, Mic, BarChart2, Printer, Upload
} from 'lucide-react';

// ═══ Constants ═══
const COLORS = ['#6366f1', '#f472b6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];
const FONT_FAMILIES = {
  sansSerif: [
    { name: 'Inter', value: '"Inter", sans-serif' },
    { name: 'Roboto', value: '"Roboto", sans-serif' },
    { name: 'Open Sans', value: '"Open Sans", sans-serif' },
    { name: 'Lato', value: '"Lato", sans-serif' },
    { name: 'Montserrat', value: '"Montserrat", sans-serif' },
    { name: 'Poppins', value: '"Poppins", sans-serif' },
    { name: 'Nunito', value: '"Nunito", sans-serif' },
    { name: 'Raleway', value: '"Raleway", sans-serif' },
    { name: 'Quicksand', value: '"Quicksand", sans-serif' },
    { name: 'Ubuntu', value: '"Ubuntu", sans-serif' },
    { name: 'Josefin Sans', value: '"Josefin Sans", sans-serif' },
    { name: 'Cabin', value: '"Cabin", sans-serif' },
    { name: 'Work Sans', value: '"Work Sans", sans-serif' },
    { name: 'DM Sans', value: '"DM Sans", sans-serif' },
    { name: 'Outfit', value: '"Outfit", sans-serif' },
    { name: 'Oswald', value: '"Oswald", sans-serif' },
    { name: 'Helvetica', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' }
  ],
  serif: [
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
    { name: 'Merriweather', value: '"Merriweather", serif' },
    { name: 'Lora', value: '"Lora", serif' },
    { name: 'Cormorant Garamond', value: '"Cormorant Garamond", serif' },
    { name: 'EB Garamond', value: '"EB Garamond", serif' },
    { name: 'Libre Baskerville', value: '"Libre Baskerville", serif' },
    { name: 'Cinzel', value: '"Cinzel", serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Garamond', value: 'Garamond, serif' }
  ],
  monospace: [
    { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
    { name: 'Fira Code', value: '"Fira Code", monospace' },
    { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
    { name: 'Space Mono', value: '"Space Mono", monospace' },
    { name: 'Inconsolata', value: '"Inconsolata", monospace' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' }
  ],
  artistic: [
    { name: 'Pacifico', value: '"Pacifico", cursive' },
    { name: 'Caveat', value: '"Caveat", cursive' },
    { name: 'Dancing Script', value: '"Dancing Script", cursive' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
    { name: 'Impact', value: 'Impact, sans-serif' }
  ]
};

const DEFAULT_FOLDERS = ['General', 'Semester Notes', 'Quick Notes'];
const SLASH_COMMANDS = [
  { id: 'text', name: 'Text', desc: 'Plain paragraph', icon: Type, type: 'text' },
  { id: 'h1', name: 'Heading 1', desc: 'Large heading', icon: Heading1, type: 'h1' },
  { id: 'h2', name: 'Heading 2', desc: 'Medium heading', icon: Heading2, type: 'h2' },
  { id: 'h3', name: 'Heading 3', desc: 'Small heading', icon: Heading3, type: 'h3' },
  { id: 'checklist', name: 'Checklist', desc: 'To-do item', icon: CheckSquare, type: 'checklist' },
  { id: 'bullet', name: 'Bullet List', desc: 'Unordered list', icon: List, type: 'bullet' },
  { id: 'numbered', name: 'Numbered List', desc: 'Ordered list', icon: ListOrdered, type: 'numbered' },
  { id: 'code', name: 'Code Block', desc: 'Code snippet', icon: Code2, type: 'code' },
  { id: 'callout', name: 'Callout', desc: 'Highlighted info', icon: Quote, type: 'callout' },
  { id: 'divider', name: 'Divider', desc: 'Horizontal line', icon: Minus, type: 'divider' },
  { id: 'image', name: 'Image', desc: 'Embed image', icon: ImageIcon, type: 'image' },
  { id: 'math', name: 'Math', desc: 'LaTeX equation', icon: Hash, type: 'math' },
  { id: 'table', name: 'Table', desc: '3×3 table', icon: Table, type: 'table' },
  { id: 'drawing', name: 'Drawing', desc: 'Freehand sketch', icon: Pencil, type: 'drawing' },
];

// ═══ Helpers ═══
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const makeBlock = (type = 'text', content = '') => ({ id: genId(), type, content, checked: false, lang: 'javascript', tableData: null, imageData: null });

const getPlainText = (blocks) => blocks.map(b => {
  if (b.type === 'divider' || b.type === 'image' || b.type === 'drawing') return '';
  if (b.type === 'table' && b.tableData) return b.tableData.flat().join(' ');
  return b.content || '';
}).join('\n');

const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;
const readingTime = (wc) => Math.max(1, Math.ceil(wc / 200));

const loadNotes = () => { try { return JSON.parse(localStorage.getItem('notes_v2') || '[]'); } catch { return []; } };
const saveNotes = (notes) => localStorage.setItem('notes_v2', JSON.stringify(notes));
const loadFolders = () => { try { return JSON.parse(localStorage.getItem('notes_folders') || 'null') || DEFAULT_FOLDERS; } catch { return DEFAULT_FOLDERS; } };
const saveFolders = (f) => localStorage.setItem('notes_folders', JSON.stringify(f));

// ═══ Drawing Component ═══
const DrawingCanvas = ({ initialImage, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen'); // pen | eraser
  const lastPos = useRef(null);

  // Zoom and Pan states
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Touch tracking refs
  const lastTouchDistance = useRef(null);
  const lastTouchCenter = useRef(null);
  const isPanning = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialImage;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [initialImage]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    
    const clientX = touch.clientX - rect.left;
    const clientY = touch.clientY - rect.top;
    
    const canvasX = clientX * (canvas.width / rect.width);
    const canvasY = clientY * (canvas.height / rect.height);
    
    return { x: canvasX, y: canvasY };
  };

  const startDraw = (e) => {
    if (e.touches && e.touches.length > 1) {
      setDrawing(false);
      // Initialize panning
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      lastTouchCenter.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      isPanning.current = true;
      return;
    }
    
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (e.touches && e.touches.length > 1) {
      setDrawing(false);
      if (isPanning.current) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
        
        if (lastTouchDistance.current) {
          const factor = dist / lastTouchDistance.current;
          setScale(s => Math.max(0.5, Math.min(4, s * factor)));
        }
        
        if (lastTouchCenter.current) {
          const dx = (center.x - lastTouchCenter.current.x) / scale;
          const dy = (center.y - lastTouchCenter.current.y) / scale;
          setPan(p => ({ x: p.x + dx, y: p.y + dy }));
        }
        
        lastTouchDistance.current = dist;
        lastTouchCenter.current = center;
      }
      return;
    }
    
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    if (e.touches && e.touches.length < 2) {
      lastTouchDistance.current = null;
      lastTouchCenter.current = null;
      isPanning.current = false;
    }
    setDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    onSave(canvas.toDataURL('image/png'));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="drawing-inline-panel" onClick={e => e.stopPropagation()}>
      <div className="drawing-header">
        <div className="drawing-tools">
          <button className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')}><Pencil size={16} /></button>
          <button className={`toolbar-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}><Eraser size={16} /></button>
          <div className="notes-toolbar-divider" />
          {['#1e293b', '#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6'].map(c => (
            <button key={c} className={`toolbar-btn ${color === c ? 'active' : ''}`} onClick={() => { setColor(c); setTool('pen'); }}
              style={{ padding: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: color === c ? '2px solid var(--text)' : '2px solid transparent' }} />
            </button>
          ))}
          <div className="notes-toolbar-divider" />
          <select className="toolbar-select" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))}>
            <option value={2}>Thin</option>
            <option value={3}>Medium</option>
            <option value={6}>Thick</option>
          </select>
          <button className="toolbar-btn" onClick={handleClear} title="Clear"><RotateCcw size={14} /></button>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> {initialImage ? 'Save' : 'Insert'}</button>
        </div>
      </div>
      <div className="drawing-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          width={800}
          height={500}
          style={{
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center',
            transition: drawing ? 'none' : 'transform 0.05s ease-out'
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {/* Floating Zoom Controls */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, color: '#fff', fontSize: '12px' }}>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 6px', fontWeight: 'bold' }}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(4, s + 0.25))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 6px', fontWeight: 'bold' }}>+</button>
          <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>Reset</button>
        </div>
      </div>
    </div>
  );
};

// ═══ Block Wrapper for Drag & Drop ═══
const BlockWrapper = ({ block, idx, updateBlock, handleBlockKeyDown, deleteBlock, toggleCheck, blockRefs, editImageBlock, isNoteLocked, setFocusedBlockId, lineNumbersEnabled }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item value={block} dragListener={false} dragControls={controls} style={{ position: 'relative' }} className="note-block">
      <div className="block-drag-handle" onPointerDown={(e) => controls.start(e)}><GripVertical size={14} /></div>
      <div className="block-content">
        <BlockRenderer
          block={{ 
            ...block, 
            listIndex: block.type === 'numbered' ? (block.listIndex || idx + 1) : undefined,
            showLineNumbers: lineNumbersEnabled
          }}
          onChange={(updated) => updateBlock(block.id, updated)}
          onKeyDown={(e) => handleBlockKeyDown(e, block)}
          onDelete={() => deleteBlock(block.id)}
          onToggleCheck={toggleCheck}
          blockRef={el => { if (el) blockRefs.current[block.id] = el; }}
          isNoteLocked={isNoteLocked}
          setFocusedBlockId={setFocusedBlockId}
        />
      </div>
      <div className="block-context-menu">
        {block.type === 'image' && block.imageData && (
          <button className="block-context-btn" onClick={() => editImageBlock(block.id)} title="Edit image" style={{ marginRight: '4px' }}>
            <Pencil size={12} />
          </button>
        )}
        <button className="block-context-btn" onClick={() => deleteBlock(block.id)} title="Delete block"><X size={12} /></button>
      </div>
    </Reorder.Item>
  );
};

// ═══ Table Block Component ═══
const TableBlock = ({ block, onChange, isNoteLocked, setFocusedBlockId }) => {
  const [focusedCell, setFocusedCell] = useState(null);
  const data = block.tableData?.map(row => row.map(cell => typeof cell === 'string' ? { text: cell, rs: 1, cs: 1, hidden: false } : cell)) || 
               [[{text:'',rs:1,cs:1,hidden:false}, {text:'',rs:1,cs:1,hidden:false}, {text:'',rs:1,cs:1,hidden:false}], 
                [{text:'',rs:1,cs:1,hidden:false}, {text:'',rs:1,cs:1,hidden:false}, {text:'',rs:1,cs:1,hidden:false}], 
                [{text:'',rs:1,cs:1,hidden:false}, {text:'',rs:1,cs:1,hidden:false}, {text:'',rs:1,cs:1,hidden:false}]];

  const updateData = (nd) => onChange({ ...block, tableData: nd });

  const addRow = (ri) => {
    const nd = data.map(r => r.map(c => ({...c})));
    nd.splice(ri, 0, Array(data[0].length).fill(null).map(() => ({text:'', rs:1, cs:1, hidden:false})));
    updateData(nd);
  };
  const addCol = (ci) => {
    const nd = data.map(r => {
      const nr = r.map(c => ({...c}));
      nr.splice(ci, 0, {text:'', rs:1, cs:1, hidden:false});
      return nr;
    });
    updateData(nd);
  };
  const delRow = (ri) => {
    if (data.length <= 1) return;
    updateData(data.filter((_, i) => i !== ri));
    setFocusedCell(null);
  };
  const delCol = (ci) => {
    if (data[0].length <= 1) return;
    updateData(data.map(r => r.filter((_, i) => i !== ci)));
    setFocusedCell(null);
  };
  const mergeRight = (ri, ci) => {
    if (ci >= data[0].length - 1) return;
    const nd = data.map(r => r.map(c => ({...c})));
    nd[ri][ci].cs += 1;
    nd[ri][ci+1].hidden = true;
    updateData(nd);
  };
  const mergeDown = (ri, ci) => {
    if (ri >= data.length - 1) return;
    const nd = data.map(r => r.map(c => ({...c})));
    nd[ri][ci].rs += 1;
    nd[ri+1][ci].hidden = true;
    updateData(nd);
  };

  return (
    <div className="block-table-wrap" style={{ position: 'relative', paddingRight: isNoteLocked ? '0' : '24px', paddingBottom: isNoteLocked ? '0' : '24px' }}>
      <table className="block-table">
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => cell.hidden ? null : (
                <td key={ci} rowSpan={cell.rs} colSpan={cell.cs} style={{ position: 'relative' }}>
                  {!isNoteLocked && focusedCell && focusedCell.r === ri && focusedCell.c === ci && (
                    <div style={{ position: 'absolute', top: -30, left: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', gap: '4px', padding: '4px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                      <button title="Add Row Above" onClick={() => addRow(ri)} style={{ cursor: 'pointer', background: 'var(--input-bg)', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>+R↑</button>
                      <button title="Add Row Below" onClick={() => addRow(ri+1)} style={{ cursor: 'pointer', background: 'var(--input-bg)', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>+R↓</button>
                      <button title="Add Col Left" onClick={() => addCol(ci)} style={{ cursor: 'pointer', background: 'var(--input-bg)', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>+C←</button>
                      <button title="Add Col Right" onClick={() => addCol(ci+1)} style={{ cursor: 'pointer', background: 'var(--input-bg)', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>+C→</button>
                      <div style={{ width: '1px', background: 'var(--border)', margin: '0 2px' }} />
                      <button title="Merge Right" onClick={() => mergeRight(ri, ci)} style={{ cursor: 'pointer', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>Merge→</button>
                      <button title="Merge Down" onClick={() => mergeDown(ri, ci)} style={{ cursor: 'pointer', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>Merge↓</button>
                      <div style={{ width: '1px', background: 'var(--border)', margin: '0 2px' }} />
                      <button title="Delete Row" onClick={() => delRow(ri)} style={{ cursor: 'pointer', background: 'var(--danger)', color: '#fff', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>-Row</button>
                      <button title="Delete Col" onClick={() => delCol(ci)} style={{ cursor: 'pointer', background: 'var(--danger)', color: '#fff', border: 'none', fontSize: '11px', padding: '2px 4px', borderRadius: '4px' }}>-Col</button>
                    </div>
                  )}
                  <div contentEditable={!isNoteLocked} suppressContentEditableWarning
                    onFocus={() => { setFocusedCell({ r: ri, c: ci }); setFocusedBlockId(block.id); }}
                    onBlur={e => {
                      setTimeout(() => {
                        setFocusedCell(prev => prev?.r === ri && prev?.c === ci ? null : prev);
                      }, 200);
                      const nd = data.map(r => r.map(c => ({...c})));
                      nd[ri][ci].text = e.currentTarget.textContent;
                      updateData(nd);
                    }}
                  >{cell.text}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!isNoteLocked && <button onClick={() => addCol(data[0].length)} title="Add Column" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'var(--input-bg)', color: 'var(--text-muted)', cursor: 'pointer', height: 'calc(100% - 24px)', width: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>}
      {!isNoteLocked && <button onClick={() => addRow(data.length)} title="Add Row" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', border: 'none', background: 'var(--input-bg)', color: 'var(--text-muted)', cursor: 'pointer', width: 'calc(100% - 24px)', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>}
    </div>
  );
};

const BlockRenderer = ({ block, onChange, onKeyDown, onDelete, onToggleCheck, blockRef, isNoteLocked, setFocusedBlockId }) => {
  const blockStyle = {
    lineHeight: block.lineHeight || 'inherit',
    letterSpacing: block.letterSpacing === 'tight' ? '-0.05em' : block.letterSpacing === 'wide' ? '0.1em' : block.letterSpacing === 'extrawide' ? '0.2em' : 'inherit',
    textShadow: block.textShadow || 'none',
    direction: block.direction || 'ltr',
    fontFamily: block.fontName || 'inherit',
    fontSize: block.fontSize || 'inherit',
    color: block.foreColor || 'inherit',
    backgroundColor: block.backColor || 'transparent'
  };

  switch (block.type) {
    case 'divider':
      return <hr className={`block-divider ${block.dividerStyle ? `divider-${block.dividerStyle}` : ''}`} />;

    case 'code': {
      const lineCount = (block.content || '').split('\n').length || 1;
      return (
        <div className="block-code-wrap">
          <div className="block-code-header">
            <select value={block.lang || 'javascript'} onChange={e => onChange({ ...block, lang: e.target.value })} disabled={isNoteLocked}>
              {['javascript', 'python', 'java', 'c++', 'html', 'css', 'sql', 'bash', 'json', 'other'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button className="toolbar-btn" onClick={() => navigator.clipboard?.writeText(block.content)} title="Copy"><Copy size={12} /></button>
          </div>
          <div className={`block-code-content ${block.showLineNumbers ? 'has-line-numbers' : ''}`}>
            {block.showLineNumbers && (
              <div className="code-line-numbers" contentEditable={false} style={{ userSelect: 'none' }}>
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i} style={{ height: '1.6em' }}>{i + 1}</div>
                ))}
              </div>
            )}
            <div
              ref={el => {
                if (el) {
                  if (blockRef) blockRef(el);
                  if (document.activeElement !== el) {
                    if (el.textContent !== block.content) {
                      el.textContent = block.content || '';
                    }
                  } else {
                    if (!el.textContent && block.content) {
                      el.textContent = block.content;
                    }
                  }
                }
              }}
              className="block-code-editable-area"
              contentEditable={!isNoteLocked}
              suppressContentEditableWarning
              onInput={e => onChange({ ...block, content: e.currentTarget.textContent })}
              onKeyDown={onKeyDown}
              onFocus={() => setFocusedBlockId(block.id)}
              style={{ ...blockStyle, outline: 'none', whiteSpace: 'pre-wrap' }}
              data-placeholder="Write code..."
            />
          </div>
        </div>
      );
    }

    case 'callout':
      return (
        <div className="block-callout">
          <div
            ref={el => {
              if (el) {
                if (blockRef) blockRef(el);
                if (document.activeElement !== el) {
                  if (el.innerHTML !== block.content) {
                    el.innerHTML = block.content || '';
                  }
                } else {
                  if (!el.innerHTML && block.content) {
                    el.innerHTML = block.content;
                  }
                }
              }
            }}
            className="block-content-editable"
            contentEditable={!isNoteLocked}
            suppressContentEditableWarning
            onInput={e => onChange({ ...block, content: e.currentTarget.innerHTML })}
            onKeyDown={onKeyDown}
            onFocus={() => setFocusedBlockId(block.id)}
            style={blockStyle}
            data-placeholder="Type a callout..."
            data-block-type="callout"
          />
        </div>
      );

    case 'checklist':
      return (
        <div className={`block-checklist ${block.checked ? 'checked' : ''}`}>
          <input type="checkbox" checked={block.checked || false} onChange={() => onToggleCheck(block.id)} disabled={isNoteLocked} />
          <div
            ref={el => {
              if (el) {
                if (blockRef) blockRef(el);
                if (document.activeElement !== el) {
                  if (el.innerHTML !== block.content) {
                    el.innerHTML = block.content || '';
                  }
                } else {
                  if (!el.innerHTML && block.content) {
                    el.innerHTML = block.content;
                  }
                }
              }
            }}
            className="block-content-editable"
            contentEditable={!isNoteLocked}
            suppressContentEditableWarning
            onInput={e => onChange({ ...block, content: e.currentTarget.innerHTML })}
            onKeyDown={onKeyDown}
            onFocus={() => setFocusedBlockId(block.id)}
            style={blockStyle}
            data-placeholder="To-do item..."
          />
        </div>
      );

    case 'image':
      return block.imageData ? (
        <div className="block-image-wrap">
          <img src={block.imageData} alt="Note attachment" />
        </div>
      ) : null;

    case 'math':
      return (
        <div className="block-math">
          <input
            ref={blockRef}
            className="block-math-input"
            value={block.content || ''}
            onChange={e => onChange({ ...block, content: e.target.value })}
            onKeyDown={onKeyDown}
            onFocus={() => setFocusedBlockId(block.id)}
            style={blockStyle}
            placeholder="LaTeX expression..."
            disabled={isNoteLocked}
          />
          {block.content && (
            <div style={{ marginTop: '.5rem', fontSize: '1.1rem' }}>
              <MathPreview tex={block.content} />
            </div>
          )}
        </div>
      );

    case 'table':
      return <TableBlock block={block} onChange={onChange} isNoteLocked={isNoteLocked} setFocusedBlockId={setFocusedBlockId} />;

    default: {
      const isList = block.type === 'bullet' || block.type === 'numbered';
      return (
        <div style={isList ? { paddingLeft: '1.25rem', position: 'relative' } : undefined}>
          {isList && (
            <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)', fontSize: '.85rem', userSelect: 'none' }}>
              {block.type === 'bullet' ? '•' : `${block.listIndex || 1}.`}
            </span>
          )}
          <div
            ref={el => {
              if (el) {
                if (blockRef) blockRef(el);
                if (document.activeElement !== el) {
                  if (el.innerHTML !== block.content) {
                    el.innerHTML = block.content || '';
                  }
                } else {
                  if (!el.innerHTML && block.content) {
                    el.innerHTML = block.content;
                  }
                }
              }
            }}
            className="block-content-editable"
            contentEditable={!isNoteLocked}
            suppressContentEditableWarning
            onInput={e => onChange({ ...block, content: e.currentTarget.innerHTML })}
            onKeyDown={onKeyDown}
            onFocus={() => setFocusedBlockId(block.id)}
            style={blockStyle}
            data-placeholder={block.type === 'h1' ? 'Heading 1' : block.type === 'h2' ? 'Heading 2' : block.type === 'h3' ? 'Heading 3' : ""}
            data-block-type={block.type}
          />
        </div>
      );
    }
  }
};

// ═══ Math Preview (using KaTeX if available) ═══
const MathPreview = ({ tex }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!tex || !ref.current) return;
    import('katex').then(katex => {
      try {
        katex.default.render(tex, ref.current, { throwOnError: false, displayMode: true });
      } catch { ref.current.textContent = tex; }
    }).catch(() => { ref.current.textContent = tex; });
  }, [tex]);
  return <div ref={ref} />;
};

// ── Caret Helpers ──
const isCaretAtStart = (el) => {
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    return el.selectionStart === 0;
  }
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length === 0;
  }
  return false;
};

const isCaretAtEnd = (el) => {
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    return el.selectionEnd === el.value.length;
  }
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const postCaretRange = range.cloneRange();
    postCaretRange.selectNodeContents(el);
    postCaretRange.setStart(range.endContainer, range.endOffset);
    return postCaretRange.toString().length === 0;
  }
  return false;
};

const focusElementAtStart = (el) => {
  el.focus();
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    el.setSelectionRange(0, 0);
    return;
  }
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};

const focusElementAtEnd = (el) => {
  el.focus();
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const len = el.value.length;
    el.setSelectionRange(len, len);
    return;
  }
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
};

// ═══ Main Notes Page ═══
const NotesPage = () => {
  const { currentUser } = useAuth();

  // ── State ──
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);

  useEffect(() => {
    if (currentUser?.uid) {
      try {
        const storedNotes = localStorage.getItem(`notes_v2_${currentUser.uid}`);
        setNotes(storedNotes ? JSON.parse(storedNotes) : []);
        const storedFolders = localStorage.getItem(`notes_folders_${currentUser.uid}`);
        setFolders(storedFolders ? JSON.parse(storedFolders) : DEFAULT_FOLDERS);
      } catch (e) {
        setNotes([]);
        setFolders(DEFAULT_FOLDERS);
      }
    }
  }, [currentUser]);

  const saveNotes = (updated) => {
    if (currentUser?.uid) {
      localStorage.setItem(`notes_v2_${currentUser.uid}`, JSON.stringify(updated));
    }
  };

  const saveFolders = (updated) => {
    if (currentUser?.uid) {
      localStorage.setItem(`notes_folders_${currentUser.uid}`, JSON.stringify(updated));
    }
  };

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [sidebarView, setSidebarView] = useState('all'); // all | favorites | trash | folder:NAME
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuIdx, setSlashMenuIdx] = useState(0);
  const [slashFilter, setSlashFilter] = useState('');
  const [showDrawing, setShowDrawing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | saving
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isNoteLocked, setIsNoteLocked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [replaceVal, setReplaceVal] = useState('');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const blockRefs = useRef({});
  const slashBlockId = useRef(null);
  const saveTimer = useRef(null);
  const contentAreaRef = useRef(null);

  // ── Advanced Options States ──
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [wordGoal, setWordGoal] = useState(0);
  const [lineNumbersEnabled, setLineNumbersEnabled] = useState(false);
  const [showDictLookup, setShowDictLookup] = useState(false);
  const [dictWord, setDictWord] = useState('');
  const [dictDefinition, setDictDefinition] = useState(null);
  const [loadingDict, setLoadingDict] = useState(false);
  const recognitionRef = useRef(null);

  // ── Custom Dropdown States ──
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [currentFont, setCurrentFont] = useState('Default');
  const [currentSize, setCurrentSize] = useState('16px');

  // ── Context Menu State ──
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectionText: '' });

  // ── Mobile Modal State ──
  const [mobileModal, setMobileModal] = useState(null); // 'font' | 'size' | 'color' | 'highlight' | 'theme' | 'emoji' | 'symbol' | null

  // ── Active note ──
  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId), [notes, activeNoteId]);

  // ── Stats ──
  const activeText = activeNote ? getPlainText(activeNote.blocks) : '';
  const wc = wordCount(activeText);
  const charCount = activeText.length;
  const rt = readingTime(wc);

  // ── Advanced Memos ──
  const headingOutlines = useMemo(() => {
    if (!activeNote) return [];
    return activeNote.blocks
      .filter(b => ['h1', 'h2', 'h3'].includes(b.type))
      .map(b => ({
        id: b.id,
        type: b.type,
        text: b.content || 'Untitled Heading'
      }));
  }, [activeNote]);

  const checklistStats = useMemo(() => {
    if (!activeNote) return { total: 0, completed: 0, percent: 0 };
    const checklists = activeNote.blocks.filter(b => b.type === 'checklist');
    const total = checklists.length;
    const completed = checklists.filter(b => b.checked).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [activeNote]);

  const goalPercent = useMemo(() => {
    if (!wordGoal || wordGoal <= 0) return 0;
    return Math.min(100, Math.round((wc / wordGoal) * 100));
  }, [wc, wordGoal]);

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, selectionText: '' });
  };

  const handleContextMenu = (e) => {
    if (contentAreaRef.current && contentAreaRef.current.contains(e.target)) {
      e.preventDefault();
      const sel = window.getSelection();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        selectionText: sel ? sel.toString() : ''
      });
    }
  };

  const handleContextCopy = () => {
    const sel = window.getSelection();
    if (sel && sel.toString()) {
      navigator.clipboard.writeText(sel.toString());
    }
    closeContextMenu();
  };

  const handleContextCut = () => {
    const sel = window.getSelection();
    if (sel && sel.toString() && focusedBlockId) {
      navigator.clipboard.writeText(sel.toString());
      document.execCommand('delete');
    }
    closeContextMenu();
  };

  const handleContextPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        insertTextAtCursor(text);
      }
    } catch (err) {
      alert("Please press Ctrl+V (or Cmd+V) to paste, or allow clipboard access in your browser.");
    }
    closeContextMenu();
  };

  // Sync toolbar Font/Size indicators with focused block styling
  useEffect(() => {
    if (focusedBlockId && activeNote) {
      const block = activeNote.blocks.find(b => b.id === focusedBlockId);
      if (block) {
        let foundFont = 'Default';
        if (block.fontName) {
          for (const group of Object.values(FONT_FAMILIES)) {
            const f = group.find(item => item.value === block.fontName || item.name === block.fontName);
            if (f) {
              foundFont = f.name;
              break;
            }
          }
        }
        setCurrentFont(foundFont);
        setCurrentSize(block.fontSize || '16px');
      }
    }
  }, [focusedBlockId, activeNote]);

  // Auto-selection menu on mobile devices
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!isMobile) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        if (contentAreaRef.current && contentAreaRef.current.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          setContextMenu({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8,
            selectionText: sel.toString()
          });
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isMobile]);



  useEffect(() => {
    try {
      document.execCommand('styleWithCSS', false, true);
    } catch (e) {
      console.warn('styleWithCSS not supported:', e);
    }
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);



  // ── Auto save ──
  const persistNotes = useCallback((updated) => {
    setNotes(updated);
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveNotes(updated);
      setSaveStatus('saved');
    }, 500);
  }, []);

  // ── Filtered notes ──
  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => !n.deleted);
    if (sidebarView === 'favorites') result = result.filter(n => n.pinned);
    else if (sidebarView === 'trash') result = notes.filter(n => n.deleted);
    else if (sidebarView.startsWith('folder:')) {
      const folderName = sidebarView.slice(7);
      result = result.filter(n => n.folder === folderName);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || getPlainText(n.blocks || []).toLowerCase().includes(q));
    }
    return result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, sidebarView, searchQuery]);

  // ── Note CRUD ──
  const createNote = (folder = null) => {
    const targetFolder = folder || (sidebarView.startsWith('folder:') ? sidebarView.slice(7) : 'General');
    const note = {
      id: genId(),
      title: '',
      blocks: [makeBlock('text')],
      folder: targetFolder,
      tags: [],
      color: '#6366f1',
      pinned: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    persistNotes(updated);
    setActiveNoteId(note.id);
    if (isMobile) setSidebarOpen(false);
    // focus title after render
    setTimeout(() => {
      const titleEl = document.querySelector('.notes-editor-title');
      if (titleEl) titleEl.focus();
    }, 100);
  };

  const updateNote = useCallback((noteId, changes) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n);
    persistNotes(updated);
  }, [notes, persistNotes]);

  const deleteNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    if (note.deleted) {
      // Permanent delete
      persistNotes(notes.filter(n => n.id !== noteId));
    } else {
      // Soft delete
      updateNote(noteId, { deleted: true });
    }
    if (activeNoteId === noteId) setActiveNoteId(null);
  };

  const restoreNote = (noteId) => {
    updateNote(noteId, { deleted: false });
  };

  const togglePin = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) updateNote(noteId, { pinned: !note.pinned });
  };

  // ── Block operations ──
  const updateBlock = useCallback((blockId, changes) => {
    if (!activeNote) return;
    const updated = activeNote.blocks.map(b => b.id === blockId ? { ...b, ...changes } : b);
    updateNote(activeNote.id, { blocks: updated });
  }, [activeNote, updateNote]);

  const insertBlockAfter = useCallback((afterId, type = 'text', extra = {}) => {
    if (!activeNote) return;
    const afterBlock = activeNote.blocks.find(b => b.id === afterId);
    const inheritedStyles = afterBlock ? {
      fontName: afterBlock.fontName,
      fontSize: afterBlock.fontSize,
      foreColor: afterBlock.foreColor,
      backColor: afterBlock.backColor,
      lineHeight: afterBlock.lineHeight,
      letterSpacing: afterBlock.letterSpacing,
      direction: afterBlock.direction
    } : {};
    const newBlock = { ...makeBlock(type), ...inheritedStyles, ...extra };
    const idx = activeNote.blocks.findIndex(b => b.id === afterId);
    const updated = [...activeNote.blocks];
    updated.splice(idx + 1, 0, newBlock);
    updateNote(activeNote.id, { blocks: updated });
    // Focus new block
    setTimeout(() => {
      const el = blockRefs.current[newBlock.id];
      if (el) el.focus();
    }, 50);
    return newBlock.id;
  }, [activeNote, updateNote]);

  const deleteBlock = useCallback((blockId, focusAtEnd = false) => {
    if (!activeNote || activeNote.blocks.length <= 1) return;
    const idx = activeNote.blocks.findIndex(b => b.id === blockId);
    const updated = activeNote.blocks.filter(b => b.id !== blockId);
    updateNote(activeNote.id, { blocks: updated });
    // Focus previous block
    if (idx > 0) {
      setTimeout(() => {
        const prevBlock = updated[idx - 1];
        const el = blockRefs.current[prevBlock?.id];
        if (el) {
          if (focusAtEnd) {
            focusElementAtEnd(el);
          } else {
            el.focus();
          }
        }
      }, 50);
    }
  }, [activeNote, updateNote]);

  const toggleCheck = useCallback((blockId) => {
    if (!activeNote) return;
    const block = activeNote.blocks.find(b => b.id === blockId);
    if (block) updateBlock(blockId, { checked: !block.checked });
  }, [activeNote, updateBlock]);

  // ── Markdown shortcuts ──
  const handleBlockKeyDown = useCallback((e, block) => {
    const content = e.currentTarget.textContent || '';

    if (isNoteLocked) return;

    // Slash command
    if (e.key === '/' && content === '') {
      e.preventDefault();
      slashBlockId.current = block.id;
      setSlashFilter('');
      setSlashMenuIdx(0);
      setShowSlashMenu(true);
      return;
    }

    // Arrow keys navigation
    if (e.key === 'ArrowUp') {
      if (isCaretAtStart(e.currentTarget)) {
        e.preventDefault();
        const idx = activeNote.blocks.findIndex(b => b.id === block.id);
        for (let i = idx - 1; i >= 0; i--) {
          const prevBlock = activeNote.blocks[i];
          const prevEl = blockRefs.current[prevBlock.id];
          if (prevEl) {
            focusElementAtEnd(prevEl);
            break;
          }
        }
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      if (isCaretAtEnd(e.currentTarget)) {
        e.preventDefault();
        const idx = activeNote.blocks.findIndex(b => b.id === block.id);
        for (let i = idx + 1; i < activeNote.blocks.length; i++) {
          const nextBlock = activeNote.blocks[i];
          const nextEl = blockRefs.current[nextBlock.id];
          if (nextEl) {
            focusElementAtStart(nextEl);
            break;
          }
        }
        return;
      }
    }

    // Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showSlashMenu) return; // handled by slash menu
      if (block.type === 'code') return; // let browser handle it (newlines in code blocks)

      e.preventDefault();

      // Markdown shortcuts on Enter
      const text = content.trimStart();
      if (text.startsWith('# ') && block.type === 'text') {
        updateBlock(block.id, { type: 'h1', content: text.slice(2) });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = text.slice(2); el.focus(); } }, 30);
        return;
      }
      if (text.startsWith('## ') && block.type === 'text') {
        updateBlock(block.id, { type: 'h2', content: text.slice(3) });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = text.slice(3); el.focus(); } }, 30);
        return;
      }
      if (text.startsWith('### ') && block.type === 'text') {
        updateBlock(block.id, { type: 'h3', content: text.slice(4) });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = text.slice(4); el.focus(); } }, 30);
        return;
      }
      if (text.startsWith('- [ ] ') || text.startsWith('- [x] ')) {
        updateBlock(block.id, { type: 'checklist', content: text.slice(6), checked: text.startsWith('- [x]') });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = text.slice(6); el.focus(); } }, 30);
        return;
      }
      if (text === '---' || text === '***') {
        updateBlock(block.id, { type: 'divider', content: '' });
        insertBlockAfter(block.id);
        return;
      }
      if (text.startsWith('> ')) {
        updateBlock(block.id, { type: 'callout', content: text.slice(2) });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = text.slice(2); el.focus(); } }, 30);
        return;
      }
      if (text.startsWith('```')) {
        updateBlock(block.id, { type: 'code', content: '', lang: text.slice(3).trim() || 'javascript' });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = ''; el.focus(); } }, 30);
        return;
      }
      if (text.startsWith('- ') && block.type === 'text') {
        updateBlock(block.id, { type: 'bullet', content: text.slice(2) });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = text.slice(2); el.focus(); } }, 30);
        return;
      }
      if (/^\d+\.\s/.test(text) && block.type === 'text') {
        const numMatch = text.match(/^(\d+)\.\s(.*)/);
        updateBlock(block.id, { type: 'numbered', content: numMatch[2], listIndex: parseInt(numMatch[1]) });
        setTimeout(() => { const el = blockRefs.current[block.id]; if (el) { el.textContent = numMatch[2]; el.focus(); } }, 30);
        return;
      }

      // Default: split content at caret and insert new block below
      const sel = window.getSelection();
      let leftContent = content;
      let rightContent = '';
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const postCaretRange = range.cloneRange();
        postCaretRange.selectNodeContents(e.currentTarget);
        postCaretRange.setStart(range.startContainer, range.startOffset);
        const postContentFragment = postCaretRange.extractContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(postContentFragment);
        rightContent = tempDiv.innerHTML;
        leftContent = e.currentTarget.innerHTML;
      }

      // Clean up common empty/trailing HTML tags
      if (rightContent === '<br>' || rightContent === '<div><br></div>') {
        rightContent = '';
      }
      if (leftContent === '<br>' || leftContent === '<div><br></div>') {
        leftContent = '';
      }

      updateBlock(block.id, { content: leftContent });

      const nextType = (block.type === 'checklist' || block.type === 'bullet' || block.type === 'numbered') ? block.type : 'text';
      const extra = block.type === 'numbered' ? { listIndex: (block.listIndex || 1) + 1 } : {};
      insertBlockAfter(block.id, nextType, { content: rightContent, ...extra });
      return;
    }

    // Backspace on empty block
    if (e.key === 'Backspace' && (content === '' || e.currentTarget.innerHTML === '<br>' || e.currentTarget.innerHTML === '<div><br></div>')) {
      e.preventDefault();
      if (block.type !== 'text') {
        // Convert back to text
        updateBlock(block.id, { type: 'text' });
        return;
      }
      deleteBlock(block.id, true);
      return;
    }

    // Tab: indent (convert to list)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (block.type === 'text') {
        updateBlock(block.id, { type: 'bullet' });
      }
    }
  }, [showSlashMenu, updateBlock, insertBlockAfter, deleteBlock, activeNote, isNoteLocked]);

  // ── Slash command handling ──
  const filteredSlashCmds = useMemo(() => {
    if (!slashFilter) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(c => c.name.toLowerCase().includes(slashFilter.toLowerCase()));
  }, [slashFilter]);

  const executeSlashCommand = useCallback((cmd) => {
    setShowSlashMenu(false);
    const blockId = slashBlockId.current;
    if (!blockId || !activeNote) return;

    if (cmd.type === 'drawing') {
      setShowDrawing(true);
      return;
    }

    if (cmd.type === 'image') {
      // Trigger file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          updateBlock(blockId, { type: 'image', imageData: ev.target.result, content: file.name });
          insertBlockAfter(blockId);
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    if (cmd.type === 'table') {
      updateBlock(blockId, { type: 'table', tableData: [['Header 1', 'Header 2', 'Header 3'], ['', '', ''], ['', '', '']] });
      insertBlockAfter(blockId);
      return;
    }

    updateBlock(blockId, { type: cmd.type, content: '' });
    if (cmd.type === 'divider') {
      insertBlockAfter(blockId);
    } else {
      setTimeout(() => {
        const el = blockRefs.current[blockId];
        if (el) { el.textContent = ''; el.focus(); }
      }, 50);
    }
  }, [activeNote, updateBlock, insertBlockAfter]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (!activeNote) return;

      // Slash menu navigation
      if (showSlashMenu) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSlashMenuIdx(i => Math.min(i + 1, filteredSlashCmds.length - 1)); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSlashMenuIdx(i => Math.max(i - 1, 0)); return; }
        if (e.key === 'Enter') { e.preventDefault(); executeSlashCommand(filteredSlashCmds[slashMenuIdx]); return; }
        if (e.key === 'Escape') { setShowSlashMenu(false); return; }
        if (e.key.length === 1) { setSlashFilter(f => f + e.key); setSlashMenuIdx(0); return; }
        if (e.key === 'Backspace') { setSlashFilter(f => { const n = f.slice(0, -1); if (n === '') setShowSlashMenu(false); return n; }); return; }
        return;
      }

      // Ctrl shortcuts
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); return; }
        if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); return; }
        if (e.key === 'u') { e.preventDefault(); document.execCommand('underline'); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeNote, showSlashMenu, filteredSlashCmds, slashMenuIdx, executeSlashCommand]);

  // ── Unified Formatting Helper ──
  const applyFormatting = (styleName, styleValue) => {
    const sel = window.getSelection();
    let appliedInline = false;
    
    if (sel && sel.rangeCount > 0 && focusedBlockId) {
      const range = sel.getRangeAt(0);
      const editableEl = blockRefs.current[focusedBlockId];
      if (editableEl && editableEl.contains(range.startContainer)) {
        appliedInline = true;
        if (!range.collapsed) {
          if (styleName === 'fontFamily') {
            document.execCommand('fontName', false, styleValue);
          } else if (styleName === 'color') {
            document.execCommand('foreColor', false, styleValue);
          } else if (styleName === 'backgroundColor') {
            document.execCommand('backColor', false, styleValue);
          } else if (styleName === 'fontSize') {
            const div = document.createElement('div');
            div.appendChild(range.cloneContents());
            const html = `<span style="font-size: ${styleValue}">${div.innerHTML}</span>`;
            document.execCommand('insertHTML', false, html);
          }
        } else {
          const span = document.createElement('span');
          if (styleName === 'fontFamily') span.style.fontFamily = styleValue;
          else if (styleName === 'fontSize') span.style.fontSize = styleValue;
          else if (styleName === 'color') span.style.color = styleValue;
          else if (styleName === 'backgroundColor') span.style.backgroundColor = styleValue;
          
          span.innerHTML = '&#8203;'; // zero-width space
          range.insertNode(span);
          
          const newRange = document.createRange();
          newRange.setStart(span.firstChild, 1);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          
          editableEl.focus();
          const inputEvent = new Event('input', { bubbles: true });
          editableEl.dispatchEvent(inputEvent);
        }
      }
    }

    if (!appliedInline && focusedBlockId) {
      const el = blockRefs.current[focusedBlockId];
      if (el) {
        if (styleName === 'fontFamily') {
          updateBlock(focusedBlockId, { fontName: styleValue });
          el.style.fontFamily = styleValue;
        } else if (styleName === 'color') {
          updateBlock(focusedBlockId, { foreColor: styleValue });
          el.style.color = styleValue;
        } else if (styleName === 'backgroundColor') {
          updateBlock(focusedBlockId, { backColor: styleValue });
          el.style.backgroundColor = styleValue;
        } else if (styleName === 'fontSize') {
          updateBlock(focusedBlockId, { fontSize: styleValue });
          el.style.fontSize = styleValue;
        }
      }
    }
  };

  const toolbarAction = (action, val = null) => {
    const sel = window.getSelection();
    const hasSelection = sel.toString().length > 0;

    if (action === 'bold') document.execCommand('bold');
    else if (action === 'italic') document.execCommand('italic');
    else if (action === 'underline') document.execCommand('underline');
    else if (action === 'strikethrough') document.execCommand('strikeThrough');
    else if (action === 'undo') document.execCommand('undo');
    else if (action === 'redo') document.execCommand('redo');
    else if (action === 'justifyLeft') document.execCommand('justifyLeft');
    else if (action === 'justifyCenter') document.execCommand('justifyCenter');
    else if (action === 'justifyRight') document.execCommand('justifyRight');
    else if (action === 'justifyFull') document.execCommand('justifyFull');
    else if (action === 'subscript') document.execCommand('subscript');
    else if (action === 'superscript') document.execCommand('superscript');
    else if (action === 'removeFormat') {
      if (hasSelection) {
        document.execCommand('removeFormat');
      } else if (focusedBlockId) {
        updateBlock(focusedBlockId, { fontName: '', fontSize: '', foreColor: '', backColor: '', textShadow: '', letterSpacing: '' });
        const el = blockRefs.current[focusedBlockId];
        if (el) {
          el.style.fontFamily = 'inherit';
          el.style.fontSize = 'inherit';
          el.style.color = 'inherit';
          el.style.backgroundColor = 'transparent';
          el.style.textShadow = 'none';
          el.style.letterSpacing = 'normal';
        }
      }
    }
    else if (action === 'foreColor') applyFormatting('color', val);
    else if (action === 'backColor') applyFormatting('backgroundColor', val);
    else if (action === 'fontName') applyFormatting('fontFamily', val);
    else if (action === 'link') {
      const url = prompt('Enter link URL:');
      if (url) document.execCommand('createLink', false, url);
    }
  };


  const insertBlockType = (type) => {
    if (!activeNote) return;
    const lastBlock = activeNote.blocks[activeNote.blocks.length - 1];
    if (type === 'drawing') { setShowDrawing(true); return; }
    if (type === 'image') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => insertBlockAfter(lastBlock.id, 'image', { imageData: ev.target.result, content: file.name });
        reader.readAsDataURL(file);
      };
      input.click(); return;
    }
    if (type === 'table') {
      insertBlockAfter(lastBlock.id, 'table', { tableData: [['Header 1', 'Header 2', 'Header 3'], ['', '', ''], ['', '', '']] });
      return;
    }
    insertBlockAfter(lastBlock.id, type);
  };

  // ── Drawing save ──
  const handleDrawingSave = (dataUrl) => {
    if (!activeNote) return;
    setShowDrawing(false);
    if (editingBlockId) {
      updateBlock(editingBlockId, { imageData: dataUrl });
      setEditingBlockId(null);
    } else {
      const lastBlock = activeNote.blocks[activeNote.blocks.length - 1];
      insertBlockAfter(lastBlock.id, 'image', { imageData: dataUrl, content: 'Drawing' });
    }
  };

  const editImageBlock = (blockId) => {
    setEditingBlockId(blockId);
    setShowDrawing(true);
  };

  const insertTextAtCursor = (text) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
    
    if (focusedBlockId && activeNote) {
      const el = blockRefs.current[focusedBlockId];
      if (el) {
        updateBlock(focusedBlockId, { content: el.innerHTML });
      }
    }
  };

  const convertTextCase = (mode) => {
    const sel = window.getSelection();
    if (!sel.toString()) return;
    const text = sel.toString();
    let transformed = '';
    if (mode === 'upper') transformed = text.toUpperCase();
    else if (mode === 'lower') transformed = text.toLowerCase();
    else if (mode === 'capitalize') {
      transformed = text.replace(/\b\w/g, c => c.toUpperCase());
    } else if (mode === 'sentence') {
      transformed = text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    }
    document.execCommand('insertText', false, transformed);
  };

  const handleSearchReplace = () => {
    if (!activeNote || !searchVal) return;
    const updated = activeNote.blocks.map(b => {
      if (['text', 'h1', 'h2', 'h3', 'checklist', 'bullet', 'numbered', 'callout'].includes(b.type)) {
        const htmlContent = b.content || '';
        const newContent = htmlContent.replace(new RegExp(searchVal, 'gi'), replaceVal);
        const el = blockRefs.current[b.id];
        if (el) el.innerHTML = newContent;
        return { ...b, content: newContent };
      }
      return b;
    });
    updateNote(activeNote.id, { blocks: updated });
  };

  // ── Speech Transcription ──
  const startDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Try Chrome/Edge.');
      return;
    }
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onstart = () => setIsDictating(true);
    rec.onresult = (event) => {
      const resultText = event.results[event.results.length - 1][0].transcript;
      insertTextAtCursor(resultText + ' ');
    };
    rec.onerror = () => setIsDictating(false);
    rec.onend = () => setIsDictating(false);
    recognitionRef.current = rec;
    rec.start();
  };

  // ── Speech Synthesis ──
  const speakText = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const selectionText = window.getSelection().toString();
    const textToSpeak = selectionText || getPlainText(activeNote.blocks);
    if (!textToSpeak.trim()) return;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ── Inline Code Formatter ──
  const formatInlineCode = () => {
    const sel = window.getSelection();
    if (!sel.toString()) return;
    const html = `<code>${sel.toString()}</code>`;
    document.execCommand('insertHTML', false, html);
  };

  // ── List/Lines Sorting ──
  const sortAdjacentListItems = (order = 'asc') => {
    if (!focusedBlockId || !activeNote) return;
    const activeBlocks = activeNote.blocks;
    const idx = activeBlocks.findIndex(b => b.id === focusedBlockId);
    if (idx === -1) return;
    const activeBlock = activeBlocks[idx];

    if (activeBlock.type !== 'bullet' && activeBlock.type !== 'numbered' && activeBlock.type !== 'checklist') {
      const content = activeBlock.content || '';
      if (content.includes('\n')) {
        const lines = content.split('\n');
        lines.sort((a, b) => order === 'asc' ? a.localeCompare(b) : b.localeCompare(a));
        const el = blockRefs.current[activeBlock.id];
        if (el) el.innerHTML = lines.join('\n');
        updateBlock(activeBlock.id, { content: lines.join('\n') });
      }
      return;
    }

    let start = idx;
    while (start > 0 && activeBlocks[start - 1].type === activeBlock.type) start--;
    let end = idx;
    while (end < activeBlocks.length - 1 && activeBlocks[end + 1].type === activeBlock.type) end++;

    const listBlocks = activeBlocks.slice(start, end + 1);
    listBlocks.sort((a, b) => {
      const tempA = document.createElement('div');
      tempA.innerHTML = a.content || '';
      const tempB = document.createElement('div');
      tempB.innerHTML = b.content || '';
      const txtA = tempA.textContent || '';
      const txtB = tempB.textContent || '';
      return order === 'asc' ? txtA.localeCompare(txtB) : txtB.localeCompare(txtA);
    });

    const newBlocks = [...activeBlocks];
    newBlocks.splice(start, listBlocks.length, ...listBlocks);
    updateNote(activeNote.id, { blocks: newBlocks });
  };

  // ── Style Injections ──
  const applyLetterSpacing = (val) => {
    const sel = window.getSelection();
    if (!sel.toString()) {
      if (focusedBlockId) {
        updateBlock(focusedBlockId, { letterSpacing: val });
        const el = blockRefs.current[focusedBlockId];
        if (el) el.style.letterSpacing = val === 'normal' ? 'normal' : val;
      }
      return;
    }
    const html = `<span style="letter-spacing: ${val === 'normal' ? 'normal' : val}">${sel.toString()}</span>`;
    document.execCommand('insertHTML', false, html);
  };

  const applyTextShadow = (effect) => {
    let shadowStyle = 'none';
    if (effect === 'glow') shadowStyle = '0 0 8px rgba(99, 102, 241, 0.6)';
    else if (effect === 'retro') shadowStyle = '2px 2px 0px var(--border)';
    else if (effect === 'outline') shadowStyle = '-1px -1px 0 var(--text), 1px -1px 0 var(--text), -1px 1px 0 var(--text), 1px 1px 0 var(--text)';
    else if (effect === 'neon') shadowStyle = '0 0 10px #ff007f, 0 0 20px #ff007f';

    const sel = window.getSelection();
    if (!sel.toString()) {
      if (focusedBlockId) {
        updateBlock(focusedBlockId, { textShadow: shadowStyle });
        const el = blockRefs.current[focusedBlockId];
        if (el) el.style.textShadow = shadowStyle;
      }
      return;
    }
    const html = `<span style="text-shadow: ${shadowStyle}">${sel.toString()}</span>`;
    document.execCommand('insertHTML', false, html);
  };

  const toggleBlockDirection = () => {
    if (!focusedBlockId || !activeNote) return;
    const block = activeNote.blocks.find(b => b.id === focusedBlockId);
    if (!block) return;
    const currentDir = block.direction === 'rtl' ? 'ltr' : 'rtl';
    updateBlock(focusedBlockId, { direction: currentDir });
    const el = blockRefs.current[focusedBlockId];
    if (el) el.style.direction = currentDir;
  };

  const updateDividerStyle = (style) => {
    if (!focusedBlockId || !activeNote) return;
    const block = activeNote.blocks.find(b => b.id === focusedBlockId);
    if (block && block.type === 'divider') {
      updateBlock(focusedBlockId, { dividerStyle: style });
    }
  };

  const cleanEmptyBlocks = () => {
    if (!activeNote) return;
    const cleaned = activeNote.blocks.filter(b => {
      if (['divider', 'image', 'drawing', 'table'].includes(b.type)) return true;
      return (b.content || '').trim() !== '';
    });
    if (cleaned.length === 0) cleaned.push(makeBlock('text'));
    updateNote(activeNote.id, { blocks: cleaned });
  };

  // ── Word Statistics Calculations ──
  const getStatsDetails = () => {
    const text = activeText;
    const words = text.split(/\s+/).filter(Boolean);
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s+/g, '').length;
    const paragraphs = activeNote ? activeNote.blocks.filter(b => b.type === 'text' && b.content?.trim()).length : 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
    
    const avgWordLen = words.length ? charNoSpaces / words.length : 0;
    const avgSentLen = sentences ? words.length / sentences : 0;
    const ari = words.length ? Math.round((4.71 * avgWordLen + 0.5 * avgSentLen - 21.43) * 10) / 10 : 0;
    
    let readabilityGrade = 'Easy';
    if (ari > 14) readabilityGrade = 'Academic / Professional';
    else if (ari > 10) readabilityGrade = 'Difficult';
    else if (ari > 6) readabilityGrade = 'Standard / High School';
    else readabilityGrade = 'Easy / Elementary';

    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))).size;
    
    const wordFreq = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      if (clean && clean.length > 3) {
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    });
    const sortedKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { charCount, charNoSpaces, paragraphs, sentences, ari, readabilityGrade, uniqueWords, sortedKeywords };
  };

  // ── Dictionary Lookup ──
  const lookupWord = async () => {
    const sel = window.getSelection().toString().trim();
    if (!sel) {
      alert('Please select a single word to look up.');
      return;
    }
    const cleanWord = sel.replace(/[^a-zA-Z]/g, '');
    if (!cleanWord) return;

    setDictWord(cleanWord);
    setLoadingDict(true);
    setShowDictLookup(true);
    setDictDefinition(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const def = data[0]?.meanings[0]?.definitions[0]?.definition;
      const pos = data[0]?.meanings[0]?.partOfSpeech;
      const phonetic = data[0]?.phonetic || '';
      setDictDefinition({ def, pos, phonetic });
    } catch {
      setDictDefinition({ def: 'No definition found for this word.', pos: 'unknown', phonetic: '' });
    } finally {
      setLoadingDict(false);
    }
  };

  // ── File Importing ──
  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const blocks = parseMarkdownToBlocks(text);
      const note = {
        id: genId(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        blocks: blocks.length ? blocks : [makeBlock('text')],
        folder: sidebarView.startsWith('folder:') ? sidebarView.slice(7) : 'General',
        tags: ['imported'],
        color: '#22c55e',
        pinned: false,
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [note, ...notes];
      persistNotes(updated);
      setActiveNoteId(note.id);
    };
    input.click();
  };

  const parseMarkdownToBlocks = (text) => {
    const lines = text.split('\n');
    const blocks = [];
    let currentCodeBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('```')) {
        if (currentCodeBlock) {
          blocks.push(currentCodeBlock);
          currentCodeBlock = null;
        } else {
          currentCodeBlock = {
            id: genId(),
            type: 'code',
            content: '',
            lang: line.slice(3).trim() || 'javascript'
          };
        }
        continue;
      }

      if (currentCodeBlock) {
        currentCodeBlock.content += (currentCodeBlock.content ? '\n' : '') + line;
        continue;
      }

      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('# ')) {
        blocks.push({ id: genId(), type: 'h1', content: trimmed.slice(2) });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({ id: genId(), type: 'h2', content: trimmed.slice(3) });
      } else if (trimmed.startsWith('### ')) {
        blocks.push({ id: genId(), type: 'h3', content: trimmed.slice(4) });
      } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
        blocks.push({ id: genId(), type: 'checklist', content: trimmed.slice(6), checked: trimmed.startsWith('- [x]') });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({ id: genId(), type: 'bullet', content: trimmed.slice(2) });
      } else if (/^\d+\.\s/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        blocks.push({ id: genId(), type: 'numbered', content: numMatch[2], listIndex: parseInt(numMatch[1]) });
      } else if (trimmed.startsWith('> ')) {
        blocks.push({ id: genId(), type: 'callout', content: trimmed.slice(2) });
      } else if (trimmed === '---' || trimmed === '***') {
        blocks.push({ id: genId(), type: 'divider', content: '' });
      } else {
        blocks.push({ id: genId(), type: 'text', content: line });
      }
    }
    if (currentCodeBlock) blocks.push(currentCodeBlock);
    return blocks;
  };

  const scrollToBlock = (blockId) => {
    const el = blockRefs.current[blockId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  const updateLineSpacing = (val) => {
    if (!focusedBlockId) return;
    updateBlock(focusedBlockId, { lineHeight: val });
  };

  // ── Export ──
  const exportNote = (format) => {
    if (!activeNote) return;
    setShowExport(false);
    const text = getPlainText(activeNote.blocks);
    const title = activeNote.title || 'Untitled';

    if (format === 'md') {
      const mdContent = activeNote.blocks.map(b => {
        if (b.type === 'h1') return `# ${b.content}`;
        if (b.type === 'h2') return `## ${b.content}`;
        if (b.type === 'h3') return `### ${b.content}`;
        if (b.type === 'checklist') return `- [${b.checked ? 'x' : ' '}] ${b.content}`;
        if (b.type === 'bullet') return `- ${b.content}`;
        if (b.type === 'numbered') return `${b.listIndex || 1}. ${b.content}`;
        if (b.type === 'code') return '```' + (b.lang || '') + '\n' + b.content + '\n```';
        if (b.type === 'callout') return `> ${b.content}`;
        if (b.type === 'divider') return '---';
        if (b.type === 'math') return `$$${b.content}$$`;
        if (b.type === 'image') return `![${b.content || 'image'}](${b.imageData})`;
        return b.content;
      }).join('\n\n');
      download(`${title}.md`, mdContent, 'text/markdown');
    } else if (format === 'txt') {
      const txtContent = activeNote.blocks.map(b => b.type === 'image' ? `[Image: ${b.imageData}]` : (b.content || '')).join('\n');
      download(`${title}.txt`, `${title}\n${'='.repeat(title.length)}\n\n${txtContent}`, 'text/plain');
    } else if (format === 'pdf') {
      exportPDF(title);
    }
  };

  const download = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async (title) => {
    if (!contentAreaRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const target = contentAreaRef.current;
      const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let position = 0;
      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${title || 'note'}.pdf`);
    } catch (err) { console.error('PDF export failed:', err); }
  };

  // ── Folder CRUD ──
  const addFolder = () => {
    if (!newFolderName.trim() || folders.includes(newFolderName.trim())) return;
    const updated = [...folders, newFolderName.trim()];
    setFolders(updated);
    saveFolders(updated);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const deleteFolder = (name) => {
    if (DEFAULT_FOLDERS.includes(name)) return;
    const updated = folders.filter(f => f !== name);
    setFolders(updated);
    saveFolders(updated);
    // Move notes from deleted folder to General
    const updatedNotes = notes.map(n => n.folder === name ? { ...n, folder: 'General' } : n);
    persistNotes(updatedNotes);
    if (sidebarView === `folder:${name}`) setSidebarView('all');
  };

  // ── Tag operations ──
  const addTag = (tag) => {
    if (!activeNote || !tag.trim()) return;
    if (activeNote.tags.includes(tag.trim())) return;
    updateNote(activeNote.id, { tags: [...activeNote.tags, tag.trim()] });
  };

  const removeTag = (tag) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== tag) });
  };

  // ── Note counts ──
  const allCount = notes.filter(n => !n.deleted).length;
  const favCount = notes.filter(n => !n.deleted && n.pinned).length;
  const trashCount = notes.filter(n => n.deleted).length;

  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;

    // Adjust coordinates to keep within screen bounds
    const menuWidth = 260;
    const menuHeight = 330;
    let x = contextMenu.x;
    let y = contextMenu.y;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 16;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 16;
    }
    if (x < 16) x = 16;
    if (y < 16) y = 16;

    return (
      <div 
        className="notes-context-menu-popup" 
        style={{ left: x, top: y }}
        onMouseDown={e => e.preventDefault()}
      >
        {/* Row 1: Copy, Cut, Paste */}
        <div className="context-menu-row">
          <button className="context-menu-btn" style={{ fontSize: '11px' }} onClick={handleContextCopy}>
            Copy
          </button>
          <button className="context-menu-btn" style={{ fontSize: '11px' }} onClick={handleContextCut}>
            Cut
          </button>
          <button className="context-menu-btn" style={{ fontSize: '11px' }} onClick={handleContextPaste}>
            Paste
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />

        {/* Row 2: Bold, Italic, Underline, Outdent, Indent */}
        <div className="context-menu-row">
          <div className="context-menu-btn-group">
            <button className="context-menu-btn" onClick={() => { toolbarAction('bold'); closeContextMenu(); }} title="Bold"><Bold size={13} /></button>
            <button className="context-menu-btn" onClick={() => { toolbarAction('italic'); closeContextMenu(); }} title="Italic"><Italic size={13} /></button>
            <button className="context-menu-btn" onClick={() => { toolbarAction('underline'); closeContextMenu(); }} title="Underline"><Underline size={13} /></button>
          </div>
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px', height: '16px' }} />
          <div className="context-menu-btn-group">
            <button className="context-menu-btn" onClick={() => { document.execCommand('outdent'); closeContextMenu(); }} title="Decrease Indent"><Outdent size={13} /></button>
            <button className="context-menu-btn" onClick={() => { document.execCommand('indent'); closeContextMenu(); }} title="Increase Indent"><Indent size={13} /></button>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />

        {/* Row 3: Font Family Dropdown */}
        <div className="context-menu-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="context-menu-label">Font Family</span>
          <select 
            className="context-menu-select"
            value={currentFont}
            onChange={e => { applyFormatting('fontFamily', e.target.value); closeContextMenu(); }}
          >
            <option value="inherit">Default Font</option>
            {Object.entries(FONT_FAMILIES).map(([groupKey, group]) => (
              <optgroup key={groupKey} label={groupKey === 'sansSerif' ? 'Modern Sans-Serif' : groupKey === 'serif' ? 'Elegant Serif' : groupKey === 'monospace' ? 'Developer Monospace' : 'Artistic & Handwritten'}>
                {group.map(f => (
                  <option key={f.name} value={f.value}>{f.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Row 4: Font Size Dropdown */}
        <div className="context-menu-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="context-menu-label">Font Size</span>
          <select 
            className="context-menu-select"
            value={currentSize}
            onChange={e => { applyFormatting('fontSize', e.target.value); closeContextMenu(); }}
          >
            {['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'].map(sz => (
              <option key={sz} value={sz}>{sz} {sz === '16px' ? '(Normal)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Row 5: Text Case */}
        <div className="context-menu-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="context-menu-label">Text Case</span>
          <select 
            className="context-menu-select"
            onChange={e => { if (e.target.value) { convertTextCase(e.target.value); closeContextMenu(); } }}
            defaultValue=""
          >
            <option value="" disabled>Change Case...</option>
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="capitalize">Capitalize Words</option>
            <option value="sentence">Sentence Case</option>
          </select>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />

        {/* Row 6: Text Color */}
        <div className="context-menu-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="context-menu-label">Text Color</span>
          <div className="context-colors-grid">
            {COLORS.map(c => (
              <button 
                key={c} 
                className="context-color-dot" 
                style={{ background: c }}
                onClick={() => { applyFormatting('color', c); closeContextMenu(); }}
              />
            ))}
            <button 
              className="context-color-dot" 
              style={{ background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--bg)' }}
              onClick={() => { applyFormatting('color', 'inherit'); closeContextMenu(); }}
              title="Reset color"
            >
              R
            </button>
          </div>
        </div>

        {/* Row 7: Highlight Color */}
        <div className="context-menu-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="context-menu-label">Highlight Color</span>
          <div className="context-colors-grid">
            {COLORS.map(c => (
              <button 
                key={c} 
                className="context-color-dot" 
                style={{ background: c }}
                onClick={() => { applyFormatting('backgroundColor', c); closeContextMenu(); }}
              />
            ))}
            <button 
              className="context-color-dot" 
              style={{ background: 'transparent', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--text)' }}
              onClick={() => { applyFormatting('backgroundColor', 'transparent'); closeContextMenu(); }}
              title="Reset highlight"
            >
              X
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileModal = () => {
    if (!isMobile || !mobileModal) return null;

    let title = '';
    let body = null;

    switch (mobileModal) {
      case 'font':
        title = 'Select Font Family';
        body = (
          <div className="mobile-modal-list">
            <button className={`mobile-modal-list-item ${currentFont === 'Default' ? 'active' : ''}`} onClick={() => { applyFormatting('fontFamily', 'inherit'); setCurrentFont('Default'); setMobileModal(null); }}>
              Default Font
            </button>
            {Object.entries(FONT_FAMILIES).map(([groupKey, group]) => (
              <div key={groupKey}>
                <div className="mobile-modal-group-title">{groupKey === 'sansSerif' ? 'Modern Sans-Serif' : groupKey === 'serif' ? 'Elegant Serif' : groupKey === 'monospace' ? 'Developer Monospace' : 'Artistic & Handwritten'}</div>
                {group.map(f => (
                  <button 
                    key={f.name} 
                    className={`mobile-modal-list-item ${currentFont === f.name ? 'active' : ''}`} 
                    style={{ fontFamily: f.value }}
                    onClick={() => { applyFormatting('fontFamily', f.value); setCurrentFont(f.name); setMobileModal(null); }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        );
        break;

      case 'size':
        title = 'Select Font Size';
        body = (
          <div className="mobile-modal-list">
            {['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'].map(sz => (
              <button 
                key={sz} 
                className={`mobile-modal-list-item ${currentSize === sz ? 'active' : ''}`}
                onClick={() => { applyFormatting('fontSize', sz); setCurrentSize(sz); setMobileModal(null); }}
              >
                {sz} {sz === '16px' ? '(Normal)' : sz === '12px' ? '(Small)' : sz === '24px' ? '(Large)' : sz === '36px' ? '(Huge)' : ''}
              </button>
            ))}
          </div>
        );
        break;

      case 'color':
        title = 'Select Text Color';
        body = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div className="mobile-colors-grid">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  className="mobile-color-dot" 
                  style={{ background: c }}
                  onClick={() => { applyFormatting('color', c); setMobileModal(null); }}
                />
              ))}
            </div>
            <button 
              className="btn btn-outline btn-sm" 
              style={{ width: '100%' }}
              onClick={() => { applyFormatting('color', 'inherit'); setMobileModal(null); }}
            >
              Reset to Default Color
            </button>
          </div>
        );
        break;

      case 'highlight':
        title = 'Select Highlight Color';
        body = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div className="mobile-colors-grid">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  className="mobile-color-dot" 
                  style={{ background: c }}
                  onClick={() => { applyFormatting('backgroundColor', c); setMobileModal(null); }}
                />
              ))}
            </div>
            <button 
              className="btn btn-outline btn-sm" 
              style={{ width: '100%' }}
              onClick={() => { applyFormatting('backgroundColor', 'transparent'); setMobileModal(null); }}
            >
              Clear Highlight Color
            </button>
          </div>
        );
        break;

      case 'theme':
        title = 'Select Note Color';
        body = (
          <div className="mobile-colors-grid">
            {COLORS.map(c => (
              <button 
                key={c} 
                className={`mobile-color-dot ${activeNote.color === c ? 'active' : ''}`}
                style={{ background: c, border: activeNote.color === c ? '3px solid var(--text)' : '1px solid rgba(0,0,0,0.1)' }}
                onClick={() => { updateNote(activeNote.id, { color: c }); setMobileModal(null); }}
              />
            ))}
          </div>
        );
        break;

      case 'emoji':
        title = 'Insert Emoji';
        body = (
          <div className="mobile-grid-picker">
            {['😀','😂','😍','👍','🎉','🔥','🚀','💻','📚','📝','❤️','✨','🤔','👏','🌟','💡','🎨','🍕','✈️','🎈'].map(emo => (
              <button 
                key={emo} 
                className="mobile-picker-item" 
                onClick={() => { insertTextAtCursor(emo); setMobileModal(null); }}
              >
                {emo}
              </button>
            ))}
          </div>
        );
        break;

      case 'symbol':
        title = 'Insert Symbol';
        body = (
          <div className="mobile-grid-picker">
            {['±','≠','≈','∞','π','√','÷','×','©','®','™','€','£','¥','$','&','@','#','%','*'].map(sym => (
              <button 
                key={sym} 
                className="mobile-picker-item" 
                onClick={() => { insertTextAtCursor(sym); setMobileModal(null); }}
              >
                {sym}
              </button>
            ))}
          </div>
        );
        break;

      case 'advanced':
        title = 'Advanced Options';
        body = (
          <div className="mobile-modal-list" style={{ gap: '12px', paddingBottom: '24px' }}>
            {/* Theme */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Editor Theme</span>
              <select className="toolbar-select" style={{ width: '100%' }} value={activeNote.theme || 'default'} onChange={e => updateNote(activeNote.id, { theme: e.target.value })}>
                <option value="default">Default Theme</option>
                <option value="sepia">Sepia Theme</option>
                <option value="dracula">Dracula Theme</option>
                <option value="cyberpunk">Cyberpunk Theme</option>
                <option value="forest">Forest Theme</option>
                <option value="solarized">Solarized Theme</option>
              </select>
            </div>
            
            {/* Page Width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Page Width</span>
              <select className="toolbar-select" style={{ width: '100%' }} value={activeNote.width || 'normal'} onChange={e => updateNote(activeNote.id, { width: e.target.value })}>
                <option value="narrow">Narrow Width</option>
                <option value="normal">Standard Width</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            {/* Letter Spacing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Letter Spacing</span>
              <select className="toolbar-select" style={{ width: '100%' }} onChange={e => { applyLetterSpacing(e.target.value); setMobileModal(null); }}>
                <option value="">Normal Spacing</option>
                <option value="tight">Tight Spacing</option>
                <option value="wide">Wide Spacing</option>
                <option value="extrawide">Extra Wide Spacing</option>
              </select>
            </div>

            {/* Typography Effects */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Typography Effect</span>
              <select className="toolbar-select" style={{ width: '100%' }} onChange={e => { applyTextShadow(e.target.value); setMobileModal(null); }}>
                <option value="">Plain Text Effect</option>
                <option value="glow">Neon Glow</option>
                <option value="retro">Retro Shadow</option>
                <option value="outline">Outline</option>
                <option value="neon">Cyber Neon</option>
              </select>
            </div>

            {/* Divider style (if divider selected) */}
            {activeNote.blocks.find(b => b.id === focusedBlockId)?.type === 'divider' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Divider Style</span>
                <select className="toolbar-select" style={{ width: '100%' }} value={activeNote.blocks.find(b => b.id === focusedBlockId)?.dividerStyle || 'solid'} onChange={e => { updateDividerStyle(e.target.value); setMobileModal(null); }}>
                  <option value="solid">Solid Line</option>
                  <option value="dotted">Dotted Line</option>
                  <option value="dashed">Dashed Line</option>
                  <option value="double">Double Line</option>
                  <option value="gradient">Gradient Line</option>
                </select>
              </div>
            )}

            {/* Toggle Actions Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center' }} onClick={() => { toggleBlockDirection(); setMobileModal(null); }}>
                Toggle RTL / LTR Alignment
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center' }} onClick={() => { sortAdjacentListItems('asc'); setMobileModal(null); }}>
                  Sort A-Z
                </button>
                <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center' }} onClick={() => { sortAdjacentListItems('desc'); setMobileModal(null); }}>
                  Sort Z-A
                </button>
              </div>
              <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center' }} onClick={() => { cleanEmptyBlocks(); setMobileModal(null); }}>
                Clean Empty Blocks
              </button>
              <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center', color: lineNumbersEnabled ? 'var(--primary)' : 'inherit' }} onClick={() => { setLineNumbersEnabled(!lineNumbersEnabled); setMobileModal(null); }}>
                {lineNumbersEnabled ? 'Disable Line Numbers' : 'Enable Line Numbers'}
              </button>
              <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center', color: showOutline ? 'var(--primary)' : 'inherit' }} onClick={() => { setShowOutline(!showOutline); setMobileModal(null); }}>
                {showOutline ? 'Hide Table of Contents' : 'Show Table of Contents'}
              </button>
              <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center' }} onClick={() => { setShowStatsModal(true); setMobileModal(null); }}>
                View Word Statistics
              </button>
              <button className="mobile-modal-list-item" style={{ background: 'var(--input-bg)', justifyContent: 'center' }} onClick={() => { lookupWord(); setMobileModal(null); }}>
                Define Highlighted Word
              </button>
            </div>
            
            {/* Word Goal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 0' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Word Goal:</span>
              <input type="number" className="toolbar-select" value={wordGoal || ''} onChange={e => setWordGoal(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100px' }} placeholder="None" />
            </div>
          </div>
        );
        break;

      case 'export':
        title = 'File Options';
        body = (
          <div className="mobile-modal-list">
            <button className="mobile-modal-list-item" onClick={() => { setMobileModal(null); handleImportFile(); }}>
              <Upload size={16} style={{ marginRight: '10px', color: 'var(--primary)' }} /> Import File (.md, .txt)
            </button>
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <button className="mobile-modal-list-item" onClick={() => { setMobileModal(null); exportNote('md'); }}>
              <FileText size={16} style={{ marginRight: '10px', color: 'var(--primary)' }} /> Export Markdown
            </button>
            <button className="mobile-modal-list-item" onClick={() => { setMobileModal(null); exportNote('txt'); }}>
              <AlignLeft size={16} style={{ marginRight: '10px', color: 'var(--primary)' }} /> Export Plain Text
            </button>
            <button className="mobile-modal-list-item" onClick={() => { setMobileModal(null); exportNote('pdf'); }}>
              <FileDown size={16} style={{ marginRight: '10px', color: 'var(--primary)' }} /> Export PDF
            </button>
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <button className="mobile-modal-list-item" onClick={() => { setMobileModal(null); window.print(); }}>
              <Printer size={16} style={{ marginRight: '10px', color: 'var(--primary)' }} /> Print Note
            </button>
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div className="notes-modal-overlay" onClick={() => setMobileModal(null)}>
        <div className="notes-modal-card mobile-bottom-sheet" onClick={e => e.stopPropagation()}>
          <div className="notes-modal-header">
            <h3 className="notes-modal-title">{title}</h3>
            <button className="toolbar-btn" onClick={() => setMobileModal(null)}><X size={16} /></button>
          </div>
          <div className="notes-modal-body" style={{ maxHeight: '50vh', padding: '1rem' }}>
            {body}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`notes-app ${isZenMode ? 'zen-mode' : ''} theme-${activeNote?.theme || 'default'}`}>
      {/* Mobile sidebar backdrop */}
      <div className={`notes-sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Mobile toggle */}
      {!activeNote && (
        <button className="notes-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={18} />
        </button>
      )}

      {/* ════ Sidebar ════ */}
      <aside className={`notes-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="notes-sidebar-header">
          <div className="notes-sidebar-title-row">
            <h2 className="notes-sidebar-title"><Sparkles size={18} /> Notes</h2>
            <button className="notes-new-btn" onClick={() => createNote()}>
              <Plus size={14} /> New
            </button>
          </div>
          <div className="notes-search-wrap">
            <Search size={14} />
            <input
              className="notes-search-input"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="notes-sidebar-nav">
          {/* Quick nav */}
          <div className="notes-nav-section">
            <button className={`notes-nav-item ${sidebarView === 'all' ? 'active' : ''}`} onClick={() => setSidebarView('all')}>
              <BookOpen size={15} /> All Notes <span className="nav-count">{allCount}</span>
            </button>
            <button className={`notes-nav-item ${sidebarView === 'favorites' ? 'active' : ''}`} onClick={() => setSidebarView('favorites')}>
              <Star size={15} /> Favorites <span className="nav-count">{favCount}</span>
            </button>
            <button className={`notes-nav-item ${sidebarView === 'trash' ? 'active' : ''}`} onClick={() => setSidebarView('trash')}>
              <Trash2 size={15} /> Trash <span className="nav-count">{trashCount}</span>
            </button>
          </div>

          {/* Folders */}
          <div className="notes-nav-section">
            <div className="notes-nav-section-title">Folders</div>
            {folders.map(f => (
              <button key={f} className={`notes-folder-item ${sidebarView === `folder:${f}` ? 'active' : ''}`}
                onClick={() => setSidebarView(`folder:${f}`)}>
                <Folder size={14} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                <span className="nav-count">{notes.filter(n => !n.deleted && n.folder === f).length}</span>
                {!DEFAULT_FOLDERS.includes(f) && (
                  <div className="notes-folder-actions">
                    <button onClick={(e) => { e.stopPropagation(); deleteFolder(f); }}><Trash2 size={12} /></button>
                  </div>
                )}
              </button>
            ))}
            {showNewFolder ? (
              <div style={{ display: 'flex', gap: '.25rem', padding: '.25rem .75rem .25rem 1.5rem' }}>
                <input
                  className="notes-search-input"
                  style={{ flex: 1, padding: '.3rem .5rem', fontSize: '.75rem' }}
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                  autoFocus
                />
                <button className="toolbar-btn" onClick={addFolder}><Plus size={14} /></button>
                <button className="toolbar-btn" onClick={() => setShowNewFolder(false)}><X size={14} /></button>
              </div>
            ) : (
              <button className="add-folder-btn" onClick={() => setShowNewFolder(true)}>
                <FolderPlus size={12} /> Add Folder
              </button>
            )}
          </div>
        </nav>

        {/* Note list */}
        <div className="notes-list-container">
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <StickyNote size={28} style={{ opacity: .2, marginBottom: '.5rem' }} />
              <p style={{ fontSize: '.78rem', margin: 0 }}>No notes found</p>
            </div>
          ) : (
            filteredNotes.map(n => (
              <div key={n.id} className={`notes-list-item ${activeNoteId === n.id ? 'active' : ''}`}
                onClick={() => { setActiveNoteId(n.id); if (isMobile) setSidebarOpen(false); }}>
                <div className="notes-list-item-title">
                  <span className="notes-list-color-dot" style={{ background: n.color }} />
                  {n.pinned && <Pin size={10} className="pin-indicator" />}
                  {n.title || 'Untitled'}
                </div>
                <div className="notes-list-item-preview">{getPlainText(n.blocks || []).substring(0, 60)}</div>
                <div className="notes-list-item-meta">
                  <span>{new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{n.folder}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ════ Editor ════ */}
      <div className="notes-editor" style={activeNote ? { background: `linear-gradient(to bottom, ${activeNote.color}15, var(--bg) 300px)` } : {}}>
        {!activeNote ? (
          <div className="notes-editor-empty">
            <StickyNote size={56} />
            <p>Select a note or create a new one</p>
            <span className="empty-hint">Use the sidebar to navigate your notes</span>
            <button className="notes-new-btn" style={{ marginTop: '.5rem' }} onClick={() => createNote()}>
              <Plus size={14} /> Create Note
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="notes-toolbar">
              {/* Row 1: Document Actions, styles, history, Zen, Lock */}
              <div className="notes-toolbar-row top-row" style={{ display: 'flex', flexWrap: 'nowrap', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="notes-toolbar-scrollable-part">
                  {isMobile && (
                    <button className="toolbar-btn" onClick={() => { setActiveNoteId(null); setSidebarOpen(true); }} title="Back">
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  {/* History */}
                  <div className="notes-toolbar-group">
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('undo')} title="Undo (Ctrl+Z)"><Undo size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('redo')} title="Redo (Ctrl+Y)"><Redo size={15} /></button>
                  </div>
                  <div className="notes-toolbar-divider" />
                  {/* Text Formatting */}
                  <div className="notes-toolbar-group">
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('bold')} title="Bold (Ctrl+B)"><Bold size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('italic')} title="Italic (Ctrl+I)"><Italic size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('underline')} title="Underline (Ctrl+U)"><Underline size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('strikethrough')} title="Strikethrough"><Strikethrough size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={formatInlineCode} title="Inline Code"><Code2 size={15} /></button>
                  </div>
                  <div className="notes-toolbar-divider" />
                  {/* Sub/Superscript */}
                  <div className="notes-toolbar-group">
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('subscript')} title="Subscript"><Subscript size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('superscript')} title="Superscript"><Superscript size={15} /></button>
                  </div>
                  <div className="notes-toolbar-divider" />
                  {/* Alignments */}
                  <div className="notes-toolbar-group">
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('justifyLeft')} title="Align Left"><AlignLeft size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('justifyCenter')} title="Align Center"><AlignCenter size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('justifyRight')} title="Align Right"><AlignRight size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('justifyFull')} title="Justify"><AlignJustify size={15} /></button>
                  </div>
                  <div className="notes-toolbar-divider" />
                  {/* Actions & Clear */}
                  <div className="notes-toolbar-group">
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('link')} title="Insert Link"><Link size={15} /></button>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => toolbarAction('removeFormat')} title="Clear Formatting"><Eraser size={15} /></button>
                  </div>
                  <div className="notes-toolbar-divider" />
                  {/* Zen & Lock & Speech & Advanced */}
                  <div className="notes-toolbar-group">
                    <button className={`toolbar-btn ${isNoteLocked ? 'active' : ''}`} onMouseDown={e => e.preventDefault()} onClick={() => setIsNoteLocked(!isNoteLocked)} title={isNoteLocked ? 'Unlock Note' : 'Lock Note (Read-Only)'}>
                      {isNoteLocked ? <Lock size={15} style={{ color: 'var(--primary)' }} /> : <Unlock size={15} />}
                    </button>
                    <button className={`toolbar-btn ${isZenMode ? 'active' : ''}`} onMouseDown={e => e.preventDefault()} onClick={() => setIsZenMode(!isZenMode)} title={isZenMode ? 'Exit Focus Mode' : 'Distraction-Free Focus Mode'}>
                      {isZenMode ? <Minimize size={15} style={{ color: 'var(--primary)' }} /> : <Maximize size={15} />}
                    </button>
                    <button className={`toolbar-btn ${isDictating ? 'mic-recording' : ''}`} onMouseDown={e => e.preventDefault()} onClick={startDictation} title="Voice Typing (Dictate)" disabled={isNoteLocked}>
                      <Mic size={15} />
                    </button>
                    <button className={`toolbar-btn ${isSpeaking ? 'active' : ''}`} onMouseDown={e => e.preventDefault()} onClick={speakText} title="Read Aloud">
                      {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button className={`toolbar-btn ${showAdvanced ? 'active' : ''}`} onMouseDown={e => e.preventDefault()} onClick={() => {
                        if (isMobile) {
                          setMobileModal('advanced');
                        } else {
                          setShowAdvanced(!showAdvanced);
                          setShowColorPicker(false);
                          setShowExport(false);
                          setShowFontDropdown(false);
                          setShowSizeDropdown(false);
                          setShowTextColorPicker(false);
                          setShowHighlightColorPicker(false);
                        }
                      }} title="Advanced Options">
                        <Sliders size={15} style={showAdvanced ? { color: 'var(--primary)' } : {}} />
                      </button>
                      {!isMobile && showAdvanced && (
                        <div className="notes-export-menu" style={{ right: 0, left: 'auto', minWidth: '220px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Theme</span>
                            <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px', width: '100%' }} value={activeNote.theme || 'default'} onChange={e => updateNote(activeNote.id, { theme: e.target.value })} title="Editor Theme">
                              <option value="default">Default</option>
                              <option value="sepia">Sepia</option>
                              <option value="dracula">Dracula</option>
                              <option value="cyberpunk">Cyberpunk</option>
                              <option value="forest">Forest</option>
                              <option value="solarized">Solarized</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Page Width</span>
                            <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px', width: '100%' }} value={activeNote.width || 'normal'} onChange={e => updateNote(activeNote.id, { width: e.target.value })} title="Page Width">
                              <option value="narrow">Narrow</option>
                              <option value="normal">Standard</option>
                              <option value="full">Full</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Letter Spacing</span>
                            <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px', width: '100%' }} onChange={e => { applyLetterSpacing(e.target.value); }} title="Letter Spacing" disabled={isNoteLocked}>
                              <option value="">Normal</option>
                              <option value="tight">Tight</option>
                              <option value="wide">Wide</option>
                              <option value="extrawide">Extra Wide</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Typography Effect</span>
                            <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px', width: '100%' }} onChange={e => { applyTextShadow(e.target.value); }} title="Typography Effects" disabled={isNoteLocked}>
                              <option value="">Plain</option>
                              <option value="glow">Neon Glow</option>
                              <option value="retro">Retro Shadow</option>
                              <option value="outline">Outline</option>
                              <option value="neon">Cyber Neon</option>
                            </select>
                          </div>
                          {activeNote.blocks.find(b => b.id === focusedBlockId)?.type === 'divider' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Divider Style</span>
                              <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px', width: '100%' }} value={activeNote.blocks.find(b => b.id === focusedBlockId)?.dividerStyle || 'solid'} onChange={e => updateDividerStyle(e.target.value)} title="Divider Style" disabled={isNoteLocked}>
                                <option value="solid">Solid</option>
                                <option value="dotted">Dotted</option>
                                <option value="dashed">Dashed</option>
                                <option value="double">Double</option>
                                <option value="gradient">Gradient</option>
                              </select>
                            </div>
                          )}
                          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                            <button className="toolbar-btn" style={{ width: 'auto', fontSize: '10px', fontWeight: 'bold' }} onClick={toggleBlockDirection} title="LTR / RTL Text Alignment" disabled={isNoteLocked}>RTL</button>
                            <button className="toolbar-btn" style={{ width: 'auto', fontSize: '10px', fontWeight: 'bold' }} onClick={() => sortAdjacentListItems('asc')} title="Sort A-Z" disabled={isNoteLocked}>A-Z</button>
                            <button className="toolbar-btn" style={{ width: 'auto', fontSize: '10px', fontWeight: 'bold' }} onClick={() => sortAdjacentListItems('desc')} title="Sort Z-A" disabled={isNoteLocked}>Z-A</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                            <button className="toolbar-btn" style={{ width: 'auto' }} onClick={cleanEmptyBlocks} title="Clean Empty Blocks" disabled={isNoteLocked}><Eraser size={13} /></button>
                            <button className={`toolbar-btn ${lineNumbersEnabled ? 'active' : ''}`} style={{ width: 'auto' }} onClick={() => setLineNumbersEnabled(!lineNumbersEnabled)} title="Code Line Numbers"><ListOrdered size={13} /></button>
                            <button className={`toolbar-btn ${showOutline ? 'active' : ''}`} style={{ width: 'auto' }} onClick={() => setShowOutline(!showOutline)} title="Table of Contents Outline"><BookOpen size={13} /></button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                            <button className="toolbar-btn" style={{ width: 'auto', fontSize: '10px', fontWeight: 'bold' }} onClick={() => setShowStatsModal(true)} title="Detailed Word Stats">Stats</button>
                            <button className="toolbar-btn" style={{ width: 'auto', fontSize: '10px', fontWeight: 'bold' }} onClick={lookupWord} title="Define Highlighted Word">Dict</button>
                          </div>
                          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span>Word Goal:</span>
                            <input type="number" className="toolbar-select" value={wordGoal || ''} onChange={e => setWordGoal(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '80px', padding: '1px 3px', fontSize: '11px' }} placeholder="None" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="notes-toolbar-divider" />
                  {/* Colors & Pins */}
                  <div className="notes-toolbar-group">
                    <div style={{ position: 'relative' }}>
                      <button className="toolbar-btn toolbar-color-btn" onMouseDown={e => e.preventDefault()} onClick={() => {
                        if (isMobile) {
                          setMobileModal('theme');
                        } else {
                          setShowColorPicker(!showColorPicker);
                        }
                      }} title="Note Color">
                        <div className="toolbar-color-dot" style={{ background: activeNote.color }} />
                      </button>
                      {showColorPicker && (
                        <div className="toolbar-color-picker" onMouseDown={e => e.preventDefault()} onClick={e => e.stopPropagation()}>
                          {COLORS.map(c => (
                            <button key={c} className={`toolbar-color-option ${activeNote.color === c ? 'active' : ''}`}
                              style={{ background: c }}
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => { updateNote(activeNote.id, { color: c }); setShowColorPicker(false); }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => togglePin(activeNote.id)} title={activeNote.pinned ? 'Unpin' : 'Pin'}>
                      <Pin size={15} className={activeNote.pinned ? 'active' : ''} style={activeNote.pinned ? { color: 'var(--primary)' } : {}} />
                    </button>
                  </div>
                </div>

                <div className="notes-toolbar-fixed-part">
                  <div style={{ position: 'relative' }}>
                    <button className="toolbar-btn" onClick={() => {
                      if (isMobile) {
                        setMobileModal('export');
                      } else {
                        setShowExport(!showExport);
                      }
                    }} title="File Options">
                      <Download size={15} />
                    </button>
                    {!isMobile && showExport && (
                      <div className="notes-export-menu" style={{ right: 0, left: 'auto' }} onClick={e => e.stopPropagation()}>
                        <button className="notes-export-item" onClick={() => { setShowExport(false); handleImportFile(); }}><Upload size={14} /> Import File (.md, .txt)</button>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                        <button className="notes-export-item" onClick={() => exportNote('md')}><FileText size={14} /> Export Markdown</button>
                        <button className="notes-export-item" onClick={() => exportNote('txt')}><AlignLeft size={14} /> Export Plain Text</button>
                        <button className="notes-export-item" onClick={() => exportNote('pdf')}><FileDown size={14} /> Export PDF</button>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                        <button className="notes-export-item" onClick={() => { setShowExport(false); window.print(); }}><Printer size={14} /> Print Note</button>
                      </div>
                    )}
                  </div>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this note?")) {
                        deleteNote(activeNote.id);
                      }
                    }} 
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Row 2: Dropdowns (Font, Size, Text color, Highlight color, spacing, indentation, text case, emojis, symbols, date/time, search/replace, selectAll) */}
              <div className="notes-toolbar-row">
                <div className="notes-toolbar-group">
                  {/* Custom Font Family Dropdown */}
                  <div className="toolbar-dropdown">
                    <button 
                      className="toolbar-btn" 
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px' }}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        if (isMobile) {
                          setMobileModal('font');
                        } else {
                          setShowFontDropdown(!showFontDropdown);
                          setShowSizeDropdown(false);
                          setShowTextColorPicker(false);
                          setShowHighlightColorPicker(false);
                        }
                      }}
                      disabled={isNoteLocked}
                    >
                      <span>Font: {currentFont}</span>
                      <ChevronDown size={12} />
                    </button>
                    {showFontDropdown && (
                      <div className="toolbar-dropdown-menu" onMouseDown={e => e.preventDefault()}>
                        <button className="toolbar-dropdown-item" onClick={() => { applyFormatting('fontFamily', 'inherit'); setCurrentFont('Default'); setShowFontDropdown(false); }}>
                          Default
                        </button>
                        <div className="toolbar-dropdown-group-title">Modern Sans-Serif</div>
                        {FONT_FAMILIES.sansSerif.map(f => (
                          <button 
                            key={f.name} 
                            className="toolbar-dropdown-item" 
                            style={{ fontFamily: f.value }}
                            onClick={() => { applyFormatting('fontFamily', f.value); setCurrentFont(f.name); setShowFontDropdown(false); }}
                          >
                            {f.name}
                          </button>
                        ))}
                        <div className="toolbar-dropdown-group-title">Elegant Serif</div>
                        {FONT_FAMILIES.serif.map(f => (
                          <button 
                            key={f.name} 
                            className="toolbar-dropdown-item" 
                            style={{ fontFamily: f.value }}
                            onClick={() => { applyFormatting('fontFamily', f.value); setCurrentFont(f.name); setShowFontDropdown(false); }}
                          >
                            {f.name}
                          </button>
                        ))}
                        <div className="toolbar-dropdown-group-title">Developer Monospace</div>
                        {FONT_FAMILIES.monospace.map(f => (
                          <button 
                            key={f.name} 
                            className="toolbar-dropdown-item" 
                            style={{ fontFamily: f.value }}
                            onClick={() => { applyFormatting('fontFamily', f.value); setCurrentFont(f.name); setShowFontDropdown(false); }}
                          >
                            {f.name}
                          </button>
                        ))}
                        <div className="toolbar-dropdown-group-title">Artistic & Handwritten</div>
                        {FONT_FAMILIES.artistic.map(f => (
                          <button 
                            key={f.name} 
                            className="toolbar-dropdown-item" 
                            style={{ fontFamily: f.value }}
                            onClick={() => { applyFormatting('fontFamily', f.value); setCurrentFont(f.name); setShowFontDropdown(false); }}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Font Size Dropdown */}
                  <div className="toolbar-dropdown">
                    <button 
                      className="toolbar-btn" 
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px' }}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        if (isMobile) {
                          setMobileModal('size');
                        } else {
                          setShowSizeDropdown(!showSizeDropdown);
                          setShowFontDropdown(false);
                          setShowTextColorPicker(false);
                          setShowHighlightColorPicker(false);
                        }
                      }}
                      disabled={isNoteLocked}
                    >
                      <span>Size: {currentSize}</span>
                      <ChevronDown size={12} />
                    </button>
                    {showSizeDropdown && (
                      <div className="toolbar-dropdown-menu" onMouseDown={e => e.preventDefault()} style={{ minWidth: '100px' }}>
                        {['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'].map(sz => (
                          <button 
                            key={sz} 
                            className="toolbar-dropdown-item" 
                            onClick={() => { applyFormatting('fontSize', sz); setCurrentSize(sz); setShowSizeDropdown(false); }}
                          >
                            {sz} {sz === '16px' ? '(Normal)' : sz === '12px' ? '(Small)' : sz === '24px' ? '(Large)' : sz === '36px' ? '(Huge)' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="notes-toolbar-divider" />
                {/* Custom Colors */}
                <div className="notes-toolbar-group">
                  {/* Text Color */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="toolbar-btn" 
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { 
                        if (isMobile) {
                          setMobileModal('color');
                        } else {
                          setShowTextColorPicker(!showTextColorPicker); 
                          setShowFontDropdown(false);
                          setShowSizeDropdown(false);
                          setShowHighlightColorPicker(false);
                        }
                      }} 
                      title="Text Color" 
                      disabled={isNoteLocked}
                    >
                      <Palette size={15} />
                    </button>
                    {showTextColorPicker && (
                      <div className="toolbar-color-picker" style={{ top: '100%', zIndex: 300 }} onMouseDown={e => e.preventDefault()}>
                        {COLORS.map(c => (
                          <button 
                            key={c} 
                            className="toolbar-color-option" 
                            style={{ background: c }} 
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { applyFormatting('color', c); setShowTextColorPicker(false); }} 
                          />
                        ))}
                        <button 
                          className="toolbar-color-option" 
                          style={{ background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--bg)' }} 
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { applyFormatting('color', 'inherit'); setShowTextColorPicker(false); }} 
                          title="Reset to default color"
                        >
                          R
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Highlight Color */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="toolbar-btn" 
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { 
                        if (isMobile) {
                          setMobileModal('highlight');
                        } else {
                          setShowHighlightColorPicker(!showHighlightColorPicker); 
                          setShowFontDropdown(false);
                          setShowSizeDropdown(false);
                          setShowTextColorPicker(false);
                        }
                      }} 
                      title="Highlight Color" 
                      disabled={isNoteLocked}
                    >
                      <Highlighter size={15} />
                    </button>
                    {showHighlightColorPicker && (
                      <div className="toolbar-color-picker" style={{ top: '100%', zIndex: 300 }} onMouseDown={e => e.preventDefault()}>
                        {COLORS.map(c => (
                          <button 
                            key={c} 
                            className="toolbar-color-option" 
                            style={{ background: c }} 
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { applyFormatting('backgroundColor', c); setShowHighlightColorPicker(false); }} 
                          />
                        ))}
                        <button 
                          className="toolbar-color-option" 
                          style={{ background: 'transparent', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text)' }} 
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { applyFormatting('backgroundColor', 'transparent'); setShowHighlightColorPicker(false); }} 
                          title="Reset to transparent highlight"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="notes-toolbar-divider" />
                {/* Indentation */}
                <div className="notes-toolbar-group">
                  <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('outdent')} title="Decrease Indent" disabled={isNoteLocked}><Outdent size={15} /></button>
                  <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('indent')} title="Increase Indent" disabled={isNoteLocked}><Indent size={15} /></button>
                </div>
                <div className="notes-toolbar-divider" />
                {/* Spacing & Case */}
                <div className="notes-toolbar-group">
                  {/* Line Spacing */}
                  <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px' }} onChange={e => updateLineSpacing(e.target.value)} title="Line Spacing" disabled={isNoteLocked}>
                    <option value="inherit">Spacing: Normal</option>
                    <option value="1.2">Compact (1.2)</option>
                    <option value="1.5">Relaxed (1.5)</option>
                    <option value="2.0">Double (2.0)</option>
                  </select>
                  {/* Text Case */}
                  <select className="toolbar-select" style={{ fontSize: '11px', padding: '2px 4px' }} onChange={e => { convertTextCase(e.target.value); e.target.value = ''; }} title="Text Case" disabled={isNoteLocked}>
                    <option value="">Case: Aa</option>
                    <option value="upper">UPPERCASE</option>
                    <option value="lower">lowercase</option>
                    <option value="capitalize">Capitalize Words</option>
                    <option value="sentence">Sentence case</option>
                  </select>
                </div>
                <div className="notes-toolbar-divider" />
                {/* Emojis, Symbols, DateTime, Search, SelectAll */}
                <div className="notes-toolbar-group">
                  {/* Emoji Picker */}
                  <div style={{ position: 'relative' }}>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => {
                      if (isMobile) {
                        setMobileModal('emoji');
                      } else {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowFontDropdown(false);
                        setShowSizeDropdown(false);
                        setShowTextColorPicker(false);
                        setShowHighlightColorPicker(false);
                      }
                    }} title="Insert Emoji" disabled={isNoteLocked}><Smile size={15} /></button>
                    {showEmojiPicker && (
                      <div className="toolbar-color-picker" style={{ width: '150px', top: '100%', zIndex: 300, display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '8px' }} onMouseDown={e => e.preventDefault()} onClick={e => e.stopPropagation()}>
                        {['😀','😂','😍','👍','🎉','🔥','🚀','💻','📚','📝'].map(emo => (
                          <button key={emo} style={{ background: 'none', border: 'none', fontSize: '16px', padding: '4px', cursor: 'pointer' }} onMouseDown={e => e.preventDefault()} onClick={() => { insertTextAtCursor(emo); setShowEmojiPicker(false); }}>{emo}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Symbol Picker */}
                  <div style={{ position: 'relative' }}>
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => {
                      if (isMobile) {
                        setMobileModal('symbol');
                      } else {
                        setShowSymbolPicker(!showSymbolPicker);
                        setShowFontDropdown(false);
                        setShowSizeDropdown(false);
                        setShowTextColorPicker(false);
                        setShowHighlightColorPicker(false);
                      }
                    }} title="Insert Symbol" style={{ fontSize: '12px', fontWeight: 'bold' }} disabled={isNoteLocked}>Ω</button>
                    {showSymbolPicker && (
                      <div className="toolbar-color-picker" style={{ width: '150px', top: '100%', zIndex: 300, display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '8px' }} onMouseDown={e => e.preventDefault()} onClick={e => e.stopPropagation()}>
                        {['±','≠','≈','∞','π','√','÷','×','©','®','™','€','£','¥'].map(sym => (
                          <button key={sym} style={{ background: 'none', border: 'none', fontSize: '14px', padding: '4px', cursor: 'pointer' }} onMouseDown={e => e.preventDefault()} onClick={() => { insertTextAtCursor(sym); setShowSymbolPicker(false); }}>{sym}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Date Time */}
                  <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => insertTextAtCursor(new Date().toLocaleString())} title="Insert Date & Time" disabled={isNoteLocked}><Clock size={15} /></button>
                  {/* Search and Replace */}
                  <button className={`toolbar-btn ${showSearchReplace ? 'active' : ''}`} onMouseDown={e => e.preventDefault()} onClick={() => setShowSearchReplace(!showSearchReplace)} title="Search and Replace" disabled={isNoteLocked}><Search size={15} /></button>
                  {/* Select All */}
                  <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => document.execCommand('selectAll')} title="Select All (Ctrl+A)" disabled={isNoteLocked}><Copy size={15} /></button>
                </div>
              </div>

              {/* Row 3: Block insertions */}
              <div className="notes-toolbar-row">
                <div className="notes-toolbar-group">
                  <button className="toolbar-btn" onClick={() => insertBlockType('text')} title="Text Box" disabled={isNoteLocked}><Type size={15} /></button>
                </div>
                <div className="notes-toolbar-divider" />
                <div className="notes-toolbar-group">
                  <button className="toolbar-btn" onClick={() => insertBlockType('h1')} title="Heading 1" disabled={isNoteLocked}><Heading1 size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('h2')} title="Heading 2" disabled={isNoteLocked}><Heading2 size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('h3')} title="Heading 3" disabled={isNoteLocked}><Heading3 size={15} /></button>
                </div>
                <div className="notes-toolbar-divider" />
                <div className="notes-toolbar-group">
                  <button className="toolbar-btn" onClick={() => insertBlockType('bullet')} title="Bullet List" disabled={isNoteLocked}><List size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('numbered')} title="Numbered List" disabled={isNoteLocked}><ListOrdered size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('checklist')} title="Checklist" disabled={isNoteLocked}><CheckSquare size={15} /></button>
                </div>
                <div className="notes-toolbar-divider" />
                <div className="notes-toolbar-group">
                  <button className="toolbar-btn" onClick={() => insertBlockType('code')} title="Code Block" disabled={isNoteLocked}><Code2 size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('callout')} title="Callout" disabled={isNoteLocked}><Quote size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('divider')} title="Divider" disabled={isNoteLocked}><Minus size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('math')} title="Math" disabled={isNoteLocked}><Hash size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('image')} title="Image" disabled={isNoteLocked}><ImageIcon size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('table')} title="Table" disabled={isNoteLocked}><Table size={15} /></button>
                  <button className="toolbar-btn" onClick={() => insertBlockType('drawing')} title="Drawing" disabled={isNoteLocked}><Pencil size={15} /></button>
                </div>
              </div>

              {/* Row 4 (Removed, now dropdown/modal) */}
            </div>

            {/* Search and Replace Panel */}
            {showSearchReplace && (
              <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', background: 'var(--input-bg)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="notes-search-input" style={{ width: '150px', padding: '4px 8px' }} placeholder="Find text..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
                <input className="notes-search-input" style={{ width: '150px', padding: '4px 8px' }} placeholder="Replace with..." value={replaceVal} onChange={e => setReplaceVal(e.target.value)} />
                <button className="btn btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: '11px', height: 'auto' }} onClick={handleSearchReplace}>Replace All</button>
                <button className="toolbar-btn" onClick={() => setShowSearchReplace(false)}><X size={14} /></button>
              </div>
            )}

            {/* Drawing inline canvas */}
            {showDrawing && (
              <DrawingCanvas
                initialImage={editingBlockId ? activeNote.blocks.find(b => b.id === editingBlockId)?.imageData : null}
                onSave={handleDrawingSave}
                onClose={() => { setShowDrawing(false); setEditingBlockId(null); }}
              />
            )}

            {/* Title */}
            <div className="notes-editor-title-wrap">
              <input
                className="notes-editor-title"
                value={activeNote.title}
                onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Untitled Note"
              />
            </div>

            {/* Meta row */}
            <div className="notes-editor-meta">
              <span className="notes-meta-chip"><Clock size={11} /> {new Date(activeNote.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="notes-meta-chip"><Folder size={11} />
                <select style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: 'inherit', cursor: 'pointer', outline: 'none', padding: 0 }}
                  value={activeNote.folder} onChange={e => updateNote(activeNote.id, { folder: e.target.value })}>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </span>
              {/* Tags */}
              <div className="notes-tag-input-wrap">
                <Tag size={11} style={{ color: 'var(--text-muted)' }} />
                {activeNote.tags.map(t => (
                  <span key={t} className="notes-tag-chip">{t}<button onClick={() => removeTag(t)}><X size={9} /></button></span>
                ))}
                <input
                  className="notes-tag-add-input"
                  placeholder="+ tag"
                  onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value) { addTag(e.currentTarget.value); e.currentTarget.value = ''; } }}
                />
              </div>
            </div>

            {/* Content area wrap */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div className={`notes-content-area width-${activeNote.width || 'normal'}`} ref={contentAreaRef} onContextMenu={handleContextMenu} onClick={(e) => {
                if (e.target === contentAreaRef.current) {
                  const lastBlock = activeNote.blocks[activeNote.blocks.length - 1];
                  if (!lastBlock || (lastBlock.type !== 'text' || lastBlock.content !== '')) {
                    insertBlockAfter(lastBlock?.id || null);
                  } else {
                    const el = blockRefs.current[lastBlock.id];
                    if (el) el.focus();
                  }
                }
              }}>
                {/* Checklist Progress Bar */}
                {checklistStats.total > 0 && (
                  <div className="checklist-progress-container" style={{ padding: '0 0 1rem' }}>
                    <div className="checklist-progress-header">
                      <span>Checklist Progress</span>
                      <span>{checklistStats.completed}/{checklistStats.total} completed ({checklistStats.percent}%)</span>
                    </div>
                    <div className="checklist-progress-track">
                      <div className="checklist-progress-bar" style={{ width: `${checklistStats.percent}%` }} />
                    </div>
                  </div>
                )}

                <div className="reorder-group-wrapper">
                  <Reorder.Group axis="y" values={activeNote.blocks} onReorder={(newBlocks) => updateNote(activeNote.id, { blocks: newBlocks })} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {activeNote.blocks.map((block, idx) => (
                      <BlockWrapper
                        key={block.id}
                        block={block}
                        idx={idx}
                        updateBlock={updateBlock}
                        handleBlockKeyDown={handleBlockKeyDown}
                        deleteBlock={deleteBlock}
                        toggleCheck={toggleCheck}
                        blockRefs={blockRefs}
                        editImageBlock={editImageBlock}
                        isNoteLocked={isNoteLocked}
                        setFocusedBlockId={setFocusedBlockId}
                        lineNumbersEnabled={lineNumbersEnabled}
                      />
                    ))}
                  </Reorder.Group>
                </div>

                {/* Slash command popup */}
                <AnimatePresence>
                  {showSlashMenu && (
                    <motion.div
                      className="slash-command-popup"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {filteredSlashCmds.length === 0 ? (
                        <div style={{ padding: '.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.78rem' }}>No commands found</div>
                      ) : (
                        filteredSlashCmds.map((cmd, i) => (
                          <button key={cmd.id} className={`slash-cmd-item ${i === slashMenuIdx ? 'focused' : ''}`}
                            onClick={() => executeSlashCommand(cmd)}
                            onMouseEnter={() => setSlashMenuIdx(i)}>
                            <div className="slash-cmd-icon"><cmd.icon size={15} /></div>
                            <div className="slash-cmd-text">
                              <span className="slash-cmd-name">{cmd.name}</span>
                              <span className="slash-cmd-desc">{cmd.desc}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Table of Contents Outline Drawer */}
              {showOutline && (
                <div className="notes-outline-drawer">
                  <div className="notes-outline-header">
                    <h3 className="notes-outline-title">Outline</h3>
                    <button className="toolbar-btn" onClick={() => setShowOutline(false)}><X size={14} /></button>
                  </div>
                  <div className="notes-outline-content">
                    {headingOutlines.length === 0 ? (
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No headings in note</div>
                    ) : (
                      headingOutlines.map(h => (
                        <a key={h.id} className={`outline-link outline-${h.type}`} onClick={() => scrollToBlock(h.id)}>
                          {h.text}
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="notes-status-bar">
              <div className="notes-status-left">
                <span className={`notes-save-indicator ${saveStatus}`}>
                  {saveStatus === 'saving' ? <><Clock size={10} /> Saving...</> : <><Save size={10} /> Saved</>}
                </span>
                {wordGoal > 0 && (
                  <div className="status-goal-progress" title={`Word Goal: ${wc}/${wordGoal} words`}>
                    <span>Goal: {goalPercent}%</span>
                    <div className="status-goal-track">
                      <div className="status-goal-bar" style={{ width: `${goalPercent}%`, backgroundColor: goalPercent >= 100 ? 'var(--success)' : 'var(--primary)' }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="notes-status-right">
                <span>{wc} words</span>
                <span>{charCount} chars</span>
                <span>~{rt} min read</span>
              </div>
            </div>
          </>
        )}
      </div>



      {/* Close color picker & export on outside click */}
      {(showColorPicker || showExport || showFontDropdown || showSizeDropdown || showTextColorPicker || showHighlightColorPicker || showEmojiPicker || showSymbolPicker || showAdvanced || contextMenu.visible) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => {
          setShowColorPicker(false);
          setShowExport(false);
          setShowFontDropdown(false);
          setShowSizeDropdown(false);
          setShowTextColorPicker(false);
          setShowHighlightColorPicker(false);
          setShowEmojiPicker(false);
          setShowSymbolPicker(false);
          setShowAdvanced(false);
          closeContextMenu();
        }} />
      )}

      {renderContextMenu()}
      {renderMobileModal()}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="notes-modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="notes-modal-card" onClick={e => e.stopPropagation()}>
            <div className="notes-modal-header">
              <h3 className="notes-modal-title">Note Statistics</h3>
              <button className="toolbar-btn" onClick={() => setShowStatsModal(false)}><X size={16} /></button>
            </div>
            <div className="notes-modal-body">
              {(() => {
                const stats = getStatsDetails();
                return (
                  <div>
                    <div className="stats-grid">
                      <div className="stats-widget">
                        <span className="stats-widget-num">{wc}</span>
                        <span className="stats-widget-lbl">Words</span>
                      </div>
                      <div className="stats-widget">
                        <span className="stats-widget-num">{stats.charCount}</span>
                        <span className="stats-widget-lbl">Characters</span>
                      </div>
                      <div className="stats-widget">
                        <span className="stats-widget-num">{stats.sentences}</span>
                        <span className="stats-widget-lbl">Sentences</span>
                      </div>
                      <div className="stats-widget">
                        <span className="stats-widget-num">{stats.paragraphs}</span>
                        <span className="stats-widget-lbl">Paragraphs</span>
                      </div>
                      <div className="stats-widget">
                        <span className="stats-widget-num">{rt} min</span>
                        <span className="stats-widget-lbl">Read Time</span>
                      </div>
                      <div className="stats-widget">
                        <span className="stats-widget-num">{Math.max(1, Math.round(wc / 130))} min</span>
                        <span className="stats-widget-lbl">Speak Time</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '.8rem' }}>
                        <span>Readability Grade:</span>
                        <strong>{stats.readabilityGrade} (ARI: {stats.ari})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem' }}>
                        <span>Unique Words:</span>
                        <strong>{stats.uniqueWords}</strong>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Top Keywords</span>
                      <div style={{ marginTop: '8px' }}>
                        {stats.sortedKeywords.length === 0 ? (
                          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>No keywords found</div>
                        ) : (
                          stats.sortedKeywords.map(([word, freq]) => (
                            <div key={word} className="keyword-item">
                              <span>{word}</span>
                              <strong>{freq} times</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="notes-modal-footer">
              <button className="btn btn-primary" onClick={() => setShowStatsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
