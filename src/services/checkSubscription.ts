import { TrainingJournalStore } from '../models/trainingEntry';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';

const store = new TrainingJournalStore();

interface AuthRequest extends Request {
	user?: User;
}

export const checkSubscriptionAccess = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		if (!req.user?.active) {
			res.status(403).json({ error: 'Subscription is not active' });
			return;
		}

		const subscriptionEnd = new Date(req.user.subscription_end);
		if (subscriptionEnd < new Date()) {
			res.status(403).json({ error: 'Subscription has expired' });
			return;
		}

		const { subscription_tier } = req.user;
		const now = new Date();
		const entries = await store.getEntriesForMonth(req.user.id, now);

		switch (subscription_tier) {
			case 0: // Free tier
				if (entries.length >= 5) {
					res
						.status(403)
						.json({ error: 'Free tier limited to 5 entries per month' });
					return;
				}
				break;
			case 1: // Basic tier
				if (entries.length >= 20) {
					res
						.status(403)
						.json({ error: 'Basic tier limited to 20 entries per month' });
					return;
				}
				break;
			case 2: // Full tier
				break;
			default:
				res.status(403).json({ error: 'Invalid subscription tier' });
				return;
		}

		next();
	} catch (error) {
		res.status(500).json({ error: error.message });
		return;
	}
};
