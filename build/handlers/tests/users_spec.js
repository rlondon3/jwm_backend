"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const server_1 = tslib_1.__importDefault(require("../../server"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const request = (0, supertest_1.default)(server_1.default);
describe('User Handler', () => {
    describe('Test user handler endpoint', () => {
        let token;
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
//# sourceMappingURL=users_spec.js.map