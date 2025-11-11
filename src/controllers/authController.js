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
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ error: "Preencha todos os campos" });
  
    try {
      const [rowsAluno] = await db.query(
        "SELECT * FROM Aluno WHERE Aluno_Email = ?",
        [email]
      );
      const [rowsUsuario] = await db.query(
        "SELECT * FROM Usuario WHERE Usuario_Email = ?",
        [email]
      );
  
      let user, tipo;
  
      if (rowsAluno.length > 0) {
        user = rowsAluno[0];
        tipo = "Aluno";
        const ok = await bcrypt.compare(senha, user.Aluno_Senha)
        if (!ok) return res.status(409).json({ error: "Credenciais inválidas" })
      } else if (rowsUsuario.length > 0) {
        user = rowsUsuario[0];
        tipo = "Usuario";
        const ok = await bcrypt.compare(senha, user.Usuario_Senha)
        if (!ok) return res.status(409).json({ error: "Credenciais inválidas" })
      } else {
        return res.status(409).json({ error: "Credenciais inválidas" });
      }
  
      const { token } = createToken({ id: user.ID_Aluno || user.ID_Usuario });
      const verificado = user.Verificado;
  
      return res.status(200).json({
        msg: "Login concluído!",
        token,
        verificado,
        tipo,
        ID: user.ID_Aluno || user.ID_Usuario,
        nome: user.Aluno_Nome || user.Usuario_Nome,
        email: user.Aluno_Email || user.Usuario_Email,
        Grupo: user.Aluno_Grupo || null
      });
    } catch (err) {
      console.error("login error:", err);
      return res.status(500).json({ error: "Erro no login" });
    }
  };
  

export const alunos = async (req, res) => {
    try {
        const alunos = req.body
        for (const aluno of alunos) {
            const { Aluno_Nome, Aluno_Email, Aluno_Senha, Aluno_RA } = aluno
            if (!Aluno_Nome || !Aluno_Email || !Aluno_Senha || !Aluno_RA) {
                console.log(req.body)
                return res.status(400).json({ error: "Preencha todos os campos" })
            }
            const hashed = await bcrypt.hash(Aluno_Senha, 10)

            const [exists] = await db.query("SELECT ID_Aluno FROM Aluno WHERE Aluno_Email = ?", [Aluno_Email])
            if (exists.length) return res.status(409).json({ error: "Email já cadastrado" })

            await db.query("INSERT INTO Aluno(Aluno_Nome, Aluno_Email, Aluno_Senha, Aluno_RA, verificado) VALUES (?, ?, ?, ?, ?)", [Aluno_Nome, Aluno_Email, hashed, Aluno_RA, false])
        }
        return res.status(201).json({ msg: "Usuário cadastrado com sucesso!" })
    } catch (err) {
        console.error("register error", err)
        return res.status(500).json({ error: "Erro ao registrar usuário" })
    }
}

export const grupos = async (req, res) => {
    const { nome, curso } = req.body

    try {
        const [rows] = await db.query("SELECT * FROM Grupo WHERE Grupo_Nome = ?", [nome])

        if (rows.length) return res.status(409).json({ error: "Grupo já cadastrado" })

        await db.query("BEGIN")

        await db.query("INSERT INTO Grupo(Grupo_Nome, Grupo_Curso) VALUES (?, ?)", [nome, curso])
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
        const [rowsAluno] = await db.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [email])
        const [rowsUsuario] = await db.query("SELECT * FROM Usuario WHERE Usuario_Email = ?", [email])

        let message = ""

        let user = null
        let tipo = null

        if (rowsAluno && rowsAluno.length) {
            user = rowsAluno[0]
            tipo = 'Aluno'
        } else if (rowsUsuario && rowsUsuario.length) {
            user = rowsUsuario[0]
            tipo = 'Usuario'
        }

        if (user) {
            const userId = tipo === 'Aluno' ? user.ID_Aluno : user.ID_Usuario
            const userName = tipo === 'Aluno' ? user.Aluno_Nome : user.Usuario_Nome
            const userEmail = tipo === 'Aluno' ? user.Aluno_Email : user.Usuario_Email

            const { token } = createToken({ id: userId, tipo }, { expiresIn: "15m" })
            const resetLink = `${process.env.FRONTEND_URL}/reset-senha/${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: "Redefinição de senha",
                html: `<p>Olá, ${userName}!</p>
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
    const {token} = req.params    
    const { senha, confirmarSenha } = req.body

    if (!senha || !confirmarSenha) return res.status(400).json({ error: "Preencha todos os campos" })

    if (senha != confirmarSenha) return res.status(409).json({ error: "As senhas devem ser iguais" })

    try {
        console.log(req.body)
        const decoded = await verifyToken(token)
        const userId = decoded.id
        const tipo = decoded.tipo

        const hashed = await bcrypt.hash(senha, 10)

        if (tipo === 'Aluno') {
            await db.query("UPDATE Aluno SET Aluno_Senha = ? WHERE ID_Aluno = ?", [hashed, userId])
        } else if (tipo === 'Usuario') {
            await db.query("UPDATE Usuario SET Usuario_Senha = ? WHERE ID_Usuario = ?", [hashed, userId])
        } else {
            const [resAluno] = await db.query("UPDATE Aluno SET Aluno_Senha = ? WHERE ID_Aluno = ?", [hashed, userId])
            if (!resAluno || resAluno.affectedRows === 0) {
                await db.query("UPDATE Usuario SET Usuario_Senha = ? WHERE ID_Usuario = ?", [hashed, userId])
            }
        }

        res.status(200).json({ msg: "Senha redefinida com sucesso!" })
        console.log("Sua senha foi redefinida")
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: "Token inválido ou expirado" })
    }
}

