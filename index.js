const cron = require('node-cron');
const dotenv = require('dotenv');
const {Configuration, OpenAIApi} = require('openai');

dotenv.config();
let queue = new Array();

let openai;

// Overriding console.log
const originalConsoleLog = console.log;

const initializeSummary = () => {
  if(openai){
    console.log = (message, ...args) => {
      queue.push(message);
  
      originalConsoleLog.apply(console, args);
    };
  } else {
    originalConsoleLog('Please configure the OpenAI API key');
  }
}

const summarizeText = async (text) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: `Summarize the following console printout:\n\n${text}`}],
      temperature: 0,
      max_tokens: 500,
    });

    originalConsoleLog('Summary', response.data.choices[0].message.content)
  } catch (error) {
    originalConsoleLog('Error:', error);
  }
}

// Schedule a task every second to check the queue
cron.schedule('* * * * * *', async () => {
  if (queue.join('').length > 50) {
    const text = queue.join('\n');
    queue = [];  // Clear the queue

    const summary = await summarizeText(text);
    originalConsoleLog('Summary:', summary);
  }
});

const config = (apiKey) => {
  const configuration = new Configuration({
    apiKey,
  });
  openai = new OpenAIApi(configuration);
}

module.exports = {
  initializeSummary,
  config
};