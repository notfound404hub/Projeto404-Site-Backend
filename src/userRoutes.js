import express from "express";
import pool from "./db.js";
import bcrypt from "bcrypt";
import multer from "multer";
import xlsx from "xlsx";

import { createToken, denyToken } from "./services/tokenService.js";

console.log("userRoutes.js carregado");


const upload = multer({ dest: "uploads/" });

console.log("userRoutes.js carregado");
const r = express.Router();

r.post("/delete", async (req, res) => {
  try {
    const { ids, tabela } = req.body;

    console.log("IDs recebidos:", ids);
    console.log("Tabela recebida:", tabela);

    // Validações
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum ID informado para exclusão." });
    }

    if (!tabela) {
      return res
        .status(400)
        .json({ error: "Nome da tabela não informado." });
    }

    // Segurança: impede SQL injection via nome de tabela
    const tabelasPermitidas = ["Usuario", "Campanha", "Mentor", "Aluno"]; // adicione as que quiser
    if (!tabelasPermitidas.includes(tabela)) {
      return res
        .status(400)
        .json({ error: "Tabela não permitida para exclusão." });
    }

    console.log(`🗑 Excluindo da tabela: ${tabela}, IDs:`, ids);

    // Monta placeholders (?, ?, ?) dinamicamente
    const placeholders = ids.map(() => "?").join(", ");

    // Usa interpolação segura apenas no nome da tabela (já validado)
    const query = `DELETE FROM ${tabela} WHERE ID_${tabela} IN (${placeholders})`;

    const [result] = await pool.query(query, ids);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum registro encontrado para exclusão." });
    }

    return res.status(200).json({
      msg: `${result.affectedRows} registro(s) excluído(s) com sucesso!`,
    });
  } catch (err) {
    console.error("Erro ao excluir itens:", err);
    res.status(500).json({ error: "Erro no servidor ao excluir itens." });
  }
});


r.post("/login", async (req, res) => {
  try {
    const { Aluno_Email, Aluno_Senha } = req.body;
    console.log(Aluno_Email, Aluno_Senha);

    const [rows] = await pool.query(
      "SELECT * FROM Aluno WHERE Aluno_Email = ?",
      [Aluno_Email]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ error: "E-Mail ou senha Senha incorretos" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(Aluno_Senha, user.Aluno_Senha);

    if (!ok) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    if (!ok)
      return res
        .status(401)
        .json({ error: "Credenciais inválidas", details: err.message });


    return res.status(200).json({
      msg: "Login bem sucedido",
      ID_Aluno: user.ID_Aluno,
      Aluno_Nome: user.Aluno_Nome,
      Aluno_Email: user.Aluno_Email,
    });
  } catch (err) {
    console.error("Erro no login:", err.message);
    res.status(500).json({ error: "Erro no login", details: err.message });
  }
});

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
    res
      .status(500)
      .json({ error: "Erro no cadastro do grupo", details: err.message });
    await pool.query("ROLLBACK");
  }
});

