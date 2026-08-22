const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Inicializar con la llave de entorno de Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta optimizada y rápida
app.get('/ask', async (req, res) => {
    try {
        const userQuery = req.query.q;
        if (!userQuery) {
            return res.status(400).send("Falta el parámetro de consulta 'q'");
        }

        // Usamos el modelo flash rápido y limitamos los tokens de salida
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7
            }
        });

        const result = await model.generateContent(userQuery);
        const response = await result.response;
        res.send(response.text());

    } catch (error) {
        console.error("Error detallado al consultar la IA:", error);
        res.status(500).send("Error en el servidor: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
