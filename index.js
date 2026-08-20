require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

// Ruta principal para verificar que funciona
app.get('/', (req, res) => {
  res.send('<h1>LinguaFlow está funcionando y conectado a Gemini</h1>');
});

// Ruta de ejemplo para hacer consultas a Gemini
app.get('/ask', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = req.query.q || "Hola, ¿cómo estás?";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.send(response.text());
  } catch (error) {
    res.status(500).send("Error al conectar con Gemini: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
