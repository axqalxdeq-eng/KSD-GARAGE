const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 10000;

// === KONFIGURACJA ŚCIEŻEK ===
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use(bodyParser.json());

// === BAZA DANYCH ===
const dbPath = path.join(__dirname, "appointments.db");
const db = new sqlite3.Database(dbPath, (err) => {
if (err) console.error("❌ Błąd połączenia z bazą:", err.message);
else console.log("✅ Połączono z bazą danych SQLite");
});

db.serialize(() => {
db.run(`
CREATE TABLE IF NOT EXISTS appointments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
date TEXT NOT NULL,
client TEXT NOT NULL,
car TEXT NOT NULL,
description TEXT
)
`);
});

// === ENDPOINTY API ===

// Pobieranie wszystkich terminów
app.get("/api/appointments", (req, res) => {
db.all("SELECT * FROM appointments", [], (err, rows) => {
if (err) res.status(500).json({ error: err.message });
else res.json(rows);
});
});

// Dodawanie nowego terminu
app.post("/api/appointments", (req, res) => {
const { date, client, car, description } = req.body;
if (!date || !client || !car) {
return res.status(400).json({ error: "Wszystkie pola oprócz opisu są wymagane" });
}
const stmt = db.prepare("INSERT INTO appointments (date, client, car, description) VALUES (?, ?, ?, ?)");
stmt.run(date, client, car, description, function (err) {
if (err) res.status(500).json({ error: err.message });
else res.json({ id: this.lastID, date, client, car, description });
});
stmt.finalize();
});

// Usuwanie terminu
app.delete("/api/appointments/:id", (req, res) => {
const { id } = req.params;
db.run("DELETE FROM appointments WHERE id = ?", id, function (err) {
if (err) res.status(500).json({ error: err.message });
else res.json({ deleted: this.changes });
});
});

// Strona główna
app.get("/", (req, res) => {
res.sendFile(path.join(publicPath, "index.html"));
});

// === URUCHOMIENIE SERWERA ===
app.listen(PORT, () => {
console.log(`🚗 Serwer KSD Garage działa na porcie ${PORT}`);
});
