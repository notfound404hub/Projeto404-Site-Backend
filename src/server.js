import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./userRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  console.log("Requisição:", req.method, req.url);
  next();
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT
  app.listen(PORT, () => console.log(`✅ Server rodando na porta ${PORT}`));
}

export default app;
