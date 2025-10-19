import express from "express";
import pool from "../db.js";

console.log("userRoutes.js carregado"); 
const r = express.Router();

r.post("/login", async (req, res) => {
  try {
    const { Usuario_Email, Usuario_Senha } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ?",
      [Usuario_Email]
    );

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

   
    const usuario = rows2[0]; 

    return res.status(200).json({ 
      msg: "Login bem sucedido",
      ID_Usuario: usuario.ID_Usuario  
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no login" });
  }
});

r.post("/alunos", async (req, res) => {
  console.log("Requisição recebida:", req.body);
  try {
    const alunos = req.body
    for(const aluno of alunos){      
      const { Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha } = aluno;
      
      const [rows] = await pool.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [Aluno_Email]);
      if (rows.length > 0) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      
      await pool.query(
        "INSERT INTO Aluno(Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha) VALUES (?, ?, ?, ?)",
        [Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha]
      );
    }

    res.status(201).json({ msg: "Usuários cadastrados com sucesso!" });
  }
  catch (err) {
    console.error("Erro no cadastro:", err); 
    res.status(500).json({ error: "Erro no cadastro", details: err.message });
  } 

});

r.post("/mentores", async (req,res) => {
  try{
    const{Mentor_Nome, Mentor_Email, Mentor_Senha, Mentor_RA} = req.body

    const[rows] = await pool.query("SELECT * FROM Mentor WHERE Mentor_Email = ?", [Mentor_Email])
    if(rows.length>0){
      return res.status(400).json({error: "Email já cadastrado"})
    }

    await pool.query(
      "INSERT INTO Mentor(Mentor_Nome, Mentor_Email, Mentor_RA, Mentor_Senha) VALUES (?, ?, ?, ?)",
      [Mentor_Nome, Mentor_Email, Mentor_RA, Mentor_Senha]
    )
    res.status(201).json({msg: "Mentor cadastrado com sucesso!"})
  }
  catch(err){
    console.error("Erro no cadastro", err)
    res.status(500).json({error: "Erro no cadastro", details: err.message})

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

r.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Usuario");

    if (rows.length > 0) {
      return res.json(rows); 
    } else {
      return res.status(404).json({ error: "Usuários não encontrados" });
    }
    
  } catch (err) {
    console.error("Erro no SELECT:", err.sqlMessage || err.message);
    return res.status(500).json({ error: "Erro no servidor ao buscar usuários" });
  }
});

r.post("/delete", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Nenhum usuário selecionado" });
    }

    const placeholders = ids.map(() => "?").join(",");

    await pool.query(`DELETE FROM Usuario WHERE ID_Usuario IN (${placeholders})`, ids);

    res.status(200).json({ msg: `Usuário(s) excluído(s) com sucesso!` });
  } catch (err) {
    console.error("Erro ao excluir usuários:", err);
    res.status(500).json({ error: "Erro ao excluir usuários", details: err.message });
  }
});

r.put("/update", async (req, res) => {
  try {
    console.log("Requisição recebida para atualizar usuário");
    console.log("Corpo da requisição:", req.body);

    const { id, nome, email, telefone, empresa, senha } = req.body;

    if (!id) {
      console.log("ID do usuário não informado");
      return res.status(400).json({ error: "ID do usuário é obrigatório" });
    }

    if (!nome || !email || !telefone || !empresa || !senha) {
      console.log("Campos obrigatórios ausentes");
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    console.log(
      `Atualizando usuário ID: ${id} com nome: ${nome}, email: ${email}, telefone: ${telefone}, empresa: ${empresa}`
    );

    await pool.query(
      "UPDATE Usuario SET Usuario_Nome = ?, Usuario_Email = ?, Usuario_Telefone = ?, Usuario_Empresa = ?, Usuario_Senha = ? WHERE ID_Usuario = ?",
      [nome, email, telefone, empresa, senha, id]
    );

    console.log("Usuário atualizado com sucesso no banco de dados");
    res.status(200).json({ msg: "Usuário atualizado com sucesso!" });

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
  }
});



export default r;