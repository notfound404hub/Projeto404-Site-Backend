import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./userRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  console.log("Requisição:", req.method, req.url);
  next();
});

io.on("connection", (socket) => {
  console.log("🟢 Novo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 500;
server.listen(PORT, () => console.log(`✅ Server rodando na porta ${PORT}`));
