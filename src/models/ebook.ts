import client from '../database';
import { PoolClient } from 'pg';
import { object, string, number, array } from 'yup';
import { Chapter, ChapterStore } from './chapter';

export type Ebook = {
	id?: number;
	title: string;
	chapter_count: number;
	chapters: Chapter;
};

export class EbookStore {
	private chapterStore = new ChapterStore();

	async showWithChapters(id: number): Promise<Ebook & { chapters: Chapter }> {
		try {
			const ebookSql = 'SELECT * FROM ebooks WHERE id=$1;';
			const chaptersSql = 'SELECT * FROM chapters WHERE ebook_id=$1;';
			const conn: PoolClient = await client.connect();

			// Fetch ebook
			const ebookRes = await conn.query(ebookSql, [id]);
			const ebook = ebookRes.rows[0];

			// Fetch associated chapters
			const chaptersRes = await conn.query(chaptersSql, [id]);
			const chapters = chaptersRes.rows;

			conn.release();

			// Return the ebook along with its chapters
			return { ...ebook, chapters };
		} catch (error) {
			throw new Error(`Could not fetch ebook with chapters: ${error}`);
		}
	}

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
				'INSERT INTO ebooks (title, chapter_count, chapters) VALUES ($1, $2, $3) RETURNING *';
			const res = await conn.query(sql, [
				ebook.title,
				ebook.chapter_count,
				ebook.chapters,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not create Ebook: ${error}`);
		}
	}
	// tslint:disable-next-line: no-unused-variable
	async update(ebook: Ebook, _id?: number): Promise<Ebook> {
		try {
			const sql =
				'UPDATE ebooks SET title=($1), chapter_count=($2), chapters=($3) WHERE id=($4) RETURNING *';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [
				ebook.title,
				ebook.chapter_count,
				ebook.chapters,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not update Ebook: ${error}`);
		}
	}
	async updateChapterCount(ebook_id: number): Promise<void> {
		try {
			const chapterCount = await this.chapterStore.getChapterCount(ebook_id);

			const sql = 'UPDATE ebooks SET chapter_count = $1 WHERE id = $2';
			const conn: PoolClient = await client.connect();
			await conn.query(sql, [chapterCount, ebook_id]);
			conn.release();
		} catch (error) {
			throw new Error(
				`Could not update chapter count for ebook ${ebook_id}: ${error}`
			);
		}
	}
	async delete(id: number): Promise<Ebook> {
		try {
			const sql = 'DELETE FROM ebooks WHERE id=($1) RETURNING *;';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not delete Ebook: ${error}`);
		}
	}
}

export function handleEbookErrors(ebook: Ebook) {
	let ebookSchema = object({
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
	});
	return ebookSchema.validate(ebook);
}
