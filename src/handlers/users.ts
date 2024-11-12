import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { User, UserStore, handleUserErrors } from '../models/user';
import jwt from 'jsonwebtoken';
import {
	authenticationToken,
	authenticateUserId,
} from '../services/authenticate';

dotenv.config();

const store = new UserStore();

const index = async (_req: Request, res: Response) => {
	try {
		const user = await store.index();
		return res.status(200).json(user);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const show = async (req: Request, res: Response) => {
	try {
		const user = await store.show(parseInt(req.params.id));
		return res.status(200).json(user);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const create = async (req: Request, res: Response) => {
	const user: User = {
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		age: req.body.age,
		city: req.body.city,
		country: req.body.country,
		email: req.body.email,
		martial_art: req.body.martial_art,
		username: req.body.username,
		password: req.body.password,
		isAdmin: req.body.isAdmin,
		subscription_start: req.body.subscription_start,
		subscription_end: req.body.subscription_end,
		progress: req.body.progress,
		active: req.body.active,
		subscription_tier: req.body.subscription_tier,
	};

	try {
		await handleUserErrors(user);

		const emailExists = await store.emailExists(user.email);
		const usernameExists = await store.usernameExists(user.username);

		if (emailExists) {
			return res.status(400).json({ error: 'Email already exists!' });
		}

		if (usernameExists) {
			return res.status(400).json({ error: 'Username already exists!' });
		}
		const newUser = await store.create(user);
		const token = jwt.sign(
			{
				user: newUser,
			},
			`${process.env.TOKEN_SECRET}` as jwt.Secret
		);

		return res.status(200).json(token);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};

const update = async (req: Request, res: Response) => {
	const user: User = {
		id: parseInt(req.params.id),
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		age: req.body.age,
		city: req.body.city,
		country: req.body.country,
		email: req.body.email,
		martial_art: req.body.martial_art,
		username: req.body.username,
		password: req.body.password,
		isAdmin: req.body.isAdmin,
		subscription_start: req.body.subscription_start,
		subscription_end: req.body.subscription_end,
		progress: req.body.progress,
		active: req.body.active,
		subscription_tier: req.body.subscription_tier,
	};
	try {
		await handleUserErrors(user);

		const updates = await store.update(user);
		const token = jwt.sign(
			{
				user: updates,
			},
			`${process.env.TOKEN_SECRET}` as jwt.Secret
		);
		return res.status(200).json(token);
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: error.message });
	}
};

const deletes = async (req: Request, res: Response) => {
	try {
		const deleteUser = await store.delete(parseInt(req.params.id));
		return res.status(200).json(deleteUser);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const authenticate = async (req: Request, res: Response) => {
	try {
		const authUser = await store.authenticate(
			req.body.username,
			req.body.password
		);
		if (authUser === null) {
			throw new Error('Not Authorized!');
		} else {
			const token = jwt.sign(
				{
					user: authUser,
				},
				`${process.env.TOKEN_SECRET}` as jwt.Secret
			);
			return res.status(200).json(token);
		}
	} catch (error) {
		return res.status(400).json(error);
	}
};

const users_route = (app: express.Application) => {
	app.post('/verify/users', authenticationToken, index);
	app.post('/verify/user/:id', authenticationToken, show);
	app.post('/create/user', create);
	app.put('/user/:id', authenticateUserId, update);
	app.delete('/user/:id', authenticateUserId, deletes);
	app.post('/user/authenticate', authenticate);
};

export default users_route;
