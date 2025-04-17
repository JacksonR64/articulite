// Task Master CLI command handler
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tasksDir = path.resolve(__dirname, '../../tasks');

// Default tasks file path
const tasksFilePath = path.join(tasksDir, 'tasks.json');

/**
 * Add a new task to tasks.json
 * @param {Object} options - Command options
 */
export async function addTask(options = {}) {
  try {
    console.log("🔍 Reading existing tasks...");
    
    // Ensure tasks directory exists
    await fs.mkdir(tasksDir, { recursive: true });
    
    // Read existing tasks or create empty structure
    let tasksData;
    try {
      const fileContent = await fs.readFile(tasksFilePath, 'utf8');
      tasksData = JSON.parse(fileContent);
    } catch (err) {
      console.log("⚠️ No existing tasks file found, creating new one.");
      tasksData = { tasks: [] };
    }
    
    // Get the next task ID
    const nextId = tasksData.tasks.length > 0 
      ? Math.max(...tasksData.tasks.map(task => task.id)) + 1 
      : 1;
    
    // Create a new task with default values
    const newTask = {
      id: nextId,
      title: options.title || "Debug and Fix Button Click Issues",
      description: options.description || "Investigate and resolve issues with buttons not working on the setup page",
      status: "pending",
      dependencies: options.dependencies || [],
      priority: options.priority || "high",
      details: options.details || "Create Playwright tests to verify button functionality. Debug issues with event handling on the setup page. Fix the issues with the Start Game button not navigating correctly.",
      testStrategy: options.testStrategy || "Verify button click functionality with Playwright tests. Ensure navigation happens correctly after button clicks.",
      subtasks: []
    };
    
    // Add the new task
    tasksData.tasks.push(newTask);
    
    // Save the updated tasks
    await fs.writeFile(tasksFilePath, JSON.stringify(tasksData, null, 2), 'utf8');
    
    console.log(`✅ Task ${nextId} added successfully!`);
    
    // Create individual task file
    const taskFilePath = path.join(tasksDir, `task_${String(nextId).padStart(3, '0')}.txt`);
    const taskContent = `# Task ${nextId}: ${newTask.title}

## Description
${newTask.description}

## Status
${newTask.status}

## Priority
${newTask.priority}

## Dependencies
${newTask.dependencies.length > 0 ? newTask.dependencies.join(', ') : 'None'}

## Implementation Details
${newTask.details}

## Test Strategy
${newTask.testStrategy}
`;
    
    await fs.writeFile(taskFilePath, taskContent, 'utf8');
    console.log(`📄 Task file created at: ${taskFilePath}`);
    
  } catch (error) {
    console.error("❌ Error adding task:", error);
  }
}

/**
 * List all tasks
 */
