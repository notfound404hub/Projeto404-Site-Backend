import express from "express";
import multer from "multer";
import {
  alunos,
  enviarEmailVerificacao,
  forgotPassword,
  grupos,
  login,
  resetPassword,
  verificarEmail,
} from "./controllers/authController.js";
import {
  deleteFromTable,
  filtrar,
  getAllUsuarios,
  importarUsuarios,
  ordenar,
  updateUsuarioById,
  usuarioDeleteById,
  usuarioGetById,
  updateAlunoById,
  alunoGetById,
  deleteAlunoById,
  tabelas,
  getCampanhas,
  updateCampanhaById,
  AlimentosGetById,
  chamados,
  AdicionarChamados,
  deleteChamado,
  getMensagensChamado,
  enviarMensagem,
  doacoes,
  cadastroAlimento,
  AlimentosUpdateById,
  cadastroGrupo,
  gruposComAlunos,
  importarAlunos, 
  cadastroTransacao, 
  updateTransacao, 
  transacaoEntradaGetById, 
  transacaoSaidaGetById,
  getQuantidadeDoacoes,
  getQuantidadeUsuarios,
  getQuantidadeAlunos,
  getRankingGrupos,
  getTotalAlimentos,
  gruposAno,
  getCampanhasGrafico,
  getTransacoes,
  getStatusCampanhas,
  getComparativoFinanceiro,
  getEvolucaoAlimentos,
  getDistribuicaoGrupos,
  cadastroAluno,
  buscarCodigoAlimento

} from "./controllers/userController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import {
  deleteMessagesById,
  getMessagesById,
  updateMessagesById,
  postMessages,
} from "./controllers/chatController.js";

console.log("userRoutes.js carregado");

const upload = multer({ dest: "uploads/" });

console.log("userRoutes.js carregado");

const r = express.Router();

r.post("/login", login);

r.post("/alunos", alunos);

r.post("/cadastroAluno", authMiddleware, cadastroAluno)

r.post("/grupos", gruposComAlunos);

r.post("/cadastroGrupo", authMiddleware, cadastroGrupo)

r.post("/auth/forgotPassword", forgotPassword);

r.put("/auth/resetPassword/:token", resetPassword);

r.post("/enviaremail", authMiddleware, enviarEmailVerificacao);

r.get("/verificar/:token", verificarEmail);

r.get("/alunos/:ID_Aluno", authMiddleware, alunoGetById);

r.put("/alunos/:ID_Aluno", authMiddleware, updateAlunoById);

r.delete("/alunos", authMiddleware, deleteAlunoById);

r.post("/importarAlunos",authMiddleware, upload.single("file"), importarAlunos);

r.get("/usuario/:ID_Usuario", authMiddleware, usuarioGetById);

r.post("/tabela", authMiddleware, tabelas);

r.delete("/usuario", authMiddleware, usuarioDeleteById);

r.put("/usuario/:ID_Usuario", authMiddleware, updateUsuarioById);

r.post("/usuarios", authMiddleware, getAllUsuarios);

r.delete("/deleteFromTable", authMiddleware, deleteFromTable);

r.post("/filtrar", authMiddleware, filtrar);

r.post("/ordenar", authMiddleware, ordenar);

r.post("/importarUsuarios",authMiddleware, upload.single("file"), importarUsuarios);

r.get("/messages/:userId", authMiddleware, getMessagesById);

r.post("/messages", authMiddleware, postMessages);

r.put("/messages/:id", authMiddleware, updateMessagesById);

r.delete("/messages/:id", authMiddleware, deleteMessagesById);

r.get("/campanhas/:ID_Campanha", authMiddleware, getCampanhas);

r.put("/campanhas/:ID_Campanha", authMiddleware, updateCampanhaById);

r.get("/alimentos/:ID_Alimento", authMiddleware, AlimentosGetById);

r.put("/alimentos/:ID_Alimento", authMiddleware, AlimentosUpdateById);

r.post("/transacao", authMiddleware, cadastroTransacao);

r.put("/transacao/entrada/:ID_TransacaoEntrada", authMiddleware, updateTransacao);

r.put("/transacao/saida/:ID_TransacaoSaida", authMiddleware, updateTransacao);

r.get("/transacao/entrada/:ID_TransacaoEntrada", authMiddleware, transacaoEntradaGetById);

r.get("/transacao/saida/:ID_TransacaoSaida", authMiddleware, transacaoSaidaGetById);

r.post("/chamados", authMiddleware, chamados);

r.post("/AdicionarChamados", authMiddleware, AdicionarChamados);

r.delete("/deleteChamado", authMiddleware, deleteChamado);

r.get("/getMensagensChamado/:ID_Chamado", authMiddleware, getMensagensChamado);

r.get('/codigoAlimento/:Alimento_Cod', authMiddleware, buscarCodigoAlimento)

r.post('/doacoes', authMiddleware, doacoes)

r.post('/cadastroAlimento', authMiddleware, cadastroAlimento)

r.post("/enviarMensagem", authMiddleware, enviarMensagem);

r.get("/getQuantidadeDoacoes/:ano", authMiddleware,getQuantidadeDoacoes);

r.get("/getQuantidadeUsuarios/:ano",authMiddleware, getQuantidadeUsuarios);

r.get("/getQuantidadeAlunos/:ano",authMiddleware, getQuantidadeAlunos);

r.get("/getRankingGrupos/:ano", authMiddleware,getRankingGrupos);

r.get("/getTotalAlimentos/:ano", authMiddleware,getTotalAlimentos);

r.get("/gruposAno/:ano", authMiddleware,gruposAno);

r.get("/getCampanhasGrafico/:ano",authMiddleware, getCampanhasGrafico);

r.get("/getTransacoes/:ano", authMiddleware,getTransacoes);

r.get("/getStatusCampanhas/:ano", authMiddleware,getStatusCampanhas);

r.get("/getComparativoFinanceiro/:ano",authMiddleware, getComparativoFinanceiro);

r.get("/getEvolucaoAlimentos/:ano",authMiddleware, getEvolucaoAlimentos);

r.get("/getDistribuicaoGrupos/:ano",authMiddleware, getDistribuicaoGrupos);

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

export default r;
