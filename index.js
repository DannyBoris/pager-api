const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const main_routes = require("./routes");

app.use(express.static("./frontend/dist"));

app.use(cors());
app.use(bodyParser({ extended: true }));
app.use(main_routes);
console.log(process.env.PORT);
app.listen(process.env.PORT, () =>
  console.log(`Listening on ${process.env.PORT}`)
);
