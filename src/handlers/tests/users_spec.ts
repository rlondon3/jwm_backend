import supertest from 'supertest';
import app from '../../server';
import dotenv from 'dotenv';

dotenv.config();

const request = supertest(app);

describe('User Handler', () => {
	describe('Test user handler endpoint', () => {
		let token: string;
		it('POST should create a user', async () => {
			const res = await request
				.post('/create/user')
				.send({
					firstname: 'Test',
					lastname: 'Tester',
					age: 32,
					city: 'Sacrament',
					country: 'USA',
					email: 'test@test.com',
					martial_art: 'test',
					username: 'testieT',
					password: 'Test1234!',
					isAdmin: false,
					subscription_start: new Date(),
					subscription_end: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					progress: 0,
					active: true,
					subscription_tier: 0,
				})
				.set('Accepted', 'application/json');
			token = 'Bearer ' + res.body;
			expect(res.status).toEqual(200);
		});
		it('should verify Users with Authentication Token', async () => {
			const res = await request
				.post('/verify/users')
				.set('Authorization', token);
			expect(res.status).toEqual(200);
		});
		it('should verify user with authentication token and get user by id', async () => {
			const res = await request
				.post('/verify/user/1')
				.set('Authorization', token);
			expect(res.status).toEqual(200);
		});
		it('should update the user', async () => {
			const res = await request
				.put('/user/1')
				.set('Authorization', token)
				.send({
					firstname: 'Test',
					lastname: 'Tester',
					age: 30,
					city: 'Boston',
					country: 'USA',
					email: 'test@test.com',
					martial_art: 'test',
					username: 'testieTs',
					password: 'Test1234!',
					isAdmin: false,
					subscription_start: new Date(),
					subscription_end: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					progress: 0,
					active: true,
					subscription_tier: 0,
				})
				.set('Accepted', 'application/json');
			expect(res.status).toEqual(200);
		});
		it('should fail with incorrect login(authentication)', async () => {
			const res = await request
				.post('/user/authenticate')
				.send({
					username: 'testie',
					password: 'Test123',
				})
				.set('Accepted', 'application/json');
			expect(res.status).toEqual(400);
		});
		it('should delete the user', async () => {
			const res = await request
				.delete('/user/1')
				.set('Authorization', token)
				.set('Accepted', 'application/json');
			expect(res.status).toEqual(200);
		});
	});
});
