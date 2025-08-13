const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("TELEGRAM IS RUNNING 🟢"));
app.listen(port, () => console.log(`Server running on port ${port}`));

require("./main.js");
