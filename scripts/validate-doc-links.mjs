#!/usr/bin/env node
import { glob } from 'glob';
import { readFile, access } from 'fs/promises';
import { dirname, resolve as resolvePath } from 'path';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import axios from 'axios';
import chalk from 'chalk';

const DOCS_DIR = 'docs';
const CONCURRENT_CHECKS = 5;

// --- Helper Functions ---

const getMarkdownFiles = async () => {
  try {
    return await glob(`${DOCS_DIR}/**/*.md`, {
      ignore: 'node_modules/**',
    });
  } catch (error) {
    console.error(chalk.red('Error finding Markdown files:'), error);
    process.exit(1);
  }
};

const extractLinks = async (filePath) => {
  const links = [];
  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const tree = remark().parse(fileContent);
    visit(tree, 'link', (node) => {
      if (node.url) {
        links.push({ url: node.url, file: filePath });
      }
    });
  } catch (error) {
    console.error(chalk.red(`Error processing file ${filePath}:`), error);
  }
  return links;
};

const checkLink = async (link) => {
  const { url, file } = link;
  const isExternal = url.startsWith('http://') || url.startsWith('https://');

  if (isExternal) {
    try {
      await axios.head(url, {
        headers: { 'User-Agent': 'link-checker/1.0' },
        timeout: 10000,
      });
      return { ...link, status: 'ok' };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, statusText } = error.response;
        return { ...link, status: 'broken', reason: `${status} ${statusText}` };
      }
      return { ...link, status: 'broken', reason: 'Request failed' };
    }
  } else {
    // Internal link
    const fileDir = dirname(file);
    const resolvedPath = resolvePath(fileDir, url.split('#')[0]);
    try {
      await access(resolvedPath);
      return { ...link, status: 'ok' };
    } catch {
      return { ...link, status: 'broken', reason: 'File not found' };
    }
  }
};

// --- Main Execution ---

const main = async () => {
  console.log(chalk.blue('Starting documentation link validation...'));
  const markdownFiles = await getMarkdownFiles();
  console.log(chalk.cyan(`Found ${markdownFiles.length} Markdown files to check.`));

  const allLinks = (await Promise.all(markdownFiles.map(extractLinks))).flat();
  console.log(chalk.cyan(`Found ${allLinks.length} links to validate.`));

  const brokenLinks = [];
  let checkedCount = 0;

  const processQueue = async (links) => {
    const promises = links.map(async (link) => {
      const result = await checkLink(link);
      checkedCount++;
      process.stdout.write(`Checked ${checkedCount}/${allLinks.length} links\r`);
      if (result.status === 'broken') {
        brokenLinks.push(result);
      }
    });
    await Promise.all(promises);
  };

  for (let i = 0; i < allLinks.length; i += CONCURRENT_CHECKS) {
    const chunk = allLinks.slice(i, i + CONCURRENT_CHECKS);
    await processQueue(chunk);
  }

  console.log('\n'); // Newline after progress indicator

  if (brokenLinks.length > 0) {
    console.error(chalk.red.bold(`\nFound ${brokenLinks.length} broken links:\n`));
    brokenLinks.forEach(({ url, file, reason }) => {
      console.error(`${chalk.yellow(file)}:`);
      console.error(`  - ${chalk.red(url)} (${chalk.magenta(reason)})`);
    });
    process.exit(1);
  } else {
    console.log(chalk.green.bold('✅ All links are valid.'));
    process.exit(0);
  }
};

main().catch((error) => {
  console.error(chalk.red.bold('\nAn unexpected error occurred:'), error);
  process.exit(1);
});
