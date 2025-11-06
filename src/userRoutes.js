import express from "express";
import multer from "multer";
import {alunos, cadastroUsuario, enviarEmailVerificacao, forgotPassword, grupos, login, mentores, resetPassword, verificarEmail} from
'./controllers/authController.js'
import { deleteFromTable, filtrar, getAllUsuarios, importarUsuarios, ordenar, updateUsuarioById, usuarioDeleteById, usuarioGetById } from "./controllers/userController.js";
import { authMiddleware } from './middlewares/authMiddleware.js'
import { deleteMessagesById, getMessagesById, updateMessagesById } from "./controllers/chatController.js";

console.log("userRoutes.js carregado");

const upload = multer({ dest: "uploads/" });

console.log("userRoutes.js carregado");

const r = express.Router();

r.post('/login', login)

r.post('/alunos', alunos)

r.post('/grupos', grupos)

r.post('/cadastroUsuario', cadastroUsuario)

r.post('/auth/forgotPassword', forgotPassword)

r.put('/auth/resetPassword', authMiddleware, resetPassword)

r.post('/enviaremail', authMiddleware, enviarEmailVerificacao)

r.get('/verificar',authMiddleware, verificarEmail)

r.get('usuario/:ID_Usuario', authMiddleware, usuarioGetById)

r.delete('usuario/:ID_Usuario', authMiddleware, usuarioDeleteById)

r.put('/usuario/:ID_Usuario', authMiddleware, updateUsuarioById)

r.get('/usuarios', authMiddleware, getAllUsuarios)

r.delete('/deleteFromTable', authMiddleware, deleteFromTable)

r.post('/filtrar', authMiddleware, filtrar)

r.post('/ordenar', authMiddleware, ordenar)

r.post('/importarusuarios', authMiddleware, importarUsuarios, upload.single("file"))

r.get('/messages/:userId', authMiddleware, getMessagesById)

r.post('/messages', authMiddleware, postMessage)

r.put('/messages/:id', authMiddleware, updateMessagesById)

r.delete('/messages/:id', authMiddleware, deleteMessagesById)

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

//   } catch (err) {
//     console.error("Erro no login:", err.message);
//     res.status(500).json({ error: "Erro no login", details: err.message });
//   }
// }); 

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
// 


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

export default r;
