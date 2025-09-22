import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.use((req, res, next) => {
    ("➡ Requisição:", req.method, JSON.stringify(req.url));
    next();
  });

const PORT = process.env.PORT || 500;
app.listen(PORT, () => {
  console.log(`✅ Server rodando na porta ${PORT}`);
});
