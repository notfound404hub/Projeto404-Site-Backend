import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken } from '../services/tokenService.js'

const sanitizeAluno = (u) => ({ alunoId: u.ID_Aluno, alunoNome: u.Aluno_Nome, alunoEmail: u.Aluno_Email, alunoRa: u.Aluno_RA})

const sanitizeGrupo = (u) => ({ grupoId: ID_Grupo, grupoNome: u.Grupo_Nome, grupoCurso: u.Grupo_Curso})

export const login = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) return res.status(400).json({error:"Preencha todos os campos"})   
    
        try{
            const[rows] = await db.query("SELECT * FROM Alunos WHERE email = ?", [email])
            if(!rows.length) return res.status(401).json({error:"Credenciais inválidas"})

            const user = rows[0]
            const ok = await bcrypt.compare(password, user.password)
            if(!ok) return res.status(401).json({error: "Credenciais inválidas"})
            
            const {token} = createToken({id: user.alunoId})
            return res.json({token, user: sanitizeUser(user)})

        }catch(err){
            console.error("login error:", err)
            return res.status(500).json({error: "Erro no login"})
        }
}

export const alunos = async (req, res) => {
    const {name, email, password, ra} = req.body
    if(!name || !email || !password || !ra){
        return res.status(400).json({error:"Preencha todos os campos"})
    }
    try{
        const alunos = req.body
        for(aluno in alunos){
            const {name, email, password, ra} = aluno            
            const hashed = await bcrypt.hash(password, 10)

            const [exists] = await db.query("SELECT ID_Aluno FROM Alunos WHERE Aluno_Email = ?", [email])
            if(exists.length) return res.status(409).json({error:"Email já cadastrado"})
            
            await pool.query("BEGIN")
            
            const [result] = await db.query("INSERT INTO Alunos(name, email, password, ra) VALUES (?, ?, ?, ?)", [name, email, hashed, ra])
            return res.status(201).json(({msg: "Usuário cadastrado com sucesso!"}))
        }        
    }catch(err){
        console.error("register error", err)
        return res.status(500).json({error: "Erro ao registrar usuário"})
    }    
}