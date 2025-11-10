import express from "express";
import multer from "multer";
import xlsx from "xlsx";

import {
  alunos,
  cadastroUsuario,
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
  codigoAlimento,
  doacoes,
  cadastroAlimento,
  getGrupos,
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
  AlimentosUpdateById,
  cadastroGrupo,
  gruposComAlunos,
  importarAlunos,
} from "./controllers/userController.js";

import { createToken, denyToken } from "./services/tokenService.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import {
  deleteMessagesById,
  getMessagesById,
  updateMessagesById,
  postMessages,
} from "./controllers/chatController.js";

console.log("userRoutes.js carregado");

const upload = multer({ dest: "uploads/" });
const r = express.Router();

/* ROTAS DE AUTENTICAÇÃO */
r.post("/login", login);
r.post("/cadastroUsuario", cadastroUsuario);
r.post("/verificarEmail", verificarEmail);
r.post("/enviarEmailVerificacao", enviarEmailVerificacao);
r.post("/forgotPassword", forgotPassword);
r.post("/resetPassword", resetPassword);

/* ROTAS DE USUÁRIOS */
r.get("/getAllUsuarios", getAllUsuarios);
r.get("/usuarioGetById/:id", usuarioGetById);
r.put("/updateUsuarioById/:id", updateUsuarioById);
r.delete("/usuarioDeleteById/:id", usuarioDeleteById);
r.post("/importarUsuarios", upload.single("file"), importarUsuarios);

/* ROTAS DE ALUNOS */
r.get("/alunos", alunos);
r.get("/alunoGetById/:id", alunoGetById);
r.put("/updateAlunoById/:id", updateAlunoById);
r.delete("/deleteAlunoById/:id", deleteAlunoById);
r.post("/importarAlunos", upload.single("file"), importarAlunos);

/* ROTAS DE GRUPOS */
r.get("/grupos", grupos);
r.get("/getGrupos", getGrupos);
r.get("/gruposComAlunos", gruposComAlunos);
r.post("/cadastroGrupo", cadastroGrupo);

/* ROTAS DE CAMPANHAS */
r.get("/getCampanhas", getCampanhas);
r.put("/updateCampanhaById/:id", updateCampanhaById);

/* ROTAS DE ALIMENTOS */
r.get("/AlimentosGetById/:id", AlimentosGetById);
r.put("/AlimentosUpdateById/:id", AlimentosUpdateById);
r.post("/cadastroAlimento", cadastroAlimento);
r.get("/codigoAlimento/:codigo", codigoAlimento);

/* ROTAS DE DOAÇÕES */
r.get("/doacoes", doacoes);

/* ROTAS DE CHAMADOS */
r.get("/chamados", chamados);
r.post("/AdicionarChamados", AdicionarChamados);
r.delete("/deleteChamado/:id", deleteChamado);
r.get("/getMensagensChamado/:id", getMensagensChamado);
r.post("/enviarMensagem", enviarMensagem);

/* ROTAS DE DASHBOARD E GRÁFICOS */
r.get("/getQuantidadeDoacoes", getQuantidadeDoacoes);
r.get("/getQuantidadeUsuarios", getQuantidadeUsuarios);
r.get("/getQuantidadeAlunos", getQuantidadeAlunos);
r.get("/getRankingGrupos", getRankingGrupos);
r.get("/getTotalAlimentos", getTotalAlimentos);
r.get("/gruposAno", gruposAno);
r.get("/getCampanhasGrafico", getCampanhasGrafico);
r.get("/getTransacoes", getTransacoes);
r.get("/getStatusCampanhas", getStatusCampanhas);
r.get("/getComparativoFinanceiro", getComparativoFinanceiro);
r.get("/getEvolucaoAlimentos", getEvolucaoAlimentos);
r.get("/getDistribuicaoGrupos", getDistribuicaoGrupos);

/* ROTAS DE CHAT */
r.get("/getMessagesById/:id", getMessagesById);
r.post("/postMessages", postMessages);
r.put("/updateMessagesById/:id", updateMessagesById);
r.delete("/deleteMessagesById/:id", deleteMessagesById);

/* ROTAS DE SERVIÇOS E TABELAS */
r.get("/tabelas", tabelas);
r.post("/filtrar", filtrar);
r.post("/ordenar", ordenar);
r.post("/deleteFromTable", deleteFromTable);

/* ROTAS DE TOKENS */
r.post("/createToken", createToken);
r.post("/denyToken", denyToken);

/* MIDDLEWARE DE AUTENTICAÇÃO */
r.use(authMiddleware);

export default r;
