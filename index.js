require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de consulta corregida con apiVersion v1beta
app.get('/ask', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: 'v1beta' }
    );
    const prompt = req.query.q || "Hola";
    const result = await model.generateContent(prompt);
    res.send(result.response.text());
  } catch (error) {
    res.status(500).send("Error al conectar con Gemini: " + error.message);
  }
});

app.listen(port, () => console.log(`Servidor en puerto ${port}`));
