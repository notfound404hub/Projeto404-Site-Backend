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


export default r;
