const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Reemplaza el texto dentro de las comillas con tu clave real de Google AI Studio (empieza con AIzaSy...)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "TU_CLAVE_API_AQUI";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        const userPrompt = req.query.q;
        if (!userPrompt) {
            return res.status(400).send("Falta el parámetro 'q'");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();

        res.send(text);
    } catch (error) {
        console.error("Error consultando Gemini:", error);
        res.status(500).send("Error interno procesando la solicitud de IA.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
