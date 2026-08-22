const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("¡ERROR CRÍTICO! La variable GEMINI_API_KEY no está configurada en Render.");
} else {
    console.log("Clave de API cargada correctamente en el servidor.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) return res.status(400).send("Falta la pregunta.");

    try {
        // Usamos gemini-2.5-flash especificando la versión completa del modelo
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        res.send(responseText);
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---", error);
        
        // Si falla 2.5, intentamos con gemini-pro como alternativa de respaldo
        try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const fallbackResult = await fallbackModel.generateContent(prompt);
            return res.send(fallbackResult.response.text());
        } catch (fallbackError) {
            res.status(500).send(`[FRASE]: "Error al generar contenido"
[PISTA]: ${error.message.replace(/"/g, "'")}`);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
