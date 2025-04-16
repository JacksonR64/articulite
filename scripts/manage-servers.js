#!/usr/bin/env node

/**
 * This script helps manage server instances
 * Usage:
 *   node scripts/manage-servers.js kill-next   - Kills all Next.js server processes
 *   node scripts/manage-servers.js kill-pw     - Kills all Playwright server processes
 *   node scripts/manage-servers.js kill-all    - Kills both Next.js and Playwright servers
 *   node scripts/manage-servers.js kill-port 3000 - Kills any process using port 3000
 */

import { execSync } from 'child_process';
import http from 'http';

const command = process.argv[2] || 'status';
const param = process.argv[3]; // For commands that take a parameter

function killProcesses(pattern) {
  try {
    // Different commands for different OS
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      execSync(`taskkill /F /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq *${pattern}*"`, { stdio: 'ignore' });
    } else {
      execSync(`pkill -f '${pattern}' || true`, { stdio: 'inherit' });
    }
    console.log(`✅ Successfully killed processes matching: ${pattern}`);
  } catch (error) {
    console.log(`No processes found matching: ${pattern}`);
  }
}

function killProcessOnPort(port) {
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      // Find PID using port on Windows
      const pid = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`).toString().trim().split(/\s+/).pop();
      if (pid) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
        console.log(`✅ Successfully killed process on port ${port} (PID: ${pid})`);
      }
    } else {
      // Find and kill process using port on Unix-like systems
      execSync(`lsof -ti:${port} | xargs kill -9 || true`, { stdio: 'inherit' });
      console.log(`✅ Successfully killed any process using port ${port}`);
    }
  } catch (error) {
    console.log(`No process found on port ${port} or unable to kill it`);
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const testServer = http.createServer();
    
    testServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        console.log(`❌ Port ${port} is already in use`);
        resolve(false);
      } else {
        console.log(`❓ Error checking port ${port}: ${err.message}`);
        resolve(false);
      }
    });
    
    testServer.once('listening', () => {
      // Port is available
      testServer.close();
      console.log(`✅ Port ${port} is available`);
      resolve(true);
    });
    
    testServer.listen(port);
  });
}

function showStatus() {
  try {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      execSync('tasklist | findstr "node.exe"', { stdio: 'inherit' });
      console.log('\nPort usage:');
      execSync('netstat -ano | findstr :3000 | findstr LISTENING', { stdio: 'inherit' });
    } else {
      console.log('Running Node.js processes:');
      execSync('ps aux | grep node | grep -v grep', { stdio: 'inherit' });
      console.log('\nPort usage:');
      execSync('lsof -i:3000 || echo "Port 3000 is available"', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('No Node.js processes found or error checking ports.');
  }
}

// Main execution
switch (command) {
  case 'kill-next':
    killProcesses('node.*next');
    break;
  case 'kill-pw':
    killProcesses('playwright');
    break;
  case 'kill-all':
    killProcesses('node.*next');
    killProcesses('playwright');
    break;
  case 'kill-port':
    if (param && !isNaN(param)) {
      killProcessOnPort(param);
    } else {
      console.log('Please specify a valid port number');
    }
    break;
  case 'check-port':
    if (param && !isNaN(param)) {
      checkPort(param);
    } else {
      checkPort(3000); // Default to checking port 3000
    }
    break;
  case 'status':
  default:
    showStatus();
    break;
} 