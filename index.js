const express = require('express');
const path = require('path');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 3000;

// Inicializa el cliente de la API de Gemini
const ai = new GoogleGenAI();

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta optimizada para responder rápido con el modelo flash y tokens limitados
app.get('/ask', async (req, res) => {
    try {
        const userQuery = req.query.q;
        if (!userQuery) {
            return res.status(400).send("Falta el parámetro de consulta 'q'");
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Modelo ágil para respuestas rápidas
            contents: userQuery,
            config: {
                maxOutputTokens: 150, // Limita la longitud para acelerar la respuesta inmediatamente
                temperature: 0.7      // Mantiene la creatividad justa para los idiomas
            }
        });

        res.send(response.text);
    } catch (error) {
        console.error("Error al consultar la IA:", error);
        res.status(500).send("Error en el servidor");
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
