"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const server_1 = tslib_1.__importDefault(require("../../server"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const request = (0, supertest_1.default)(server_1.default);
describe('User Handler', () => {
    describe('Test user handler endpoint', () => {
        let token;
        let userId;
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
                subscription_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                progress: 0,
                active: true,
                subscription_tier: 0,
            })
                .set('Accepted', 'application/json');
            token = 'Bearer ' + res.body;
            const decoded = jsonwebtoken_1.default.decode(res.body);
            userId = decoded.user.id;
            expect(userId).toBeDefined();
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
                .post(`/verify/user/${userId}`)
                .set('Authorization', token);
            expect(res.status).toEqual(200);
        });
        it('should update the user', async () => {
            const res = await request
                .put(`/user/${userId}`)
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
                subscription_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
                .delete(`/user/${userId}`)
                .set('Authorization', token)
                .set('Accepted', 'application/json');
            expect(res.status).toEqual(200);
        });
    });
});
//# sourceMappingURL=users_spec.js.map