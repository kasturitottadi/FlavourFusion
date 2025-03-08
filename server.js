import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = 3001;

// ✅ Directly paste your API Key here
const genAI = new GoogleGenerativeAI('AIzaSyA_jakbqlSFGtPJe7qdWeelLOyHNc06q0c');

app.use(cors());
app.use(express.json());

app.get('/recipeStream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const prompt = `Generate a detailed ${complexity} level ${mealType} recipe for ${cuisine} cuisine using ${ingredients}. Cooking time should be ${cookingTime}.`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ action: 'chunk', chunk: text })}\n\n`);
      }
    }

    // Close the stream once completed
    res.write(`data: ${JSON.stringify({ action: 'close' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    res.status(500).send('Failed to generate recipe.');
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
