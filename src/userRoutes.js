import express from "express";
import pool from "./db.js";
import bcrypt from "bcrypt";
import multer from "multer";
import xlsx from "xlsx";
import {createToken, denyToken} from "./services/tokenService.js"
import {forgotPassword} from
'./controllers/authController.js'

console.log("userRoutes.js carregado");

const upload = multer({ dest: "uploads/" });
const r = express.Router();

r.post("/login", async (req, res) => {
  try {
    const { Aluno_Email, Aluno_Senha } = req.body;
    console.log(Aluno_Email, Aluno_Senha);

    const [rows] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ? AND Usuario_Senha = ?",
      [Usuario_Email, Usuario_Senha]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "E-Mail ou senha Senha incorretos" });
    }

    const user = rows[0]
    const ok = await bcrypt.compare(Aluno_Senha, user.Aluno_Senha)
    if(!ok) return res.status(401).json({error:"Credenciais inválidas", details:err.message})  


    return res.status(200).json({
      msg: "Login bem sucedido",
      ID_Aluno: user.ID_Aluno,
      Aluno_Nome: user.Aluno_Nome,
      Aluno_Email: user.Aluno_Email
    });
  } catch (err) {
    console.error("Erro no login:", err.message);
    res.status(500).json({ error: "Erro no login", details: err.message });
  }
});

r.post('/auth/forgotPassword', forgotPassword)



r.post("/grupos", async (req, res) => {
  console.log("Requisição recebida: ", req.body);
  try {
    const { Grupo_Nome, Grupo_Curso } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM GRUPO WHERE Grupo_Nome = ?",
      [Grupo_Nome]
    );
    if (rows.length > 0) {
      return res.status(400).json({ error: "Grupo já cadastrado" });
    }
    await pool.query("BEGIN");


    await pool.query(
      "INSERT INTO Grupo(Grupo_Nome, Grupo_Curso) VALUES (?, ?)",
      [Grupo_Nome, Grupo_Curso]
    );
    res.status(201).json("Grupo cadastrado com sucesso");
    await pool.query("COMMIT");
  } catch (err) {
    console.error("Erro no cadastro: ", err);
    res.status(500).json({ error: "Erro no cadastro do grupo", details: err.message });
    await pool.query("ROLLBACK");
  }
  });

r.post("/alunos", async (req, res) => {
  console.log("Requisição recebida:", req.body);
  try {

    const alunos = req.body;
    

    for(const aluno of alunos){      
      const { Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha, Id_Grupo } = aluno;
      const hashed = await bcrypt.hash(Aluno_Senha, 10)
      
      const [rows] = await pool.query("SELECT * FROM Aluno WHERE Aluno_Email = ?", [Aluno_Email]);

      if (rows.length > 0) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      await pool.query(
        "INSERT INTO Aluno(Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha, Id_Grupo) VALUES (?, ?, ?, ?, ?)",
        [Aluno_RA, Aluno_Nome, Aluno_Email, hashed, Id_Grupo]
      );

      console.log("Aluno cadastrado", { aluno });
    }
  
    res.status(201).json({ msg: "Usuários cadastrados com sucesso!" });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ error: "Erro no cadastro", details: err.message });
  }
});

