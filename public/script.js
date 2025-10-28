// public/script.js

// --- 1. INISIASI KONEKSI SOCKET.IO KONDISIONAL ---
let socketOptions = {};

// Logika ini untuk memastikan koneksi berhasil di lingkungan Vercel
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 1. Tambahkan path ke Serverless Function
    socketOptions.path = "/api/socket";
    
    // 2. Beri tahu klien bahwa path yang diberikan adalah path lengkap (mengatasi error routing di Vercel)
    socketOptions.transports = ['websocket'];
} 

const socket = io(socketOptions);

// --- 2. GET ELEMEN HTML ---

const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const usersList = document.getElementById("users");
const form = document.getElementById("form"); // Ambil elemen formulir


// --- 3. EVENT LISTENERS (MENGIRIM PESAN & NAMA) ---

// Listener untuk tombol "Ganti Nama"
document.getElementById("setName").onclick = () => {
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit("set username", username);
        // Jika Anda ingin mengosongkan input nama, tambahkan di sini
    }
};

// PENTING: Tambahkan event listener untuk submit formulir untuk mencegah halaman me-relog.
form.addEventListener('submit', function(e) {
    // BARIS KRITIS INI MENCEGAH REFRESH HALAMAN!
    e.preventDefault(); 
    
    const msg = messageInput.value.trim();
    if (msg) {
        socket.emit("chat message", msg);
        messageInput.value = ""; // Bersihkan input setelah kirim
    }
});

// Listener untuk tombol "Kirim" (Opsional, tapi biarkan kosong agar submit formulir yang berjalan)
document.getElementById("send").onclick = () => {
    // Biarkan kosong, karena logika pengiriman sudah ada di form.addEventListener('submit').
};


// --- 4. EVENT HANDLERS (MENERIMA PESAN & UPDATE) ---

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
    li.classList.add("server"); 
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