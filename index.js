const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

// Inicialización de la API de Gemini usando la variable de entorno segura
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para servir la interfaz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint seguro de consulta a Gemini con manejo robusto de errores
app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) {
        return res.status(400).send("Falta el parámetro de consulta (q).");
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.send(response.text);
    } catch (error) {
        console.error("Error al conectar con Gemini:", error);
        res.status(500).send("Error interno al procesar la solicitud con la Inteligencia Artificial.");
    }
});

app.listen(port, () => {
    console.log(`Servidor LinguaNova ejecutándose en http://localhost:${port}`);
});
