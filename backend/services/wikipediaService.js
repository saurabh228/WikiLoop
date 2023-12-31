// services/wikipediaService.js
const axios = require('axios');
const jsdom = require("jsdom");
const cheerio = require('cheerio');
const { JSDOM } = jsdom;


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


async function calculatePath(startUrl) {
  console.log("Calculating path to Philosophy...");
  let currentUrl = startUrl;
  let clicks = 0;
  let visitedArticles = [];

  while (currentUrl !== "https://en.wikipedia.org/wiki/Philosophy") {
    clicks++;
    visitedArticles.push(currentUrl);

    const articleContent = await getArticleContent(currentUrl);
    const nextLink = getFirstLink(articleContent);

    if (!nextLink || visitedArticles.includes(nextLink)) {
      return { clicks, articles: visitedArticles, reachedPhilosophy: false };
    }

    currentUrl = `https://en.wikipedia.org${nextLink}`;
  }

  return { steps: clicks, visitedPages: visitedArticles, reachedPhilosophy: true };
}

module.exports = { calculatePath };
