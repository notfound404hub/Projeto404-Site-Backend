import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken } from '../services/tokenService.js'
import { json } from 'express'
import dotenv from "dotenv";

dotenv.config()


const sanitizeAluno = (u) => ({ alunoId: u.ID_Aluno, alunoNome: u.Aluno_Nome, alunoEmail: u.Aluno_Email, alunoRa: u.Aluno_RA})

const sanitizeGrupo = (u) => ({ grupoId: ID_Grupo, grupoNome: u.Grupo_Nome, grupoCurso: u.Grupo_Curso})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

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

export const forgotPassword = async (req, res) => {
    const {email} = req.body
    try{
        const[rows] = await db.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [email])

        let message = ""

        if(rows.length){
            const user = rows[0]
            const {token} = createToken({id: user.alunoId}, process.env.JWT_SECRET, {expiresIn: "15m"})
            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to:  email,
                subject: "Redefinição de senha",
                html: `<p>Olá, ${user.Aluno_Nome}!</p>
                    <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>O link é válido por 15 minutos.</p>`   
                               
            })
            message = "Email de recuperação enviado"
            
            }else{
                message = "A mensagem não pode ser enviada"
            }
            
        res.status(200).json({message})
    }catch(err){
        console.error(err)
        res.status(500).json({error: "Erro interno do servidor"})
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