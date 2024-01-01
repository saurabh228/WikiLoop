// services/wikipediaService.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * Fetches the HTML content of a Wikipedia article.
 * @param {string} url - The URL of the Wikipedia article.
 * @returns {string|null} - The HTML content of the article or null on error.
 */
async function getArticleContent(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching article content:", error);
    return null;
  }
}

/**
 * Removes content within parentheses from text within paragraph tags.
 * @param {string} html - The HTML content to process.
 * @returns {string} - The HTML content with parentheses content removed.
 */
function removeParenthesesContentWithinParagraphs(html) {
  const $ = cheerio.load(html);

  $('p:not(:has(a))').each((_, paragraph) => {
    const content = $(paragraph).html();
    if (content) {
      const contentWithoutParentheses = content.replace(/\([^)]*\)/g, '');
      $(paragraph).html(contentWithoutParentheses);
    }
  });

  return $.html();
}

/**
 * Extracts the first eligible link from the article content.
 * @param {string} articleContent - The HTML content of the Wikipedia article.
 * @returns {string|null} - The URL of the first eligible link or null if none found.
 */
function getFirstLink(articleContent) {
  const contentWithoutParentheses = removeParenthesesContentWithinParagraphs(articleContent);
  const $ = cheerio.load(contentWithoutParentheses);

  // Find all non-parenthetical, non-italicized links within the main content area
  const eligibleLinks = $('p > a')
    .filter((_, link) => {
      const parent = $(link).parent();
      return !(
        parent.is('i') ||
        parent.is('b') ||
        parent.is('em')
      );
    });

  const newlink = eligibleLinks.length > 0 ? eligibleLinks.attr('href') : null;
  console.log("Found", eligibleLinks.length > 0 ? newlink : "No Valid Links");
  return newlink;
}

/**
 * Calculates the path to the Philosophy article on Wikipedia.
 * @param {string} startUrl - The starting URL for the calculation.
 * @param {object} io - The Socket.IO instance for emitting events.
 */
async function calculatePath(startUrl, io) {
  console.log("Calculating path to Philosophy...");
  io.emit('log', "Calculating path to Philosophy...");

  let currentUrl = startUrl;
  let clicks = 0;
  let existingData = [];

  // Clear the contents of the 'visitedArticles.json' file
  fs.writeFile('visitedArticles.json', "", (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  while (currentUrl !== "https://en.wikipedia.org/wiki/Philosophy") {
    clicks++;

    const articleContent = await getArticleContent(currentUrl);
    const nextLink = `https://en.wikipedia.org${getFirstLink(articleContent)}`;
    existingData.push({ url: currentUrl, parent: nextLink });

    if (!nextLink) {
      io.emit('dead-page', currentUrl);
      return;
    } else if (existingData.some((item) => item.url === nextLink)) {
      io.emit('loop', nextLink);
      return;
    } else {
      io.emit('next-link', nextLink);
    }

    currentUrl = nextLink;
  }

  const updatedJsonData = JSON.stringify(existingData, null, 2);

  // Write the updated data to the 'visitedArticles.json' file
  fs.writeFile('visitedArticles.json', updatedJsonData, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data has been added to the existing file");
  });
}

module.exports = { calculatePath };