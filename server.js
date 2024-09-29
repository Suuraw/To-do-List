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

app.post("/remove/:id",async(req,res)=>
{
  const id=req.params.id;

  try{
    await db.query("DELETE FROM list_items WHERE id = ($1)",[id])
    res.status(200).json({message:"Item deleted "})
  }
  catch(err)
  {
    console.log("failed to delete or the items doesn't exist");
  }
})


app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
