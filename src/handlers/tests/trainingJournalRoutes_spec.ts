import supertest from 'supertest';
import app from '../../server';
import dotenv from 'dotenv';
dotenv.config();

const request = supertest(app);
const { SPEC_PASSWORD } = process.env;

describe('Training Journal Endpoints', () => {
	let token: string;
	let entryId: number;

	beforeAll(async () => {
		const userResp = await request.post('/create/user').send({
			firstname: 'Ralph',
			lastname: 'London',
			age: 30,
			city: 'Atlanta',
			country: 'USA',
			email: 'jounralGuy@store.com',
			martial_art: 'Taijiquan',
			username: 'journalGuy',
			password: SPEC_PASSWORD,
			isAdmin: false,
			subscription_start: '2024-11-12T00:00:00.000Z',
			subscription_end: '2025-11-12T00:00:00.000Z',
			progress: 0,
			active: true,
			subscription_tier: 0,
		});
		token = 'Bearer ' + userResp.body;
	});

	it('POST: Should create a training entry', async () => {
		const resp = await request
			.post('/journal/entries')
			.set('Authorization', token)
			.send({
				practice_date: '2024-01-20T00:00:00.000Z',
				practice_type: 'solo',
				session_duration: 30,
				content: 'Practiced seated meditation focusing on releasing tension.',
				reflection: 'Found difficulty in maintaining empty shoulders.',
			})
			.set('Accept', 'application/json');

		expect(resp.status).toBe(201);
		entryId = resp.body.id;
	});

	it('GET: Should retrieve all entries for user', async () => {
		const resp = await request
			.get('/journal/entries')
			.set('Authorization', token);

		expect(resp.status).toBe(200);
		expect(Array.isArray(resp.body)).toBeTruthy();
		expect(resp.body.length).toBeGreaterThan(0);
	});

	it('GET: Should retrieve specific entry', async () => {
		const resp = await request
			.get(`/journal/entries/${entryId}`)
			.set('Authorization', token);

		expect(resp.status).toBe(200);
		expect(resp.body.id).toBe(entryId);
	});

	it('PUT: Should update an entry', async () => {
		const resp = await request
			.put(`/journal/entries/${entryId}`)
			.set('Authorization', token)
			.send({
				practice_date: '2024-01-20T00:00:00.000Z',
				practice_type: 'solo',
				session_duration: 45, // Updated duration
				content: 'Practiced seated meditation focusing on releasing tension.',
				reflection: 'Made progress with shoulder emptiness after 30 minutes.',
			});

		expect(resp.status).toBe(200);
		expect(resp.body.session_duration).toBe(45);
		expect(resp.body.reflection).toContain('Made progress');
	});

	// it('Should enforce subscription tier limits', async () => {
	// 	const promises = Array(6)
	// 		.fill(null)
	// 		.map(() =>
	// 			request.post('/journal/entries').set('Authorization', token).send({
	// 				practice_date: '2024-01-20T00:00:00.000Z',
	// 				practice_type: 'solo',
	// 				session_duration: 30,
	// 				content: 'Test entry',
	// 				reflection: 'Test reflection',
	// 			})
	// 		);

	// 	const responses = await Promise.all(promises);
	// 	const lastResponse = responses[responses.length - 1];
	// 	expect(lastResponse.status).toBe(403);
	// 	expect(lastResponse.body.error).toContain('Free tier limited');
	// });

	it('DELETE: Should delete an entry', async () => {
		const resp = await request
			.delete(`/journal/entries/${entryId}`)
			.set('Authorization', token);

		expect(resp.status).toBe(200);
		expect(resp.body.id).toBe(entryId);
	});

	afterAll(async () => {
		await request
			.delete('/user/1')
			.set('Authorization', token)
			.set('Accepted', 'application/json');
	});
});
