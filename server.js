// KSD Garage - Kalendarz Mechanika
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

// Połączenie z bazą SQLite
const db = new sqlite3.Database("garage.db", err => {
if (err) console.error("Błąd bazy:", err.message);
else console.log("Połączono z bazą danych SQLite");
});

// Tworzenie tabeli jeśli nie istnieje
db.run(`CREATE TABLE IF NOT EXISTS appointments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
date TEXT,
client TEXT,
car TEXT,
desc TEXT
)`);

// Ścieżka do plików frontendu
app.use(express.static(path.join(__dirname, "./public")));
app.use(bodyParser.json());

// Pobieranie terminów
app.get("/api/appointments", (req, res) => {
db.all("SELECT * FROM appointments", [], (err, rows) => {
if (err) res.status(500).json({ error: err.message });
else res.json(rows);
});
});

// Dodawanie nowego terminu
app.post("/api/appointments", (req, res) => {
const { date, client, car, desc } = req.body;
db.run(
"INSERT INTO appointments(date, client, car, desc) VALUES(?, ?, ?, ?)",
[date, client, car, desc],
function (err) {
if (err) res.status(500).json({ error: err.message });
else res.json({ id: this.lastID });
}
);
});

// Usuwanie terminu
app.delete("/api/appointments/:id", (req, res) => {
db.run("DELETE FROM appointments WHERE id=?", req.params.id, err => {
if (err) res.status(500).json({ error: err.message });
else res.json({ success: true });
});
});

// Strona główna
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Start serwera
app.listen(PORT, () => console.log(`🚗 Serwer działa na http://localhost:${PORT}`));