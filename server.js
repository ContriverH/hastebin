const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // to read the content from the html

if (process.env.NODE_ENV !== "production") {
  // this is done because we want dotenv to only load in the development environment
  require("dotenv").config();
}

const Document = require("./models/Document");

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", (error) => console.error(error)); // this is to check whether we are connected to our database
db.once("open", () => console.log("Connected to Mongoose")); // this is going to run only once when we are connected to mongoose

app.get("/", (req, res) => {
  const code = `Welcome to Hastebin!
Click on new button given on the right side of the window.
And create a remarkable document for you.
Copy the URL link to share this unique document with anyone.
`;

  res.render("code-display", { code, language: "plaintext" });
});

app.get("/new", (req, res) => {
  res.render("new");
});

app.post("/save", async (req, res) => {
  const value = req.body.value;

  try {
    const document = await Document.create({ value });
    res.redirect(`/${document.id}`);
  } catch (e) {
    res.render("new", { value });
  }
});

app.get("/:id/duplicate", async (req, res) => {
  const id = req.params.id;
  try {
    const document = await Document.findById(id);
    res.render("new", { value: document.value });
  } catch (e) {
    res.redirect(`/${id}`);
  }
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const document = await Document.findById(id);
    res.render("code-display", { code: document.value, id });
  } catch (e) {
    res.redirect("/");
  }
});

app.listen(3000);
