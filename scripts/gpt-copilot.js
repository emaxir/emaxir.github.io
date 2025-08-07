// Example script that could be used with OpenAI API in the future

const fs = require('fs');
const axios = require('axios');

async function runTask(promptPath) {
  const prompt = fs.readFileSync(promptPath, 'utf-8');
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'Authorization': `Bearer YOUR_OPENAI_API_KEY`
    }
  });

  console.log(response.data.choices[0].message.content);
}

runTask('./prompts/tasks.md');
