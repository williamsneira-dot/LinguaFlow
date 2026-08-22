const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/ask', async (req, res) => {
    try {
        // Hacemos una consulta directa a Google para ver tus permisos reales
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(apiURL);
        const data = await response.json();
        
        if (data.error) {
            return res.send("Google rechazó la llave. Motivo: " + data.error.message);
        }

        // Extraemos solo los nombres de los modelos disponibles y los enviamos a la pantalla
        const nombresDeModelos = data.models.map(m => m.name.replace('models/', '')).join(', ');
        res.send("TUS MODELOS PERMITIDOS SON: " + nombresDeModelos);

    } catch (error) {
        res.status(500).send("Error de escaneo: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
