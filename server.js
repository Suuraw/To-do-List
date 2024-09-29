import bodyParser from "body-parser";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Users",
  password: "sujay123",
  port: 5432,
});
db.connect();

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this to handle JSON requests
app.use(express.static("public"));

app.get("/items", async(req, res) => {
  try {
    const result = await db.query("SELECT * FROM list_items");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/items", async (req, res) => {
  const { item } = req.body; // Make sure your frontend sends 'item'
  try {
    await db.query("INSERT INTO list_items(items) VALUES ($1)", [item]);
    return res.json({ status: "ok", item }); // Respond with a JSON object
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.sendStatus(500); // Send a server error response
  }
});
app.post("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { item } = req.body;

    // Use RETURNING * to return the updated row
    const result = await db.query(
      "UPDATE list_items SET items = $1 WHERE id = $2",
      [item, id]
    );

    // If no rows were updated (invalid ID), return a 404 error
   

    // Respond with the updated item
    return res.status(200).json({ status: "ok", updatedItem: result.rows[0] });
  } catch (err) {
    console.error("Failed to update the item_list:");
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/items/:id", async (req, res) => {
  const id = req.params.id; // Get the item ID from the URL parameters
  const { completed } = req.body; // Get the completed status from the request body

  try {
      // Update the completed status in the database
      await db.query("UPDATE list_items SET completed = $1 WHERE id = $2", [completed, id]);
      res.sendStatus(200); // Send a success response
  } catch (err) {
      console.error(err);
      return res.sendStatus(500); // Send a server error response if something goes wrong
  }
});

app.post("/remove", async (req, res) => {
  const ids = req.body.ids; // Expecting an array of IDs

  try {
      // Prepare a parameterized query for multiple IDs
      const query = `DELETE FROM list_items WHERE id = ANY($1::int[])`; // Using PostgreSQL's ANY to delete multiple IDs
      await db.query(query, [ids]); // Pass the array of IDs to the query

      res.status(200).json({ message: "Items deleted successfully" });
  } catch (err) {
      console.error("Failed to delete items:", err);
      res.status(500).json({ error: "Failed to delete items or items don't exist" });
  }
});


app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
