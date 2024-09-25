import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
	POSTGRES_HOST,
	POSTGRES_DB,
	POSTGRES_DB_TEST,
	POSTGRES_DB_PROD,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	DB_PORT,
	DB_TEST_PORT,
	ENV,
} = process.env;

console.log(`Environment is currently running in ${ENV} mode...`);

// const createUserTableSQL = `
//     CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         firstname VARCHAR(255) NOT NULL,
//         lastname VARCHAR(255) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         martial_art VARCHAR(255),
//         username VARCHAR(255) UNIQUE NOT NULL,
//         password TEXT NOT NULL,
//         isAdmin BOOLEAN DEFAULT FALSE
//     );
// `;

// async function initializeDatabase(client: Pool): Promise<void> {
// 	let conn: PoolClient | null = null;

// 	try {
// 		conn = await client.connect();
// 		await conn.query(createUserTableSQL);
// 		console.log('Database schema initialized successfully.');
// 	} catch (error) {
// 		console.error(`Database initialization failed: ${error.message}`);
// 		throw error;
// 	} finally {
// 		if (conn) {
// 			conn.release();
// 		}
// 	}
// }

let client = new Pool();

if (ENV === 'dev') {
	client = new Pool({
		host: POSTGRES_HOST,
		database: POSTGRES_DB,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		port: Number(DB_PORT),
	});
} else if (ENV === 'test') {
	client = new Pool({
		host: POSTGRES_HOST,
		database: POSTGRES_DB_TEST,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		port: Number(DB_TEST_PORT),
	});
} else if (ENV === 'prod') {
	client = new Pool({
		host: POSTGRES_HOST,
		database: POSTGRES_DB_PROD,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		port: Number(DB_PORT),
	});
} else {
	throw new Error(`Invalid ENV value: ${ENV}`);
}

// initializeDatabase(client).catch((error) => {
// 	console.error('Failed to initialize database schema:', error);
// 	process.exit(1);
// });

export default client;
