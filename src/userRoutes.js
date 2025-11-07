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

// r.post("/delete", async (req, res) => {


//   try {
//     const { ids, tabela } = req.body;

//     console.log("IDs recebidos:", ids);
//     console.log("Tabela recebida:", tabela);

//     // Validações
//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "Nenhum ID informado para exclusão." });
//     }

//     if (!tabela) {
//       return res
//         .status(400)
//         .json({ error: "Nome da tabela não informado." });
//     }

//     // Segurança: impede SQL injection via nome de tabela
//     const tabelasPermitidas = ["Campanha","Usuario", "Mentor", "Aluno"];
//     if (!tabelasPermitidas.includes(tabela.trim())) {
//       console.log(`A tabela é ${tabela}`)
//       return res
//         .status(400)
//         .json({ error: "Tabela não permitida para exclusão." });
//     }

//     console.log(`🗑 Excluindo da tabela: ${tabela}, IDs:`, ids);

//     // Monta placeholders (?, ?, ?) dinamicamente
//     const placeholders = ids.map(() => "?").join(", ");

//     // Usa interpolação segura apenas no nome da tabela (já validado)
//     const query = `DELETE FROM ${tabela} WHERE ID_${tabela} IN (${placeholders})`;

//     const [result] = await pool.query(query, ids);

//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ error: "Nenhum registro encontrado para exclusão." });
//     }

//     return res.status(200).json({
//       msg: `${result.affectedRows} registro(s) excluído(s) com sucesso!`,
//     });
//   } catch (err) {
//     console.error("Erro ao excluir itens:", err);
//     res.status(500).json({ error: "Erro no servidor ao excluir itens." });
//   }
// });


// r.post("/login", async (req, res) => {
//   try {
//     const {Email, Senha } = req.body;
//     console.log(Email, Senha);

//     const [rows] = await pool.query(
//       "SELECT * FROM Aluno WHERE Aluno_Email = ?",
//       [Email]
//     );
//     const [rows2] = await pool.query(
//       "SELECT * FROM Usuario WHERE Usuario_Email = ?",
//       [Email]
//     );
//     console.log(rows)
//     console.log(rows2)
//     if ((rows.length === 0)&&(rows2.length === 0)) {
//       return res
//         .status(400)
//         .json({ error: "E-Mail ou senha Senha incorretos" });
//     }
//     let user = "";
//     let ok = ""
//     if(rows.length > 0){
//       console.log("E-mail de um(a) aluno(a)")
//       user = rows[0];
//       ok = await bcrypt.compare(Senha, user.Aluno_Senha);
//     }else if(rows2.length > 0){
//       console.log("E-mail de um(a) usuário(a)")
//       user = rows2[0];
//       ok = await bcrypt.compare(Senha, user.Usuario_Senha);
//     }
//       "SELECT * FROM Usuario WHERE Usuario_Email = ? AND Usuario_Senha = ?",
//       [Usuario_Email, Usuario_Senha]
//     );

//     if (rows.length === 0) {
//       return res.status(400).json({ error: "E-Mail ou senha Senha incorretos" });
//     }
//     const user = rows[0]
//     const ok = await bcrypt.compare(Aluno_Senha, user.Aluno_Senha)
//     if(!ok) return res.status(401).json({error:"Credenciais inválidas", details:err.message})  

//     if(!user.Foto){
//       if(rows.length > 0){
//         return res.status(200).json({
//           msg: "Login bem sucedido, va pra tela de cadastro, de aluno",
//           ID_Aluno: user.ID_Aluno,
//           Aluno_Nome: user.Aluno_Nome,
//           Aluno_Email: user.Aluno_Email,
//           tela:"/Cadastro",
//         });
//       }else{
//         if(rows2.length > 0){
//           return res.status(200).json({
//             msg: "Login bem sucedido, va pra tela de cadastro, de usuario",
//             ID_Aluno: user.ID_Aluno,
//             Aluno_Nome: user.Aluno_Nome,
//             Aluno_Email: user.Aluno_Email,
//             tela:"/Cadastro",
//           });
//       }}
//     }else{
//       if(rows.length > 0){
//         return res.status(200).json({
//           msg: "Login bem sucedido, va pra tela de adm, de aluno",
//           ID_Aluno: user.ID_Aluno,
//           Aluno_Nome: user.Aluno_Nome,
//           Aluno_Email: user.Aluno_Email,
//           tela:"/admin",
//         });
//       }else{
//         if(rows2.length > 0){
//           return res.status(200).json({
//             msg: "Login bem sucedido, va pra tela de adm, de usuario",
//             ID_Aluno: user.ID_Aluno,
//             Aluno_Nome: user.Aluno_Nome,
//             Aluno_Email: user.Aluno_Email,
//             tela:"/admin",
//           });
//       }}
//     }

