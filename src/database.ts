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
	ENV,
} = process.env;

console.log(`Environment is currently running in ${ENV} mode...`);

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
		port: Number(DB_PORT),
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

export default client;
