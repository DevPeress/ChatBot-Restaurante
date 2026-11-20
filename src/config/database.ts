import process from "node:process";
import { createPool, type Pool } from "mysql2/promise";

let pool: Pool | undefined;

export function getDatabasePool(): Pool {
    if (pool) {
        return pool;
    }

    const { DB_HOST, DB_USER, DB_NAME } = process.env;
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        throw new Error("Configure DB_HOST, DB_USER e DB_NAME para conectar ao MySQL.");
    }

    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("DB_PORT deve ser um número inteiro entre 1 e 65535.");
    }

    pool = createPool({
        host: DB_HOST,
        port,
        user: DB_USER,
        password: process.env.DB_PASSWORD ?? "",
        database: DB_NAME,
    });

    return pool;
}
