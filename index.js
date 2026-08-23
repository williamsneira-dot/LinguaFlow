const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Lee la API Key cargada en el entorno de Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "DUMMY_KEY");

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint GET tradicional para compatibilidad rápida
app.get('/ask', async (req, res) => {
    try {
        const userPrompt = req.query.q;
        if (!userPrompt) {
            return res.status(400).send("Falta la consulta 'q'");
        }

        if (!GEMINI_API_KEY) {
            console.error("ERROR: No se encontró la variable GEMINI_API_KEY en Render.");
            return res.status(500).send("Falta la API Key en el servidor.");
        }

        // Utiliza el modelo activo recomendado
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        
        res.send(response.text());
    } catch (error) {
        console.error("Error al conectar con la API de Gemini:", error.message);
        res.status(500).send("Error procesando respuesta de IA: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado correctamente en puerto ${PORT}`);
});
