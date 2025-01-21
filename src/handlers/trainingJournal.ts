import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { authenticationToken } from '../services/authenticate';
import {
	TrainingEntry,
	TrainingJournalStore,
	validateTrainingEntry,
} from '../models/trainingEntry';
import { User } from '../models/user';

dotenv.config();
const store = new TrainingJournalStore();

interface AuthRequest extends Request {
	user: User;
}

const index = async (req: AuthRequest, res: Response) => {
	try {
		const entries = await store.getEntriesByUserId(req.user?.id as number);
		return res.status(200).json(entries);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const show = async (req: AuthRequest, res: Response) => {
	try {
		const entry = await store.getEntryById(parseInt(req.params.id));
		if (entry.user_id !== req.user?.id) {
			return res
				.status(403)
				.json({ error: 'User ID does not match entry owner' });
		}
		return res.status(200).json(entry);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const create = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: 'User not authenticated' });
	}
	const entry: TrainingEntry = {
		user_id: req.user.id as number,
		practice_date: new Date(req.body.practice_date),
		practice_type: req.body.practice_type,
		session_duration: req.body.session_duration,
		content: req.body.content,
		reflection: req.body.reflection,
	};

	try {
		await validateTrainingEntry(entry);
		const newEntry = await store.create(entry);
		return res.status(201).json(newEntry);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};

const update = async (req: AuthRequest, res: Response) => {
	try {
		const existingEntry = await store.getEntryById(parseInt(req.params.id));
		if (existingEntry.user_id !== req.user?.id) {
			return res
				.status(403)
				.json({ error: 'User ID does not match entry owner' });
		}

		const entry: TrainingEntry = {
			id: parseInt(req.params.id),
			user_id: req.user?.id as number,
			practice_date: new Date(req.body.practice_date),
			practice_type: req.body.practice_type,
			session_duration: req.body.session_duration,
			content: req.body.content,
			reflection: req.body.reflection,
		};

		await validateTrainingEntry(entry);
		const updatedEntry = await store.update(entry);
		return res.status(200).json(updatedEntry);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};

const deleteEntry = async (req: AuthRequest, res: Response) => {
	try {
		const existingEntry = await store.getEntryById(parseInt(req.params.id));
		if (existingEntry.user_id !== req.user?.id) {
			return res
				.status(403)
				.json({ error: 'User ID does not match entry owner' });
		}

		const deletedEntry = await store.delete(
			parseInt(req.params.id),
			req.user?.id as number
		);
		return res.status(200).json(deletedEntry);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const trainingJournalRoutes = (app: express.Application) => {
	app.get('/journal/entries', authenticationToken, index);
	app.get('/journal/entries/:id', authenticationToken, show);
	app.post('/journal/entries', authenticationToken, create);
	app.put('/journal/entries/:id', authenticationToken, update);
	app.delete('/journal/entries/:id', authenticationToken, deleteEntry);
};

export default trainingJournalRoutes;
