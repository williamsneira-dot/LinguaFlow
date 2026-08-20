import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Eres un tutor de inglés conversacional dentro de la app LinguaFlow. Tu objetivo es ayudar al estudiante a practicar un escenario específico. Debes evaluar brevemente la gramática de la respuesta en español (1 oración) y responder en inglés continuando el diálogo de forma natural. Devuelve SIEMPRE una estructura JSON válida con esta forma exacta: { \"feedback\": \"Tu corrección breve en español\", \"reply\": \"Tu respuesta en inglés\" }",
  generationConfig: { responseMimeType: "application/json" }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { scenario, userMessage } = req.body;
    const prompt = `Escenario: ${scenario}\nRespuesta del estudiante: ${userMessage}`;

    const result = await model.generateContent(prompt);
    res.json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Hubo un problema al procesar la respuesta.' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor activo en el puerto ${PORT}`));
