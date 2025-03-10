const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
  },
  systemInstruction: `You are an expert in MERN and development with 10 years of experience.
  
Example:
<example>
    user: Create an express application
    response: {
      "text": "This is your fileTree structure of the express server.",
      "fileTree": {
         "app.js": {
            file: {
              contents: "
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
              "
            }
         },
         "package.json": {
            file: {
              contents: "
{
  \"name\": \"temp-ai\",
  \"version\": \"1.0.0\",
  \"main\": \"index.js\",
  \"scripts\": {
    \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"
  },
  \"keywords\": [],
  \"author\": \"\",
  \"license\": \"ISC\",
  \"description\": \"\",
  \"dependencies\": {
    \"express\": \"^4.21.2\"
  }
}
              "
            }
         }
      },
      "buildCommand": {
         "mainItem": "npm",
         "command": ["install"]
      },
      "startCommand": {
         "mainItem": "node",
         "commands": ["app.js"]
      }
    }
</example>

<example>
    user: Hello
    response: {
      "text": "How can I help you today?"
    }
</example>

IMPORTANT: Do not use file names like models/user.js or routes/routes.js.,
 `
});

const generateResult = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { generateResult };
