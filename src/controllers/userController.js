import db from "../db.js";
import bcrypt from "bcrypt";
import {
  createToken,
  denyToken,
  verifyToken,
} from "../services/tokenService.js";
import dotenv from "dotenv";
import xlsx from "xlsx";
import { error } from "console";

export const tabelas = async (req, res) => {
  const { teste } = req.body;
  console.log(req.body);
  try {
    let tabela = teste.trim();
    const tabelasPermitidas = ["Usuario", "Campanha", "Alimentos", "TransacaoEntrada", "TransacaoSaida"];
    if (!tabelasPermitidas.includes(tabela)) {
      return res.status(400).json({ error: "Tabela inválida" });
    }

    const [rows] = await db.query(`SELECT * FROM ??`, [tabela]);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro no servidor ao buscar usuários" });
  }
};

export const usuarioGetById = async (req, res) => {
  const { ID_Usuario } = req.params;
  try {
    console.log("Buscando usuário ID:", ID_Usuario);

    const [rows] = await db.query(
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
};

export const alunoGetById = async (req, res) => {
  const { ID_Aluno } = req.params;
  try {
    console.log("Buscando aluno ID:", ID_Aluno);

    const [rows] = await db.query("SELECT * FROM Aluno WHERE ID_Aluno = ?", [
      ID_Aluno,
    ]);

    if (rows.length > 0) {
      return res.json({ msg: "Aluno encontrado com sucesso", rows });
    } else {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (err) {
    console.error("Erro no SELECT:", err.sqlMessage || err.message);
    return res
      .status(500)
      .json({ error: "Erro no servidor ao buscar usuário" });
  }
};

export const updateAlunoById = async (req, res) => {
  try {
    console.log("Requisição recebida para atualizar usuário.");

    const { ID_Aluno } = req.params;
    const { Aluno_Nome, Aluno_Telefone, Aluno_Senha } = req.body;

    console.log("Dados recebidos no body:", req.body);
    console.log("ID recebido nos parâmetros:", ID_Aluno);

    if (!ID_Aluno) {
      console.log("ID do usuário não informado.");
      return res.status(400).json({ error: "ID do usuário não informado" });
    }
    if (req.body.Aluno_Email || req.body.Aluno_CPF || req.body.created_at) {
      console.log(
        "Tentativa de alterar campo protegido (Email, CPF ou created_at)."
      );
      return res.status(400).json({
        error: "Não é permitido alterar Email, CPF/CNPJ ou data de criação",
      });
    }

    console.log(req.body);

    console.log("Executando UPDATE no banco de dados...");

    const [result] = await db.query(
      `UPDATE Aluno 
       SET 
         Aluno_Nome = ?, 
         Aluno_Telefone = ?, 
         Aluno_Senha = ?
       WHERE ID_Aluno = ?`,
      [Aluno_Nome, Aluno_Telefone, Aluno_Senha, ID_Aluno]
    );

    console.log("Query executada com sucesso!");
    console.log(" Resultado do MySQL:", result);

    res.status(200).json({ msg: "Usuário atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro no UPDATE:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Erro no servidor ao atualizar usuário" });
  }
};

export const deleteAlunoById = async (req, res) => {
  try {
    const { ids, tabela } = req.body;

    console.log(ids);

    const [rows] = await db.query("SELECT * FROM Aluno WHERE ID_Aluno IN (?)", [
      ids,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await db.query(`DELETE FROM mensagens WHERE idRemetente IN (?)`, [ids]);
    await db.query(`DELETE FROM ${tabela} WHERE ID_Aluno IN (?)`, [ids]);

    return res.status(200).json({ msg: "Conta deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar conta:", err);
    res.status(500).json({ error: "Erro no servidor ao deletar conta" });
  }
};

export const usuarioDeleteById = async (req, res) => {
  const { ids, tabela } = req.body;
  try {
    console.log(ids);
    const [rows] = await db.query(
      `SELECT * FROM ${tabela} WHERE ID_Usuario IN (?)`,
      [ids]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await db.query(`DELETE FROM ${tabela} WHERE ID_Usuario IN (?)`, [ids]);

    return res.status(200).json({ msg: "Conta deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar conta:", err);
    res.status(500).json({ error: "Erro no servidor ao deletar conta" });
  }
};

export const updateUsuarioById = async (req, res) => {
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

    const [result] = await db.query(
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
};

export const importarAlunos = async (req, res) => {
  console.log("Recebendo requisição para importar alunos...");

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

    const connection = await db.getConnection();
    const inseridos = [];
    const atualizados = [];
    const ignorados = [];

    try {
      await connection.beginTransaction();

      for (const u of dados) {
        const {
          Aluno_Nome,
          Aluno_RA,
          Aluno_Email,
          Aluno_CPF,
          Aluno_Telefone,
          Aluno_Senha,
          Aluno_Grupo,
          Aluno_Turma
        } = u;

        if (!Aluno_Email) {
          console.log("Ignorando linha sem e-mail:", u);
          continue;
        }

        const [rows] = await connection.query(
          "SELECT * FROM Aluno WHERE Aluno_Email = ?",
          [Aluno_Email]
        );

        if (rows.length > 0) {
          const atual = rows[0];
          const mudou =
            atual.Aluno_Nome !== Aluno_Nome ||
            atual.Aluno_CPF !== Aluno_CPF ||
            atual.Aluno_RA !== Aluno_RA ||
            atual.Aluno_Telefone !== Aluno_Telefone ||
            atual.Aluno_Senha !== Aluno_Senha;
          atual.Aluno_Grupo !== Aluno_Grupo;
          atual.Aluno_Turma !== Aluno_Turma;

          if (mudou) {
            console.log(`Atualizando usuário alterado: ${Aluno_Email}`);
            await connection.query(
              `UPDATE Aluno
               SET Aluno_Nome = ?, Aluno_CPF = ?, Aluno_RA = ?, Aluno_Telefone = ?, Aluno_Senha = ?, Aluno_Grupo = ?, Aluno_Turma = ?
               WHERE Aluno_Email = ?`,
              [
                Aluno_Nome || null,
                Aluno_CPF || null,
                Aluno_RA || null,
                Aluno_Telefone || null,
                Aluno_Senha || null,
                Aluno_Grupo || null,
                Aluno_Turma || null,
                Aluno_Email
              ]
            );
            atualizados.push(Aluno_Email);
          } else {
            console.log(`Nenhuma mudança detectada em: ${Aluno_Email}`);
            ignorados.push(Aluno_Email);
          }
        } else {
          console.log(`Inserindo novo aluno: ${Aluno_Email}`);
          await connection.query(
            `INSERT INTO Aluno 
             (Aluno_Nome, Aluno_CPF, Aluno_RA, Aluno_Email, Aluno_Telefone, Aluno_Senha, Aluno_Grupo, Aluno_Turma)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              Aluno_Nome || null,
              Aluno_CPF || null,
              Aluno_RA || null,
              Aluno_Email,
              Aluno_Telefone || null,
              Aluno_Senha || null,
              Aluno_Grupo || null,
              Aluno_Turma || null,
            ]
          );
          inseridos.push(Aluno_Email);
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
};


export const getAllUsuarios = async (req, res) => {
  const { teste } = req.body;
  console.log(teste[1]);
  try {
    const { id } = req.query;
    let query = `SELECT * FROM ${teste}`;
    console.log(query);

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro no servidor ao buscar usuários" });
  }
};

export const gruposComAlunos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM Grupo g
      LEFT JOIN Grupo_Aluno ga ON g.ID_Grupo = ga.ID_Grupo
      LEFT JOIN Aluno a ON ga.ID_Aluno = a.ID_Aluno
    `);
    const gruposMap = {};

    for (const row of rows) {
      if (!gruposMap[row.ID_Grupo]) {
        gruposMap[row.ID_Grupo] = {
          ID_Grupo: row.ID_Grupo,
          Grupo_Nome: row.Grupo_Nome,
          Grupo_Curso: row.Grupo_Curso,
          alunos: []
        };
      }

      if (row.Aluno_Nome) {
        gruposMap[row.ID_Grupo].alunos.push(row.Aluno_Nome);
      }
    }

    const grupos = Object.values(gruposMap).map((g) => {
      const obj = { ...g }
      g.alunos.forEach((nome, i) => {
        obj[`Aluno_${i + 1}`] = nome
      })
      obj.alunos = g.alunos;
      return obj;
    });


    return res.status(200).json(grupos);
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return res.status(500).json({ error: "Erro ao buscar grupos e alunos." });
  }
};

export const deleteFromTable = async (req, res) => {
  try {
    const { ids, tabela } = req.body;

    console.log("IDs recebidos:", ids);
    console.log("Tabela recebida:", tabela);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum ID informado para exclusão." });
    }

    if (!tabela) {
      return res.status(400).json({ error: "Nome da tabela não informado." });
    }

    const tabelasPermitidas = ["Campanha", "Usuario", "Mentor", "Aluno", "Alimento", "Grupo", "TransacaoEntrada", "TransacaoSaida", ];
    if (!tabelasPermitidas.includes(tabela.trim())) {
      console.log(`A tabela é ${tabela}`);
      return res
        .status(400)
        .json({ error: "Tabela não permitida para exclusão." });
    }

    console.log(`🗑 Excluindo da tabela: ${tabela}, IDs:`, ids);

    const placeholders = ids.map(() => "?").join(", ");

    const query = `DELETE FROM ${tabela} WHERE ID_${tabela} IN (${placeholders})`;

    const [result] = await db.query(query, ids);

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
};

export const cadastroGrupo = async (req, res) => {
  const { Grupo_Nome, Grupo_Curso } = req.body

  try {
    const [rows] = await db.query("SELECT * FROM Grupo WHERE Grupo_Nome = ?", [Grupo_Nome])

    if (rows.length) return res.status(409).json({ error: "Grupo já cadastrado" })

    await db.query("INSERT INTO Grupo(Grupo_Nome, Grupo_Curso) VALUES (?, ?)", [Grupo_Nome, Grupo_Curso])

    return res.status(200).json({ msg: "Grupo cadastrado com sucesso" })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Erro interno do servidor" })
  }

}

export const filtrar = async (req, res) => {
  try {
    const { filtros, tabela } = req.body;
    console.log("Filtros recebidos:", filtros);
    console.log("Tabela recebida:", tabela);

    const tabelaLimpa = tabela?.trim();
    const tabelasPermitidas = ["Usuario", "Aluno"];
    if (!tabelasPermitidas.includes(tabelaLimpa))
      return res.status(400).json({ error: "Tabela inválida" });

    if (!filtros || !Array.isArray(filtros) || filtros.length === 0) {
      const [rows] = await db.query(`SELECT * FROM ${tabela}`);
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
    console.log("Query final:", query);

    const [rows] = await db.query(query, values);

    res.json(rows);
  } catch (error) {
    console.error(`Erro ao filtrar ${req.body.tabela}:`, error);
    res.status(500).json({ error: `Erro ao filtrar ${req.body.tabela}` });
  }
};

export const ordenar = async (req, res) => {
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
    const [rows] = await db.query(query);
    console.log(direcao);
    res.json(rows);
  } catch (error) {
    console.error(`Erro ao ordenar ${tabela}:`, error);
    res.status(500).json({ error: `Erro ao ordenar ${tabela}` });
  }
};

export const importarUsuarios = async (req, res) => {
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

    const connection = await db.getConnection();
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
};

export const getCampanhas = async (req, res) => {
  const { ID_Campanha } = req.params;
  try {
    console.log("Buscando Campanha ID:", ID_Campanha);

    const [rows] = await db.query(
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
};

export const updateCampanhaById = async (req, res) => {
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

    if (!ID_Campanha) {
      console.log("ID da campanha não informado.");
      return res.status(400).json({ error: "ID da campanha não informado." });
    }

    if (Campanha_Grupo || Campanha_Quantidade) {
      console.log(
        "Tentativa de alterar campo protegido (Grupo ou Quantidade)."
      );
      return res.status(400).json({
        error: "Não é permitido alterar o Grupo ou a Quantidade.",
      });
    }

    console.log("Executando UPDATE no banco...");

    const [result] = await db.query(
      `UPDATE Campanha
       SET 
         Campanha_Nome = ?,
         Campanha_Local = ?,
         Campanha_Meta = ?,
        
         finish_at = ?
       WHERE ID_Campanha = ?`,
      [Campanha_Nome, Campanha_Local, Campanha_Meta, finish_at, ID_Campanha]
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
};

export const importarCampanha = async (req, res) => {
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

    const connection = await db.getConnection();
    const inseridos = [];
    const atualizados = [];
    const ignorados = [];

    try {
      await connection.beginTransaction();

      for (const row of dados) {
        // normaliza nomes de colunas (se vierem com espaços ou minúsculas, adapte aqui)
        const Campanha_Nome =
          row.Campanha_Nome || row["Campanha Nome"] || row.nome || null;
        const Campanha_Local = row.Campanha_Local || row.Local || null;
        const Campanha_Grupo = row.Campanha_Grupo || row.Grupo || null;
        const Campanha_Meta = toNumberSafe(row.Campanha_Meta ?? row.Meta);
        const Campanha_Quantidade = Number.isFinite(
          Number(row.Campanha_Quantidade)
        )
          ? parseInt(row.Campanha_Quantidade, 10)
          : toNumberSafe(row.Campanha_Quantidade) || null;
        const finish_at_raw =
          row.finish_at || row["Finish At"] || row["Acaba em"] || null;

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
          const atualQuantidade =
            atual.Campanha_Quantidade != null
              ? Number(atual.Campanha_Quantidade)
              : null;
          const atualFinishDate = atual.finish_at
            ? new Date(atual.finish_at)
            : null;

          // compara robustamente:
          const mudouLocal = (atualLocal || "") !== (Campanha_Local || "");
          const mudouGrupo = (atualGrupo || "") !== (Campanha_Grupo || "");
          const mudouMeta =
            (atualMeta === null && Campanha_Meta !== null) ||
            (atualMeta !== null && Campanha_Meta === null) ||
            (atualMeta !== null &&
              Campanha_Meta !== null &&
              Number(atualMeta) !== Number(Campanha_Meta));
          const mudouQuantidade =
            (atualQuantidade === null && Campanha_Quantidade !== null) ||
            (atualQuantidade !== null && Campanha_Quantidade === null) ||
            (atualQuantidade !== null &&
              Campanha_Quantidade !== null &&
              Number(atualQuantidade) !== Number(Campanha_Quantidade));

          let mudouFinish = false;
          if (atualFinishDate === null && newFinishDate !== null)
            mudouFinish = true;
          else if (atualFinishDate !== null && newFinishDate === null)
            mudouFinish = true;
          else if (atualFinishDate !== null && newFinishDate !== null) {
            if (atualFinishDate.getTime() !== newFinishDate.getTime())
              mudouFinish = true;
          }

          const mudou =
            mudouLocal ||
            mudouGrupo ||
            mudouMeta ||
            mudouQuantidade ||
            mudouFinish;

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
};

export const cadastroAlimento = async (req, res) => {
  const { Alimento_Cod, Alimento_Nome, Alimento_Marca, Alimento_Peso } = req.body;

  if (!Alimento_Cod || !Alimento_Nome || !Alimento_Marca || !Alimento_Peso) {
    return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
  }

  try {
    await db.query(
      "INSERT INTO codigoAlimentos (Alimento_Cod, Alimento_Nome, Alimento_Marca, Alimento_Peso) VALUES (?, ?, ?, ?)",
      [Alimento_Cod, Alimento_Nome, Alimento_Marca, Alimento_Peso]
    );

    res.json({ msg: "Alimento cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar alimento:", err);
    res.status(500).json({ error: "Erro ao cadastrar alimento." });
  }
};

// Rota para cadastrar transação (entrada ou saída)
export const cadastroTransacao = async (req, res) => {
  try {
    // Front may send either a 'tabela' field (TransacaoEntrada|TransacaoSaida) or a transacao_Tipo
    const {
      tabela: tabelaBody,
      transacao_Grupo,
      transacao_Aluno,
      transacao_Valor,
      transacao_Comprovante,
    } = req.body;

    let finalTable = tabelaBody;
    if (!finalTable) {
      const tipoLower = String(finalTable).toLowerCase();
      if (tipoLower.includes("entrada")) finalTable = "TransacaoEntrada";
      else if (tipoLower.includes("saida") || tipoLower.includes("saída")) finalTable = "TransacaoSaida";
    }

    if (!finalTable) {
      return res.status(400).json({ error: "Tipo de transação é obrigatório (envie 'tabela' ou 'transacao_Tipo')." });
    }

    // validate finalTable
    if (finalTable !== "TransacaoEntrada" && finalTable !== "TransacaoSaida") {
      return res.status(400).json({ error: "Campo 'tabela' inválido. Use 'TransacaoEntrada' ou 'TransacaoSaida'." });
    }

    const [result] = await db.query(
      `INSERT INTO ${finalTable} (transacao_Grupo, transacao_Aluno, transacao_Valor, transacao_Comprovante, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [transacao_Grupo || null, transacao_Aluno || null, transacao_Valor || null, transacao_Comprovante || null]
    );

    return res.status(201).json({ msg: "Transação cadastrada com sucesso!", id: result.insertId });
  } catch (err) {
    console.error("Erro ao cadastrar transação:", err);
    return res.status(500).json({ error: "Erro no servidor ao cadastrar transação." });
  }
};

// Rota para atualizar transação (entrada ou saída)
export const updateTransacao = async (req, res) => {
  try {
    // front sends body like:
    // { transacao_Grupo, transacao_Aluno, transacao_Valor, transacao_Tipo, transacao_Comprovante, tabela }
    const {
      transacao_Tipo,
      transacao_Grupo,
      transacao_Aluno,
      transacao_Valor,
      transacao_Comprovante,
      tabela: tabelaBody,
    } = req.body;

    // Accept params named exactly as DB id columns to avoid frontend conflict
    const idFromEntrada = req.params.ID_TransacaoEntrada;
    const idFromSaida = req.params.ID_TransacaoSaida;
    const idGeneric = req.params.id;
    const id = idFromEntrada || idFromSaida || idGeneric;

    // Determine table: prefer explicit tabela from body, then transacao_Tipo, then param used
    let finalTable = tabelaBody;
    if (!finalTable && transacao_Tipo) {
      const tipoLower = String(transacao_Tipo).toLowerCase();
      if (tipoLower.includes("entrada")) finalTable = "TransacaoEntrada";
      else if (tipoLower.includes("saida") || tipoLower.includes("saída")) finalTable = "TransacaoSaida";
    }
    if (!finalTable) {
      if (idFromEntrada) finalTable = "TransacaoEntrada";
      else if (idFromSaida) finalTable = "TransacaoSaida";
    }

    if (!id || !finalTable) {
      return res.status(400).json({ error: "ID e tabela (ou transacao_Tipo) são obrigatórios." });
    }

    const idCol = finalTable === "TransacaoEntrada" ? "ID_TransacaoEntrada" : "ID_TransacaoSaida";

    const [result] = await db.query(
      `UPDATE ${finalTable}
       SET transacao_Grupo = ?, transacao_Aluno = ?, transacao_Valor = ?, transacao_Comprovante = ?
       WHERE ${idCol} = ?`,
      [transacao_Grupo || null, transacao_Aluno || null, transacao_Valor || null, transacao_Comprovante || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transação não encontrada." });
    }

    return res.status(200).json({ msg: "Transação atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar transação:", err);
    return res.status(500).json({ error: "Erro no servidor ao atualizar transação." });
  }
};

// Rota GET para TransacaoEntrada por ID (baseada em AlimentosGetById)
export const transacaoEntradaGetById = async (req, res) => {
  const { ID_TransacaoEntrada } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM TransacaoEntrada WHERE ID_TransacaoEntrada = ?",
      [ID_TransacaoEntrada]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ error: "Transação de entrada não encontrada." });
    }
  } catch (err) {
    console.error("Erro ao buscar transação de entrada:", err.sqlMessage || err.message);
    return res.status(500).json({ error: "Erro no servidor ao buscar transação de entrada." });
  }
};

// Rota GET para TransacaoSaida por ID (baseada em AlimentosGetById)
export const transacaoSaidaGetById = async (req, res) => {
  const { ID_TransacaoSaida } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM TransacaoSaida WHERE ID_TransacaoSaida = ?",
      [ID_TransacaoSaida]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ error: "Transação de saída não encontrada." });
    }
  } catch (err) {
    console.error("Erro ao buscar transação de saída:", err.sqlMessage || err.message);
    return res.status(500).json({ error: "Erro no servidor ao buscar transação de saída." });
  }
};

export const AlimentosGetById = async (req, res) => {
  const { ID_Alimento } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM Alimento WHERE ID_Alimento = ?",
      [ID_Alimento]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ error: "Alimento não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao buscar alimento:", err.sqlMessage || err.message);
    return res.status(500).json({ error: "Erro no servidor ao buscar alimento." });
  }
};

export const AlimentosUpdateById = async (req, res) => {
  const { ID_Alimento } = req.params;
  const { Alimento_Quantidade, Alimento_Validade } = req.body

  console.log("🚀 Chegou na rota GET /alimentos");

  try {
    console.log(req.body)
    console.log(req.params)
    console.log("Buscando alimento EAN:", ID_Alimento);

    const [rows] = await db.query(
      "SELECT * FROM Alimento WHERE ID_Alimento = ?",
      [ID_Alimento]
    );

    console.log(rows)

    if (!rows.length) return res.status(404).json({ error: "Alimento não encontrado" })

    await db.query(
      "UPDATE Alimento SET Alimento_Validade = ?, Alimento_Quantidade = ? WHERE ID_Alimento = ?",
      [Alimento_Validade, Alimento_Quantidade, ID_Alimento]
    );

    return res.status(200).json({ msg: "Alimento atualizado com sucesso" })

  } catch (err) {
    console.error("Erro ao buscar alimento:", err.sqlMessage || err.message);
    return res.status(500).json({ error: "Erro no servidor ao buscar alimento." });
  }
};

export const chamados = async (req, res) => {
  let { Chamado_Criador, Criador_Tipo } = req.body;

  try {
    Chamado_Criador = Number(Chamado_Criador);

    console.log("Buscando chamados do criador ID:", Chamado_Criador);
    console.log("Buscando tipo do criador tipo:", Criador_Tipo);

    let query = "SELECT * FROM Chamados";
    let params = [];

    if (!(Chamado_Criador === 1 && Criador_Tipo === "Usuario")) {
      query += " WHERE Chamado_Criador = ? AND Criador_Tipo = ?";
      params = [Chamado_Criador, Criador_Tipo];
    }

    console.log("Query:", query, "Params:", params);

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      return res.json(rows);
    } else {
      return res.status(404).json({
        error: `Nenhum chamado encontrado para o criador ${Chamado_Criador} com o tipo ${Criador_Tipo}`,
      });
    }
  } catch (err) {
    console.error("Erro no SELECT:", err.sqlMessage || err.message);
    return res.status(500).json({
      error: `Erro no servidor ao buscar chamados do criador ${Chamado_Criador}`,
    });
  }
};

export const AdicionarChamados = async (req, res) => {
  const { Chamado_Titulo, Mensagem, Chamado_Criador, Criador_Tipo } = req.body;
  console.log("Titulo: ", Chamado_Criador);
  console.log("Mensagem: ", Mensagem);
  console.log("Chamado_Criador: ", Chamado_Criador);
  console.log("Criador_Tipo: ", Criador_Tipo);
  if (!Chamado_Titulo || !Mensagem || !Chamado_Criador || !Criador_Tipo) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios não preenchidos." });
  }

  try {
    const [resultChamado] = await db.query(
      `INSERT INTO Chamados (Chamado_Titulo, Chamado_Status, Chamado_Criador, Criador_Tipo)
     VALUES (?, 'Aberto', ?, ?)`,
      [Chamado_Titulo, Chamado_Criador, Criador_Tipo]
    );

    const novoIDChamado = resultChamado.insertId;

    await db.query(
      `INSERT INTO ChamadosMensagem (ID_Chamado, Mensagem, Remetente, Tipo_Remetente)
     VALUES (?, ?, ?, ?)`,
      [novoIDChamado, Mensagem, Chamado_Criador, Criador_Tipo]
    );

    res.status(201).json({
      message: "Chamado criado com sucesso!",
      ID_Chamado: novoIDChamado,
    });
  } catch (err) {
    console.error("Erro ao criar chamado:", err);
    res.status(500).json({ error: "Erro no servidor ao criar chamado." });
  }
};
export const deleteChamado = async (req, res) => {
  const { ID_Chamado, Criador_Tipo } = req.body;
  console.log(ID_Chamado);
  console.log(Criador_Tipo);
  if (!ID_Chamado || !Criador_Tipo) {
    return res.status(400).json({ error: "ID do chamado ou Criado Tipo não informado." });
  }

  try {
    const [chamadoExiste] = await db.query(
      "SELECT * FROM Chamados WHERE ID_Chamado = ? AND Criador_Tipo = ?",
      [ID_Chamado, Criador_Tipo]
    );

    if (chamadoExiste.length === 0) {
      return res.status(404).json({ error: "Chamado não encontrado." });
    }

    await db.query("DELETE FROM ChamadosMensagem WHERE ID_Chamado = ?", [
      ID_Chamado,
    ]);

    await db.query("DELETE FROM Chamados WHERE ID_Chamado = ? AND Criador_Tipo = ?", [ID_Chamado, Criador_Tipo]);

    res.status(200).json({ message: "Chamado excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir chamado:", err);
    res.status(500).json({ error: "Erro no servidor ao excluir chamado." });
  }
};

export const getMensagensChamado = async (req, res) => {
  const { ID_Chamado } = req.params;
  console.log(ID_Chamado)
  if (!ID_Chamado) {
    return res.status(400).json({ error: "ID do chamado não informado." });
  }

  try {
    const [mensagens] = await db.query(
      `SELECT 
       *
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
};

export const enviarMensagem = async (req, res) => {
  const { ID_Chamado, Remetente, Mensagem, Remetente_Tipo } = req.body;
  console.log(Remetente_Tipo)
  if (!ID_Chamado || !Remetente || !Mensagem || !Remetente_Tipo) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios não preenchidos." });
  }

  try {
    await db.query(
      `INSERT INTO ChamadosMensagem (ID_Chamado, Mensagem, Remetente, Tipo_Remetente ,created_at)
     VALUES (?, ?, ?, ?, NOW())`,
      [ID_Chamado, Mensagem, Remetente, Remetente_Tipo]
    );

    res.status(201).json({ message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    res.status(500).json({ error: "Erro no servidor ao enviar mensagem." });
  }
};

export const codigoAlimento = async (req, res) => {
  const { ean } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM codigoAlimentos WHERE Alimento_Cod = ?", [ean]);
    if (rows.length === 0) return res.status(404).json({ msg: "Alimento não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar alimento:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const doacoes = async (req, res) => {
  const { Alimento_Codigo, Alimento_Validade, Alimento_Quantidade } = req.body;
  if (!Alimento_Codigo || !Alimento_Validade || !Alimento_Quantidade)
    return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });

  try {
    await db.query(
      "INSERT INTO Alimentos (Alimento_Codigo, Alimento_Validade, Alimento_Quantidade) VALUES (?, ?, ?)",
      [Alimento_Codigo, Alimento_Validade, Alimento_Quantidade]
    );
    res.json({ msg: "Doação registrada com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar doação:", err);
    res.status(500).json({ error: "Erro ao registrar doação." });
  }
}


