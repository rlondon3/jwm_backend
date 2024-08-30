import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { User, UserStore } from '../models/user';
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
		res.json(user);
	} catch (error) {
		res.status(400);
		res.json(error);
	}
};

const show = async (req: Request, res: Response) => {
	try {
		const user = await store.show(parseInt(req.params.id));
		res.json(user);
	} catch (error) {
		res.status(400);
		res.json(error);
	}
};

const create = async (req: Request, res: Response) => {
	const user: User = {
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		martial_art: req.body.martial_art,
		username: req.body.username,
		password: req.body.password,
		isAdmin: req.body.isAdmin,
	};
	try {
		// Check if the email and username already exist
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

		return res.json(token);
	} catch (error) {
		return res.status(400).json(error);
	}
};

const update = async (req: Request, res: Response) => {
	const user: User = {
		id: parseInt(req.params.id),
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		martial_art: req.body.martial_art,
		username: req.body.username,
		password: req.body.password,
		isAdmin: req.body.isAdmin,
	};
	try {
		const updates = await store.update(user);
		const token = jwt.sign(
			{
				user: updates,
			},
			`${process.env.TOKEN_SECRET}` as jwt.Secret
		);
		res.status(200).json(token);
	} catch (error) {
		res.status(400);
		res.json(error);
	}
};

const deletes = async (req: Request, res: Response) => {
	try {
		const deleteUser = await store.delete(parseInt(req.params.id));
		res.json(deleteUser);
	} catch (error) {
		res.status(400);
		res.json(error);
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
			res.json(token);
		}
	} catch (error) {
		res.status(400);
		res.json(error);
	}
};

const users_route = (app: express.Application) => {
	app.post('/verify/users', authenticationToken, index);
	app.post('/verify/user/:id', authenticationToken, show);
	app.post('/create/user', create);
	app.put('/user/:id', authenticateUserId, update);
	app.delete('/useR/:id', authenticateUserId, deletes);
	app.post('/user/authenticate', authenticate);
};

export default users_route;
