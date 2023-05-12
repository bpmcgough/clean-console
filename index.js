const openai = require('openai');
const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();
let queue = [];

// Set OpenAI API Key
openai.apiKey = process.env.OPENAI_API_KEY;

// Overriding console.log
const originalConsoleLog = console.log;
console.log = function (message) {
  queue.push(message);

  // Call the original console.log function
  originalConsoleLog.apply(console, arguments);
};

// Function to summarize text with ChatGPT
async function summarizeText(text) {
  const response = await openai.Completion.create({
    engine: 'text-davinci-002',
    prompt: `Summarize the following text:\n\n${text}`,
    max_tokens: 60
  });

  return response.choices[0].text.trim();
}

// Schedule a task every second to check the queue
cron.schedule('* * * * * *', async function() {
  if (queue.length > 100) {
    const text = queue.join('\n');
    queue = [];  // Clear the queue

    const summary = await summarizeText(text);
    console.log('Summary:', summary);
  }
});