//    catch (err) {
//     console.error("Erro no login:", err.message);
//     res.status(500).json({ error: "Erro no login", details: err.message });
//   }





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
    return res.json({message: "Se o email existir, a senha foi redefinida"})
  }catch(err){
    console.error("forgotPassword error", err)
    return res.status(500).json({error: "Erro ao redefinir a senha"})
  }  
})

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
    console.log(" Buscando usuário ID:", ID_Usuario);

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
    console.log("🧩 Filtros recebidos:", filtros);
    console.log("📋 Tabela recebida:", tabela);

    // ✅ Caso especial: se o campo "tabela" já vier com WHERE (ex: "Transacao WHERE transacao_Tipo = 'Entrada'")
    if (typeof tabela === "string" && tabela.toUpperCase().includes("WHERE")) {
      const query = `SELECT * FROM ${tabela}`;
      console.log("⚙️ Executando query direta:", query);

      const [rows] = await pool.query(query);
      return res.json(rows);
    }

    // ✅ Caso normal: aplicar filtros dinamicamente
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

    const query = `SELECT * FROM ${tabela}${whereClause}`;
    console.log("🧾 Query final:", query);
    const [rows] = await pool.query(query, values);

    res.json(rows);
  } catch (error) {
    console.error(`❌ Erro ao filtrar ${req.body.tabela}:`, error);
    res.status(500).json({ error: `Erro ao filtrar ${req.body.tabela}` });
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
r.get("/campanhas/:ID_Campanha", async (req, res) => {
  const { ID_Campanha } = req.params;
  try {
    console.log("Buscando Campanha ID:", ID_Campanha);

    const [rows] = await pool.query(
      "SELECT * FROM Campanha WHERE ID_Campanha = ?",
      [ID_Campanha]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ error: "Campanha não encontrado" });
    }
  } catch (err) {
    console.error("Erro no SELECT:", err.sqlMessage || err.message);
    return res
      .status(500)
      .json({ error: "Erro no servidor ao buscar Campanha" });
  }
});
r.put("/campanhas/:ID_Campanha", async (req, res) => {
  try {
    console.log("Requisição recebida para atualizar campanha.");

    const { ID_Campanha } = req.params;
    const {
      Campanha_Nome,
      Campanha_Local,
      Campanha_Meta,
      finish_at,
      Campanha_Grupo,
      Campanha_Quantidade,
    } = req.body;

    console.log("Body recebido:", req.body);
    console.log("ID recebido:", ID_Campanha);

    // Verificações básicas
    if (!ID_Campanha) {
      console.log("ID da campanha não informado.");
      return res.status(400).json({ error: "ID da campanha não informado." });
    }

    // Bloqueia alteração de campos protegidos
    if (Campanha_Grupo || Campanha_Quantidade) {
      console.log("Tentativa de alterar campo protegido (Grupo ou Quantidade).");
      return res.status(400).json({
        error: "Não é permitido alterar o Grupo ou a Quantidade.",
      });
    }

    console.log("Executando UPDATE no banco...");

    const [result] = await pool.query(
      `UPDATE Campanha
       SET 
         Campanha_Nome = ?,
         Campanha_Local = ?,
         Campanha_Meta = ?,
        
         finish_at = ?
       WHERE ID_Campanha = ?`,
      [
        Campanha_Nome,
        Campanha_Local,
        Campanha_Meta,
        finish_at,
        ID_Campanha,
      ]
    );

    if (result.affectedRows === 0) {
      console.log("Nenhuma campanha encontrada para o ID informado.");
      return res.status(404).json({ error: "Campanha não encontrada." });
    }

    console.log("Campanha atualizada com sucesso!");
    res.status(200).json({ msg: "Campanha atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro no UPDATE de campanha:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Erro no servidor ao atualizar campanha." });
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

r.post("/importarCampanha", upload.single("file"), async (req, res) => {
    if (!req.file) {
    console.log(" Nenhum arquivo recebido!");
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

    // helpers
    const toNumberSafe = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(String(v).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    const parseDateSafe = (v) => {
      if (v === null || v === undefined || v === "") return null;
      // v pode ser Excel date serial (número) ou string; Date consegue lidar de forma geral.
      const d = new Date(v);
      if (isNaN(d.getTime())) return null;
      return d;
    };

    const formatSQLDateTime = (d) => {
      if (!d) return null;
      // retorna "YYYY-MM-DD HH:MM:SS"
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    };

    const connection = await pool.getConnection();
    const inseridos = [];
    const atualizados = [];
    const ignorados = [];

    try {
      await connection.beginTransaction();

      for (const row of dados) {
        // normaliza nomes de colunas (se vierem com espaços ou minúsculas, adapte aqui)
        const Campanha_Nome = row.Campanha_Nome || row["Campanha Nome"] || row.nome || null;
        const Campanha_Local = row.Campanha_Local || row.Local || null;
        const Campanha_Grupo = row.Campanha_Grupo || row.Grupo || null;
        const Campanha_Meta = toNumberSafe(row.Campanha_Meta ?? row.Meta);
        const Campanha_Quantidade = Number.isFinite(Number(row.Campanha_Quantidade))
          ? parseInt(row.Campanha_Quantidade, 10)
          : toNumberSafe(row.Campanha_Quantidade) || null;
        const finish_at_raw = row.finish_at || row["Finish At"] || row["Acaba em"] || null;

        if (!Campanha_Nome) {
          console.log(" Ignorando linha sem nome de campanha:", row);
          continue;
        }

        // busca existente
        const [rows] = await connection.query(
          "SELECT * FROM Campanha WHERE Campanha_Nome = ?",
          [Campanha_Nome]
        );

        const newFinishDate = parseDateSafe(finish_at_raw);
        const newFinishSQL = formatSQLDateTime(newFinishDate); // null ou string

        if (rows.length > 0) {
          const atual = rows[0];

          // normaliza valores atuais vindos do DB
          const atualLocal = atual.Campanha_Local ?? null;
          const atualGrupo = atual.Campanha_Grupo ?? null;
          const atualMeta = toNumberSafe(atual.Campanha_Meta);
          const atualQuantidade = atual.Campanha_Quantidade != null ? Number(atual.Campanha_Quantidade) : null;
          const atualFinishDate = atual.finish_at ? new Date(atual.finish_at) : null;

          // compara robustamente:
          const mudouLocal = (atualLocal || "") !== (Campanha_Local || "");
          const mudouGrupo = (atualGrupo || "") !== (Campanha_Grupo || "");
          const mudouMeta =
            (atualMeta === null && Campanha_Meta !== null) ||
            (atualMeta !== null && Campanha_Meta === null) ||
            (atualMeta !== null && Campanha_Meta !== null && Number(atualMeta) !== Number(Campanha_Meta));
          const mudouQuantidade =
            (atualQuantidade === null && Campanha_Quantidade !== null) ||
            (atualQuantidade !== null && Campanha_Quantidade === null) ||
            (atualQuantidade !== null && Campanha_Quantidade !== null && Number(atualQuantidade) !== Number(Campanha_Quantidade));

          let mudouFinish = false;
          if (atualFinishDate === null && newFinishDate !== null) mudouFinish = true;
          else if (atualFinishDate !== null && newFinishDate === null) mudouFinish = true;
          else if (atualFinishDate !== null && newFinishDate !== null) {
            if (atualFinishDate.getTime() !== newFinishDate.getTime()) mudouFinish = true;
          }

          const mudou = mudouLocal || mudouGrupo || mudouMeta || mudouQuantidade || mudouFinish;

          if (mudou) {
            console.log(` Atualizando campanha: ${Campanha_Nome}`);

            await connection.query(
              `UPDATE Campanha
               SET Campanha_Local = ?, 
                   Campanha_Grupo = ?, 
                   Campanha_Meta = ?, 
                   Campanha_Quantidade = ?, 
                   finish_at = ?
               WHERE Campanha_Nome = ?`,
              [
                Campanha_Local || null,
                Campanha_Grupo || null,
                Campanha_Meta !== null ? Campanha_Meta : 0,
                Campanha_Quantidade !== null ? Campanha_Quantidade : 0,
                newFinishSQL, // pode ser null
                Campanha_Nome,
              ]
            );

            atualizados.push(Campanha_Nome);
          } else {
            ignorados.push(Campanha_Nome);
          }
        } else {
          // inserir nova campanha; created_at = NOW()
          console.log(`Inserindo campanha: ${Campanha_Nome}`);

          await connection.query(
            `INSERT INTO Campanha
             (Campanha_Nome, Campanha_Local, Campanha_Grupo, Campanha_Meta, Campanha_Quantidade, created_at, finish_at)
             VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
            [
              Campanha_Nome,
              Campanha_Local || null,
              Campanha_Grupo || null,
              Campanha_Meta !== null ? Campanha_Meta : 0,
              Campanha_Quantidade !== null ? Campanha_Quantidade : 0,
              newFinishSQL,
            ]
          );

          inseridos.push(Campanha_Nome);
        }
      } // for

      await connection.commit();

      console.log("Importação concluída!");
      console.log("Inseridos:", inseridos.length, inseridos);
      console.log("Atualizados:", atualizados.length, atualizados);
      console.log("Ignorados:", ignorados.length, ignorados);

      res.json({
        msg: `Importação concluída! (${inseridos.length} novos, ${atualizados.length} atualizados, ${ignorados.length} sem mudança)`,
        inseridos,
        atualizados,
        ignorados,
      });
    } catch (err) {
      await connection.rollback();
      console.error("❌ Erro durante importação:", err);
      res.status(500).json({ error: "Erro ao importar campanhas." });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("❌ Erro ao processar arquivo Excel:", err);
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


r.post("/chamados", async (req, res) => {
  const { Chamado_Criador } = req.body;
  try {
    console.log("Buscando chamados do criador ID:", Chamado_Criador);
    console.log("Chamado_Criador:", Chamado_Criador);
    console.log("Pool:", typeof pool.query);
    
    const [rows] = await pool.query(
      "SELECT * FROM Chamados WHERE Chamado_Criador = ?",
      [Chamado_Criador]
    );

    if (rows.length > 0) {
      return res.json(rows); // retorna todos os chamados
    } else {
      return res.status(404).json({ error: `Nenhum chamado encontrado para o criador ${Chamado_Criador}` });
    }
  } catch (err) {
    console.error("Erro no SELECT:", err.sqlMessage || err.message);
    return res
      .status(500)
      .json({ error: `Erro no servidor ao buscar chamados do criador ${Chamado_Criador}` });
  }
});


r.post("/AdicionarChamados", async (req, res) => {
  const { Chamado_Titulo, Mensagem, Chamado_Criador } = req.body;

  if (!Chamado_Titulo || !Mensagem || !Chamado_Criador) {
    return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
  }

  try {
    // 1️⃣ Cria o chamado na tabela Chamados
    const [resultChamado] = await pool.query(
      `INSERT INTO Chamados (Chamado_Titulo, Chamado_Status, Chamado_Criador)
       VALUES (?, 'Aberto', ?)`,
      [Chamado_Titulo, Chamado_Criador]
    );

    const novoIDChamado = resultChamado.insertId;

    // 2️⃣ Cria a primeira mensagem (descrição inicial)
    await pool.query(
      `INSERT INTO ChamadosMensagem (ID_Chamado, Mensagem, Remetente)
       VALUES (?, ?, ?)`,
      [novoIDChamado, Mensagem, Chamado_Criador]
    );

    res.status(201).json({
      message: "Chamado criado com sucesso!",
      ID_Chamado: novoIDChamado,
    });
  } catch (err) {
    console.error("Erro ao criar chamado:", err);
    res.status(500).json({ error: "Erro no servidor ao criar chamado." });
  }
});

r.delete("/deleteChamado", async (req, res) => {
  const { ID_Chamado } = req.body;
console.log(ID_Chamado)
  if (!ID_Chamado) {
    return res.status(400).json({ error: "ID do chamado não informado." });
  }

  try {
    // Verifica se o chamado existe antes de excluir
    const [chamadoExiste] = await pool.query(
      "SELECT * FROM Chamados WHERE ID_Chamado = ?",
      [ID_Chamado]
    );

    if (chamadoExiste.length === 0) {
      return res.status(404).json({ error: "Chamado não encontrado." });
    }

    // Exclui as mensagens relacionadas primeiro (para manter integridade)
    await pool.query("DELETE FROM ChamadosMensagem WHERE ID_Chamado = ?", [
      ID_Chamado,
    ]);

    // Exclui o chamado
    await pool.query("DELETE FROM Chamados WHERE ID_Chamado = ?", [
      ID_Chamado,
    ]);

    res.status(200).json({ message: "Chamado excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir chamado:", err);
    res.status(500).json({ error: "Erro no servidor ao excluir chamado." });
  }
});

r.post("/getMensagensChamado", async (req, res) => {
  const { ID_Chamado } = req.body;

  if (!ID_Chamado) {
    return res.status(400).json({ error: "ID do chamado não informado." });
  }

  try {
    const [mensagens] = await pool.query(
      `SELECT 
         ID_ChamadosMensagem,
         ID_Chamado,
         Mensagem,
         Remetente,
         DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS DataEnvio
       FROM ChamadosMensagem
       WHERE ID_Chamado = ?
       ORDER BY created_at ASC`,
      [ID_Chamado]
    );

    res.status(200).json(mensagens);
  } catch (err) {
    console.error("Erro ao buscar mensagens:", err);
    res.status(500).json({ error: "Erro no servidor ao buscar mensagens." });
  }
});

r.post("/enviarMensagem", async (req, res) => {
  const { ID_Chamado, Remetente, Mensagem } = req.body;

  if (!ID_Chamado || !Remetente || !Mensagem) {
    return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
  }

  try {
    await pool.query(
      `INSERT INTO ChamadosMensagem (ID_Chamado, Mensagem, Remetente, created_at)
       VALUES (?, ?, ?, NOW())`,
      [ID_Chamado, Mensagem, Remetente]
    );

    res.status(201).json({ message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    res.status(500).json({ error: "Erro no servidor ao enviar mensagem." });
  }
});

export default r;
