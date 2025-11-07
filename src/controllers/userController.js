import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken, verifyToken } from '../services/tokenService.js'
import dotenv from "dotenv";
import xlsx from "xlsx";

export const tabelas = async (req, res) => {
  const { teste } = req.body;
  console.log(req.body)
  try {
    let tabela = teste.trim()
    const tabelasPermitidas = ["Usuario"];
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
}

export const alunoGetById = async (req, res) => {

  const { ID_Aluno } = req.params;
  try {
    console.log("Buscando aluno ID:", ID_Aluno);

    const [rows] = await db.query(
      "SELECT * FROM Aluno WHERE ID_Aluno = ?",
      [ID_Aluno]
    );

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
}

export const updateAlunoById = async (req, res) => {
  try {
    console.log("Requisição recebida para atualizar usuário.");

    const { ID_Aluno } = req.params;
    const { Aluno_Nome, Aluno_Telefone, Aluno_Senha } =
      req.body;

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

    console.log(req.body)

    console.log("Executando UPDATE no banco de dados...");

    const [result] = await db.query(
      `UPDATE Aluno 
       SET 
         Aluno_Nome = ?, 
         Aluno_Telefone = ?, 
         Aluno_Senha = ?
       WHERE ID_Aluno = ?`,
      [
        Aluno_Nome,
        Aluno_Telefone,
        Aluno_Senha,
        ID_Aluno,
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

export const deleteAlunoById = async (req, res) => {
  try {
    const { ids, tabela } = req.body;

    console.log(ids)

    const [rows] = await db.query(
      "SELECT * FROM Aluno WHERE ID_Aluno IN (?)",
      [ids]
    );

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
}

export const usuarioDeleteById = async (req, res) => {
  const { ids, tabela } = req.body;
  try {
    console.log(ids)
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
}

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
      return res
        .status(400)
        .json({ error: "Nome da tabela não informado." });
    }

    const tabelasPermitidas = ["Campanha", "Usuario", "Mentor", "Aluno"];
    if (!tabelasPermitidas.includes(tabela.trim())) {
      console.log(`A tabela é ${tabela}`)
      return res
        .status(400)
        .json({ error: "Tabela não permitida para exclusão." });
    }

    console.log(`🗑 Excluindo da tabela: ${tabela}, IDs:`, ids);

    const placeholders = ids.map(() => "?").join(", ");

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
}

export const filtrar = async (req, res) => {
  try {
    const { filtros, tabela } = req.body;
    console.log("Filtros recebidos:", filtros);
    console.log("Tabela recebida:", tabela);

    const tabelaLimpa = tabela?.trim()
    const tabelasPermitidas = ["Usuario", "Aluno"]
    if(!tabelasPermitidas.includes(tabelaLimpa)) return res.status(400).json({error:"Tabela inválida"})

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
}

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
    const [rows] = await pool.query(query);
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
};