export const enviarEmailVerificacao = async (req, res) => {
    let message = ""

    try {
        const userId = req.user.id
        const [rowsUsuario] = await db.query("SELECT * FROM Usuario WHERE ID_Usuario = ?", [userId])
        let user = null
        let tipo = null

        if (rowsUsuario && rowsUsuario.length) {
            user = rowsUsuario[0]
            tipo = 'Usuario'
        } else {
            const [rowsAluno] = await db.query("SELECT * FROM Aluno WHERE ID_Aluno = ?", [userId])
            if (rowsAluno && rowsAluno.length) {
                user = rowsAluno[0]
                tipo = 'Aluno'
            }
        }

        if (!user) return res.status(404).json({ error: "Usuário não encontrado" })

        const userIdToken = tipo === 'Aluno' ? user.ID_Aluno : user.ID_Usuario
        const userEmail = tipo === 'Aluno' ? user.Aluno_Email : user.Usuario_Email
        const userName = tipo === 'Aluno' ? user.Aluno_Nome : user.Usuario_Nome

        const { token: tokenVerifyMail } = createToken({ id: userIdToken, tipo }, { expiresIn: "10m" })
        const verifyLink = `${process.env.FRONTEND_URL}/verificar/${tokenVerifyMail}`

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Verificação de email",
            html: `<p>Olá, ${userName}!</p>
                          <p>Essa mensagem foi enviada para realizar a verificação do seu email. Clique no link abaixo para verificar seu email:</p>
                          <a href="${verifyLink}">${verifyLink}</a>
                          <p>O link é válido por 10 minutos.</p>`
        })

        return res.status(200).json({ msg: "Email enviado com sucesso", tokenVerifyMail })
    } catch (err) {
        console.error(err)
        message = "Erro ao enviar o email de verificação"
        return res.status(400).json({ error: "Token inválido ou expirado" })
    }
}

export const verificarEmail = async (req, res) => {
    const {token} = req.params
    try {
        const decoded = await verifyToken(token)
        const userId = decoded.id
        const tipo = decoded.tipo

        if (tipo === 'Aluno') {
            await db.query("UPDATE Aluno SET Verificado = ? WHERE ID_Aluno = ?", [true, userId])
        } else if (tipo === 'Usuario') {
            try {
                await db.query("UPDATE Usuario SET Verificado = ? WHERE ID_Usuario = ?", [true, userId])
            } catch (e) {
                await db.query("UPDATE Usuario SET Verificado = ? WHERE ID_Usuario = ?", [true, userId])
            }
        } else {
            try {
                await db.query("UPDATE Aluno SET Verificado = ? WHERE ID_Aluno = ?", [true, userId])
            } catch (e) {
                try {
                    await db.query("UPDATE Usuario SET Verificado = ? WHERE ID_Usuario = ?", [true, userId])
                } catch (e2) {
                    await db.query("UPDATE Usuario SET Verificado = ? WHERE ID_Usuario = ?", [true, userId])
                }
            }
        }

        return res.status(200).json({ msg: "Seu email foi verificado" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Erro interno de servidor" })
    }
}
