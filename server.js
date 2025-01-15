const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000; // Puedes cambiar el puerto si lo necesitas

app.use(cors()); // Permite solicitudes desde otros dominios
app.use(express.json()); // Permite recibir JSON en el cuerpo de las solicitudes

// Ruta para manejar solicitudes POST a la API de Notion
app.post("/api/notion", async (req, res) => {
  const { databaseId, query } = req.body;

  if (!databaseId) {
    return res.status(400).json({ error: "Falta el ID de la base de datos" });
  }

  try {
    console.log("Enviando solicitud a Notion con databaseId:", databaseId);
    console.log("Query:", query);

    const notionResponse = await global.fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`, // Clave API desde variables de entorno
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(query || {}), // Consulta personalizada (opcional)
    });

    console.log("Respuesta de Notion:", notionResponse.status);

    const data = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Error en la respuesta de Notion:", data);
      return res.status(notionResponse.status).json(data); // Manejo de errores de la API
    }

    res.json(data); // Enviar los datos al frontend
  } catch (error) {
    console.error("Error interno del servidor (POST):", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para manejar solicitudes GET a la API de Notion (fetchArticle)
app.get("/api/notion", async (req, res) => {
  const { pageId } = req.query;

  if (!pageId) {
    return res.status(400).json({ error: "Falta el ID de la página" });
  }

  try {
    console.log("Enviando solicitud a Notion con pageId:", pageId);

    const notionResponse = await global.fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`, // Clave API desde variables de entorno
        "Notion-Version": "2022-06-28",
      },
    });

    console.log("Respuesta de Notion (GET):", notionResponse.status);

    const data = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Error en la respuesta de Notion (GET):", data);
      return res.status(notionResponse.status).json(data); // Manejo de errores de la API
    }

    res.json(data); // Enviar los datos al frontend
  } catch (error) {
    console.error("Error interno del servidor (GET):", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
