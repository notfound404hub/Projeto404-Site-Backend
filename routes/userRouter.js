import express from "express";
import pool from "../db.js";

const r = express.Router();

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