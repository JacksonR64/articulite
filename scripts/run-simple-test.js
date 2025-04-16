#!/usr/bin/env node

/**
 * This script is a workaround for running a simple homepage test.
 * It attempts to bypass Next.js server startup issues by checking
 * if the server is already running.
 */

import { execSync } from 'child_process';
import http from 'http';

console.log('🔍 Checking if the server is already running...');

// Function to check if port 3000 is already in use (server is running)
function isPortInUse() {
  return new Promise((resolve) => {
    const testServer = http.createServer();
    
    testServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, which means server is running
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    testServer.once('listening', () => {
      // Port is available, which means server is not running
      testServer.close();
      resolve(false);
    });
    
    testServer.listen(3000);
  });
}

async function main() {
  try {
    const serverRunning = await isPortInUse();
    
    if (serverRunning) {
      console.log('✅ Server is already running on port 3000.');
    } else {
      console.log('❌ Server is not running. Please start the server manually with:');
      console.log('   npm run dev');
      console.log('   or:');
      console.log('   npx next dev --no-turbo');
      process.exit(1);
    }
    
    console.log('🎭 Running the simple homepage test...');
    execSync('npx playwright test e2e/simple-homepage.spec.ts --project=chromium', { 
      stdio: 'inherit' 
    });
    
    console.log('✅ Test completed!');
  } catch (error) {
    console.error('❌ Error running test:', error.message);
    process.exit(1);
  }
}

main(); 