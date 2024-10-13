import client from '../database';
import { PoolClient } from 'pg';
import { object, string, number } from 'yup';
import { EbookStore } from './ebook';

export type Chapter = {
	id?: number;
	ebook_id: number;
	user_id: number; // Reference to the user
	title: string;
	chapter_number: number;
	content: string;
};

export class ChapterStore {
	private ebookStore = new EbookStore();

	async getChaptersByEbookId(ebook_id: number): Promise<Chapter[]> {
		try {
			const sql = 'SELECT * FROM chapters WHERE ebook_id=($1);';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [ebook_id]);
			conn.release();
			return res.rows;
		} catch (error) {
			throw new Error(`Can't retrieve chapters: ${error}`);
		}
	}
	async getChapterCount(ebook_id: number): Promise<number> {
		try {
			const sql = 'SELECT COUNT(*) FROM chapters WHERE ebook_id = $1';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [ebook_id]);
			conn.release();

			return parseInt(res.rows[0].count, 10); // Convert the count to a number
		} catch (error) {
			throw new Error(
				`Could not get chapter count for ebook ${ebook_id}: ${error}`
			);
		}
	}
	async show(id: number): Promise<Chapter> {
		try {
			const sql = 'SELECT * FROM chapters WHERE id=($1);';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Can't find chapter: ${error}`);
		}
	}
	async create(chapter: Chapter): Promise<Chapter> {
		try {
			const conn: PoolClient = await client.connect();
			const sql =
				'INSERT INTO chapters (ebook_id, user_id, title, chapter_number, content) VALUES ($1, $2, $3, $4, $5) RETURNING *';
			const res = await conn.query(sql, [
				chapter.ebook_id,
				chapter.user_id,
				chapter.title,
				chapter.chapter_number,
				chapter.content,
			]);
			conn.release();

			await this.ebookStore.updateChapterCount(chapter.ebook_id);

			return res.rows[0];
		} catch (error) {
			throw new Error(
				`Could not create chapter for user, "${chapter.user_id}": ${error}`
			);
		}
	}
	// tslint:disable-next-line: no-unused-variable
	async update(chapter: Chapter, _id?: number): Promise<Chapter> {
		try {
			const sql =
				'UPDATE chapters SET ebook_id=($1), user_id=($2), title=($3), chapter_number=($4), content=($5) WHERE id=($6) RETURNING *';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [
				chapter.ebook_id,
				chapter.user_id,
				chapter.title,
				chapter.chapter_number,
				chapter.content,
				chapter.id,
			]);
			conn.release();
			return res.rows[0];
		} catch (error) {
			throw new Error(`Could not update chapter: ${error}`);
		}
	}
	async delete(id: number): Promise<Chapter> {
		try {
			const sql = 'DELETE FROM chapters WHERE id=($1) RETURNING *;';
			const conn: PoolClient = await client.connect();
			const res = await conn.query(sql, [id]);
			conn.release();
			const deletedChapter = res.rows[0];

			await this.ebookStore.updateChapterCount(deletedChapter.ebook_id);

			return deletedChapter;
		} catch (error) {
			throw new Error(`Could not delete chapter: ${error}`);
		}
	}
}

export function handleChapterErrors(chapter: Chapter) {
	let chapterSchema = object({
		ebook_id: number().required(),
		user_id: number().required(),
		title: string().required(),
		chapter_number: number().required(),
		content: string().required(),
	});
	return chapterSchema.validate(chapter);
}

// CREATE TABLE chapters (
//     id SERIAL PRIMARY KEY,
//     ebook_id INT REFERENCES ebooks(id),
//     user_id INT REFERENCES users(id),  -- If chapters are unique to users
//     title VARCHAR(255),
//     chapter_number INT,
//     content TEXT
//  );
