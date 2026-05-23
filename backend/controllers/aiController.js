const { GoogleGenerativeAI } = require('@google/generative-ai');
const dbService = require('../models/dbService');

const cleanJsonString = (str) => {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
};

// Initialize Gemini API (safely handling missing keys)
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI:', err);
  }
}

// Common queries mock database for offline fallback
const mockResponses = {
  binary_search: {
    javascript: {
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    // Calculate mid to avoid overflow
    const mid = Math.floor(left + (right - left) / 2);

    // Check if target is present at mid
    if (arr[mid] === target) {
      return mid;
    }

    // If target is greater, ignore left half
    if (arr[mid] < target) {
      left = mid + 1;
    } 
    // If target is smaller, ignore right half
    else {
      right = mid - 1;
    }
  }

  // Target was not present in the array
  return -1;
}`,
      comments: `Line 2-3: Initialize left pointer to 0 and right pointer to the last element index.
Line 5: Loop continues as long as the search interval is not empty.
Line 7: Midpoint formula avoids integer overflow.
Line 10-12: Target found; return index.
Line 15-17: If mid-value is smaller than target, search right half.
Line 20-22: Else search left half.
Line 26: Return -1 if not found.`,
      explanation: `Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.

### How it works:
1. Start with the entire sorted array.
2. If the value of the search key is less than the item in the middle of the interval, narrow the interval to the lower half.
3. Otherwise, narrow it to the upper half.
4. Repeatedly check until the value is found or the interval is empty.`,
      algorithm: `1. Set left pointer to 0, right pointer to N-1.
2. If left > right, return -1 (Not Found).
3. Find mid = floor(left + (right - left)/2).
4. If arr[mid] == target, return mid.
5. If arr[mid] < target, set left = mid + 1 and repeat from Step 2.
6. If arr[mid] > target, set right = mid - 1 and repeat from Step 2.`,
      complexity: {
        time: 'O(log N)',
        space: 'O(1)'
      },
      flowchart: `graph TD
  A["Start"] --> B["Initialize left = 0, right = N - 1"]
  B --> C{"left <= right?"}
  C -- "Yes" --> D["Calculate mid = left + (right - left)/2"]
  D --> E{"arr[mid] == target?"}
  E -- "Yes" --> F["Return mid"]
  E -- "No" --> G{"arr[mid] < target?"}
  G -- "Yes" --> H["left = mid + 1"]
  G -- "No" --> I["right = mid - 1"]
  H --> C
  I --> C
  C -- "No" --> J["Return -1"]
  F --> K["End"]
  J --> K`,
      alternative: `An alternative is recursive binary search, which has the same time complexity but uses O(log N) auxiliary space due to the call stack:
\`\`\`javascript
function recursiveBinarySearch(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  const mid = Math.floor(left + (right - left) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return recursiveBinarySearch(arr, target, mid + 1, right);
  return recursiveBinarySearch(arr, target, left, mid - 1);
}
\`\`\``
    }
  }
};

// Generic response builder for queries not mocked
const getGenericMockResponse = (prompt, language, difficulty) => {
  const code = `// CodeExplain Mock Output for: "${prompt}"
// Language: ${language} | Difficulty: ${difficulty}

#include <stdio.h>
// If you configure a real GEMINI_API_KEY in backend/.env,
// this system will instantly stream actual AI responses!

void helloWorld() {
    printf("CodeExplain AI (Local Demo Mode)\\n");
    printf("Query: %s\\n", "${prompt}");
}
`;
  return {
    code: language === 'javascript' ? `console.log("Demo Code for: ${prompt}");` : code,
    comments: `Line 1: Explains that this is local demo mode.\nLine 2: Please add GEMINI_API_KEY inside your .env configuration.`,
    explanation: `This is a demo explanation. Please set up your **GEMINI_API_KEY** in the backend configuration file \`.env\` to unlock full dynamic Gemini-based code generation.`,
    algorithm: `1. Check for API key.\n2. Fail back to mock template.\n3. Render this warning UI.`,
    complexity: {
      time: 'O(1)',
      space: 'O(1)'
    },
    flowchart: `graph TD
  A["Start Demo Mode"] --> B["Configure .env with GEMINI_API_KEY"]
  B --> C["Restart Backend Server"]
  C --> D["Enjoy full Gemini Integration!"]`,
    alternative: `To use full AI code generation, simply create a \`.env\` file in the \`backend/\` directory and add:
\`GEMINI_API_KEY=your_gemini_api_key_here\``
  };
};

