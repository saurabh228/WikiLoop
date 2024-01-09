// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import ResultTree from './components/ResultTree'; 

const socket = io('http://localhost:3001');

function App() {
  // State for input URL, calculation results, and visited pages
  const [inputs, setInputs] = useState([]);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [currentInput, setCurrentInput] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate the entered URL
    const url = currentInput.trim();
    if (!isValidWikipediaUrl(url)) {
      setIsValidUrl(false);
      return;
    }
  
    try {
      setInputs([...inputs, url]);
      setIsValidUrl(true);
      const response = await axios.post('http://localhost:3001/wiki/calculatePath', { url });
    } catch (error) {
      console.error('Error calculating path:', error.message);
    }
  };

  return (
    <div className="app-container">
      {/* Form for entering Wikipedia URL */}
      <form onSubmit={handleSubmit
                      } className='form-input'>
        <label>
          <input
            placeholder='Enter Wikipedia URL'
            className={`input-box ${isValidUrl ? '' : 'invalid-url'}`} // Add class for styling invalid URL
            type="text"
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
            }}
          />
        </label>
        <button type="submit">Calculate Path</button>
        {!isValidUrl && <p className="error-message">Please enter a valid Wikipedia URL</p>}
      </form>

      {/* Results container */}
      <div className="results-container">
          <ResultTree
            inputs={inputs}
            socket={socket}
          />
      </div>
    </div>
  );
}

// Helper function to validate a Wikipedia URL
function isValidWikipediaUrl(url) {
  return /^https:\/\/en\.wikipedia\.org\/wiki\/.+$/.test(url);
}

export default App;
