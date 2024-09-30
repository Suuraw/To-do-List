import express from "express";
import bodyParser from "body-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config(); // Load environment variables

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL || require('./.env').DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Attempt to connect to the database
db.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Connected to the database successfully.");
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));  // Changed from "index.htm" to "index.html"
});

// API Routes
app.get("/items", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM list_items");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.sendStatus(500);
  }
});

app.post("/items", async (req, res) => {
  const { item } = req.body;
  try {
    await db.query("INSERT INTO list_items(items) VALUES ($1)", [item]);
    return res.json({ status: "ok", item });
  } catch (err) {
    console.error("Error adding item:", err);
    return res.sendStatus(500);
  }
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { item } = req.body;
  try {
    const result = await db.query(
      "UPDATE list_items SET items = $1 WHERE id = $2",
      [item, id]
    );
    return res.status(200).json({ status: "ok", updatedItem: result.rows[0] });
  } catch (err) {
    console.error("Error updating item:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/items/:id", async (req, res) => {
  const id = req.params.id;
  const { completed } = req.body;
  try {
    await db.query("UPDATE list_items SET completed = $1 WHERE id = $2", [completed, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error updating item completion status:", err);
    return res.sendStatus(500);
  }
});

app.post("/remove", async (req, res) => {
  const ids = req.body.ids;
  try {
    const query = `DELETE FROM list_items WHERE id = ANY($1::int[])`;
    await db.query(query, [ids]);
    res.status(200).json({ message: "Items deleted successfully" });
  } catch (err) {
    console.error("Error deleting items:", err);
    res.status(500).json({ error: "Failed to delete items" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