export async function listTasks() {
  try {
    const fileContent = await fs.readFile(tasksFilePath, 'utf8');
    const tasksData = JSON.parse(fileContent);
    
    console.log("\n📋 Tasks List:\n");
    
    tasksData.tasks.forEach(task => {
      const statusEmoji = task.status === "done" ? "✅" : task.status === "pending" ? "⏳" : "❓";
      console.log(`${statusEmoji} [${task.id}] ${task.title} (${task.priority} priority)`);
      
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          const subtaskStatusEmoji = subtask.status === "done" ? "✅" : subtask.status === "pending" ? "⏳" : "❓";
          console.log(`  ${subtaskStatusEmoji} [${task.id}.${subtask.id}] ${subtask.title}`);
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error listing tasks:", error);
  }
}

/**
 * Expand a task by adding subtasks
 * @param {Object} options - Command options
 */
export async function expandTask(options = {}) {
  try {
    // Check if task ID is provided
    if (!options.id) {
      console.error("❌ Task ID is required.");
      return;
    }
    
    console.log(`🔍 Expanding task #${options.id}...`);
    
    // Read tasks data
    const fileContent = await fs.readFile(tasksFilePath, 'utf8');
    const tasksData = JSON.parse(fileContent);
    
    // Find the task to expand
    const taskIndex = tasksData.tasks.findIndex(task => task.id === parseInt(options.id));
    if (taskIndex === -1) {
      console.error(`❌ Task with ID ${options.id} not found.`);
      return;
    }
    
    const task = tasksData.tasks[taskIndex];
    
    // Add predefined subtasks for the button click issues task
    if (task.id === 11) {
      task.subtasks = [
        {
          id: 1,
          title: "Create Playwright test for setup page buttons",
          description: "Develop comprehensive tests for all buttons on the setup page, focusing on the Start Game button",
          status: "pending",
          dependencies: [],
          details: "Create a dedicated Playwright test file for setup page buttons. Test each button's functionality systematically. Ensure server starts on a consistent port. Verify expected navigation occurs after button clicks. Add assertions to confirm page transitions and state changes."
        },
        {
          id: 2,
          title: "Add server management script",
          description: "Create a script to ensure the development server runs consistently on the same port for testing",
          status: "pending",
          dependencies: [1],
          details: "Create a utility script to start/stop the dev server programmatically. Configure it to use a consistent port. Add integration with Playwright test runner. Include error handling for server startup failures. Document usage for the development team."
        },
        {
          id: 3,
          title: "Diagnose button click event handling issues",
          description: "Investigate why button clicks are not triggering the expected navigation or actions",
          status: "pending",
          dependencies: [1, 2],
          details: "Use browser developer tools to monitor event propagation. Add logging to the handleStartGame function. Check for event handler binding issues. Verify state management during button clicks. Investigate potential React hydration issues. Compare working buttons with non-working ones to identify differences."
        },
        {
          id: 4,
          title: "Fix button click issues",
          description: "Implement solutions based on diagnosis to fix the button functionality",
          status: "pending",
          dependencies: [3],
          details: "Update event handling code based on diagnosis findings. Fix any React state management issues. Correct hydration or rendering problems. Ensure event handlers are properly bound. Test fixes in isolation before integration. Document the root cause and solution."
        },
        {
          id: 5,
          title: "Verify fixes with automated tests",
          description: "Run the Playwright tests to confirm buttons work correctly after fixes",
          status: "pending",
          dependencies: [4],
          details: "Run the full test suite to confirm all fixes work. Verify button clicks lead to correct navigation. Check that game state is properly initialized. Document test results. Update tests if needed to cover edge cases discovered during fixing."
        }
      ];
      
      // Save updated tasks
      await fs.writeFile(tasksFilePath, JSON.stringify(tasksData, null, 2), 'utf8');
      
      // Update the task file to include subtasks
      const taskFilePath = path.join(tasksDir, `task_${String(task.id).padStart(3, '0')}.txt`);
      const taskContent = `# Task ${task.id}: ${task.title}

## Description
${task.description}

## Status
${task.status}

## Priority
${task.priority}

## Dependencies
${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}

## Implementation Details
${task.details}

## Test Strategy
${task.testStrategy}

## Subtasks
${task.subtasks.map(subtask => `### ${subtask.id}. ${subtask.title}
${subtask.description}
Status: ${subtask.status}
Dependencies: ${subtask.dependencies.length > 0 ? subtask.dependencies.join(', ') : 'None'}
Details: ${subtask.details}
`).join('\n')}
`;
      
      await fs.writeFile(taskFilePath, taskContent, 'utf8');
      
      console.log(`✅ Added ${task.subtasks.length} subtasks to task #${task.id}`);
    } else {
      console.log(`⚠️ No predefined subtasks available for task #${task.id}`);
    }
    
  } catch (error) {
    console.error("❌ Error expanding task:", error);
  }
}

/**
 * Run the CLI with provided arguments
 * @param {Array} args - Command line arguments
 */
export function runCLI(args) {
  const command = args[2];
  
  switch (command) {
    case 'add-task':
      addTask();
      break;
    case 'list':
      listTasks();
      break;
    case 'expand':
      // Extract --id=X from arguments
      const idArg = args.find(arg => arg.startsWith('--id='));
      const id = idArg ? idArg.split('=')[1] : null;
      expandTask({ id });
      break;
    default:
      console.log(`
📚 Task Master CLI 📚

Available commands:
  add-task                Add a new task
  list                    List all tasks
  expand --id=<taskId>    Add subtasks to a specific task
      `);
      break;
  }
} 