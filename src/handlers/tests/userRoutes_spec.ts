import supertest from 'supertest';
import app from '../../server';
import dotenv from 'dotenv';

dotenv.config();

const request = supertest(app);

const { SPEC_USER, SPEC_PASSWORD } = process.env;

describe('POST: Test user endpoint', () => {
	let token: string;
	it('POST: Test should create a user', async () => {
		const resp = await request
			.post('/create/user')
			.send({
				firstname: 'Ralph',
				lastname: 'London',
				age: 30,
				city: 'Atlanta',
				country: 'USA',
				email: 'ralphieLondon@store.com',
				martial_art: 'Taijiquan',
				username: SPEC_USER,
				password: SPEC_PASSWORD,
				isAdmin: false,
				subscription_start: '2024-11-12T00:00:00.000Z',
				subscription_end: '2025-11-12T00:00:00.000Z',
				progress: 0,
				active: true,
				subscription_tier: 0,
			})
			.set('Accepted', 'application/json');
		token = 'Bearer ' + resp.body;
		expect(resp.status).toEqual(200);
	});
	it('POST: Verify tokens of users', async () => {
		const resp = await request
			.post('/verify/users')
			.set('Authorization', token);
		expect(resp.status).toEqual(200);
	});
	it('POST: Verify token of user', async () => {
		const resp = await request
			.post('/verify/users/1')
			.set('Authorization', token);
		expect(resp.body.username).toEqual('test_user');
	});
	it('PUT: Should update the user', async () => {
		const resp = await request
			.put('/users/1')
			.set('Authorization', token)
			.send({
				firstname: 'Ralphie',
				lastname: 'London',
				age: 30,
				city: 'Atlanta',
				country: 'USA',
				email: 'ralphieLondon@store.com',
				martial_art: 'Baguazhang',
				username: SPEC_USER,
				password: SPEC_PASSWORD,
				isAdmin: false,
				subscription_start: '2024-11-12T00:00:00.000Z',
				subscription_end: '2025-11-12T00:00:00.000Z',
				progress: 0,
				active: true,
				subscription_tier: 0,
			})
			.set('Accepted', 'application/json');
		expect(resp.status).toEqual(200);
		expect(resp.body.firstname).toEqual('Ralphie');
	});
	it('AUTHENTICATE: Authentication should fail', async () => {
		const resp = await request
			.post('/users/authenticate')
			.send({
				username: 'test_user5',
				password: SPEC_PASSWORD as string,
			})
			.set('Accepted', 'application/json');
		expect(resp.status).toBe(400);
	});
	it('DELETE: Tests deletion of user', async () => {
		const resp = await request
			.delete('/users/1')
			.set('Authorization', token)
			.set('Accepted', 'application/json');
		expect(resp.status).toBe(200);
	});
});