const aiController = {
  generateCode: async (req, res) => {
    try {
      const { prompt, language, difficulty } = req.body;
      const userId = req.user.id;

      if (!prompt || !language || !difficulty) {
        return res.status(400).json({ message: 'Prompt, language, and difficulty are required.' });
      }

      let aiResult;

      // Re-read .env dynamically to pick up user edits without requiring server restarts!
      try {
        require('dotenv').config({ override: true });
      } catch (err) {
        console.error('Failed to reload .env configuration:', err);
      }
      const currentApiKey = process.env.GEMINI_API_KEY;

      // Check if we use custom client API key or backend key
      const userApiKey = req.headers['x-gemini-key'];
      let activeGenAI = null;
      const targetKey = (userApiKey && userApiKey !== 'null' && userApiKey !== 'undefined' && userApiKey.trim() !== '')
        ? userApiKey
        : currentApiKey;

      if (targetKey && targetKey !== 'YOUR_GEMINI_API_KEY' && targetKey.trim() !== '') {
        try {
          activeGenAI = new GoogleGenerativeAI(targetKey);
        } catch (e) {
          console.error('Failed to init Gemini key:', e);
        }
      }

      if (activeGenAI) {
        try {
          const model = activeGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          
          const systemPrompt = `You are an expert software developer and technical educator.
You must respond strictly in JSON format. Do not include markdown code block characters around the JSON output, just output raw JSON text.
The JSON must follow this exact structure:
{
  "code": "A string containing complete, functional, well-structured, production-ready code in ${language} matching the difficulty level ${difficulty}. Use 2-space indentation. Include inline comments directly in the code.",
  "comments": "A string detailing a line-by-line or block-by-block breakdown explanation of what individual lines of the code do. Use line references if helpful.",
  "explanation": "A string explaining in simple, beginner-friendly terms what the code does, why we wrote it this way, and dry-run examples.",
  "algorithm": "A string listing the high-level algorithm, steps, or logical approach taken.",
  "complexity": {
    "time": "Time complexity in Big O notation (e.g., O(N log N)). Explain briefly why.",
    "space": "Space complexity in Big O notation (e.g., O(1)). Explain briefly why."
  },
  "flowchart": "A valid Mermaid.js flowchart representing the logical flow of the code. Start with 'graph TD'. Label nodes clearly, and double quote all node text, e.g. A[\\"Start\\"] --> B{\\"Is index valid?\\"}. Avoid special brackets or quotes that break Mermaid parsing. Make it beautiful and functional.",
  "alternative": "A string detailing an alternative solution (e.g., iterative vs recursive, or different data structure) with its code snippet and pros/cons."
}

User Question: "${prompt}"`;

          const responseSchema = {
            type: "object",
            properties: {
              code: { 
                type: "string",
                description: "The complete source code with proper formatting, indentation, and standard line breaks (use \\n for newlines). Do not output on a single line." 
              },
              comments: { 
                type: "string",
                description: "Line-by-line explanation comments separated by newlines (\\n)." 
              },
              explanation: { 
                type: "string",
                description: "Line-by-line pedagogical breakdown with paragraph newlines (\\n)." 
              },
              algorithm: { 
                type: "string",
                description: "Sequential logic steps list with newline characters (\\n)." 
              },
              complexity: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  space: { type: "string" }
                },
                required: ["time", "space"]
              },
              flowchart: { type: "string" },
              alternative: { 
                type: "string",
                description: "Alternative code snippet and explanation formatted with standard indentation and newlines (\\n)." 
              }
            },
            required: ["code", "comments", "explanation", "algorithm", "complexity", "flowchart", "alternative"]
          };

          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema
            }
          });

          const responseText = result.response.text();
          aiResult = JSON.parse(cleanJsonString(responseText));
        } catch (geminiErr) {
          console.error('Gemini API call failed, using mock fallback:', geminiErr);
          // Try to see if we have standard mock for binary search
          const key = prompt.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          if (key.includes('binary') && key.includes('search') && mockResponses.binary_search[language.toLowerCase()]) {
            aiResult = mockResponses.binary_search[language.toLowerCase()];
          } else {
            aiResult = getGenericMockResponse(prompt, language, difficulty);
          }
        }
      } else {
        // No Gemini API Key
        const key = prompt.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (key.includes('binary') && key.includes('search') && mockResponses.binary_search[language.toLowerCase()]) {
          aiResult = mockResponses.binary_search[language.toLowerCase()];
        } else {
          aiResult = getGenericMockResponse(prompt, language, difficulty);
        }
      }

      // Create new chat session with original prompt and response
      const chat = await dbService.createChat({
        userId,
        language,
        difficulty,
        prompt,
        response: aiResult
      });

      res.status(200).json({
        chatId: chat.id || chat._id,
        language: chat.language,
        difficulty: chat.difficulty,
        prompt: chat.prompt,
        response: chat.response,
        messages: chat.messages,
        createdAt: chat.createdAt
      });
    } catch (err) {
      console.error('AI code generation error:', err);
      res.status(500).json({ message: 'Error generating code and explanation.' });
    }
  },

  chatFollowUp: async (req, res) => {
    try {
      const { chatId, message } = req.body;
      const userId = req.user.id;

      if (!chatId || !message) {
        return res.status(400).json({ message: 'Chat ID and follow-up message are required.' });
      }

      const chat = await dbService.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat session not found.' });
      }

      // Safeguard ownership
      if (chat.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      // Prepare updated history
      const updatedMessages = [...chat.messages, { role: 'user', content: message, timestamp: new Date() }];
      let replyContent;
      let updatedResponse = { ...chat.response };

      // Re-read .env dynamically to pick up user edits without requiring server restarts!
      try {
        require('dotenv').config({ override: true });
      } catch (err) {
        console.error('Failed to reload .env configuration:', err);
      }
      const currentApiKey = process.env.GEMINI_API_KEY;

      // Check for custom client API key or backend key
      const userApiKey = req.headers['x-gemini-key'];
      let activeGenAI = null;
      const targetKey = (userApiKey && userApiKey !== 'null' && userApiKey !== 'undefined' && userApiKey.trim() !== '')
        ? userApiKey
        : currentApiKey;

      if (targetKey && targetKey !== 'YOUR_GEMINI_API_KEY' && targetKey.trim() !== '') {
        try {
          activeGenAI = new GoogleGenerativeAI(targetKey);
        } catch (e) {
          console.error('Failed to init Gemini key inside follow-up:', e);
        }
      }

      if (activeGenAI) {
        try {
          const model = activeGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          
          // Construct message history context for Gemini
          let chatContext = `You are continuing a discussion about code in ${chat.language}.
Here is the code context:
\`\`\`${chat.language}
${chat.response.code}
\`\`\`
Previous messages in this session:
`;
          chat.messages.forEach(m => {
            chatContext += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n`;
          });
          
          chatContext += `\nUser follow-up question: "${message}"
          
You must respond strictly in JSON format. Do not include markdown code block characters around the JSON output, just output raw JSON text.
Respond with a JSON object of this structure:
{
  "reply": "Your explanation or reply answering the user query in simple, pedagogical terms. Use markdown formatting where appropriate.",
  "codeUpdated": "boolean indicating if the code should be updated based on user request",
  "updatedCode": "string containing updated full code ONLY if codeUpdated is true, otherwise empty string",
  "updatedComments": "string containing updated inline line comments ONLY if codeUpdated is true, otherwise empty string",
  "updatedFlowchart": "string containing updated Mermaid flowchart ONLY if codeUpdated is true, otherwise empty string",
  "updatedComplexity": {
    "time": "updated time complexity (only if changed)",
    "space": "updated space complexity (only if changed)"
  }
}`;

          const followUpSchema = {
            type: "object",
            properties: {
              reply: { 
                type: "string",
                description: "Interactive chat reply text, formatted with newlines (\\n) for paragraphs and lists." 
              },
              codeUpdated: { type: "boolean" },
              updatedCode: { 
                type: "string",
                description: "Updated source code with proper indents and newline characters (\\n) for line breaks, only if codeUpdated is true." 
              },
              updatedComments: { 
                type: "string",
                description: "Updated line comments with newlines (\\n) if codeUpdated is true." 
              },
              updatedFlowchart: { type: "string" },
              updatedComplexity: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  space: { type: "string" }
                }
              }
            },
            required: ["reply", "codeUpdated"]
          };

          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: chatContext }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: followUpSchema
            }
          });

          const responseText = result.response.text();
          const followUpData = JSON.parse(cleanJsonString(responseText));

          replyContent = followUpData.reply;

          // If the AI updated the code, we save the new code state in the response
          if (followUpData.codeUpdated) {
            updatedResponse.code = followUpData.updatedCode || updatedResponse.code;
            updatedResponse.comments = followUpData.updatedComments || updatedResponse.comments;
            updatedResponse.flowchart = followUpData.updatedFlowchart || updatedResponse.flowchart;
            if (followUpData.updatedComplexity) {
              updatedResponse.complexity = {
                time: followUpData.updatedComplexity.time || updatedResponse.complexity.time,
                space: followUpData.updatedComplexity.space || updatedResponse.complexity.space
              };
            }
          }

        } catch (geminiErr) {
          console.error('Gemini follow-up API call failed, mock reply:', geminiErr);
          replyContent = `I received your message: "${message}". Please configure a valid **GEMINI_API_KEY** in backend/.env to get real AI interactive answers!`;
        }
      } else {
        replyContent = `I received your message: "${message}". In local demo mode (no GEMINI_API_KEY), I can simulate how follow-up questions work, but to get a real response, configure the Gemini API key in your \`.env\` file.`;
      }

      updatedMessages.push({ role: 'model', content: replyContent, timestamp: new Date() });

      // Save updated messages and potential updated response back to DB
      await dbService.updateChatMessages(chatId, updatedMessages);
      
      // If code was updated, we need to update the chat response object in DB
      await dbService.updateChatResponse(chatId, updatedResponse);

      res.status(200).json({
        reply: replyContent,
        updatedResponse: updatedResponse, // send the current state of code/explanation
        messages: updatedMessages
      });
    } catch (err) {
      console.error('AI follow-up error:', err);
      res.status(500).json({ message: 'Error processing follow-up chat.' });
    }
  }
};

module.exports = aiController;
