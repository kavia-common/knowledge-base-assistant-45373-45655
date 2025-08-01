import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { uploadFile, submitQuery } from './api';

/**
 * App - Main frontend component.
 * Includes theme switcher, file upload UI, and a search/query interface linked to the backend.
 */
function App() {
  const [theme, setTheme] = useState('light');

  // File upload UI states
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  // Q&A search bar UI states
  const [query, setQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [answerResult, setAnswerResult] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  // Handles file(s) dropped or selected
  const handleFileSelected = async (file) => {
    setUploadError('');
    setUploadResult(null);
    setUploadProgress(0);
    if (!file) return;

    setUploading(true);

    // Async wrapper to provide progress (with fake progress, since fetch does not have native progress monitoring)
    let timer = null;
    try {
      // Use a timer to show a progress bar (estimation only)
      let progress = 0;
      timer = setInterval(() => {
        progress += Math.random() * 17 + 7;
        setUploadProgress(Math.min(98, Math.floor(progress)));
      }, 180);

      const result = await uploadFile(file);
      clearInterval(timer);
      setUploadProgress(100);
      setUploadResult(result);
    } catch (err) {
      clearInterval(timer);
      setUploadProgress(0);
      setUploadError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 700);
    }
  };

  // File input handler
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Drag-and-drop handlers
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };
  // Q&A search bar submit handler
  // PUBLIC_INTERFACE
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setQueryError('');
    setAnswerResult(null);
    if (!query.trim()) return;
    setQueryLoading(true);
    try {
      const result = await submitQuery(query);
      setAnswerResult(result);
    } catch (err) {
      setQueryError(err?.message || 'Query failed');
    } finally {
      setQueryLoading(false);
    }
  };

  // Search bar and answer rendering
  const renderQueryBar = () => (
    <div
      className="query-area"
      style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto 32px auto',
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        boxShadow: '0 4px 22px -5px rgba(0,0,0,0.08)',
        padding: '24px 26px',
        border: '2px solid var(--border-color)',
        zIndex: 2
      }}
    >
      <form onSubmit={handleQuerySubmit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="text"
          autoComplete="off"
          placeholder="Ask a question about your knowledge base…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={queryLoading}
          style={{
            flex: 1,
            fontSize: 16,
            border: '1.5px solid var(--border-color)',
            borderRadius: 8,
            padding: '12px 13px',
            outline: 'none',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          className="btn"
          style={{
            minWidth: 90,
            padding: '10px 18px',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            cursor: queryLoading ? 'not-allowed' : 'pointer',
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            opacity: queryLoading ? 0.6 : 1
          }}
          disabled={queryLoading}
        >
          {queryLoading ? "Searching..." : "Ask"}
        </button>
      </form>
      {queryError && (
        <div style={{ color: 'red', marginTop: 12, minHeight: 20 }}>{queryError}</div>
      )}

      {answerResult && (
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <div style={{
            fontWeight: 600,
            fontSize: 17,
            marginBottom: 8,
            color: 'var(--text-primary)'
          }}>Answer:</div>
          <div style={{
            whiteSpace: 'pre-line',
            background: 'rgba(50,120,220,0.07)',
            borderRadius: 8,
            padding: 14,
            fontSize: 15.5,
            color: 'var(--text-primary)'
          }}>
            {answerResult.answer}
          </div>
          {answerResult.references && answerResult.references.length > 0 && (
            <div style={{
              marginTop: 14,
              fontSize: 15,
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>References:</div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {answerResult.references.map((ref, i) => (
                  <li key={i} style={{ marginBottom: 2 }}>
                    <span style={{
                      background: 'rgba(0,180,216,0.14)',
                      borderRadius: 5,
                      padding: '2px 6px',
                      fontFamily: 'monospace',
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}>{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {answerResult.follow_up_questions && answerResult.follow_up_questions.length > 0 && (
            <div style={{
              marginTop: 12,
              fontSize: 14,
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontWeight: 500 }}>Follow up questions:</span>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {answerResult.follow_up_questions.map((q, i) => (
                  <li key={i} style={{ marginBottom: 2 }}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // UI for the file upload area
  const renderUploadArea = () => (
    <div
      className="upload-area"
      style={{
        border: dragActive ? '2px solid var(--text-secondary)' : '2px dashed var(--border-color)',
        padding: 32,
        borderRadius: 16,
        background: dragActive ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        transition: 'border 0.19s, background 0.19s',
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        margin: '20px auto 32px auto',
        boxShadow: dragActive ? '0 0 16px 2px rgba(0,180,216,0.06)' : 'none',
        minHeight: 120,
        zIndex: 1
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        style={{ display: "none" }}
        ref={inputRef}
        onChange={onFileChange}
        disabled={uploading}
      />
      <div style={{ pointerEvents: uploading ? 'none' : 'auto', minHeight: 50 }}>
        <div style={{ fontWeight: 600, fontSize: 17 }}>
          {dragActive 
            ? "Drop your file here!"
            : "Drag and drop a file here, or"
          }
        </div>
        <button
          className="btn"
          style={{
            marginTop: 12,
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 15,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1
          }}
          onClick={() => {
            if (!uploading && inputRef.current) inputRef.current.value = null; // Reset so reselect same file works
            if (!uploading && inputRef.current) inputRef.current.click();
          }}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Browse"}
        </button>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 400 }}>
          Supported: PDF, DOCX, TXT, etc.
        </div>
      </div>
      {/* Progress Bar */}
      {uploading || uploadProgress > 0 ? (
        <div style={{
          marginTop: 24, width: '90%', height: 10, background: '#e0e0e0',
          borderRadius: 6, overflow: 'hidden', marginLeft: 'auto', marginRight: 'auto'
        }}>
          <div style={{
            height: '100%', borderRadius: 6,
            width: `${Math.ceil(uploadProgress)}%`,
            background: 'linear-gradient(90deg, var(--button-bg) 60%, var(--text-secondary))',
            transition: 'width 0.3s'
          }} />
        </div>
      ) : null}
      {/* Result or Error */}
      {uploadResult && (
        <div style={{ marginTop: 20, color: 'green', fontWeight: 600 }}>
          ✅ Uploaded successfully!<br/>
          <pre style={{
            textAlign: "left", background: "rgba(60,180,60,0.08)", borderRadius: 8, padding: 8, fontSize: 13, marginTop: 6
          }}>{JSON.stringify(uploadResult, null, 2)}</pre>
        </div>
      )}
      {uploadError && (
        <div style={{ marginTop: 20, color: 'red', fontWeight: 600 }}>
          ❌ {uploadError}
        </div>
      )}
    </div>
  );

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: '100vh' }}>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <span style={{ fontWeight: 600, fontSize: 23 }}>
            Knowledge Base Assistant
          </span>
        </p>

        {/* File Upload UI */}
        {renderUploadArea()}

        {/* Query/Search Bar */}
        {renderQueryBar()}

        <p>
          Current theme: <strong>{theme}</strong>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
