// services/wikipediaService.js
const axios = require('axios');
const cheerio = require('cheerio');

async function getFirstLink(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const firstLink = $('div#mw-content-text p a:not(.external, .internal)')
      .add('div#mw-content-text li a:not(.external, .internal)')
      .add('div#mw-content-text td a:not(.external, .internal)')
      .first()
      .attr('href');

    console.log('First Link:', firstLink); // Log the first link
    return firstLink;
  } catch (error) {
    throw new Error('Error fetching Wikipedia page');
  }
}

async function calculatePath(initialUrl) {
  console.log(`Backend Starts.`);
  const visitedPages = [];
  let currentUrl = initialUrl;
  let steps = 0;

  while (currentUrl !== 'https://en.wikipedia.org/wiki/Philosophy') {
   
    
    try {
      const firstLinkPath = await getFirstLink(currentUrl);
      if (!firstLinkPath) {
        console.log('No valid link found on the page.'); // Log the message
        return { error: 'No valid link found on the page.' };
      }
      currentUrl = `https://en.wikipedia.org${firstLinkPath}`;
      steps++;


      if (visitedPages.includes(currentUrl) || steps > 60) {
        // Break the loop if there is a potential loop or too many steps
        console.log('Exiting loop:', { currentUrl, steps, visitedPages }); // Log the state
        return { error: 'Unable to reach Philosophy page within 30 steps or potential loop detected.' };
      }
  
      visitedPages.push(currentUrl);


    } catch (error) {
      console.error('Error in getFirstLink function:', error.message);
      return { error: 'Error fetching Wikipedia page.' };
    }
  }

  console.log('Path calculated successfully:', { steps, visitedPages }); // Log the final state
  return { steps, visitedPages };
}

module.exports = { calculatePath };
