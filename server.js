const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Taha137729", 
  database: "food_delivery_db",
});

db.connect((err) => {
  if (err) console.log("Error connecting to database:", err);
  else console.log("Database connected!");
});


app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const query = "INSERT INTO users (username, password) VALUES (?, ?)";

  db.query(query, [username, password], (err) => {
    if (err) return res.status(500).send("Error registering user");
    return res.status(200).send("User registered successfully");
  });
});


app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query =
    "SELECT username, role FROM users WHERE username = ? AND password = ?";

  db.query(query, [username, password], (err, result) => {
    if (err || result.length === 0) {
      return res.status(401).send("Invalid credentials");
    }
    const user = result[0];
    return res.status(200).json({ username: user.username, role: user.role });
  });
});


app.get("/menu", (req, res) => {
  const query = "SELECT * FROM foods";
  db.query(query, (err, results) => {
    if (err) return res.status(500).send("Error fetching menu");
    return res.status(200).json(results);
  });
});


app.post("/add-food", (req, res) => {
  const { name, description, price } = req.body;
  const query = "INSERT INTO foods (name, description, price) VALUES (?, ?, ?)";

  db.query(query, [name, description, price], (err) => {
    if (err) return res.status(500).send("Error adding food");
    return res.status(200).send("Food added successfully");
  });
});


app.put("/edit-food/:id", (req, res) => {
  const foodId = req.params.id;
  const { name, description, price } = req.body;

  const query =
    "UPDATE foods SET name = ?, description = ?, price = ? WHERE id = ?";
  db.query(query, [name, description, price, foodId], (err) => {
    if (err) return res.status(500).send("Error editing food");
    return res.status(200).send("Food edited successfully");
  });
});


app.delete("/delete-food/:id", (req, res) => {
  const foodId = req.params.id;
  const query = "DELETE FROM foods WHERE id = ?";

  db.query(query, [foodId], (err) => {
    if (err) return res.status(500).send("Error deleting food");
    return res.status(200).send("Food deleted successfully");
  });
});


app.post("/checkout", (req, res) => {
  const { username, cart, total } = req.body;

  if (!username) return res.status(400).send("Missing username");
  if (!cart || cart.length === 0) return res.status(400).send("Cart is empty");

  const orderQuery = "INSERT INTO orders (username, total) VALUES (?, ?)";

  db.query(orderQuery, [username, total], (err, orderResult) => {
    if (err) return res.status(500).send("Error creating order");

    const orderId = orderResult.insertId;

   
    const itemQuery =
      "INSERT INTO order_items (order_id, food_name, price, quantity) VALUES ?";

    const values = cart.map((item) => [
      orderId,
      item.name,
      item.price,
      item.qty,
    ]);

    db.query(itemQuery, [values], (err) => {
      if (err) return res.status(500).send("Error saving order items");
      return res.status(200).send("Order placed successfully");
    });
  });
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});