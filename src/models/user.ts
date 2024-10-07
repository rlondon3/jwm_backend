import client from '../database';
import { PoolClient } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import * as yup from 'yup';
import { object, string, number, boolean, date } from 'yup';

dotenv.config();

const { SALT_ROUNDS, PEPPER } = process.env;
export type User = {
	id?: number;
	firstname: string;
	lastname: string;
	age: number;
	city: string;
	country: string;
	email: string;
	martial_art: string;
	username: string;
	password: string;
	isAdmin: boolean;
	subscription_start: Date;
	subscription_end: Date;
	progress: number;
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
				'INSERT INTO users (firstname, lastname, age, city, country, email, martial_art, username, password, isAdmin, subscription_start, subscription_end, progress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
			const hash = bcrypt.hashSync(
				user.password + `${PEPPER}.processs.env`,
				parseInt(`${SALT_ROUNDS}.process.env` as string)
			);
			const res = await conn.query(sql, [
				user.firstname,
				user.lastname,
				user.age,
				user.city,
				user.country,
				user.email,
				user.martial_art,
				user.username,
				hash,
				user.isAdmin,
				user.subscription_start,
				user.subscription_end,
				user.progress,
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
				'UPDATE users SET firstname=($1), lastname=($2), age=($3), city=($4), country=($5), email=($6), martial_art=($7), username=($8), password=($9), isAdmin=($10), subscription_start=($11), subscription_end=($12), progress=($13) WHERE id=($14) RETURNING *';
			const conn: PoolClient = await client.connect();
			const hash = bcrypt.hashSync(
				user.password + `${PEPPER}`,
				parseInt(`${SALT_ROUNDS}` as unknown as string)
			);
			const res = await conn.query(sql, [
				user.firstname,
				user.lastname,
				user.age,
				user.city,
				user.country,
				user.email,
				user.martial_art,
				user.username,
				hash,
				user.isAdmin,
				user.subscription_start,
				user.subscription_end,
				user.progress,
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

export function handleUserErrors(user: User) {
	let userSchema = object({
		firstname: string().required(),
		lastname: string().required(),
		age: number().required().positive().integer(),
		city: string().required(),
		country: string().required(),
		email: string().email(),
		martial_art: string().required(),
		password: string()
			.required()
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
				'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character'
			),
		isAdmin: boolean().default(false),
		subscription_start: date().required(),
		subscription_end: date()
			.required()
			.min(
				yup.ref('subscription_start'),
				'Subscription end date must be after the start date.'
			),
		progress: number().min(0).max(100).required(),
	});
	return userSchema.validate(user);
}
