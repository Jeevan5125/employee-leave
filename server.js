const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const SECRET = "supersecretkey";


const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();


app.use(cors({
  origin: "*"
}));

app.use(bodyParser.json());

require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔️"))
  .catch(err => console.log("DB Error ❌", err));

// REGISTER — create new user
app.post("/register", async (req, res) => {
  const { username, password, name, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await User.create({ username, password: hash, name, role });

  res.json({ ok: true });
});



// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id, role: user.role }, SECRET);

  res.json({ token, user });
});

// GET USERS (ADMIN ONLY)
app.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// RESET PASSWORD
app.put("/users/reset/:id", async (req, res) => {
  const { password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(req.params.id, { password: hash });

  res.json({ ok: true });
});


//request

const Request = require("./models/Request");

app.get("/requests", async (req, res) => {
  const data = await Request.find();
  res.json(data);
});

app.post("/requests", async (req, res) => {
  await Request.create(req.body);
  res.json({ ok: true });
});

app.put("/requests/:id", async (req, res) => {
  await Request.findByIdAndUpdate(req.params.id, req.body);
  res.json({ ok: true });
});


// Holidays
const Holiday = require("./models/Holiday");

app.get("/holidays", async (req, res) => {
  const h = await Holiday.find();
  res.json(h);
});

app.post("/holidays", async (req, res) => {
  await Holiday.create(req.body);
  res.json({ ok: true });
});





app.listen(4000,()=> console.log("API running on port 4000"));

const PDFDocument = require("pdfkit");

app.post("/export/pdf", (req, res) => {
  console.log("PDF request received:", req.body);   // 👈 LOG HERE

  try {
    const { requests } = req.body;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=leave-report.pdf");

    doc.fontSize(18).text("Leave Report", { align: "center" });
    doc.moveDown();

    (requests || []).forEach(r => {
      doc.fontSize(12).text(
        `${r.user} — ${r.type} — ${r.from} to ${r.to} — ${r.status}`
      );
    });

    doc.pipe(res);
    doc.end();
  } catch (e) {
    console.error("PDF ERROR:", e);
    res.status(500).send("PDF failed");
  }
});
