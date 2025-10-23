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
      ID_Usuario: usuario.ID_Usuario,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no login" });
  }
});

r.post("/grupos", async (req,res) => {
  console.log("Requisição recebida: ", req.body)
  try{
    const {Grupo_Nome, Grupo_Curso} = req.body

    const[rows] = await pool.query(
      "SELECT * FROM GRUPO WHERE Grupo_Nome = ?", [Grupo_Nome]
    )
    if(rows.length > 0){
      return res.status(400).json({error: "Grupo já cadastrado"})
    }
    await pool.query("BEGIN")

    await pool.query(
      "INSERT INTO Grupo(Grupo_Nome, Grupo_Curso) VALUES (?, ?)", [Grupo_Nome, Grupo_Curso]
    )
    res.status(201).json("Grupo cadastrado com sucesso")
    await pool.query("COMMIT")
  }catch(err){
    console.error("Erro no cadastro: ", err)
    res.status(500).json({error:"Erro no cadastro do grupo", details: err.message})
    await pool.query("ROLLBACK")

  }  
})

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
        "INSERT INTO Aluno(Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha, Id_Grupo) VALUES (?, ?, ?, ?, ?)",
        [Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha, Id_Grupo]
      );

      console.log("Aluno cadastrado", {aluno})
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
    return res
      .status(500)
      .json({ error: "Erro no servidor ao buscar usuário" });
  }
});

r.put("/usuarioPrincipal/:ID_Usuario", async (req, res) => {
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

// 📍 Buscar todos os usuários ou um específico por ID
r.get("/usuarios", async (req, res) => {
  try {
    const { id } = req.query; // permite /usuarios?id=3
    let query = "SELECT * FROM Usuario";

    if (id) {
      query += " WHERE ID_Usuario = ?";
      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.json(rows[0]);
    }

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro no servidor ao buscar usuários" });
  }
});


r.post("/delete", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Nenhum usuário selecionado" });
    }

    const placeholders = ids.map(() => "?").join(",");

    await pool.query(
      `DELETE FROM Usuario WHERE ID_Usuario IN (${placeholders})`,
      ids
    );

    res.status(200).json({ msg: `Usuário(s) excluído(s) com sucesso!` });
  } catch (err) {
    console.error("Erro ao excluir usuários:", err);
    res
      .status(500)
      .json({ error: "Erro ao excluir usuários", details: err.message });
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

r.post("/filtrar", async (req, res) => {
  try {
    const { filtros } = req.body;
    console.log(filtros);
    // se não tiver filtros, retorna tudo
    if (!filtros || !Array.isArray(filtros) || filtros.length === 0) {
      const [rows] = await pool.query("SELECT * FROM Usuario");
      return res.json(rows);
    }

    // montar condições dinâmicas
    const conditions = [];
    const values = [];

    filtros.forEach((f) => {
      const campo = f.campo;
      const valor = f.valor;

      switch (f.condicao) {
        case "igual":
          conditions.push(`${campo} = ?`);
          values.push(valor);
          break;
        case "contem":
          conditions.push(`${campo} LIKE ?`);
          values.push(`%${valor}%`);
          break;
        case "naoContem":
          conditions.push(`${campo} NOT LIKE ?`);
          values.push(`%${valor}%`);
          break;
        case "maior":
          conditions.push(`${campo} > ?`);
          values.push(valor);
          break;
        case "menor":
          conditions.push(`${campo} < ?`);
          values.push(valor);
          break;
        default:
          break;
      }
    });

    const whereClause = conditions.length? `WHERE ${conditions.join(" AND ")}`: "";

    const query = `SELECT * FROM Usuario ${whereClause}`;
    console.log(`SELECT * FROM Usuario${whereClause} `);
    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao filtrar usuários:", error);
    res.status(500).json({ error: "Erro ao filtrar usuários" });
  }
});

r.post("/ordenar", async (req, res) => {
  try {
    const { campo, direcao } = req.body;
    console.log(campo)
    console.log(direcao)
    // validações básicas
    if (!campo) {
      return res.status(400).json({ error: "Campo de ordenação não informado" });
    }

    let orderType = "ASC";
    if (direcao && direcao.toLowerCase() === "desc") {
      orderType = "DESC";
    }

    // 🔒 segurança: impedir SQL injection via interpolação de coluna
    const colunasPermitidas = [
      "ID_Usuario",
      "Usuario_Nome",
      "Usuario_CPF",
      "Usuario_Empresa",
      "Usuario_Email",
      "Usuario_Telefone",
      "created_at",
    ];
    console.log("Campo recebido:", campo);
console.log("Colunas permitidas:", colunasPermitidas);

    if (!colunasPermitidas.includes(campo)) {
      return res.status(400).json({ error: "Campo de ordenação inválido" });
    }

    const query = `SELECT * FROM Usuario ORDER BY ${campo} ${orderType}`;
    console.log(query);
    const [rows] = await pool.query(query);
    console.log(direcao)
    res.json(rows);
  } catch (error) {
    console.error("Erro ao ordenar usuários:", error);
    res.status(500).json({ error: "Erro ao ordenar usuários" });
  }
});

r.put("/usuario/:ID_Usuario", async (req, res) => {
  try {
    console.log("📩 Requisição recebida para atualizar usuário.");

    const { ID_Usuario } = req.params;
    const {
      Usuario_Nome,
      Usuario_Empresa,
      Usuario_Telefone,
      Usuario_Senha
    } = req.body;

    console.log("🧾 Dados recebidos no body:", req.body);
    console.log("🆔 ID recebido nos parâmetros:", ID_Usuario);

    if (!ID_Usuario) {
      console.log("❌ ID do usuário não informado.");
      return res.status(400).json({ error: "ID do usuário não informado" });
    }

    // 🚫 bloqueia alteração de campos protegidos
    if (req.body.Usuario_Email || req.body.Usuario_CPF || req.body.created_at) {
      console.log("🚫 Tentativa de alterar campo protegido (Email, CPF ou created_at).");
      return res
        .status(400)
        .json({ error: "Não é permitido alterar Email, CPF/CNPJ ou data de criação" });
    }

    console.log("🛠️ Executando UPDATE no banco de dados...");

    const [result] = await pool.query(
      `UPDATE Usuario 
       SET 
         Usuario_Nome = ?, 
         Usuario_Empresa = ?, 
         Usuario_Telefone = ?, 
         Usuario_Senha = ?
       WHERE ID_Usuario = ?`,
      [
        Usuario_Nome,
        Usuario_Empresa,
        Usuario_Telefone,
        Usuario_Senha,
        ID_Usuario,
      ]
    );

    console.log("✅ Query executada com sucesso!");
    console.log(" Resultado do MySQL:", result);

    res.status(200).json({ msg: "Usuário atualizado com sucesso!" });
  } catch (err) {
    console.error("💥 Erro no UPDATE:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
  }
});


export default r;
