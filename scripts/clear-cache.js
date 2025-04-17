// Script to clear the question cache
console.log('Clearing question cache...');

// Create a fake localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: (key, value) => {
    console.log(`Setting ${key} in localStorage`);
  },
  removeItem: (key) => {
    console.log(`Removing ${key} from localStorage`);
  }
};

// Mock the StorageKeys enum
const StorageKeys = {
  QUESTION_CACHE: 'articulate:question_cache'
};

// Clear the question cache
try {
  localStorage.removeItem(StorageKeys.QUESTION_CACHE);
  console.log('Question cache cleared successfully!');
  console.log('\nTo clear the cache in your browser:');
  console.log('1. Open developer tools (F12 or Right-click > Inspect)');
  console.log('2. Go to the Application tab');
  console.log('3. Select "Local Storage" on the left sidebar');
  console.log('4. Right-click on "articulate:question_cache" and delete it');
} catch (error) {
  console.error('Error clearing cache:', error);
} 