r.post("/alunos", async (req, res) => {
  console.log("Requisição recebida:", req.body);
  try {
    const alunos = req.body;

    for (const aluno of alunos) {
      const { Aluno_RA, Aluno_Nome, Aluno_Email, Aluno_Senha, Id_Grupo } =
        aluno;
      const hashed = await bcrypt.hash(Aluno_Senha, 10);

      const [rows] = await pool.query(
        "SELECT * FROM Aluno WHERE Aluno_Email = ?",
        [Aluno_Email]
      );

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

r.delete("/usuario/:ID_Usuario", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE Aluno SET Aluno_Senha = ? WHERE Aluno_Email = ?", [
      hashed,
      Aluno_Email,
    ]);
    return res.json({ message: "Se o email existir, a senha foi redefinida" });
  } catch (err) {
    console.error("forgotPassword error", err);
    return res.status(500).json({ error: "Erro ao redefinir a senha" });
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

r.post("/tabela", async (req, res) => {
  const { teste } = req.body;
  console.log(teste[1]);
  try {
    const { id } = req.query;
    let query = `SELECT * FROM ${teste}`;
    console.log(query);

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
    const { filtros, tabela } = req.body;
    console.log(filtros);

    // se não tiver filtros, retorna tudo

    console.log(tabela);

    if (!filtros || !Array.isArray(filtros) || filtros.length === 0) {
      const [rows] = await pool.query(`SELECT * FROM ${tabela}`);
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

    const query = `SELECT * FROM ${tabela} ${whereClause}`;
    console.log(`SELECT * FROM ${tabela} ${whereClause} `);
    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao filtrar ${tabela}:`, error);
    res.status(500).json({ error: `Erro ao filtrar ${tabela}` });
  }
});

r.post("/ordenar", async (req, res) => {
  try {
    const { campo, direcao, tabela } = req.body;
    console.log(campo);
    console.log(direcao);
    console.log(tabela);

    if (!campo) {
      return res
        .status(400)
        .json({ error: "Campo de ordenação não informado" });
    }

    let orderType = "ASC";
    if (direcao && direcao.toLowerCase() === "desc") {
      orderType = "DESC";
    }

    console.log("Campo recebido:", campo);

    const query = `SELECT * FROM ${tabela} ORDER BY ${campo} ${orderType}`;
    console.log(query);
    const [rows] = await pool.query(query);
    console.log(direcao);
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao ordenar ${tabela}:`, error);
    res.status(500).json({ error: `Erro ao ordenar ${tabela}` });
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
          console.log("⚠️ Ignorando linha sem e-mail:", u);
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
            console.log(`✏️ Atualizando usuário alterado: ${Usuario_Email}`);
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
    const hashed = await bcrypt.hash(senha, 10);

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios",
      });
    }

    const [emailExists] = await pool.query(
      "SELECT * FROM Usuario WHERE Usuario_Email = ?",
      [email]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        error: "Este email já está cadastrado",
      });
    }

    if (cpfCnpj) {
      const [cpfExists] = await pool.query(
        "SELECT * FROM Usuario WHERE Usuario_CPF = ?",
        [cpfCnpj]
      );

      if (cpfExists.length > 0) {
        return res.status(400).json({
          error: "Este CPF/CNPJ já está cadastrado",
        });
      }
    }

    // Insere o novo usuário
    const [result] = await pool.query(
      `INSERT INTO Usuario
      (Usuario_Nome, Usuario_Empresa, Usuario_CPF, Usuario_Email, Usuario_Telefone, Usuario_Senha) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, empresa || null, cpfCnpj || null, email, telefone || null, hashed]
    );

    return res.status(201).json({
      msg: "Usuário cadastrado com sucesso",
      ID_Usuario: result.insertId,
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ error: "Erro no servidor ao cadastrar usuário" });
  }
});


r.get("/api/messages/conversa/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  console.log("📩 [GET] Rota /api/messages/conversa chamada");
  console.log("➡️ Params recebidos:", { user1, user2 });

  try {
    const [conversaRows] = await pool.query(
      `SELECT c.idConversa
       FROM Conversas c
       JOIN ParticipantesConversa p1 ON c.idConversa = p1.idConversa
       JOIN ParticipantesConversa p2 ON c.idConversa = p2.idConversa
       WHERE p1.idAluno = ? AND p2.idAluno = ?`,
      [user1, user2]
    );

    console.log("🔍 Conversa encontrada:", conversaRows);

    if (conversaRows.length === 0) {
      console.log("⚠️ Nenhuma conversa encontrada entre os usuários");
      return res.json([]);
    }

    const idConversa = conversaRows[0].idConversa;
    console.log("🗂️ idConversa:", idConversa);

    const [rows] = await pool.query(
      `SELECT * FROM Mensagens
       WHERE idConversa = ?
       ORDER BY createdAt ASC`,
      [idConversa]
    );

    console.log(`💬 ${rows.length} mensagens encontradas`);
    res.json(rows);
  } catch (err) {
    console.error("❌ Erro ao buscar conversa:", err);
    res.status(500).json({ error: "Erro ao buscar conversa" });
  }
});

// 🔹 Enviar nova mensagem
r.post("/api/messages", async (req, res) => {
  const { idRemetente, idDestinatario, mensagem } = req.body;
  console.log("📤 [POST] /api/messages chamada");
  console.log("➡️ Body recebido:", { idRemetente, idDestinatario, mensagem });

  try {
    const [conversaRows] = await pool.query(
      `SELECT c.idConversa
       FROM Conversas c
       JOIN ParticipantesConversa p1 ON c.idConversa = p1.idConversa
       JOIN ParticipantesConversa p2 ON c.idConversa = p2.idConversa
       WHERE p1.idAluno = ? AND p2.idAluno = ?`,
      [idRemetente, idDestinatario]
    );

    console.log("🔍 Conversa existente:", conversaRows);

    let idConversa;
    if (conversaRows.length > 0) {
      idConversa = conversaRows[0].idConversa;
      console.log("✅ Conversa já existente:", idConversa);
    } else {
      console.log("🆕 Criando nova conversa...");
      const [novaConversa] = await pool.query(
        `INSERT INTO Conversas (createdAt) VALUES (NOW())`
      );
      idConversa = novaConversa.insertId;
      console.log("🆔 Nova conversa criada:", idConversa);

      await pool.query(
        `INSERT INTO ParticipantesConversa (idConversa, idAluno)
         VALUES (?, ?), (?, ?)`,
        [idConversa, idRemetente, idConversa, idDestinatario]
      );
      console.log("👥 Participantes inseridos com sucesso");
    }

    const [result] = await pool.query(
      `INSERT INTO Mensagens (idConversa, idRemetente, mensagem, createdAt)
       VALUES (?, ?, ?, NOW())`,
      [idConversa, idRemetente, mensagem]
    );

    console.log("💾 Mensagem salva com sucesso:", result);

    const novaMensagem = {
      idMensagem: result.insertId,
      idConversa,
      idRemetente,
      mensagem,
      createdAt: new Date(),
    };

    if (req.io) {
      req.io.emit("receivedMessage", novaMensagem);
      console.log("📡 Mensagem emitida via socket:", novaMensagem);
    } else {
      console.log("⚠️ req.io não definido (sem socket ativo)");
    }

    res.status(201).json(novaMensagem);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// 🔹 Editar mensagem
r.put("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { mensagem } = req.body;
  console.log("✏️ [PUT] Editando mensagem:", id, "->", mensagem);

  try {
    await pool.query(`UPDATE Mensagens SET mensagem = ? WHERE idMensagem = ?`, [
      mensagem,
      id,
    ]);
    console.log("✅ Mensagem atualizada com sucesso");

    if (req.io) req.io.emit("editedMessage", { idMensagem: id, mensagem });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao editar mensagem:", err);
    res.status(500).json({ error: "Erro ao editar mensagem" });
  }
});

// 🔹 Deletar mensagem
r.delete("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  console.log("🗑️ [DELETE] Deletando mensagem:", id);

  try {
    await pool.query(`DELETE FROM Mensagens WHERE idMensagem = ?`, [id]);
    console.log("✅ Mensagem deletada com sucesso");

    if (req.io) req.io.emit("deletedMessage", { idMensagem: id });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao deletar mensagem:", err);
    res.status(500).json({ error: "Erro ao deletar mensagem" });
  }
});



export default r;