r.post("/mentores", async (req, res) => {
  try {
    const { Mentor_Nome, Mentor_Email, Mentor_Senha, Mentor_RA } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM Mentor WHERE Mentor_Email = ?",
      [Mentor_Email]
    );
    if (rows.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    await pool.query(
      "INSERT INTO Mentor(Mentor_Nome, Mentor_Email, Mentor_RA, Mentor_Senha) VALUES (?, ?, ?, ?)",
      [Mentor_Nome, Mentor_Email, Mentor_RA, Mentor_Senha]
    );
    res.status(201).json({ msg: "Mentor cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro no cadastro", err);
    res.status(500).json({ error: "Erro no cadastro", details: err.message });
  }
});

r.post("/forgot-password", async (req, res) => {
  
  const{Aluno_Email,newPassword} = req.body

  if(!Aluno_Email || !newPassword){
    return res.status(400).json({error:"Envie email e senha"})
  }
 
  try{
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.query("UPDATE Aluno SET Aluno_Senha = ? WHERE Aluno_Email = ?",
      [hashed, Aluno_Email]
    )
    return res.status(201).json({message: "Se o email existir, a senha foi redefinida"})
  }catch(err){
    console.error("forgotPassword error", err)
    return res.status(500).json({error: "Erro ao redefinir a senha"})
  }  
})

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

// r.put("/usuarioPrincipal/:ID_Usuario", async (req, res) => {
//   try {
//     const { ID_Usuario } = req.params;
//     const { Usuario_Email, Usuario_Senha, Usuario_Cargo } = req.body;

//     await pool.query(
//       "UPDATE Usuario SET Usuario_Email=?, Usuario_Senha=?, Usuario_Cargo=? WHERE ID_Usuario=?",
//       [Usuario_Email, Usuario_Senha, Usuario_Cargo, ID_Usuario]
//     );

//     return res.status(200).json({ msg: "Usuário atualizado com sucesso" });
//   } catch (err) {
//     console.error("Erro no UPDATE:", err.sqlMessage || err.message);
//     res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
//   }
// });

r.get("/usuarios", async (req, res) => {
  try {
    const { id } = req.query; 
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

r.delete("/deleteFromTable", async (req, res) => {
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

// r.put("/update", async (req, res) => {
//   try {
//     console.log("Requisição recebida para atualizar usuário");
//     console.log("Corpo da requisição:", req.body);

//     const { id, nome, email, telefone, empresa, senha } = req.body;

//     if (!id) {
//       console.log("ID do usuário não informado");
//       return res.status(400).json({ error: "ID do usuário é obrigatório" });
//     }

//     if (!nome || !email || !telefone || !empresa || !senha) {
//       console.log("Campos obrigatórios ausentes");
//       return res.status(400).json({ error: "Preencha todos os campos" });
//     }

//     console.log(
//       `Atualizando usuário ID: ${id} com nome: ${nome}, email: ${email}, telefone: ${telefone}, empresa: ${empresa}`
//     );

//     await pool.query(
//       "UPDATE Usuario SET Usuario_Nome = ?, Usuario_Email = ?, Usuario_Telefone = ?, Usuario_Empresa = ?, Usuario_Senha = ? WHERE ID_Usuario = ?",
//       [nome, email, telefone, empresa, senha, id]
//     );

//     console.log("Usuário atualizado com sucesso no banco de dados");
//     res.status(200).json({ msg: "Usuário atualizado com sucesso!" });
//   } catch (err) {
//     console.error("Erro ao atualizar usuário:", err);
//     res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
//   }
// });

r.post("/filtrar", async (req, res) => {
  try {
    const { filtros } = req.body;
    console.log(filtros);
    if (!filtros || !Array.isArray(filtros) || filtros.length === 0) {
      const [rows] = await pool.query("SELECT * FROM Usuario");
      return res.json(rows);
    }
    
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

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

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
    console.log(campo);
    console.log(direcao);
    if (!campo) {
      return res
        .status(400)
        .json({ error: "Campo de ordenação não informado" });
    }

    let orderType = "ASC";
    if (direcao && direcao.toLowerCase() === "desc") {
      orderType = "DESC";
    }

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
    console.log(direcao);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao ordenar usuários:", error);
    res.status(500).json({ error: "Erro ao ordenar usuários" });
  }
});

r.put("/usuario/:ID_Usuario", async (req, res) => {
  try {
    console.log("Requisição recebida para atualizar usuário.");

    const { ID_Usuario } = req.params;
    const { Usuario_Nome, Usuario_Empresa, Usuario_Telefone, Usuario_Senha } =
      req.body;

    console.log("Dados recebidos no body:", req.body);
    console.log("ID recebido nos parâmetros:", ID_Usuario);

    if (!ID_Usuario) {
      console.log("ID do usuário não informado.");
      return res.status(400).json({ error: "ID do usuário não informado" });
    }
    if (req.body.Usuario_Email || req.body.Usuario_CPF || req.body.created_at) {
      console.log(
        "Tentativa de alterar campo protegido (Email, CPF ou created_at)."
      );
      return res.status(400).json({
        error: "Não é permitido alterar Email, CPF/CNPJ ou data de criação",
      });
    }

    console.log("Executando UPDATE no banco de dados...");

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

    console.log("Query executada com sucesso!");
    console.log(" Resultado do MySQL:", result);

    res.status(200).json({ msg: "Usuário atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro no UPDATE:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
  }
});

r.post("/importarUsuarios", upload.single("file"), async (req, res) => {
  console.log("Recebendo requisição para importar usuários...");

  if (!req.file) {
    console.log("Nenhum arquivo recebido!");
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }

  console.log(" Arquivo recebido:", req.file.originalname);

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const dados = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`${dados.length} registros lidos do Excel.`);

    if (dados.length === 0) {
      return res.status(400).json({ error: "Planilha vazia ou inválida." });
    }

    const connection = await pool.getConnection();
    const inseridos = [];
    const atualizados = [];
    const ignorados = [];

    try {
      await connection.beginTransaction();

      for (const u of dados) {
        const {
          Usuario_Nome,
          Usuario_CPF,
          Usuario_Empresa,
          Usuario_Email,
          Usuario_Telefone,
          Usuario_Senha,
        } = u;

        if (!Usuario_Email) {
          console.log("Ignorando linha sem e-mail:", u);
          continue;
        }

        const [rows] = await connection.query(
          "SELECT * FROM Usuario WHERE Usuario_Email = ?",
          [Usuario_Email]
        );

        if (rows.length > 0) {
          const atual = rows[0];
          const mudou =
            atual.Usuario_Nome !== Usuario_Nome ||
            atual.Usuario_CPF !== Usuario_CPF ||
            atual.Usuario_Empresa !== Usuario_Empresa ||
            atual.Usuario_Telefone !== Usuario_Telefone ||
            atual.Usuario_Senha !== Usuario_Senha;

          if (mudou) {
            console.log(`Atualizando usuário alterado: ${Usuario_Email}`);
            await connection.query(
              `UPDATE Usuario
               SET Usuario_Nome = ?, Usuario_CPF = ?, Usuario_Empresa = ?, Usuario_Telefone = ?, Usuario_Senha = ?
               WHERE Usuario_Email = ?`,
              [
                Usuario_Nome || null,
                Usuario_CPF || null,
                Usuario_Empresa || null,
                Usuario_Telefone || null,
                Usuario_Senha || null,
                Usuario_Email,
              ]
            );
            atualizados.push(Usuario_Email);
          } else {
            console.log(`Nenhuma mudança detectada em: ${Usuario_Email}`);
            ignorados.push(Usuario_Email);
          }
        } else {
          console.log(`Inserindo novo usuário: ${Usuario_Email}`);
          await connection.query(
            `INSERT INTO Usuario 
             (Usuario_Nome, Usuario_CPF, Usuario_Empresa, Usuario_Email, Usuario_Telefone, Usuario_Senha)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              Usuario_Nome || null,
              Usuario_CPF || null,
              Usuario_Empresa || null,
              Usuario_Email,
              Usuario_Telefone || null,
              Usuario_Senha || null,
            ]
          );
          inseridos.push(Usuario_Email);
        }
      }

      await connection.commit();

      console.log("Importação concluída!");
      console.log("Inseridos:", inseridos);
      console.log("Atualizados:", atualizados);
      console.log("Ignorados (sem mudança):", ignorados);

      res.json({
        msg: `Importação concluída! (${inseridos.length} novos, ${atualizados.length} atualizados, ${ignorados.length} sem mudança)`,
        inseridos,
        atualizados,
        ignorados,
      });
    } catch (err) {
      await connection.rollback();
      console.error("Erro durante importação:", err);
      res.status(500).json({ error: "Erro ao importar usuários." });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Erro ao processar arquivo Excel:", err);
    res.status(500).json({ error: "Erro ao processar arquivo Excel." });
  }
});


r.post("/cadastroUsuario", async (req, res) => {
  try {
    const { nome, empresa, cpfCnpj, email, telefone, senha, tabela } = req.body;
    const hashed = await bcrypt.hash(senha, 10)

    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        error: "Nome, email e senha são obrigatórios" 
      });
    }

    const [emailExists] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ?",
      [email]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ 
        error: "Este email já está cadastrado" 
      });
    }

    if (cpfCnpj) {
      const [cpfExists] = await pool.query(
        "SELECT * FROM Usuario WHERE Usuario_CPF = ?",
        [cpfCnpj]
      );

      if (cpfExists.length > 0) {
        return res.status(400).json({ 
          error: "Este CPF/CNPJ já está cadastrado" 
        });
      }
    }    

    const [result] = await pool.query(
      `INSERT INTO Usuario
      (Usuario_Nome, Usuario_Empresa, Usuario_CPF, Usuario_Email, Usuario_Telefone, Usuario_Senha) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, empresa || null, cpfCnpj || null, email, telefone || null, hashed]
    );

    return res.status(201).json({
      msg: "Usuário cadastrado com sucesso",
      ID_Usuario: result.insertId
    });

  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ error: "Erro no servidor ao cadastrar usuário" });
  }
});

/* ============================================================
   🔹 ROTAS DE MENSAGENS (Chat)
   ============================================================ */

r.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Mensagem 
       WHERE idRemetente = ? OR idDestinatario = ?
       ORDER BY createdAt ASC`,
      [userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar mensagens:", err);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

r.post("/messages", async (req, res) => {
  const { idRemetente, idDestinatario, mensagem } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO Mensagem (idRemetente, idDestinatario, mensagem, createdAt)
       VALUES (?, ?, ?, NOW())`,
      [idRemetente, idDestinatario, mensagem]
    );

    const novaMensagem = {
      idMensagem: result.insertId,
      idRemetente,
      idDestinatario,
      mensagem,
      createdAt: new Date(),
    };

    req.io.emit("receivedMessage", novaMensagem);

    res.status(201).json(novaMensagem);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

r.put("/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { mensagem } = req.body;

  try {
    await pool.query(`UPDATE Mensagem SET mensagem = ? WHERE idMensagem = ?`, [
      mensagem,
      id,
    ]);

    req.io.emit("editedMessage", { idMensagem: id, mensagem });

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao editar mensagem:", err);
    res.status(500).json({ error: "Erro ao editar mensagem" });
  }
});

r.delete("/messages/:id", async (req, res) => {
  const { id } = req.params;

  try {    await pool.query(`DELETE FROM Mensagem WHERE idMensagem = ?`, [id]);


    req.io.emit("deletedMessage", { idMensagem: id });

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar mensagem:", err);
    res.status(500).json({ error: "Erro ao deletar mensagem" });
  }
});

export default r;
