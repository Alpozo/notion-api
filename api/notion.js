export default async function handler(req, res) {
  const { method } = req;

  if (method === "OPTIONS") {
    // Responder al preflight request con los encabezados CORS permitidos
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.status(204).end(); // No content
    return;
  }

  if (method === "POST") {
    const { databaseId, query } = req.body;

    if (!databaseId) {
      return res.status(400).json({ error: "Falta el ID de la base de datos" });
    }

    try {
      const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify(query || {}),
      });

      const data = await notionResponse.json();

      if (!notionResponse.ok) {
        return res.status(notionResponse.status).json(data);
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Error interno del servidor (POST):", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  } else if (method === "GET") {
    const { pageId } = req.query;

    if (!pageId) {
      return res.status(400).json({ error: "Falta el ID de la página" });
    }

    try {
      const notionResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
        },
      });

      const data = await notionResponse.json();

      if (!notionResponse.ok) {
        return res.status(notionResponse.status).json(data);
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Error interno del servidor (GET):", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  } else {
    res.setHeader("Allow", [ "POST", "GET", "OPTIONS" ]);
    res.status(405).end(`Método ${method} no permitido`);
  }
}