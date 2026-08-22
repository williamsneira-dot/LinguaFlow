const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) return res.status(400).send("Falta la pregunta.");

    try {
        // Usamos el identificador estándar actualizado
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        res.send(responseText);
    } catch (error) {
        console.error("Error Gemini:", error.message);
        res.status(500).send(`[FRASE]: "Error al conectar con la IA"\n[PISTA]: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});
