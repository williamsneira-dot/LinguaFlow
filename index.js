const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        const userQuery = req.query.q;
        if (!userQuery) {
            return res.status(400).send("Falta el parámetro 'q'");
        }

        // 1. EL TRUCO DEFINITIVO: Preguntar a Google qué modelos están disponibles para tu llave
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const modelsData = await modelsResponse.json();
        
        // Filtrar los modelos para encontrar uno que soporte texto y sea Gemini
        const availableModels = modelsData.models.filter(m => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent') &&
            m.name.includes('gemini')
        );

        if (availableModels.length === 0) {
            return res.status(500).send("Error: Tu API Key no tiene modelos Gemini compatibles.");
        }

        // 2. Tomar el nombre exacto que Google nos devuelva (le quitamos el "models/")
        const autoModelName = availableModels[0].name.replace('models/', '');
        console.log("✅ Modelo detectado y usado automáticamente:", autoModelName);

        // 3. Usar ese modelo 100% garantizado
        const model = genAI.getGenerativeModel({ 
            model: autoModelName, 
            generationConfig: {
                maxOutputTokens: 150, // Mantenemos la velocidad
                temperature: 0.7
            }
        });

        const result = await model.generateContent(userQuery);
        const response = await result.response;
        res.send(response.text());

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error en el servidor: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
