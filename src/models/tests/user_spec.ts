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
	subscription_start: new Date(),
	subscription_end: new Date(
		new Date().setFullYear(new Date().getFullYear() + 1)
	), // One year from start
	progress: 0,
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
	it('should fail for subscription_end before subscription_start', async () => {
		// Set subscription_end to a past date before subscription_start
		test_user.subscription_end = new Date('2020-01-01');
		await handleUserErrors(test_user).catch((err) => {
			expect(err.errors[0]).toContain(
				'Subscription end date must be after the start date'
			);
		});
	});

	it('should fail for progress out of range', async () => {
		// Set progress to an invalid value (e.g., 110)
		test_user.progress = 110;
		await handleUserErrors(test_user).catch((err) => {
			expect(err.errors).toContain(
				'progress must be less than or equal to 100'
			);
		});
	});
});

describe('UserStore password hash', () => {
	it('should hash the password correctly', async () => {
		const user: User = {
			...test_user,
			password: 'TestPassword123!',
		};

		const hashedPassword = bcrypt.hashSync(
			user.password + process.env.PEPPER,
			parseInt(process.env.SALT_ROUNDS as string)
		);
		const isMatch = bcrypt.compareSync(
			'TestPassword123!' + process.env.PEPPER,
			hashedPassword
		);
		expect(isMatch).toBeTrue();
	});
});
