import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';

dotenv.config();

interface AuthRequest extends Request {
	user: User;
}

interface TokenInterface {
	user: User;
	iat: number;
}
export const authenticationToken = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	try {
		const authHead = req.headers.authorization;
		const token = (authHead as string).split(' ')[1];
		const decoded = jwt.verify(
			token,
			`${process.env.TOKEN_SECRET}` as jwt.Secret
		);

		req.user = (decoded as TokenInterface).user;

		next();
	} catch (error) {
		res.status(400);
		res.json(`Not authorized: ${error}`);
	}
};

export const authenticateUserId = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		const authHead = req.headers.authorization;
		const token = (authHead as string).split(' ')[1];
		const decoded = jwt.verify(
			token,
			`${process.env.TOKEN_SECRET}` as jwt.Secret
		);
		const id = (decoded as TokenInterface).user.id;
		if (id !== parseInt(req.params.id)) {
			throw new Error('ID is invalid!');
		}
		next();
	} catch (error) {
		res.status(401);
		res.json(error);
		return;
	}
};
