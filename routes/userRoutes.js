import express from "express";
import pool from "../db.js";

const r = express.Router();

// rota de login (POST)
r.post("/login", async (req, res) => {
  try {
    const { Usuario_Email, Usuario_Senha } = req.body;

    // verifica se email existe
    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ?",
      [Usuario_Email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Email não cadastrado" });
    }

    // verifica senha
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






r.post("/register",async (req,res) => {
    try{
        const{Aluno_RA, Aluno_Nome,Aluno_Email,Aluno_Senha,Aluno_CPF,Aluno_DDD,Aluno_Telefone} = req.body; 
        
        const [rows] = await pool.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [Aluno_Email]);
        if(rows.length>0){
            return res.status(400).json({error:"Email já cadastrado"});
        }
        
        await pool.query(
            "INSERT INTO Aluno(Aluno_RA, Aluno_Nome,Aluno_Email,Aluno_Senha,Aluno_CPF,Aluno_DDD,Aluno_Telefone) VALUES (?, ?, ?, ?, ?, ?, ?)"
            [Aluno_RA, Aluno_Nome,Aluno_Email,Aluno_Senha,Aluno_CPF,Aluno_DDD,Aluno_Telefone]
        );

        res.status(201).json({msg:"Usuário cadastrado com sucesso!"});
    }    
    catch(err){
        console.error(err);
        res.status(500).json({error:"Erro no cadastro"});


    }
});

export default r;