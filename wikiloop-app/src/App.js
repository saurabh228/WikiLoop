// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css'; // Import the CSS file

const socket = io('http://localhost:3001');

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [jsonArray, setJsonArray] = useState([]);

  useEffect(() => {
    // Listen for updates to the JSON array
    socket.on('jsonArrayUpdate', (updatedJsonArray) => {
      setJsonArray(updatedJsonArray);
      console.log('Updated JSON array:', updatedJsonArray);
    });

    socket.on('log', (message) => {
      console.log(message);
    });

   
  }, []);

  useEffect(() => {
    // Fetch visited pages from the server
    axios.get('http://localhost:3001/visited-pages')
      .then(response => {
        // console.log('Visited pages:', response.data);
      })
      .catch(error => {
        console.error('Error fetching visited pages:', error.message);
      });
  }, [results]);

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
          <div className="json-array-container">
        <h3>JSON Array from Server:</h3>
        <ul>
          {jsonArray.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
        </div>
      )}
    </div>
  );
}

export default App;
