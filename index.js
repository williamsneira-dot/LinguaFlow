const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Verificación inicial de la clave
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("¡ERROR CRÍTICO! La variable GEMINI_API_KEY no está configurada en Render.");
} else {
    console.log("Clave de API cargada correctamente en el servidor.");
}

const genAI = new GoogleGenerativeAI(apiKey || "CLAVE_NO_CONFIGURADA");

app.use(express.static(path.join(__dirname, 'public')));

// Función auxiliar para reintentar peticiones en caso de saturación temporal (503 / 429)
async function generateContentWithRetry(model, prompt, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            const isOverloaded = error.message && (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('429'));
            if (isOverloaded && i < retries - 1) {
                console.warn(`[Aviso] Modelo saturado. Reintento ${i + 1} de ${retries} en ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Incremento exponencial del tiempo de espera
            } else {
                throw error;
            }
        }
    }
}

app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) return res.status(400).send("Falta la pregunta.");

    try {
        // Modelo oficial activo
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await generateContentWithRetry(model, prompt);
        res.send(result.response.text());
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---");
        console.error(error.message); 
        console.error("-----------------------");
        res.status(500).send("Error en la IA: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
