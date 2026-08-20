const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializar dotenv si usas entorno local
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar la API de Gemini con tu clave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta /ask que requiere tu frontend para que funcione la IA, el chat y el quiz
app.get('/ask', async (req, res) => {
    const prompt = req.query.q;
    if (!prompt) {
        return res.status(400).send("Falta el parámetro 'q' con la pregunta.");
    }

    try {
        // Usamos el modelo estándar recomendado
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.send(text);
    } catch (error) {
        console.error("Error al conectar con Gemini:", error);
        res.status(500).send("Error al procesar la solicitud con la Inteligencia Artificial.");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    // actualización
});
