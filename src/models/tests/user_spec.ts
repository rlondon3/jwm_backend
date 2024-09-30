import { UserStore, User, handleUserErrors } from '../user';
import bcrypt from 'bcrypt';

const store = new UserStore();

const test_user: User = {
	firstname: 'Ralphie',
	lastname: 'London',
	age: 30,
	city: 'Atlanta',
	country: 'USA',
	email: 'ralphieLondon@store.com',
	martial_art: 'baguazhang',
	username: 'boxer_123',
	password: 'Store1234!',
	isAdmin: false,
};

describe('UserStore Model', () => {
	it('should have an index method', () => {
		expect(store.index).toBeDefined();
	});

	it('should have a show method', () => {
		expect(store.show).toBeDefined();
	});

	it('should have a create method', () => {
		expect(store.create).toBeDefined();
	});

	it('should have an update method', () => {
		expect(store.update).toBeDefined();
	});

	it('should have a delete method', () => {
		expect(store.delete).toBeDefined();
	});

	it('should have an authenticate method', () => {
		expect(store.authenticate).toBeDefined();
	});
});

describe('User Validation', () => {
	it('should validate a correct user', async () => {
		const result = await handleUserErrors(test_user);
		expect(result).toBeDefined();
		expect(result.firstname).toEqual('Ralphie');
	});

	it('should fail for a user with invalid email', async () => {
		test_user.email = 'invalidEmail'; // Invalid email
		await handleUserErrors(test_user).catch((err) => {
			expect(err.errors).toContain('email must be a valid email');
		});
	});

	it('should fail for a password without complexity', async () => {
		test_user.password = 'simplepassword'; // Weak password
		await handleUserErrors(test_user).catch((err) => {
			expect(err.errors).toContain(
				'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character'
			);
		});
	});
});

describe('UserStore create method', () => {
	it('should hash the password correctly', async () => {
		const user: User = {
			...test_user,
			password: 'TestPassword123!',
		};

		const createdUser = await store.create(user);
		const isMatch = bcrypt.compareSync(
			'TestPassword123!' + process.env.PEPPER,
			createdUser.password
		);
		expect(isMatch).toBeTrue();
	});

	it('should add a user to the database', async () => {
		const user: User = {
			...test_user,
			username: 'new_user',
		};

		const createdUser = await store.create(user);
		expect(createdUser.username).toEqual('new_user');
	});

	it('should throw an error if email already exists', async () => {
		const user: User = { ...test_user };

		try {
			await store.create(user);
			await store.create(user); // Attempt to create the same user again
		} catch (err) {
			expect(err.message).toContain('Could not add user');
		}
	});
});

describe('UserStore authenticate method', () => {
	it('should authenticate a valid user', async () => {
		const result = await store.authenticate(
			test_user.username,
			test_user.password
		);
		expect(result).toBeDefined();
		expect(result?.username).toEqual(test_user.username);
	});

	it('should return null for invalid password', async () => {
		const result = await store.authenticate(
			test_user.username,
			'wrongpassword'
		);
		expect(result).toBeNull();
	});
});
