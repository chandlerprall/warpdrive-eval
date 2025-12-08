#!/usr/bin/env node

const TurndownService = require('turndown');

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: node url-to-markdown.js <url>');
    process.exit(1);
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const html = await response.text();
    
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);
    
    console.log(markdown);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();

