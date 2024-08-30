import client from '../database';
import { PoolClient } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const { SALT_ROUNDS, PEPPER } = process.env;
export type User = {
	id?: number;
	firstname: string;
	lastname: string;
	email: string;
	martial_art: string;
	username: string;
	password: string;
	isAdmin: boolean;
};

export class UserStore {
	async index(): Promise<User[]> {
		try {
			const sql = 'SELECT * FROM users;';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql);
			conn.release();
			return res.rows;
		} catch (error) {
			throw new Error(`Can't retrieve users: ${error}`);
		}
	}
	async show(id: number): Promise<User> {
		try {
			const sql = 'SELECT * FROM users WHERE id=($1);';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Can't find user: ${error}`);
		}
	}
	async create(user: User): Promise<User> {
		try {
			const conn: PoolClient = await client.connect();
			const sql =
				'INSERT INTO users (firstname, lastname, email, martial_art, username, password, isAdmin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
			const hash = bcrypt.hashSync(
				user.password + `${PEPPER}.processs.env`,
				parseInt(`${SALT_ROUNDS}.process.env` as string)
			);
			const res = await conn.query(sql, [
				user.firstname,
				user.lastname,
				user.email,
				user.martial_art,
				user.username,
				hash,
				user.isAdmin,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not add user" ${error}`);
		}
	}
	// tslint:disable-next-line: no-unused-variable
	async update(user: User, _id?: number): Promise<User> {
		try {
			const sql =
				'UPDATE users SET firstname=($1), lastname=($2), email=($3), martial_art=($4), username=($5), password=($6), isAdmin=($7) WHERE id=($8) RETURNING *';
			const conn: PoolClient = await client.connect();
			const hash = bcrypt.hashSync(
				user.password + `${PEPPER}`,
				parseInt(`${SALT_ROUNDS}` as unknown as string)
			);
			const res = await conn.query(sql, [
				user.firstname,
				user.lastname,
				user.email,
				user.martial_art,
				user.username,
				hash,
				user.isAdmin,
				user.id,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not update user: ${error}`);
		}
	}
	async delete(id: number): Promise<User> {
		try {
			const sql = 'DELETE FROM users WHERE id=($1);';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not delete user: ${error}`);
		}
	}
	async authenticate(username: string, password: string): Promise<User | null> {
		try {
			const sql = 'SELECT * FROM users WHERE username=($1)';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [username]);
			if (res.rows.length) {
				bcrypt.compareSync(password + `${PEPPER}`, res.rows[0].password);
				return res.rows[0];
			}
			return null;
		} catch (error) {
			throw new Error(`Could not authenticate: ${error}`);
		}
	}
	async emailExists(email: string): Promise<boolean> {
		const conn: PoolClient = await client.connect();
		try {
			const sql = 'SELECT COUNT(*) FROM users WHERE email = $1';
			const res = await conn.query(sql, [email]);
			if (res.rows) {
				return parseInt(res.rows[0].count) > 0;
			}
			return false;
		} finally {
			conn.release();
		}
	}

	async usernameExists(username: string): Promise<boolean> {
		const conn: PoolClient = await client.connect();

		try {
			const sql = 'SELECT COUNT(*) FROM users WHERE username = $1';
			const res = await conn.query(sql, [username]);
			if (res.rows) {
				return parseInt(res.rows[0].count) > 0;
			}
			return false;
		} finally {
			conn.release();
		}
	}
}
