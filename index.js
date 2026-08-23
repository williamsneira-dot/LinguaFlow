const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Servir la interfaz visual desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Validar clave de IA
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: Falta la variable de entorno GEMINI_API_KEY.");
} else {
    console.log("🔑 Clave de API cargada correctamente en el servidor.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

// Ruta para la IA que usa tu aplicación
app.get('/ask', async (req, res) => {
    try {
        const prompt = req.query.q;
        
        if (!prompt) {
            return res.status(400).json({ error: "El prompt es obligatorio." });
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.send(text);
    } catch (error) {
        console.error("--- ERROR EN GEMINI ---");
        console.error(error);
        res.status(500).send("Error en la IA: " + error.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
