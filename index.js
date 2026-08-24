const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middlewares esenciales
app.use(cors());
app.use(express.json());

// Servir la interfaz visual desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Validar clave de API al iniciar
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR CRÍTICO: Falta la variable de entorno GEMINI_API_KEY.");
} else {
    console.log("🔑 Clave de API cargada correctamente en el servidor.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usando un modelo actual y estable de la API
const MODEL_NAME = "gemini-2.5-flash";

// Ruta POST segura para procesar las consultas de la IA
app.post('/ask', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === "") {
            return res.status(400).json({ error: "El prompt es obligatorio y debe ser un texto válido." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "El servidor no tiene configurada la clave de API de Gemini." });
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt.trim());
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---", error);
        res.status(500).json({ error: "Error en la IA: " + error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo exitosamente en el puerto ${PORT}`);
});
