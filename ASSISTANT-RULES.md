# Cursor Assistant Rules & Learnings

## Command Management Rules

1. **Directory Path Verification Rule**
   - Always verify directories exist before attempting to navigate to them with `cd`
   - Use `ls -la /full/path/to/target` **before** attempting `cd /full/path/to/target`
   - When executing cross-directory commands, use paths that start from a known directory

2. **Command Context Awareness Rule**
   - Before running any npm command, verify the current directory with `pwd`
   - Always check if package.json exists in the current directory before running npm commands
   - Use `cd /complete/path/to/directory && npm command` pattern for certainty

3. **Process & Port Management Rule**
   - Check for existing processes using `lsof -i:PORT` before starting services on that port
   - Use dedicated port numbers for report services (e.g., `--port 9324` instead of default)
   - Explicitly kill processes on ports before reuse with `kill $(lsof -ti:PORT)`

4. **Hidden File Detection Rule**
   - Use `find /path -type f -name ".*" | grep -v "\.git"` to detect hidden files
   - Check for `.next` and other build directories before assuming directories are empty
   - Use `ls -la` instead of `ls` to see hidden files/directories

5. **Directory Cleanup Rule**
   - Always verify content before removal with `ls -la` and targeted searches
   - When reorganizing, check both directories with `diff -r` for unexpected differences
   - Create temporary backups before major directory changes

6. **Flag Verification Rule**
   - Verify command line flags before using them (`npx next -h`)
   - Don't assume flag compatibility across different versions
   - Use explicit documentation references for command arguments

7. **Progressive Problem Solving Rule**
   - Start with simple tests that avoid complex dependencies
   - Isolate working parts from failing components
   - Build gradually from confirmed working components

## Navigation Debugging Rules

8. **Data Consistency Rule**
   - ALWAYS verify keys and data formats match between sending and receiving components
   - Before assuming event handler issues, check that localStorage keys match exactly
   - When debugging navigation, check how state is transferred between pages
   - Watch for key mismatches (e.g., 'gameConfig' vs 'gameSettings') that cause redirection loops

9. **Navigation Flow Analysis Rule**
   - Trace complete navigation flow from origin to destination and back
   - Check server logs for redirect patterns that indicate loops or unexpected navigation
   - Examine both the trigger (button click) and destination page's initialization logic
   - Look for patterns like GET /setup → GET /game → GET /setup that reveal redirect loops

10. **Deep Component Interaction Rule**
    - When navigation fails, examine both sides of the interaction
    - Outgoing page: Check event handlers and navigation triggers
    - Incoming page: Check initialization logic and conditional redirects
    - Debug entire navigation flow, not just the triggering component

11. **Consistent Navigation Approach Rule**
    - Use consistent navigation methods throughout an application
    - If direct window.location navigation works in one place, use it everywhere
    - Match navigation strategies between related components
    - Prefer reliable direct methods over framework-specific abstractions when troubleshooting

12. **Progressive Navigation Diagnosis Rule**
    - Start with data flow before event handling
    - Check data storage and retrieval first (localStorage, state management)
    - Then check navigation methods and redirects
    - Finally, investigate event handling details

## Command Reference for Future Use

### Server Management Commands
- `npm run server:status` - Check running Node.js processes and port usage
- `npm run server:kill-all` - Kill all Next.js and Playwright processes
- `npm run server:kill-port 3000` - Kill process on specific port
- `npm run server:check-port` - Check if port 3000 is available

### Testing Commands
- `npx playwright test e2e/basic-test.spec.ts --project=chromium` - Run basic test
- `npm run test:homepage` - Run homepage test (requires server)
- `npx playwright show-report --port 9324` - Show test report on custom port

### Node.js Version Management
- `nvm install 20.11.1 && nvm use 20.11.1` - Switch to Node.js 20.11.1
- `nvm use 23.10.0` - Switch to latest Node.js

### Development Server
- `npm run clean-start` - Kill all processes and start dev server
- `npx next dev` - Start Next.js dev server (without turbopack)

## Conversation Summaries

### 2023-04-16: Project Directory Cleanup
In this session, we accomplished the following:

1. **Successfully cleaned up the project directories** in Task_Master, consolidating everything into a single articulite directory
   - Removed unnecessary my-app directory
   - Copied important configuration files (.env) from the old articulite to fresh-articulite
   - Removed old articulite directory after verifying all content was preserved
   - Renamed fresh-articulite to articulite

2. **Fixed Git repository connections**
   - Committed and pushed all changes in fresh-articulite before renaming
   - Verified GitHub remote was properly maintained after directory rename

3. **Created server management scripts** that:
   - Help manage server processes
   - Check and clear port conflicts
   - Make testing more reliable

4. **Created simple Playwright tests** that work even with Next.js server issues
   - Made a basic test that doesn't require the server running
   - Fixed test execution on the latest Node.js

5. **Identified compatibility issues**
   - Found Next.js 15.3.0 has issues with different Node.js versions
   - Created workarounds for testing that don't depend on the problematic server

This cleanup has resulted in a cleaner, more organized project structure with all code properly saved and connected to GitHub. The repository now contains helpful scripts for managing server processes and tests that work independently of server issues.

The most valuable lesson was creating better error prevention processes and validation steps before making directory changes.

### 2023-04-18: Navigation System Fixes
In this session, we successfully diagnosed and fixed navigation issues across the application:

1. **Fixed button click functionality** on the setup page and throughout the app
   - Implemented consistent navigation pattern using direct window.location approach
   - Replaced problematic Next.js Router navigation with more reliable methods
   - Fixed localStorage key mismatches between setup and game pages
   - Added consistent navigation helper functions

2. **Improved debugging methodology** 
   - Identified patterns in server logs revealing navigation loops
   - Traced entire navigation flows to identify root causes
   - Created focused test cases to isolate and verify fixes
   - Developed new rules for future navigation debugging

3. **Enhanced application stability**
   - Standardized navigation approach throughout the application
   - Added proper event handling and visual feedback
   - Implemented error handling with fallback navigation options
   - Resolved redirect loops caused by inconsistent localStorage keys

The most valuable lessons were: (1) check data consistency across components before assuming event problems, (2) trace entire navigation flows including initialization logic, and (3) use consistent navigation methods throughout the application. 