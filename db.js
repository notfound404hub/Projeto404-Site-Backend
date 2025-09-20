import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("Tentando conectar ao banco...");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Conexão com MySQL estabelecida com sucesso!");
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Database: ${process.env.DB_NAME}`);
        connection.release();
    } catch (err) {
        console.error("Erro ao conectar no MySQL:", err.message);
    }
})();

export default pool;
