// frontend/src/App.jsx - Main React component for Bug Whisperer
import React, { useState } from 'react';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [filename, setFilename] = useState('example.js');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFixedCode, setShowFixedCode] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ type: '', message: '', url: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [dragActive, setDragActive] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null); // Clear previous results

    console.log('Starting analysis...', { language, filename, codeLength: code.length });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          filename,
          code
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      console.log('Analysis result received:', result);
      setAnalysis(result);
      markFileAsAnalyzed(); // Mark current file as analyzed
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToGitHub = async () => {
    if (!analysis || !analysis.fixed_code) {
      setError('No fixed code to save');
      return;
    }

    // Simple demo values - in a real app, these would be user inputs
    const owner = 'demo-user';
    const repo = 'demo-repo';
    const baseBranch = 'main';
    const newBranchName = `bug-whisperer-fix-${Date.now()}`;
    const commitMessage = `Fix ESLint issues in ${filename}`;

    setGithubLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          baseBranch,
          newBranchName,
          path: filename,
          content: analysis.fixed_code,
          commitMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'GitHub commit failed');
      }

      const result = await response.json();
      setModalContent({
        type: 'success',
        message: 'Pull request created successfully!',
        url: result.pullRequestUrl
      });
      setShowModal(true);

    } catch (err) {
      setModalContent({
        type: 'error',
        message: err.message,
        url: ''
      });
      setShowModal(true);
    } finally {
      setGithubLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    return severity === 'error' ? '#dc3545' : '#ffc107';
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent({ type: '', message: '', url: '' });
  };

  const handleMultipleFileUpload = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.name.endsWith('.js') && !file.name.endsWith('.jsx')) {
        errors.push(`${file.name}: Not a JavaScript file`);
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 1MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (validFiles.length === 0) {
      setError('No valid JavaScript files found');
      return;
    }

    setError(null);

    // Read all files
    const filePromises = validFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            content: e.target.result,
            size: file.size,
            analyzed: false
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises)
      .then(fileData => {
        setUploadedFiles(prev => [...prev, ...fileData]);
        // Auto-select first file if none selected
        if (currentFileIndex === -1 && fileData.length > 0) {
          selectFile(uploadedFiles.length); // Index of first new file
        }
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const selectFile = (index) => {
    if (index >= 0 && index < uploadedFiles.length) {
      const file = uploadedFiles[index];
      setCurrentFileIndex(index);
      setFilename(file.name);
      setCode(file.content);
      setAnalysis(null); // Clear previous analysis
    }
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    if (index === currentFileIndex) {
      // If removing current file, select another or clear
      if (newFiles.length > 0) {
        const newIndex = index >= newFiles.length ? newFiles.length - 1 : index;
        setCurrentFileIndex(newIndex);
        selectFile(newIndex);
      } else {
        setCurrentFileIndex(-1);
        setFilename('example.js');
        setCode('');
        setAnalysis(null);
      }
    } else if (index < currentFileIndex) {
      // Adjust current index if removing file before current
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const markFileAsAnalyzed = () => {
    if (currentFileIndex >= 0) {
      const newFiles = [...uploadedFiles];
      newFiles[currentFileIndex].analyzed = true;
      setUploadedFiles(newFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleMultipleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleMultipleFileUpload(files);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setCurrentFileIndex(-1);
    setFilename('example.js');
    setCode('');
    setError(null);
    setAnalysis(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐛 Bug Whisperer</h1>
        <p>JavaScript Code Analyzer with ESLint</p>
      </header>

      {/* Coming Soon Features Banner */}
      <div className="coming-soon-banner">
        <div className="banner-content">
          <h3>🚀 Coming Soon - Exciting Features!</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <div className="feature-text">
                <strong>More Languages</strong>
                <p>TypeScript, Python, Java, C++, and more</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📁</span>
              <div className="feature-text">
                <strong>GitHub Integration</strong>
                <p>Analyze files directly from GitHub repositories</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🗂️</span>
              <div className="feature-text">
                <strong>Project Analysis</strong>
                <p>Scan entire projects and analyze multiple files</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📂</span>
              <div className="feature-text">
                <strong>Folder Upload</strong>
                <p>Upload entire project folders for batch analysis</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <div className="feature-text">
                <strong>Batch Processing</strong>
                <p>Find and fix bugs across multiple files at once</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div className="feature-text">
                <strong>Advanced Rules</strong>
                <p>Custom linting rules and security vulnerability detection</p>
              </div>
            </div>
          </div>
          <p className="banner-note">
            Currently in MVP phase - JavaScript analysis with ESLint. 
            <strong>Stay tuned for these powerful features!</strong>
          </p>
        </div>
      </div>

      <main className="App-main">
        <div className="input-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language:</label>
              <select 
                id="language"
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current File:</label>
              <div className="file-info">
                <span className="filename">{filename}</span>
                {uploadedFiles.length > 0 && (
                  <div className="file-actions">
                    <span className="file-count">({uploadedFiles.length} files)</span>
                    <button 
                      onClick={clearAllFiles}
                      className="clear-file-btn"
                      title="Clear all uploaded files"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="form-group">
            <label>Upload JavaScript Files:</label>
            <div 
              className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="upload-content">
                <span className="upload-icon">📁</span>
                <p className="upload-text">
                  <strong>Drop multiple .js files here</strong> or{' '}
                  <label className="upload-link">
                    browse files
                    <input
                      type="file"
                      accept=".js,.jsx"
                      multiple
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </p>
                <p className="upload-hint">Supports multiple .js and .jsx files (max 1MB each)</p>
              </div>
            </div>
          </div>

          {/* File Manager */}
          {uploadedFiles.length > 0 && (
            <div className="form-group">
              <label>Uploaded Files ({uploadedFiles.length}):</label>
              <div className="file-manager">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className={`file-item ${index === currentFileIndex ? 'active' : ''} ${file.analyzed ? 'analyzed' : ''}`}
                    onClick={() => selectFile(index)}
                  >
                    <div className="file-item-content">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="file-status">
                        {file.analyzed && <span className="analyzed-badge">✓</span>}
                        {index === currentFileIndex && <span className="current-badge">Current</span>}
                      </div>
                      <button 
                        className="remove-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor Section */}
          <div className="form-group">
            <label htmlFor="code">
              Code to analyze:
              {currentFileIndex >= 0 && <span className="file-loaded"> (File {currentFileIndex + 1} of {uploadedFiles.length}: {uploadedFiles[currentFileIndex].name})</span>}
            </label>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Upload .js files above or paste your JavaScript code here..."
              rows={12}
            />
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !code.trim()}
              className="analyze-btn"
            >
              {loading ? 'Analyzing...' : 'Analyze Code'}
            </button>
            
            {uploadedFiles.length > 1 && (
              <div className="navigation-buttons">
                <button 
                  onClick={() => selectFile(Math.max(0, currentFileIndex - 1))}
                  disabled={currentFileIndex <= 0}
                  className="nav-btn prev-btn"
                  title="Previous file"
                >
                  ← Previous
                </button>
                <span className="file-counter">
                  {currentFileIndex + 1} of {uploadedFiles.length}
                </span>
                <button 
                  onClick={() => selectFile(Math.min(uploadedFiles.length - 1, currentFileIndex + 1))}
                  disabled={currentFileIndex >= uploadedFiles.length - 1}
                  className="nav-btn next-btn"
                  title="Next file"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {analysis && (
          <div className="results-section">
            {analysis.issues.length > 0 && (
              <div className="issues-section">
                <h3>Issues Found</h3>
                <div className="issues-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Line</th>
                        <th>Severity</th>
                        <th>Message</th>
                        <th>Suggestion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.issues.map((issue, index) => (
                        <tr key={index}>
                          <td>{issue.line}</td>
                          <td>
                            <span 
                              className="severity-badge"
                              style={{ backgroundColor: getSeverityColor(issue.severity) }}
                            >
                              {issue.severity}
                            </span>
                          </td>
                          <td>{issue.message}</td>
                          <td className="suggestion">{issue.suggestion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="fixed-code-section">
              <div className="section-header">
                <h3>Fixed Code</h3>
                <button 
                  className="toggle-btn"
                  onClick={() => setShowFixedCode(!showFixedCode)}
                >
                  {showFixedCode ? 'Hide' : 'Show'} Fixed Code
                </button>
              </div>
              
              {showFixedCode && (
                <div className="code-container">
                  <pre className="code-block">
                    <code>{analysis.fixed_code}</code>
                  </pre>
                  
                  {analysis.fixed_code !== code && (
                    <div className="github-actions">
                      <button 
                        onClick={handleSaveToGitHub}
                        disabled={githubLoading}
                        className="github-btn"
                      >
                        {githubLoading ? 'Creating PR...' : 'Save Fix to GitHub'}
                      </button>
                      <p className="github-note">
                        Demo: Creates PR in demo-user/demo-repo
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lesson-section">
              <h3>💡 Learning Lesson</h3>
              <div className="lesson-text">
                {analysis.lesson.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalContent.type === 'success' ? '✅ Success' : '❌ Error'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{modalContent.message}</p>
              {modalContent.url && (
                <p>
                  <a href={modalContent.url} target="_blank" rel="noopener noreferrer">
                    View Pull Request
                  </a>
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="modal-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;