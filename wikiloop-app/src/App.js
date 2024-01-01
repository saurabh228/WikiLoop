// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css'; // Import the CSS file

const socket = io('http://localhost:3001');

function App() {
  // State for input URL, calculation results, and visited pages
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);
  const [jsonArray, setJsonArray] = useState([]);
  const [isValidUrl, setIsValidUrl] = useState(true); // State for URL validation

  useEffect(() => {
    // Listen for updates to the JSON array
    socket.on('next-link', (nextLink) => {
      setJsonArray((prevArray) => [...prevArray, nextLink]);
      // console.log("next-link", nextLink);
    });

    // Listen for 'dead-page' event
    socket.on('dead-page', (page) => {
      alert(`Reached a dead-end page: ${page}`);
    });

    // Listen for 'loop' event
    socket.on('loop', (link) => {
      alert(`Detected a loop. Unable to reach Philosophy. Current link: ${link}`);
    });

    socket.on('log', (message) => {
      console.log(message);
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off('next-link');
      socket.off('dead-page');
      socket.off('loop');
    };

  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the entered URL
    if (!isValidWikipediaUrl(url)) {
      setIsValidUrl(false);
      return;
    }

    try {
      setIsValidUrl(true);
      setJsonArray([]);
      const response = await axios.post('http://localhost:3001/wiki/calculatePath', { url });
      setResults(response.data);
    } catch (error) {
      console.error('Error calculating path:', error.message);
    }
  };

  return (
    <div className="app-container">
      {/* Form for entering Wikipedia URL */}
      <form onSubmit={handleSubmit} className='form-input'>
        <label>
          <input
            placeholder='Enter Wikipedia URL'
            className={`input-box ${isValidUrl ? '' : 'invalid-url'}`} // Add class for styling invalid URL
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIsValidUrl(true); // Reset validation when the user edits the URL
            }}
          />
        </label>
        <button type="submit">Calculate Path</button>
        {!isValidUrl && <p className="error-message">Please enter a valid Wikipedia URL</p>}
      </form>

      {/* Results container */}
      <div className="results-container">
        <h3>Steps: {jsonArray.length}</h3>
        <ul>
          {jsonArray.map((item, index) => (
            // Each visited page is displayed as a list item
            <a key={index} href={item} target="_blank" rel="noopener noreferrer">
              <li className={item === 'https://en.wikipedia.org/wiki/Philosophy' ? 'philosophy-link' : 'regular-link'}>
                {/* Display the title text */}
                {item === 'https://en.wikipedia.org/wiki/Philosophy' ? 'Philosophy' : getTitleFromLink(item)}
              </li>
            </a>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Helper function to extract the title from a Wikipedia link
function getTitleFromLink(link) {
  const titleMatch = link.match(/\/wiki\/(.+)/);
  return titleMatch ? titleMatch[1] : link;
}

// Helper function to validate a Wikipedia URL
function isValidWikipediaUrl(url) {
  return /^https:\/\/en\.wikipedia\.org\/wiki\/.+$/.test(url);
}

export default App;
