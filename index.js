// index.js
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows requests from your frontend
app.use(express.json()); // Parses incoming JSON requests

// Initialize Gemini AI
// Make sure to set your GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// API Route: /api/learn
app.post('/api/learn', async (req, res) => {
  try {
    const { task, text } = req.body;

    if (!task || !text) {
      return res.status(400).json({ error: 'Task and text are required.' });
    }

    // Logic: Create a specific prompt based on the learning task
    let systemPrompt;
    switch (task) {
      case 'correct-grammar':
        systemPrompt = `You are an expert English grammar teacher. Correct the grammar in the following sentence. Only provide the corrected sentence. Do not add any explanations unless the original sentence was perfect. If it's perfect, just say "The sentence is grammatically correct." Sentence: "${text}"`;
        break;
        case 'rephrase-fluently':
        systemPrompt = `You are an expert writer and editor. Rephrase the following text to make it more fluent, clear, and professional.

        Your goals are to:
        - Preserve the original meaning.
        - Improve sentence structure and word choice.
        - Provide 2-3 distinct and improved versions.

        Original text: "${text}"`;
        break;
        case 'explain-this':
        systemPrompt = `You are an expert communicator skilled at simplifying complex topics. Your goal is to explain the following text or concept in a clear and easy-to-understand way.

        Structure your explanation with these sections:
        - **Simple Summary:** Start with a brief, high-level summary of what it is.
        - **Key Points:** Break down the main ideas into a few clear, digestible points. Use bullets.
        - **Analogy or Example:** Provide a simple analogy or a real-world example to make it relatable.
        - **Why it Matters:** Briefly explain its significance or common use.

        Assume the reader is smart but not an expert on this topic.

        Topic to explain: "${text}"`;
        break;
        case 'translate-to-bengali':
        systemPrompt = `You are an expert translator specializing in high-quality English to Bengali translation.

        Your task is to:
        1.  Accurately translate the following text into natural, fluent Bengali, preserving the original meaning and tone.
        2.  Provide the translation in the **Bengali script** (e.g., আমার নাম...).
        3.  After the script, provide a **romanized version** for pronunciation (e.g., Amar nam...).

        Format the output clearly, with the Bengali script first.

        Original text: "${text}"`;
        break;
      case 'explain-vocabulary':
        systemPrompt = `You are a helpful dictionary. Explain the English word "${text}" for a beginner. Provide its definition, part of speech, and one clear example sentence. Format your response in markdown.`;
        break;
      case 'improve-sentence':
        systemPrompt = `You are an English writing coach. Improve the following sentence to make it sound more fluent and natural for a native speaker. Provide the improved sentence and a brief, one-line explanation of what you changed. Sentence: "${text}"`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid task specified.' });
    }

    // Request to Gemini API
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const geminiText = response.text();

    // Send the response back to the frontend
    res.json({ message: geminiText });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to get response from AI model.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port} 🚀`);
});
