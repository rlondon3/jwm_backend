import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Chapter, ChapterStore, handleChapterErrors } from 'src/models/chapter';

dotenv.config();
const store = new ChapterStore();

const index = async (_req: Request, res: Response) => {
	try {
		const chapter = await store.index();
		return res.status(200).json(chapter);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const show = async (req: Request, res: Response) => {
	try {
		const chapter = await store.show(parseInt(req.params.id));
		return res.status(200).json(chapter);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const create = async (req: Request, res: Response) => {
	const chapter: Chapter = {
		ebook_id: req.body.ebook_id,
		user_id: req.body.user_id,
		title: req.body.title,
		chapter_number: req.body.chapter_number,
		content: req.body.content,
	};

	try {
		await handleChapterErrors(chapter);

		return res.status(200).json(chapter);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};
const update = async (req: Request, res: Response) => {
	const chapter: Chapter = {
		id: parseInt(req.params.id),
		ebook_id: req.body.ebook_id,
		user_id: req.body.user_id,
		title: req.body.title,
		chapter_number: req.body.chapter_number,
		content: req.body.content,
	};
	try {
		await handleChapterErrors(chapter);

		return res.status(200).json(chapter);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};
const deletes = async (req: Request, res: Response) => {
	try {
		const deletedChapter = await store.delete(parseInt(req.params.id));
		return res.status(200).json(deletedChapter);
	} catch (error) {
		return res.status(400).json(error);
	}
};
const chaptersByUser = async (req: Request, res: Response) => {
	try {
		const chapterByUser = await store.getChaptersByUserId(
			parseInt(req.params.id)
		);
		if (chapterByUser === null) {
			throw new Error('No chapters for user!');
		} else {
			return res.status(200).json(chapterByUser);
		}
	} catch (error) {
		return res.status(400).json(error);
	}
};

const chaptersRoute = (app: express.Application) => {
	app.post('/chapters', index);
	app.post('/chapters/:id', show);
	app.post('/create/chapter', create);
	app.put('/chapter/:id', update);
	app.delete('/chapter/:id', deletes);
	app.post('/chapter/user', chaptersByUser);
};

export default chaptersRoute;
