import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken } from '../services/tokenService.js'
import { json } from 'express'
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config()


const sanitizeAluno = (u) => ({ alunoId: u.ID_Aluno, alunoNome: u.Aluno_Nome, alunoEmail: u.Aluno_Email, alunoRa: u.Aluno_RA})

const sanitizeGrupo = (u) => ({ grupoId: ID_Grupo, grupoNome: u.Grupo_Nome, grupoCurso: u.Grupo_Curso})

const resend = new Resend(process.env.RESEND_API_KEY);

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log("📩 Requisição recebida:", email);
  
    try {
      const [rows] = await db.query(
        "SELECT * FROM Aluno WHERE Aluno_Email = ?",
        [email]
      );
  
      if (!rows.length) {
        console.log("⚠️ Nenhum usuário encontrado para:", email);
        // Resposta genérica pra não expor se o e-mail existe
        return res
          .status(200)
          .json({ message: "Email de recuperação enviado (caso exista)." });
      }
  
      const user = rows[0];
      const { token } = createToken(
        { id: user.ID_Aluno },
        { expiresIn: "15m" }
      );
  
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
      console.log("🔗 Link de reset:", resetLink);
  
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_USER, // teste, pode mudar depois
        to: email,
        subject: "Redefinição de senha",
        html: `
          <p>Olá, ${user.Aluno_Nome}!</p>
          <p>Você solicitou a redefinição de senha. Clique no link abaixo:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>O link é válido por 15 minutos.</p>
        `,
      });
  
      // 👇 Novo: verificar retorno do Resend
      if (error) {
        console.error("❌ Erro ao enviar e-mail via Resend:", error);
        return res.status(500).json({ error: "Falha ao enviar o e-mail." });
      }
  
      console.log("✅ Email enviado com sucesso!", data);
  
      res.status(200).json({
        message: "Email de recuperação enviado.",
        info: data, // só pra debug, pode remover depois
      });
    } catch (err) {
      console.error("💥 Erro interno:", err);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  };

export const login = async (req, res) => {
    const {email, senha} = req.body
    if(!email || !senha) return res.status(400).json({error:"Preencha todos os campos"})   
    
        try{
            const[rows] = await db.query("SELECT * FROM Aluno WHERE email = ?", [email])
            if(!rows.length) return res.status(401).json({error:"Credenciais inválidas"})

            const user = rows[0]
            const ok = await bcrypt.compare(senha, user.senha)
            if(!ok) return res.status(401).json({error: "Credenciais inválidas"})
            
            const {token} = createToken({id: aluno.alunoId})
            return res.json({token, user: sanitizeUser(user)})

        }catch(err){
            console.error("login error:", err)
            return res.status(500).json({error: "Erro no login"})
        }
}

export const alunos = async (req, res) => {
    const {nome, email, senha, ra} = req.body
    if(!nome || !email || !senha || !ra){
        return res.status(400).json({error:"Preencha todos os campos"})
    }
    try{
        const alunos = req.body
        for(aluno in alunos){
            const {nome, email, senha, ra} = aluno            
            const hashed = await bcrypt.hash(senha, 10)

            const [exists] = await db.query("SELECT ID_Aluno FROM Aluno WHERE Aluno_Email = ?", [email])
            if(exists.length) return res.status(409).json({error:"Email já cadastrado"})
            
            await pool.query("BEGIN")
            
            await db.query("INSERT INTO Aluno(nome, email, senha, ra) VALUES (?, ?, ?, ?)", [nome, email, hashed, ra])
            return res.status(201).json({msg: "Usuário cadastrado com sucesso!"})
        }        
    }catch(err){
        console.error("register error", err)
        return res.status(500).json({error: "Erro ao registrar usuário"})
    }    
}


export const grupos = async (req, res) => {
    const{nome, curso} = req.body

    try{
        const [rows] = await db.query("SELECT * FROM Grupo WHERE Grupo_Nome = ?", {nome})
    
        if(rows.length) return res.status(409).json({error: "Grupo já cadastrado"})
    
        await db.query("BEGIN")
    
        await db.query("SELECT INTO Grupo(nome, curso) VALUES (?, ?)", [nome, curso])
        res.status(201).json({msg: "Grupo cadastrado com sucesso!"})  
        await db.query("COMMIT")      

    }catch(err){
        console.error("register error", err)
        res.status(500).json({error: "Error ao registrar grupo"})
        await db.query("ROLLBACK")
    }
}

export const resetPassword = async (req, res) => {
    const{token, senha, confirmarSenha} = req.body

    if(!senha || !confirmarSenha) return res.status(400).json({error: "Preencha todos os campos"})
    
    if(senha != confirmarSenha) return res.status(409).json({error: "As senhas devem ser iguais"})

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id

        const hashed = await bcrypt.hash(senha, 10)
        await db.query("UPDATE Aluno SET Aluno_Senha = ? WHERE ID_Aluno = ?", [hashed, userId])

        return res.status(200).json({msg:"Senha redefinida com sucesso!"})
    }catch(err){
        console.error(err)
        res.status(400).json({error:"Token inválido ou expirado"})
    }    
}