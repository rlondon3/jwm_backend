import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Ebook, EbookStore, handleEbookErrors } from '../models/ebook';

dotenv.config();

const store = new EbookStore();

const index = async (_req: Request, res: Response) => {
	try {
		const ebook = await store.index();
		return res.status(200).json(ebook);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const show = async (req: Request, res: Response) => {
	try {
		const ebook = await store.show(parseInt(req.params.id));
		return res.status(200).json(ebook);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const create = async (req: Request, res: Response) => {
	const ebook: Ebook = {
		title: req.body.title,
		chapter_count: req.body.chapter_count,
		chapters: req.body.chapters,
	};

	try {
		await handleEbookErrors(ebook);

		return res.status(200).json(ebook);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};

const update = async (req: Request, res: Response) => {
	const ebook: Ebook = {
		id: parseInt(req.params.id),
		title: req.body.title,
		chapter_count: req.body.chapter_count,
		chapters: req.body.chapters,
	};
	try {
		await handleEbookErrors(ebook);

		return res.status(200).json(ebook);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};

const deletes = async (req: Request, res: Response) => {
	try {
		const deletedEbook = await store.delete(parseInt(req.params.id));
		return res.status(200).json(deletedEbook);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const showWithChapters = async (req: Request, res: Response) => {
	try {
		const ebookWithChapters = await store.showWithChapters(
			parseInt(req.params.id)
		);
		if (ebookWithChapters === null) {
			throw new Error('No Content created!');
		} else {
			return res.status(200).json(ebookWithChapters);
		}
	} catch (error) {
		return res.status(400).json(error);
	}
};

const usersRoute = (app: express.Application) => {
	app.post('/ebooks', index);
	app.post('/ebooks/:id', show);
	app.post('/create/ebook', create);
	app.put('/ebook/:id', update);
	app.delete('/ebook/:id', deletes);
	app.post('/ebook/chapters', showWithChapters);
};

export default usersRoute;
