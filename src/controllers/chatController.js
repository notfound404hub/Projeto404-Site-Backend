import db from '../db.js'
import bcrypt from 'bcrypt'
import { createToken, denyToken, verifyToken } from '../services/tokenService.js'
import dotenv from "dotenv";

export const getMessagesById = async (req, res) => {
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
}

export const postMessages = async (req, res) => {
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
}


export const updateMessagesById = async (req, res) => {
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
}

export const deleteMessagesById = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(`DELETE FROM Mensagem WHERE idMensagem = ?`, [id]);


        req.io.emit("deletedMessage", { idMensagem: id });

        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao deletar mensagem:", err);
        res.status(500).json({ error: "Erro ao deletar mensagem" });
    }
}
