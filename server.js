import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/users", userRoutes);

//Requisição
app.use((req, res, next) => {
    console.log(" Requisição:", req.method, req.url);
    next();
  });

// Porta
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server rodando na porta ${PORT}`);
});
