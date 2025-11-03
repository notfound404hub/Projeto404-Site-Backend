import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken, verifyToken } from '../services/tokenService.js'
import { json } from 'express'
import dotenv from "dotenv";
import nodemailer from "nodemailer"

dotenv.config()


const sanitizeAluno = (u) => ({ alunoId: u.ID_Aluno, alunoNome: u.Aluno_Nome, alunoEmail: u.Aluno_Email, alunoRa: u.Aluno_RA })

const sanitizeGrupo = (u) => ({ grupoId: ID_Grupo, grupoNome: u.Grupo_Nome, grupoCurso: u.Grupo_Curso })


export const login = async (req, res) => {
    const { email, senha } = req.body
    if (!email || !senha) return res.status(400).json({ error: "Preencha todos os campos" })

    try {
        const [rows] = await db.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [email])
        if (!rows.length) return res.status(401).json({ error: "Credenciais inválidas" })

        const user = rows[0]
        const ok = await bcrypt.compare(senha, user.Aluno_Senha)
        if (!ok) return res.status(401).json({ error: "Credenciais inválidas" })

        const { token } = createToken({ id: user.ID_Aluno })
        return res.status(200).json({ msg: "Login concluído!", token })

    } catch (err) {
        console.error("login error:", err)
        return res.status(500).json({ error: "Erro no login" })
    }
}

export const alunos = async (req, res) => {
    const { nome, email, senha, ra } = req.body
    if (!nome || !email || !senha || !ra) {
        return res.status(400).json({ error: "Preencha todos os campos" })
    }
    try {
        const alunos = req.body
        for (aluno in alunos) {
            const { nome, email, senha, ra } = aluno
            const hashed = await bcrypt.hash(senha, 10)

            const [exists] = await db.query("SELECT ID_Aluno FROM Aluno WHERE Aluno_Email = ?", [email])
            if (exists.length) return res.status(409).json({ error: "Email já cadastrado" })

            await pool.query("BEGIN")

            await db.query("INSERT INTO Aluno(nome, email, senha, ra, verificado) VALUES (?, ?, ?, ?, ?)", [nome, email, hashed, ra, false])
            return res.status(201).json({ msg: "Usuário cadastrado com sucesso!" })
        }
    } catch (err) {
        console.error("register error", err)
        return res.status(500).json({ error: "Erro ao registrar usuário" })
    }
}


export const grupos = async (req, res) => {
    const { nome, curso } = req.body

    try {
        const [rows] = await db.query("SELECT * FROM Grupo WHERE Grupo_Nome = ?", { nome })

        if (rows.length) return res.status(409).json({ error: "Grupo já cadastrado" })

        await db.query("BEGIN")

        await db.query("SELECT INTO Grupo(nome, curso) VALUES (?, ?)", [nome, curso])
        res.status(201).json({ msg: "Grupo cadastrado com sucesso!" })
        await db.query("COMMIT")

    } catch (err) {
        console.error("register error", err)
        res.status(500).json({ error: "Error ao registrar grupo" })
        await db.query("ROLLBACK")
    }
}


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Erro ao conectar ao servidor SMTP:", error);
    }
    if (success) {
        console.log("✅ Servidor SMTP pronto para enviar mensagens!");
    }
});



export const forgotPassword = async (req, res) => {
    const { email } = req.body
    console.log("requisição recebida", req.body);
    try {
        const [rows] = await db.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [email])

        let message = ""

        if (rows.length) {
            const user = rows[0]
            const { token } = createToken({ id: user.ID_Aluno }, { expiresIn: "15m" })
            const resetLink = `${process.env.FRONTEND_URL}/reset-senha/${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Redefinição de senha",
                html: `<p>Olá, ${user.Aluno_Nome}!</p>
                          <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
                          <a href="${resetLink}">${resetLink}</a>
                          <p>O link é válido por 15 minutos.</p>`

            })
            
            message = "Email de recuperação enviado"

        } else {
            message = "A mensagem não pode ser enviada"
        }

        res.status(200).json({ message })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Erro interno do servidor" })
    }
}

export const resetPassword = async (req, res) => {
    const { token, senha, confirmarSenha } = req.body

    if (!senha || !confirmarSenha) return res.status(400).json({ error: "Preencha todos os campos" })

    if (senha != confirmarSenha) return res.status(409).json({ error: "As senhas devem ser iguais" })

    try {
        const decoded = await verifyToken(token)
        const userId = decoded.id

        const hashed = await bcrypt.hash(senha, 10)
        await db.query("UPDATE Aluno SET Aluno_Senha = ? WHERE ID_Aluno = ?", [hashed, userId])

        res.status(200).json({ msg: "Senha redefinida com sucesso!" })
        console.log("Sua senha foi redefinida")
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: "Token inválido ou expirado" })
    }
}

export const enviarEmailVerificacao = async (req, res) => {
    const {email} = req.body

    if (!email) return res.status(400).json({ error: "Preencha todos os campos" })

    try {
        const [rows] = await db.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", { email })
        if (!rows.length) return res.status(401).json({ error: "E-mail não encontrado" })

        let message = ""

        if (rows.length) {
            const user = rows[0]
            const { token } = createToken({ id: user.ID_Aluno }, { expiresIn: "10m" })
            const verifyLink = `${process.env.FRONTEND_URL}/verificar/${token}`

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verificação de email",
                html: `<p>Olá, ${user.Aluno_Nome}!</p>
                          <p>Essa mensagem foi enviada para realizar a verificação do seu email. Clique no link abaixo para verificar seu email:</p>
                          <a href="${verifyLink}">${verifyLink}</a>
                          <p>O link é válido por 10 minutos.</p>`
            })

            message = "Email de verificação enviado"
        }else{
            message = "Erro ao enviar o email de verificação"
        }

        return res.status(200).json({message})
    } catch (err) {
        console.error(err)
        return res.status(400).json({error:"Token inválido ou expirado"})
    }
}

export const verificarEmail = async (req, res) => {
    const {token} = req.params
    
    try{
        const decode = await verifyToken(token)
        const userId = decode.id
        
        await db.query("UPDATE Aluno SET Verificado = ? WHERE ID_Aluno = ?", [true, userId])

        return res.status(200).json({msg:"Seu email foi verificado"})

    }catch(err){
        console.error(err)
        return res.status(500).json({error:"Erro interno de servidor"})
    }  
}
