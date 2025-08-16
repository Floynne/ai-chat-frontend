// =================================================================
//          УЛЬТИМАТИВНЫЙ AI-ЧАТ ФРОНТЕНД by Floynne & AI
//
//          Версия: 3.3 "Абсолютный Монолит"
// =================================================================

import React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const BACKEND_URL = 'https://ai-chat-server-k50v.onrender.com';

// --- КОМПОНЕНТЫ ---
const SendIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const DeleteIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const CopyIcon = () => ( <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 16H6C4.89543 16 4 15.1046 4 14V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V8M10 12H18C19.1046 12 20 12.8954 20 14V20C20 21.1046 19.1046 22 18 22H10C8.89543 22 8 21.1046 8 20V14C8 12.8954 8.89543 12 10 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const DownloadIcon = () => ( <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 13M12 13L7 8M12 13V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );

// Новый компонент Аватара
const Avatar = ({ role }) => {
  return <div className={`avatar ${role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>{role === 'user' ? 'F' : 'AI'}</div>;
};

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copyText, setCopyText] = useState('Copy');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const customStyle = { ...oneDark, 'pre[class*="language-"]': { ...oneDark['pre[class*="language-"]'], backgroundColor: 'transparent' } };
  const handleCopy = () => { navigator.clipboard.writeText(String(children)).then(() => { setCopyText('Copied!'); setTimeout(() => setCopyText('Copy'), 2000); }); };
  const handleDownload = () => { const blob = new Blob([String(children)], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `code.${language}`; a.click(); URL.revokeObjectURL(url); };
  return !inline && match ? ( <div className="code-block-wrapper"><div className="code-block-header"><span>{language}</span><div className="code-block-buttons"><button className="code-action-btn" onClick={handleCopy}><CopyIcon /> {copyText}</button><button className="code-action-btn" onClick={handleDownload}><DownloadIcon /> Download</button></div></div><SyntaxHighlighter style={customStyle} PreTag="div" language={language} {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter></div> ) : ( <code className={className} {...props}>{children}</code> );
};

const CustomSelect = ({ value, onChange, disabled, options }) => ( <div className="custom-select-wrapper"><select className="custom-select" value={value} onChange={onChange} disabled={disabled}>{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><span className="select-arrow">▼</span></div> );

function App() {
  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem('chats')) || [{ id: Date.now(), title: 'Новый чат', messages: [], model: 'groq' }]);
  const [currentChatId, setCurrentChatId] = useState(chats[0]?.id || null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ... (все хуки и функции-обработчики остаются без изменений из предыдущего ответа)
  useEffect(() => { localStorage.setItem('chats', JSON.stringify(chats)); }, [chats]);
  const useAutoResizeTextarea = (value) => { useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; } }, [value]); };
  useAutoResizeTextarea(inputValue);
  const useScrollToBottom = (dependencies) => { useEffect(() => { setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100); }, dependencies); };
  useScrollToBottom([chats, isLoading]);
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const modelOptions = [{value: 'gemini', label: 'Cortex AI (CX 3.5)'}, {value: 'groq', label: 'Cortex AI (CX 3.0)'}];
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { role: 'user', content: inputValue };
    const aiMessagePlaceholder = { role: 'assistant', content: '' };
    const messagesForRequest = [...(currentChat.messages || []), userMessage];
    setChats(chats.map(chat => chat.id === currentChatId ? { ...chat, messages: [...messagesForRequest, aiMessagePlaceholder], title: (chat.messages || []).length === 0 ? inputValue.substring(0, 30) : chat.title } : chat ));
    setInputValue('');
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/stream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: currentChat.model, messages: messagesForRequest }) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamingContent = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.substring(6); if (!data) continue;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) throw new Error(parsed.message);
                    if (parsed.status === 'done') break;
                    if (parsed.chunk) {
                        streamingContent += parsed.chunk;
                        setChats(prev => prev.map(c => c.id === currentChatId ? {...c, messages: c.messages.map((m, i) => i === c.messages.length - 1 ? {...m, content: streamingContent} : m) } : c));
                    }
                } catch(e) { /* Игнор */ }
            }
        }
      }
    } catch (error) {
      console.error("Ошибка стриминга:", error);
      setChats(prev => prev.map(c => c.id === currentChatId ? {...c, messages: c.messages.map((m, i) => i === c.messages.length - 1 ? {...m, content: `**Ошибка:** ${error.message}`} : m) } : c ));
    } finally { setIsLoading(false); }
  }, [inputValue, isLoading, currentChat, chats, currentChatId]);
  const createNewChat = useCallback(() => { const newChatId = Date.now(); const newChat = { id: newChatId, title: `Новый чат`, messages: [], model: 'groq' }; setChats(prevChats => [newChat, ...prevChats]); setCurrentChatId(newChatId); }, []);
  const handleDeleteChat = useCallback((chatIdToDelete) => {
    const updatedChats = chats.filter(chat => chat.id !== chatIdToDelete);
    if (updatedChats.length === 0) { const newChatId = Date.now(); setChats([{ id: newChatId, title: 'Новый чат', messages: [], model: 'groq' }]); setCurrentChatId(newChatId); }
    else { setChats(updatedChats); if (currentChatId === chatIdToDelete) { setCurrentChatId(updatedChats[0].id); } }
  }, [chats, currentChatId]);
  const handleModelChange = useCallback((e) => setChats(chats.map(chat => chat.id === currentChatId ? { ...chat, model: e.target.value } : chat)), [chats, currentChatId]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }, [handleSendMessage]);

  const renderEmptyChat = () => ( <motion.div className="empty-chat-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}><h2 className="welcome-message">Hey, I'am Cortex. Ready to dive in?</h2><form className="search-bar-form" onSubmit={handleSendMessage}><textarea className="chat-textarea" ref={textareaRef} rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything..." /><button className="send-button" type="submit" disabled={isLoading || !inputValue.trim()}><SendIcon /></button></form><div className="model-selector-container"><CustomSelect value={currentChat?.model || 'groq'} onChange={handleModelChange} options={modelOptions} /></div></motion.div> );
  
  // !!! ИЗМЕНЕНИЕ В РЕНДЕРЕ АКТИВНОГО ЧАТА !!!
  const renderActiveChat = () => (
    <div className='active-chat-view'>
      <header className="chat-header"><h2>{currentChat?.title}</h2><CustomSelect value={currentChat?.model || 'groq'} onChange={handleModelChange} disabled={(currentChat?.messages || []).length > 0} options={modelOptions} /></header>
      <div className="message-list">
        <AnimatePresence>
          {currentChat?.messages.map((msg, index) => (
            <motion.div key={`${currentChatId}-${index}`} className={`message-bubble ${msg.role}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
              <Avatar role={msg.role} />
              <div className='message-content-wrapper'>
                <div className='message-content'>
                  <Markdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                    {msg.content + (isLoading && index === currentChat.messages.length - 1 ? '▋' : '')}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <motion.div className="form-container-bottom" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div className='input-wrapper-bottom'>
          <textarea className="chat-textarea" ref={textareaRef} rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything..." />
          <button className="send-button" type="submit" disabled={isLoading || !inputValue.trim()} onClick={handleSendMessage}><SendIcon /></button>
        </div>
      </motion.div>
    </div>
  );

  return ( <div className="app-container"><aside className="sidebar"><div className="sidebar-header"><button className="new-chat-btn" onClick={createNewChat}>+ New chat</button></div><nav className="chat-list"><AnimatePresence>{chats.map(chat => ( <motion.div key={chat.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} transition={{duration: 0.3}}><div className={`chat-item-wrapper ${chat.id === currentChatId ? 'active' : ''}`}><a href="#" className="chat-item" onClick={(e) => {e.preventDefault(); setCurrentChatId(chat.id);}}>{chat.title}</a><button className="delete-chat-btn" onClick={() => handleDeleteChat(chat.id)}><DeleteIcon /></button></div></motion.div> ))}</AnimatePresence></nav></aside><main className={`chat-area ${currentChat && (currentChat.messages || []).length === 0 ? 'is-empty' : ''}`}>{!currentChat ? renderEmptyChat() : ( (currentChat.messages || []).length === 0 ? renderEmptyChat() : renderActiveChat() )}</main></div> );
}

export default App;