#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';

const log = {
  info: (msg) => console.log(chalk.blue(msg)),
  success: (msg) => console.log(chalk.green(msg)),
  warning: (msg) => console.log(chalk.yellow(msg)),
  error: (msg) => console.log(chalk.red(msg)),
};

// Check if we're in the project root (package.json exists)
if (!existsSync(path.join(process.cwd(), 'package.json'))) {
  log.error('Please run this script from the project root directory');
  process.exit(1);
}

// Get the commit message from command line args or use a default
const commitMessage = process.argv.slice(2).join(' ') || 'Auto-commit: Changes passing tests and linting';

// Function to execute shell commands and return output
function runCommand(command, { ignoreError = false } = {}) {
  try {
    const output = execSync(command, { 
      stdio: ['inherit', 'pipe', 'pipe'],
      encoding: 'utf-8' 
    });
    return { success: true, output };
  } catch (error) {
    if (!ignoreError) {
      log.error(`Command failed: ${command}`);
      log.error(error.message);
      console.log(error.stdout?.toString() || '');
      console.log(error.stderr?.toString() || '');
    }
    return { success: false, error };
  }
}

// Main function
async function main() {
  console.log(boxen(chalk.cyan('ArticuLITE Auto-Commit Tool'), {
    padding: 1,
    margin: 1,
    borderStyle: 'double'
  }));

  log.info('Checking for uncommitted changes...');
  const { output: status } = runCommand('git status --porcelain');
  
  if (!status.trim()) {
    log.warning('No changes to commit. Exiting...');
    return;
  }
  
  log.info('Running linter...');
  const lintResult = runCommand('npm run lint');
  if (!lintResult.success) {
    log.error('Linting failed. Please fix the issues before committing.');
    process.exit(1);
  }
  log.success('Linting passed!');
  
  log.info('Building project...');
  const buildResult = runCommand('npm run build');
  if (!buildResult.success) {
    log.error('Build failed. Please fix the issues before committing.');
    process.exit(1);
  }
  log.success('Build successful!');
  
  log.info('Running unit tests...');
  const testResult = runCommand('npm test');
  if (!testResult.success) {
    log.error('Unit tests failed. Please fix the issues before committing.');
    process.exit(1);
  }
  log.success('Unit tests passed!');
  
  log.info('Running E2E tests...');
  const e2eResult = runCommand('npm run test:e2e');
  if (!e2eResult.success) {
    log.error('E2E tests failed. Please fix the issues before committing.');
    process.exit(1);
  }
  log.success('E2E tests passed!');
  
  log.info('All checks passed! Committing changes...');
  
  // Stage all changes
  const stageResult = runCommand('git add .');
  if (!stageResult.success) {
    log.error('Failed to stage changes.');
    process.exit(1);
  }
  
  // Commit with the provided message
  const commitResult = runCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    log.error('Failed to commit changes.');
    process.exit(1);
  }
  
  log.success('Successfully committed changes!');
  
  // Offer to push changes
  log.info('Do you want to push changes to remote repository? (y/n)');
  process.stdin.once('data', (data) => {
    const input = data.toString().trim().toLowerCase();
    if (input === 'y' || input === 'yes') {
      log.info('Pushing changes...');
      const pushResult = runCommand('git push');
      if (pushResult.success) {
        log.success('Successfully pushed changes!');
      }
    } else {
      log.info('Not pushing changes. You can push manually later with "git push".');
    }
    process.exit(0);
  });
}

main().catch((error) => {
  log.error('An unexpected error occurred:');
  log.error(error.message);
  process.exit(1);
}); 