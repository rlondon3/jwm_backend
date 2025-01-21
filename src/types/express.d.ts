import { User } from '../models/user';

console.log('Custom types loaded');

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}
