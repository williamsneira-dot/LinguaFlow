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

// Ruta con el modelo actualizado que indicó Google en el error
app.get('/ask', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const prompt = req.query.q || "Hola";
    const result = await model.generateContent(prompt);
    res.send(result.response.text());
  } catch (error) {
    res.status(500).send("Error al conectar con Gemini: " + error.message);
  }
});

app.listen(port, () => console.log(`Servidor en puerto ${port}`));
