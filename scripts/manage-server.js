#!/usr/bin/env node

/**
 * Server management script for consistent development and testing
 * This script helps start and stop the Next.js dev server on a consistent port
 * to make testing more reliable.
 */

import { spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const DEFAULT_PORT = 3333; // Use a specific port to avoid conflicts
const SERVER_STARTUP_TIMEOUT = 10000; // 10 seconds
const SERVER_SHUTDOWN_TIMEOUT = 5000; // 5 seconds

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Server state tracking
let serverProcess = null;
let serverPid = null;
let serverUrl = null;
let isShuttingDown = false;

/**
 * Starts the Next.js development server
 * @param {number} port - The port to start the server on
 * @returns {Promise<string>} - The URL of the running server
 */
function startServer(port = DEFAULT_PORT) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting development server on port ${port}...`);
    
    // Create the server process
    serverProcess = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      shell: true,
    });
    
    serverPid = serverProcess.pid;
    console.log(`📝 Server PID: ${serverPid}`);
    
    let output = '';
    let errorOutput = '';
    let serverStarted = false;
    
    // Capture standard output
    serverProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(`[Server] ${chunk}`);
      
      // Check for server ready message - update for Turbopack
      if ((chunk.includes('Ready') || chunk.includes('ready')) || 
          (chunk.includes('✓ Ready') || chunk.includes('✓ Compiled')) && !serverStarted) {
        serverStarted = true;
        serverUrl = `http://localhost:${port}`;
        console.log(`✅ Server started successfully at ${serverUrl}`);
        resolve(serverUrl);
      }
    });
    
    // Capture error output
    serverProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      process.stderr.write(`[Server Error] ${chunk}`);
      
      // Check for common errors
      if (chunk.includes('EADDRINUSE')) {
        reject(new Error(`Port ${port} is already in use. Try a different port.`));
      }
    });
    
    // Handle process exit
    serverProcess.on('exit', (code) => {
      if (!serverStarted && !isShuttingDown) {
        reject(new Error(`Server failed to start (exit code: ${code})\n${errorOutput}`));
      }
    });
    
    // Set timeout in case server doesn't start
    const timeout = setTimeout(() => {
      if (!serverStarted) {
        reject(new Error(`Server failed to start within ${SERVER_STARTUP_TIMEOUT}ms timeout\n${errorOutput}`));
      }
    }, SERVER_STARTUP_TIMEOUT);
    
    // Clean up timeout on success
    serverProcess.stdout.on('data', () => {
      if (serverStarted) {
        clearTimeout(timeout);
      }
    });
  });
}

/**
 * Stops the running development server
 * @returns {Promise<void>}
 */
function stopServer() {
  return new Promise((resolve) => {
    if (!serverProcess) {
      console.log('ℹ️ No server is running');
      resolve();
      return;
    }
    
    console.log(`🛑 Stopping development server (PID: ${serverPid})...`);
    isShuttingDown = true;
    
    // Attempt graceful shutdown
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', serverPid, '/f', '/t']);
    } else {
      process.kill(-serverProcess.pid, 'SIGINT');
    }
    
    // Set timeout to force kill if necessary
    const timeout = setTimeout(() => {
      console.log('⚠️ Server did not shut down gracefully, forcing termination');
      try {
        process.kill(serverPid, 'SIGKILL');
      } catch (error) {
        // Process may already be gone
      }
      serverProcess = null;
      serverPid = null;
      serverUrl = null;
      isShuttingDown = false;
      resolve();
    }, SERVER_SHUTDOWN_TIMEOUT);
    
    // Clean up on normal exit
    serverProcess.on('exit', () => {
      clearTimeout(timeout);
      console.log('✅ Server stopped successfully');
      serverProcess = null;
      serverPid = null;
      serverUrl = null;
      isShuttingDown = false;
      resolve();
    });
  });
}

/**
 * Restarts the development server
 * @param {number} port - The port to restart the server on
 * @returns {Promise<string>} - The URL of the running server
 */
async function restartServer(port = DEFAULT_PORT) {
  await stopServer();
  return startServer(port);
}

/**
 * Gets the URL of the running server
 * @returns {string|null} - The URL of the running server or null if not running
 */
function getServerUrl() {
  return serverUrl;
}

/**
 * Checks if the server is running
 * @returns {boolean} - True if the server is running
 */
function isServerRunning() {
  return serverProcess !== null && !isShuttingDown;
}

/**
 * Writes a test configuration file with server information
 * @param {string} serverUrl - The URL of the running server
 */
function writeTestConfig(serverUrl) {
  const configPath = path.join(rootDir, 'e2e', 'test-config.json');
  const config = {
    baseUrl: serverUrl,
    timestamp: new Date().toISOString()
  };
  
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  console.log(`📝 Test configuration written to ${configPath}`);
}

// Command handling when script is run directly
if (process.argv[2]) {
  const command = process.argv[2].toLowerCase();
  const port = process.argv[3] ? parseInt(process.argv[3], 10) : DEFAULT_PORT;
  
  switch (command) {
    case 'start':
      startServer(port)
        .then(url => {
          writeTestConfig(url);
          console.log(`🌐 Server running at ${url}`);
        })
        .catch(error => {
          console.error(`❌ Failed to start server: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'stop':
      stopServer()
        .then(() => {
          console.log('👋 Server stopped');
          process.exit(0);
        });
      break;
      
    case 'restart':
      restartServer(port)
        .then(url => {
          writeTestConfig(url);
          console.log(`🌐 Server restarted at ${url}`);
        })
        .catch(error => {
          console.error(`❌ Failed to restart server: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'status':
      if (isServerRunning()) {
        console.log(`✅ Server is running at ${getServerUrl()} (PID: ${serverPid})`);
      } else {
        console.log('❌ Server is not running');
      }
      break;
      
    default:
      console.log(`
📚 Server Management Script 📚

Usage:
  node scripts/manage-server.js [command] [port]

Commands:
  start     Start the development server
  stop      Stop the development server
  restart   Restart the development server
  status    Check if the server is running

Examples:
  node scripts/manage-server.js start 3000
  node scripts/manage-server.js stop
      `);
      break;
  }
}

// Handle process exit
process.on('exit', () => {
  if (serverProcess) {
    console.log('ℹ️ Process exiting, shutting down server...');
    // Try to kill the server process
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverPid, '/f', '/t'], { detached: true });
      } else {
        process.kill(-serverProcess.pid, 'SIGKILL');
      }
    } catch (error) {
      // Process may already be gone
    }
  }
});

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down...');
  stopServer().then(() => process.exit(0));
});

// Export functions for programmatic use
export {
  startServer,
  stopServer,
  restartServer,
  isServerRunning,
  getServerUrl,
  writeTestConfig,
};