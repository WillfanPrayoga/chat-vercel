// script.js

// --- 1. INISIASI KONEKSI SOCKET.IO KONDISIONAL ---

let socketOptions = {};

// Logika: Jika bukan localhost, tambahkan path ke Serverless Function Vercel
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    socketOptions.path = "/api/socket";
} 
// Jika di localhost, biarkan io() mencoba path default (ini ideal untuk `vercel dev`)

const socket = io(socketOptions);


// --- 2. GET ELEMEN HTML ---

const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const usersList = document.getElementById("users");


// --- 3. EVENT LISTENERS (MENGIRIM PESAN & NAMA) ---

document.getElementById("setName").onclick = () => {
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit("set username", username);
        // Opsional: Sembunyikan input nama setelah diset (tergantung desain UI)
        // console.log(`Username set to: ${username}`);
    }
};

document.getElementById("send").onclick = () => {
    const msg = messageInput.value.trim();
    if (msg) {
        // Kirim event ke server
        socket.emit("chat message", msg);
        messageInput.value = ""; // Bersihkan input setelah kirim
    }
};


// --- 4. EVENT HANDLERS (MENERIMA PESAN & UPDATE) ---

// Ini hanya akan berfungsi jika Anda mengimplementasikan logika history di server
socket.on("chat history", (history) => {
    messages.innerHTML = "";
    history.forEach((m) => addMessage(m.user, m.msg, m.time));
});

// Menerima pesan chat baru dari server
socket.on("chat message", (data) => {
    addMessage(data.user, data.msg, data.time);
});

// Menerima pesan dari server (misalnya: "User A bergabung")
socket.on("server message", (msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    li.classList.add("server"); // Gunakan CSS class 'server' untuk penanda
    messages.appendChild(li);
});

// Menerima daftar pengguna yang aktif
socket.on("update users", (users) => {
    usersList.innerHTML = users.map((u) => `<li>${u}</li>`).join("");
});


// --- 5. FUNGSI UTILITY ---

function addMessage(user, msg, time) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${user}</strong> [${time}]: ${msg}`;
    messages.appendChild(li);
    // Gulir ke bawah secara otomatis
    messages.scrollTop = messages.scrollHeight; 
}