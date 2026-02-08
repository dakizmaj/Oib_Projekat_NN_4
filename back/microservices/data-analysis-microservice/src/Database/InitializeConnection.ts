import { Db } from "./DbConnectionPool";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export async function initialize_database() {
    try {
        // First, create database if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.end();
        
        // Then initialize TypeORM connection
        await Db.initialize();
        console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Database connected")
    } catch(err){
        console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization ", err);
    }
}