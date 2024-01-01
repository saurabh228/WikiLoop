
// services/wikipediaService.js
const axios = require('axios');
const jsdom = require("jsdom");
const cheerio = require('cheerio');
const { JSDOM } = jsdom;
const fs = require('fs');

async function getArticleContent(url) {
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching article content:", error);
    return null;
  }
}

// Function to remove content within parentheses from text within paragraph tags
function removeParenthesesContentWithinParagraphs(html) {
  const $ = cheerio.load(html);

  $('p').each((_, paragraph) => {
    const content = $(paragraph).html();
    if (content) {
      const contentWithoutParentheses = content.replace(/\([^)]*\)/g, '');
      $(paragraph).html(contentWithoutParentheses);
    }
  });

  return $.html();
}

function getFirstLink(articleContent) {
  // Remove content within parentheses from paragraph text
  const contentWithoutParentheses = removeParenthesesContentWithinParagraphs(articleContent);

  // Parse the HTML content using a DOM parser
  const $ = cheerio.load(contentWithoutParentheses);

  // Find all non-parenthetical, non-italicized links within the main content area
  const eligibleLinks = $('p > a')
    .filter((_, link) => {
      // Exclude links within italics
      const parent = $(link).parent();
      return !(
        parent.is('i') ||
        parent.is('b') ||
        parent.is('em')
      );
    });

  // Return the first eligible link, or null if none are found
  console.log("Found", eligibleLinks.length > 0 ? eligibleLinks.attr('href') : "No Valid Links");
  return eligibleLinks.length > 0 ? eligibleLinks.attr('href') : null;
}


async function calculatePath(startUrl, io) {
  console.log("Calculating path to Philosophy...");
  io.emit('log', "Calculating path to Philosophy...");
  let currentUrl = startUrl;
  let clicks = 0;
  let visitedArticles = [];
  let visitedPages = [];
  let existingData = [];

  fs.readFile('visitedArticles.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    if (data) {
      existingData = JSON.parse(data);
    }
  });

  while (currentUrl !== "https://en.wikipedia.org/wiki/Philosophy") {
    clicks++;
    
    const articleContent = await getArticleContent(currentUrl);
    const nextLink = getFirstLink(articleContent);
    existingData.push({ url: currentUrl , parent: `https://en.wikipedia.org${nextLink}` });
    visitedPages.push(`https://en.wikipedia.org${nextLink}`);
    if (!nextLink || visitedArticles.some(article => article.url === nextLink)) {
      return { clicks, articles: visitedArticles, reachedPhilosophy: false };
    }

    currentUrl = `https://en.wikipedia.org${nextLink}`;
  }

  const updatedJsonData = JSON.stringify(existingData, null, 2);

  fs.writeFile('visitedArticles.json', updatedJsonData, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data has been added to the existing file");
  });

  return { steps: clicks, visitedPages: visitedPages, reachedPhilosophy: true };
}

module.exports = { calculatePath };
