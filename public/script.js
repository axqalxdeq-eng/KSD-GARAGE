let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

async function loadAppointments() {
const res = await fetch("/api/appointments");
return await res.json();
}

function renderCalendar(appointments, search = "") {
const grid = document.getElementById("calendar");
grid.innerHTML = "";

const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
days.forEach(d => {
const header = document.createElement("div");
header.textContent = d;
header.className = "day-header";
grid.appendChild(header);
});

const firstDay = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

for (let i = 0; i < firstDay; i++) {
const empty = document.createElement("div");
empty.className = "day empty";
grid.appendChild(empty);
}

for (let i = 1; i <= daysInMonth; i++) {
const div = document.createElement("div");
div.className = "day";
div.textContent = i;

const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
const dayAppointments = appointments.filter(a => a.date === dateStr);

if (dayAppointments.length > 0) {
div.classList.add("has-appointment");

const filtered = search
? dayAppointments.filter(a =>
a.client.toLowerCase().includes(search.toLowerCase()) ||
a.car.toLowerCase().includes(search.toLowerCase())
)
: dayAppointments;

const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.innerHTML = filtered.length
? filtered.map(a =>
`<b>${a.client}</b> – ${a.car}<br>${a.desc}<br><button class='delBtn' data-id='${a.id}'>Usuń</button>`
).join("<hr>")
: "<i>Brak dopasowań</i>";

div.appendChild(tooltip);
}

grid.appendChild(div);
}

document.querySelectorAll(".delBtn").forEach(btn => {
btn.onclick = async e => {
e.stopPropagation();
const id = btn.dataset.id;
if (confirm("Usunąć ten termin?")) {
await fetch(`/api/appointments/${id}`, { method: "DELETE" });
start();
}
};
});
}

document.getElementById("addBtn").onclick = async () => {
const date = document.getElementById("date").value;
const client = document.getElementById("client").value.trim();
const car = document.getElementById("car").value.trim();
const desc = document.getElementById("desc").value.trim();

if (!date || !client || !car) {
alert("Uzupełnij datę, klienta i samochód!");
return;
}

await fetch("/api/appointments", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ date, client, car, desc })
});
start();
};

document.getElementById("search").addEventListener("input", () => start());
document.getElementById("refresh").onclick = () => start();
document.getElementById("prevMonth").onclick = () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } start(); };
document.getElementById("nextMonth").onclick = () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } start(); };

function startClock() {
const clock = document.getElementById("clock");
setInterval(() => {
clock.textContent = new Date().toLocaleString("pl-PL");
}, 1000);
}

async function start() {
const data = await loadAppointments();
const search = document.getElementById("search").value;
renderCalendar(data, search);

const monthName = new Date(currentYear, currentMonth).toLocaleString("pl-PL", {
month: "long",
year: "numeric"
});
document.getElementById("month").textContent = monthName.toUpperCase();
}

startClock();
start();