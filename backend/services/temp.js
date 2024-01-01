// // wikipedia-loop-backend/index.js
// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(express.json());
// app.use(cors());

// const VISITED_PAGES_FILE = 'visited-pages.json';

// // Function to follow Wikipedia Loop rules
// const followWikipediaLoop = async (url, visitedPages) => {
//     const MAX_REQUESTS = 20; // Set a maximum number of requests to avoid infinite loops
//     let currentUrl = url;
//     let requestCount = 0;

//     while (requestCount < MAX_REQUESTS) {
//         // Make a request to the current URL
//         const response = await axios.get(currentUrl);

//         // Use Cheerio to parse the HTML and extract the first valid link
//         const $ = cheerio.load(response.data);
//         const validLinks = $('p a').filter((index, element) => {
//             const link = $(element).attr('href');
//             return link && !link.includes(':') && !link.includes('#');
//         });

//         if (validLinks.length === 0) {
//             // No valid links found, break the loop
//             break;
//         }

//         // Get the first valid link
//         const firstLink = $(validLinks[0]).attr('href');

//         // Update the current URL for the next iteration
//         currentUrl = https://en.wikipedia.org${firstLink};

//         // Check if the page has already been visited
//         if (visitedPages.includes(currentUrl)) {
//             // Break the loop to avoid infinite loops
//             break;
//         }

//         // Add the current URL to the visited pages array
//         visitedPages.push(currentUrl);

//         // Increment the request count
//         requestCount += 1;

//         // Check if the page is the Philosophy page
//         if (currentUrl.toLowerCase().includes('philosophy')) {
//             break;
//         }
//     }

//     return { requestCount, visitedPages };
// };

// // API endpoint for handling Wikipedia URL
// app.post('/wikipedia-loop', async (req, res) => {
//     console.log('Received request:', req.body);
//     const { url } = req.body;

//     try {
//         // Clear the content of the visited-pages.json file for each new input
//         fs.writeFileSync(VISITED_PAGES_FILE, '[]', 'utf-8');

//         // Load the previously visited pages from the JSON file
//         let visitedPages = [];
//         try {
//             visitedPages = JSON.parse(fs.readFileSync(VISITED_PAGES_FILE, 'utf-8'));
//         } catch (err) {
//             console.error('Error reading visited pages JSON file:', err);
//         }

//         // Call the function to follow Wikipedia Loop rules
//         const result = await followWikipediaLoop(url, visitedPages);

//         // Update the JSON file with the new visited pages
//         fs.writeFileSync(VISITED_PAGES_FILE, JSON.stringify(result.visitedPages, null, 2), 'utf-8');

//         // Send the result back to the frontend
//         res.json(result);
//     } catch (err) {
//         console.error('Error processing Wikipedia Loop:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });