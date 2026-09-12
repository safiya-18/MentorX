const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
  console.warn("WARNING: GROQ_API_KEY is not set in backend/.env");
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MentorX AI Backend is running securely.' });
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validation: Missing message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
    }

    // Validation: Missing API Key
    if (!groqClient) {
      return res.status(500).json({ error: 'Groq API is not configured on the server.' });
    }

    // Validation: Request limit (basic length check for now)
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds the maximum allowed length of 2000 characters.' });
    }

    // Call Groq API
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: GROQ_MODEL,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'No response generated.';
    
    res.json({ reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      error: 'An error occurred while communicating with the AI service.',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`MentorX AI Backend running on http://localhost:${PORT}`);
});
