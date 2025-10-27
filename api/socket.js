import { Server } from "socket.io";

let io;
let users = {};
let chatHistory = [];

export default function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      console.log("🟢 User connected");

      socket.on("set username", (username) => {
        const oldName = users[socket.id];
        const newName = username;

        if (oldName && oldName !== newName) {
          users[socket.id] = newName;
          io.emit("server message", `✏️ ${oldName} mengganti nama menjadi ${newName}`);
        } else if (!oldName) {
          users[socket.id] = newName;
          io.emit("server message", `🟢 ${newName} bergabung ke chat`);
          socket.emit("chat history", chatHistory);
        }

        io.emit("update users", Object.values(users));
      });

      socket.on("chat message", (msg) => {
        const user = users[socket.id] || "Anonim";
        const time = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const newMessage = { user, msg, time };
        chatHistory.push(newMessage);
        io.emit("chat message", newMessage);
      });

      socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
          io.emit("server message", `🔴 ${user} keluar dari chat`);
          delete users[socket.id];
          io.emit("update users", Object.values(users));
        }
      });
    });

    console.log("✅ Socket.IO server initialized");
  }

  res.end();
}
