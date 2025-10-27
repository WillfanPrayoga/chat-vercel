const socket = io({
  path: "/api/socket",
});

const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const usersList = document.getElementById("users");

document.getElementById("setName").onclick = () => {
  const username = usernameInput.value.trim();
  if (username) {
    socket.emit("set username", username);
  }
};

document.getElementById("send").onclick = () => {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit("chat message", msg);
    messageInput.value = "";
  }
};

socket.on("chat history", (history) => {
  messages.innerHTML = "";
  history.forEach((m) => addMessage(m.user, m.msg, m.time));
});

socket.on("chat message", (data) => {
  addMessage(data.user, data.msg, data.time);
});

socket.on("server message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  li.classList.add("server");
  messages.appendChild(li);
});

socket.on("update users", (users) => {
  usersList.innerHTML = users.map((u) => `<li>${u}</li>`).join("");
});

function addMessage(user, msg, time) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${user}</strong> [${time}]: ${msg}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
