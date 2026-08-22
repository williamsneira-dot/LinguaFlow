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
        // Usamos gemini-1.5-flash que es el modelo estándar y más estable para las APIs gratuitas
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        res.send(responseText);
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---");
        console.error(error.message); 
        console.error("-----------------------");
        
        res.status(500).send(`[FRASE]: "Error: ${error.message.substring(0, 40)}"
[PISTA]: Revisa tu API Key en Render.`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
