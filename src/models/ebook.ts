import client from '../database';
import { PoolClient } from 'pg';
import { object, string, number, boolean, array } from 'yup';

export type Ebook = {
	id?: number;
	title: string;
	chapter_count: number;
	chapters: Array<Chapter>;
	interactive_content: boolean;
	ai: boolean;
};

export type Chapter = {
	title: string;
	chapter_number: number;
	content: string;
};

export class EbookStore {
	async index(): Promise<Ebook[]> {
		try {
			const sql = 'SELECT * FROM ebooks;';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql);
			conn.release();
			return res.rows;
		} catch (error) {
			throw new Error(`Can't retrieve Ebook: ${error}`);
		}
	}
	async show(id: number): Promise<Ebook> {
		try {
			const sql = 'SELECT * FROM ebooks WHERE id=($1);';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Can't find Ebook: ${error}`);
		}
	}
	async create(ebook: Ebook): Promise<Ebook> {
		try {
			const conn: PoolClient = await client.connect();
			const sql =
				'INSERT INTO ebooks (title, chapter_count, chapters, interactive_content, ai) VALUES ($1, $2, $3, $4, $5) RETURNING *';
			const res = await conn.query(sql, [
				ebook.title,
				ebook.chapter_count,
				ebook.chapters,
				ebook.interactive_content,
				ebook.ai,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not Ebook user" ${error}`);
		}
	}
	// tslint:disable-next-line: no-unused-variable
	async update(ebook: Ebook, _id?: number): Promise<Ebook> {
		try {
			const sql =
				'UPDATE ebooks SET title=($1), chapter_count=($2), chapters=($3), interactive_content=($4), ai=($5) WHERE id=($6) RETURNING *';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [
				ebook.title,
				ebook.chapter_count,
				ebook.chapters,
				ebook.interactive_content,
				ebook.ai,
				ebook.id,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not update Ebook: ${error}`);
		}
	}
	async delete(id: number): Promise<Ebook> {
		try {
			const sql = 'DELETE FROM ebooks WHERE id=($1);';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not delete Ebook: ${error}`);
		}
	}
}

export function handleUserErrors(ebook: Ebook) {
	let userSchema = object({
		title: string().required(),
		chapter_count: number().required(),
		chapters: array()
			.of(
				object({
					title: string().required(),
					chapter_number: number().required().positive().integer(),
					content: string().required(),
				})
			)
			.required(),
		interactive_content: boolean().default(false),
		ai: boolean().default(false),
	});
	return userSchema.validate(ebook);
}
