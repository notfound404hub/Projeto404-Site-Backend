import express from "express";
import pool from "../db.js";

console.log("🔎 userRoutes.js carregado"); 
const r = express.Router();

r.post("/login", async (req, res) => {
  try {
    const { Usuario_Email, Usuario_Senha } = req.body;
    console.log("📦 Body recebido:", req.body);


    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ?",
      [Usuario_Email]      
    );
    console.log("Email recebido:", Usuario_Email);


    if (rows.length === 0) {
      return res.status(400).json({ error: "Email não cadastrado" });
    }

    const [rows2] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ? AND Usuario_Senha = ?",
      [Usuario_Email, Usuario_Senha]
    );

    if (rows2.length === 0) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    return res.status(200).json({ msg: "Login bem sucedido" });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no login" });
  }
});


r.post("/register", async (req, res) => {
  try {
    const { Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_CPF, Aluno_DDD, Aluno_Telefone } = req.body;

    const [rows] = await pool.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [Aluno_Email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    await pool.query(
      "INSERT INTO Aluno(Aluno_RA, Aluno_Nome,Aluno_Email,Aluno_CPF,Aluno_DDD,Aluno_Telefone) VALUES (?, ?, ?, ?, ?, ?)",
      [Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_CPF, Aluno_DDD, Aluno_Telefone]
    );

    res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
  }
  catch (err) {
    console.error("Erro no cadastro:", err); 
    res.status(500).json({ error: "Erro no cadastro", details: err.message });
  }

});

export default r;