"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = tslib_1.__importDefault(require("supertest"));
const server_1 = tslib_1.__importDefault(require("../../server"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const request = (0, supertest_1.default)(server_1.default);
const { SPEC_PASSWORD } = process.env;
describe('POST: Test user endpoint', () => {
    let token;
    let userId;
    it('POST: Test should create a user', async () => {
        const resp = await request
            .post('/create/user')
            .send({
            firstname: 'Ralph',
            lastname: 'London',
            age: 30,
            city: 'Atlanta',
            country: 'USA',
            email: 'rLondo@store.com',
            martial_art: 'Taijiquan',
            username: 'taichithumper',
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
        const decoded = jsonwebtoken_1.default.decode(resp.body);
        userId = decoded.user.id;
        expect(userId).toBeDefined();
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
            .post(`/verify/user/${userId}`)
            .set('Authorization', token);
        expect(resp.body.username).toEqual('taichithumper');
    });
    it('PUT: Should update the user', async () => {
        const resp = await request
            .put(`/user/${userId}`)
            .set('Authorization', token)
            .send({
            firstname: 'Ralphie',
            lastname: 'London',
            age: 30,
            city: 'Atlanta',
            country: 'USA',
            email: 'rLondo@store.com',
            martial_art: 'Baguazhang',
            username: 'taichithumper',
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
        expect(resp.body.user.firstname).toEqual('Ralphie');
    });
    it('AUTHENTICATE: Authentication should fail', async () => {
        const resp = await request
            .post('/user/authenticate')
            .send({
            username: 'test_user5',
            password: SPEC_PASSWORD,
        })
            .set('Accepted', 'application/json');
        expect(resp.status).toBe(400);
    });
    it('DELETE: Tests deletion of user', async () => {
        const resp = await request
            .delete(`/user/${userId}`)
            .set('Authorization', token)
            .set('Accepted', 'application/json');
        expect(resp.status).toBe(200);
    });
});
//# sourceMappingURL=userRoutes_spec.js.map