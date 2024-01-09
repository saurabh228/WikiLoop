// services/wikipediaService.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


// Fetches the HTML content of a Wikipedia article.
async function getArticleContent(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching article content:", error);
    return null;
  }
}

// Removes content within parentheses from text within paragraph tags.

function removeParenthesesContentWithinParagraphs(html) {
  const $ = cheerio.load(html);

  $('p').each((_, paragraph) => {
    const content = $(paragraph).html();
    if (content) {
      const contentWithoutATagContent = content.replace(/\([^)]*\)/g, (match) => {
        return match.replace(/<a\b[^>]*>.*?<\/a>/gi, '');
      });
      $(paragraph).html(contentWithoutATagContent);
    }
  });

  return $.html();
}


// Extracts the first eligible link from the article content.

function getFirstLink(articleContent) {
  const contentWithoutParentheses = removeParenthesesContentWithinParagraphs(articleContent);
  const $ = cheerio.load(contentWithoutParentheses);

  // Find all non-parenthetical, non-italicized links within the main content area
  const eligibleLinks = $('p > a, p > b > a')
    .filter((_, link) => {
      const parent = $(link).parent();
      return !(
        parent.is('i') || parent.is('em') ||
        parent.css('font-style') === 'italic'
      );
    });

  const newlink = eligibleLinks.length > 0 ? eligibleLinks.attr('href') : null;
  console.log("Found", eligibleLinks.length > 0 ? newlink : "No Valid Links");
  return newlink;
}


// Calculates the path to the Philosophy article on Wikipedia.

async function calculatePath(startUrl, io) {
  console.log("Calculating path to Philosophy...");

  let currentUrl = startUrl;
  let clicks = 0;
  let existingData = [];

  try {
    const data = await fs.promises.readFile('visitedArticles.json', 'utf8');
    if (data.length > 0) {
      existingData = JSON.parse(data);
    }
  } catch (err) {
    console.error(err);
    return;
  }

  console.log("Existing Data", existingData);

  // Clear the contents of the 'visitedArticles.json' file
  try {
    await fs.promises.writeFile('visitedArticles.json', "");
  } catch (err) {
    console.error(err);
    return;
  }

  while (currentUrl !== "https://en.wikipedia.org/wiki/Philosophy") {
    clicks++;

    const articleContent = await getArticleContent(currentUrl);
    const nextLink = `https://en.wikipedia.org${getFirstLink(articleContent)}`;

    if (!nextLink) {
      io.emit('dead-page', currentUrl);
      return;
    } else if (existingData.includes(nextLink)) {
      io.emit('loop', nextLink);
      return;
    } else {
      existingData.push(nextLink);
      io.emit('next-link', nextLink);
    }

    currentUrl = nextLink;
  }

  const updatedJsonData = JSON.stringify(existingData, null, 2);

  // Write the updated data to the 'visitedArticles.json' file
  try {
    await fs.promises.writeFile('visitedArticles.json', updatedJsonData);
    console.log("Data has been added to the existing file");
  } catch (err) {
    console.error(err);
  }
}

module.exports = { calculatePath };