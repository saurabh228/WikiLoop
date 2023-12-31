// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file



function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/wiki/calculatePath', { url });
      setResults(response.data);
    } catch (error) {
      console.error('Error calculating path:', error.message);
    }
  };

  return (
    <div className="app-container">
      <form onSubmit={handleSubmit}>
        <label>
          Wikipedia URL:
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <button type="submit">Calculate Path</button>
      </form>

      {results && results.visitedPages && (
        <div className="results-container">
          <p>Number of Requests: {results.steps}</p>
          <div>
            <h3>Visited Pages:</h3>
            <ul>
              {results.visitedPages.map((page, index) => (
                <li key={index}>{page}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
