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

  $('p:not(:has(a))').each((_, paragraph) => {
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

  const newlink = eligibleLinks.length > 0 ? eligibleLinks.attr('href') : null;

  // Return the first eligible link, or null if none are found
  console.log("Found", eligibleLinks.length > 0 ? newlink : "No Valid Links");
  return newlink;
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
    const nextLink = `https://en.wikipedia.org${getFirstLink(articleContent)}`;
    existingData.push({ url: currentUrl , parent: nextLink });

    
    if(!nextLink) {
      io.emit('dead-page', currentUrl)
      return ;
    }
    else if(existingData.some((item) => item.url === nextLink)) {
      io.emit('loop', nextLink);
      return;
    }else{
      io.emit('next-link', nextLink);
    }

    currentUrl = nextLink;
  }

  const updatedJsonData = JSON.stringify(existingData, null, 2);

  fs.writeFile('visitedArticles.json', updatedJsonData, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data has been added to the existing file");
  });

  return;
}

module.exports = { calculatePath };