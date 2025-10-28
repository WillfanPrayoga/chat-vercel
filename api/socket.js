// api/socket.js (FINAL ROBUST VERSION)

import { Server } from "socket.io";

// Hapus: let io;
let activeUsers = new Map();

function getCurrentTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function handler(req, res) {
    if (!res.socket || !res.socket.server) {
        // Handle request biasa jika tidak ada server socket
        res.status(200).json({ message: 'Socket server handler reached.' });
        return;
    }

    // 1. Inisialisasi Socket.IO HANYA SATU KALI
    if (!res.socket.server.io) {
        console.log('STARTING SOCKET.IO SERVER...');
        
        // Gunakan 'const io' di sini, bukan variabel global
        const io = new Server(res.socket.server, { 
            cors: {
                origin: "*", 
                methods: ["GET", "POST"]
            }
        });

        res.socket.server.io = io; // Simpan instance
        
        // Logika Utama Koneksi
        io.on('connection', (socket) => {
            console.log('✅ User connected successfully');

            socket.on('set username', (username) => {
                const newUsername = username || 'Guest';
                activeUsers.set(socket.id, newUsername);
                io.emit('server message', `${newUsername} has joined the chat.`);
                io.emit('update users', Array.from(activeUsers.values()));
            });

            socket.on('chat message', (msg) => {
                const user = activeUsers.get(socket.id) || 'Guest';
                const time = getCurrentTime();
                io.emit('chat message', { user, msg, time }); 
            });

            socket.on('disconnect', () => {
                const user = activeUsers.get(socket.id);
                if (user) {
                    activeUsers.delete(socket.id);
                    io.emit('server message', `${user} has left the chat.`);
                    io.emit('update users', Array.from(activeUsers.values()));
                }
            });
        });
    }

    // Panggil res.end() di akhir
    res.end();
}