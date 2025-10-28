// api/socket.js

import { Server } from "socket.io";

let io;
let activeUsers = new Map();

function getCurrentTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Handler utama Vercel
export default function handler(req, res) {
    // Jika tidak ada server socket, tidak ada yang bisa dilakukan
    if (!res.socket.server) {
        res.end('Error: Socket server not found.');
        return;
    }

    // 1. Inisialisasi Socket.IO HANYA SATU KALI
    if (!res.socket.server.io) {
        console.log('Starting NEW Socket.io server...');
        
        io = new Server(res.socket.server, {
            path: '/api/socket', // Tambahkan path ini di server juga
            cors: {
                origin: "*", 
                methods: ["GET", "POST"]
            }
        });

        // Simpan instance IO ke objek server Vercel
        res.socket.server.io = io;
        
        // Logika Utama Koneksi
        io.on('connection', (socket) => {
            console.log('✅ User connected successfully');

            // Logika Event Listener Anda
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
    } else {
        // Jika sudah berjalan, ambil instance yang sudah ada
        io = res.socket.server.io;
        console.log('Socket.io already running.');
    }

    // Akhiri request HTTP Vercel
    res.end();
}