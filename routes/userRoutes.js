import express from "express";
import pool from "../db.js";

console.log("userRoutes.js carregado"); 
const r = express.Router();

r.post("/login", async (req, res) => {
  try {
    const { Usuario_Email, Usuario_Senha } = req.body;
    console.log("Body recebido:", req.body);


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
    const { Usuario_RA, Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Cargo, Usuario_Telefone } = req.body;

    const [rows] = await pool.query("SELECT * FROM Usuario WHERE Usuario_Email = ?", [Usuario_Email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    await pool.query(
      "INSERT INTO Usuario(Usuario_RA, Usuario_Nome,Usuario_Email,Usuario_Senha,Usuario_Cargo,Usuario_Telefone) VALUES (?, ?, ?, ?, ?, ?)",
      [Usuario_RA, Usuario_Nome, Usuario_Email, Usuario_Senha, Usuario_Cargo, Usuario_Telefone]
    );

    res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
  }
  catch (err) {
    console.error("Erro no cadastro:", err); 
    res.status(500).json({ error: "Erro no cadastro", details: err.message });
  }

});

r.delete("/usuario/:ID_Usuario", async (req, res) => {
  try {
    const { ID_Usuario } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE ID_Usuario = ?",
      [ID_Usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await pool.query("DELETE FROM Usuario WHERE ID_Usuario = ?", [ID_Usuario]);

    return res.status(200).json({ msg: "Conta deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar conta:", err);
    res.status(500).json({ error: "Erro no servidor ao deletar conta" });
  }
});

r.get("/usuario/:ID_Usuario", async (req, res) => {
  const { ID_Usuario } = req.params;
  try {
    console.log("🔎 Buscando usuário ID:", ID_Usuario);

    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE ID_Usuario = ?",
      [ID_Usuario]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (err) {
    console.error("Erro no SELECT:", err.sqlMessage || err.message);
    return res.status(500).json({ error: "Erro no servidor ao buscar usuário" });
  }
});


r.put("/usuario/:ID_Usuario", async (req, res) => {
  try {
    const { ID_Usuario } = req.params;
    const { Usuario_Email, Usuario_Senha, Usuario_Cargo } = req.body;

    await pool.query(
      "UPDATE Usuario SET Usuario_Email=?, Usuario_Senha=?, Usuario_Cargo=? WHERE ID_Usuario=?",
      [Usuario_Email, Usuario_Senha, Usuario_Cargo, ID_Usuario]
    );

    return res.status(200).json({ msg: "Usuário atualizado com sucesso" });
  } catch (err) {
    console.error("Erro no UPDATE:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
  }
});

export default r;