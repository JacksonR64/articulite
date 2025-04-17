/**
 * Script to preload sample questions into localStorage
 * This gives us test data without requiring an OpenAI API key
 */

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

// Sample questions for each category
const sampleQuestions = {
  Object: [
    { text: "Describe a chair without using the words 'sit' or 'seat'", difficulty: "medium" },
    { text: "Describe a smartphone without mentioning any brand names", difficulty: "easy" },
    { text: "Explain what a refrigerator is to someone from the 1700s", difficulty: "medium" },
    { text: "Describe a book without using the words 'read', 'page', or 'paper'", difficulty: "hard" },
    { text: "Explain what headphones are without mentioning music or ears", difficulty: "medium" },
    { text: "Describe scissors without using your hands to gesture", difficulty: "easy" },
    { text: "Explain what a clock is without using time-related words", difficulty: "hard" },
    { text: "Describe a bicycle without mentioning wheels", difficulty: "hard" },
    { text: "Explain what glasses/spectacles are without touching your face", difficulty: "medium" },
    { text: "Describe a television without saying 'watch' or 'screen'", difficulty: "medium" }
  ],
  Nature: [
    { text: "Describe a mountain without using 'big', 'tall', or 'high'", difficulty: "medium" },
    { text: "Explain what a river is without using 'water' or 'flow'", difficulty: "hard" },
    { text: "Describe a forest without mentioning trees", difficulty: "hard" },
    { text: "Explain what a beach is without saying 'sand' or 'ocean'", difficulty: "medium" },
    { text: "Describe a cloud without looking up or pointing", difficulty: "easy" },
    { text: "Explain what a flower is without mentioning colors", difficulty: "medium" },
    { text: "Describe a waterfall without using your hands to gesture", difficulty: "medium" },
    { text: "Explain what the moon is without mentioning night or sky", difficulty: "hard" },
    { text: "Describe a volcano without saying 'hot', 'lava', or 'erupt'", difficulty: "hard" },
    { text: "Explain what a desert is without mentioning sand or heat", difficulty: "medium" }
  ],
  Person: [
    { text: "Describe a doctor without mentioning hospitals or medicine", difficulty: "medium" },
    { text: "Explain what a teacher does without mentioning schools or students", difficulty: "hard" },
    { text: "Describe a chef without talking about food or cooking", difficulty: "hard" },
    { text: "Explain what an athlete is without naming any sports", difficulty: "medium" },
    { text: "Describe a musician without using sound-related words", difficulty: "hard" },
    { text: "Explain what a firefighter does without mentioning fire", difficulty: "hard" },
    { text: "Describe a police officer without saying 'law' or 'crime'", difficulty: "medium" },
    { text: "Explain what an artist does without mentioning any art forms", difficulty: "medium" },
    { text: "Describe a farmer without talking about plants or animals", difficulty: "hard" },
    { text: "Explain what an actor is without mentioning movies, TV, or theater", difficulty: "hard" }
  ],
  Action: [
    { text: "Describe running without moving your legs", difficulty: "easy" },
    { text: "Explain dancing without standing up", difficulty: "medium" },
    { text: "Describe swimming without moving your arms", difficulty: "medium" },
    { text: "Explain writing without using your hands", difficulty: "medium" },
    { text: "Describe laughing without making any sound", difficulty: "easy" },
    { text: "Explain cooking without mentioning food", difficulty: "hard" },
    { text: "Describe singing without making vocal sounds", difficulty: "medium" },
    { text: "Explain jumping without leaving your seat", difficulty: "easy" },
    { text: "Describe climbing without using your hands or arms", difficulty: "hard" },
    { text: "Explain reading without mentioning books or eyes", difficulty: "medium" }
  ],
  World: [
    { text: "Describe New York City without mentioning buildings or people", difficulty: "hard" },
    { text: "Explain what a country is without naming any", difficulty: "medium" },
    { text: "Describe the ocean without saying 'water' or 'blue'", difficulty: "medium" },
    { text: "Explain what a desert is without mentioning sand or heat", difficulty: "medium" },
    { text: "Describe the Amazon rainforest without mentioning trees or rain", difficulty: "hard" },
    { text: "Explain what an island is without saying 'water' or 'land'", difficulty: "hard" },
    { text: "Describe the Great Wall of China without saying 'wall' or 'long'", difficulty: "hard" },
    { text: "Explain what a capital city is without naming examples", difficulty: "medium" },
    { text: "Describe the North Pole without mentioning snow, ice, or cold", difficulty: "hard" },
    { text: "Explain what a museum is without mentioning art or history", difficulty: "medium" }
  ],
  Random: [
    { text: "Describe the concept of time without using numbers", difficulty: "hard" },
    { text: "Explain what music is without humming or mentioning instruments", difficulty: "medium" },
    { text: "Describe happiness without smiling", difficulty: "medium" },
    { text: "Explain what a game is without giving examples", difficulty: "medium" },
    { text: "Describe the internet without mentioning computers or phones", difficulty: "hard" },
    { text: "Explain what money is without mentioning buying or selling", difficulty: "hard" },
    { text: "Describe sleep without mentioning beds or closing your eyes", difficulty: "medium" },
    { text: "Explain what a language is without speaking or writing examples", difficulty: "hard" },
    { text: "Describe a birthday without mentioning age or presents", difficulty: "medium" },
    { text: "Explain what a family is without referring to specific family members", difficulty: "medium" }
  ]
};

// Prepare cache structure
const cache = {
  version: "1.0.0",
  lastUpdated: Date.now(),
  categories: {}
};

// Add UUID to each question and map to categories
Object.keys(sampleQuestions).forEach(category => {
  cache.categories[category] = sampleQuestions[category].map((q, index) => ({
    id: `sample-${category}-${index}`,
    category,
    text: q.text,
    difficulty: q.difficulty,
    used: false
  }));
});

// Stringify for localStorage
const cacheString = JSON.stringify(cache);

console.log('Sample question cache created:');
console.log(`Total categories: ${Object.keys(cache.categories).length}`);
Object.keys(cache.categories).forEach(category => {
  console.log(`- ${category}: ${cache.categories[category].length} questions`);
});

console.log('\nTo add these sample questions to your browser:');
console.log('1. Open developer tools (F12 or Right-click > Inspect)');
console.log('2. Go to the Application tab');
console.log('3. Select "Local Storage" on the left sidebar');
console.log('4. Use the following command in the Console:');
console.log(`localStorage.setItem('articulate:question_cache', '${cacheString.replace(/'/g, "\\'")}')`);
console.log('\nThis will preload sample questions for testing without needing an OpenAI API key.'); 