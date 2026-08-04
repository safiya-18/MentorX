import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSearch, FiFileText } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast';

const RichNotesCard = () => {
  const [notes, setNotes] = useLocalStorage('mentorxNotes', [
    { id: 1, title: 'Welcome to MentorX Notes', content: '# Welcome\nHere you can write your study notes using **Markdown**.\n\n- Support for lists\n- *Italics*\n- `code blocks`', date: new Date().toISOString() }
  ]);
  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create a new note
  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      date: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  // Delete a note
  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
    toast.success("Note deleted");
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Auto-save update
  const handleUpdateNote = (field, value) => {
    if (!activeNoteId) return;
    setNotes(notes.map(n => 
      n.id === activeNoteId ? { ...n, [field]: value, date: new Date().toISOString() } : n
    ));
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card flex flex-col md:flex-row h-[700px] overflow-hidden">
      {/* Sidebar - Note List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200/50 flex flex-col bg-white/30">
        <div className="p-4 border-b border-slate-200/50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FiFileText className="text-mentorBlue-500" /> My Notes
            </h2>
            <button 
              onClick={handleAddNote}
              className="w-8 h-8 rounded-full bg-mentorBlue-100 hover:bg-mentorBlue-200 text-mentorBlue-600 flex items-center justify-center transition-colors"
            >
              <FiPlus />
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white/50 outline-none focus:border-mentorBlue-400 text-sm"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar">
          <AnimatePresence>
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">No notes found.</div>
            ) : (
              filteredNotes.map(note => (
                <motion.div 
                  key={note.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors group flex justify-between items-start ${
                    activeNoteId === note.id ? 'bg-mentorBlue-50/50 border-l-4 border-l-mentorBlue-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <h3 className={`font-medium truncate ${activeNoteId === note.id ? 'text-mentorBlue-800' : 'text-slate-700'}`}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {note.content.replace(/[#*`_]/g, '') || 'No content'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(note.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content - Note Editor */}
      <div className="w-full md:w-2/3 flex flex-col bg-white/50">
        {activeNote ? (
          <>
            <div className="p-6 border-b border-slate-200/50">
              <input 
                type="text" 
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                placeholder="Note Title"
                className="w-full text-2xl font-bold bg-transparent outline-none text-slate-800 placeholder-slate-300"
              />
            </div>
            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
              <textarea 
                value={activeNote.content}
                onChange={(e) => handleUpdateNote('content', e.target.value)}
                placeholder="Write your note here using Markdown..."
                className="w-full lg:w-1/2 p-6 resize-none bg-transparent outline-none text-slate-600 font-mono text-sm border-b lg:border-b-0 lg:border-r border-slate-200/50"
              />
              <div className="w-full lg:w-1/2 p-6 overflow-y-auto prose prose-slate prose-sm max-w-none">
                {activeNote.content ? (
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                ) : (
                  <div className="text-slate-400 italic">Preview will appear here...</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-400 flex-col gap-4">
            <FiFileText size={48} className="text-slate-300" />
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RichNotesCard;
