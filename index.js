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

const genAI = new GoogleGenerativeAI(apiKey || "CLAVE_NO_CONFIGURADA");

app.use(express.static(path.join(__dirname, 'public')));

// Función auxiliar para reintentar en caso de límite excedido (429)
async function generateWithRetry(model, prompt, retries = 3, delay = 3000) {
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        if (error.message.includes('429') && retries > 0) {
            console.log(`Límite alcanzado. Reintentando en ${delay / 1000} segundos... (${retries} intentos restantes)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(model, prompt, retries - 1, delay * 2);
        }
        throw error;
    }
}

app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) return res.status(400).send("Falta la pregunta.");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const responseText = await generateWithRetry(model, prompt);
        res.send(responseText);
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---");
        console.error(error.message); 
        console.error("-----------------------");
        
        if (error.message.includes('429')) {
            res.status(429).send("La IA está recibiendo muchas peticiones en este momento. Por favor, espera 10 segundos antes de realizar otra acción.");
        } else {
            res.status(500).send("Error en la IA: " + error.message);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
