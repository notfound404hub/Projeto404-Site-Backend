import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken, verifyToken } from '../services/tokenService.js'
import dotenv from "dotenv";
import xlsx from "xlsx";

export const usuarioGetById = async (req, res) => {

    const { ID_Usuario } = req.params;
    try {
        console.log("Buscando usuário ID:", ID_Usuario);

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
}

export const usuarioDeleteById = async (req, res) => {
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
}

export const getAllUsuarios = async (req, res) => {
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
};


export const deleteFromTable = async (req, res) => {
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
};

export const filtrar = async (req, res) => {
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
};

export const ordenar = async (req, res) => {
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

