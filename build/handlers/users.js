"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const user_1 = require("../models/user");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const authenticate_1 = require("../services/authenticate");
dotenv_1.default.config();
const store = new user_1.UserStore();
const index = async (_req, res) => {
    try {
        const user = await store.index();
        res.json(user);
    }
    catch (error) {
        res.status(400);
        res.json(error);
    }
};
const show = async (req, res) => {
    try {
        const user = await store.show(parseInt(req.params.id));
        res.json(user);
    }
    catch (error) {
        res.status(400);
        res.json(error);
    }
};
const create = async (req, res) => {
    const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        martial_art: req.body.martial_art,
        username: req.body.username,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
    };
    try {
        // Check if the email and username already exist
        const emailExists = await store.emailExists(user.email);
        const usernameExists = await store.usernameExists(user.username);
        if (emailExists) {
            return res.status(400).json({ error: 'Email already exists!' });
        }
        if (usernameExists) {
            return res.status(400).json({ error: 'Username already exists!' });
        }
        const newUser = await store.create(user);
        const token = jsonwebtoken_1.default.sign({
            user: newUser,
        }, `${process.env.TOKEN_SECRET}`);
        return res.json(token);
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
const update = async (req, res) => {
    const user = {
        id: parseInt(req.params.id),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        martial_art: req.body.martial_art,
        username: req.body.username,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
    };
    try {
        const updates = await store.update(user);
        const token = jsonwebtoken_1.default.sign({
            user: updates,
        }, `${process.env.TOKEN_SECRET}`);
        res.status(200).json(token);
    }
    catch (error) {
        res.status(400);
        res.json(error);
    }
};
const deletes = async (req, res) => {
    try {
        const deleteUser = await store.delete(parseInt(req.params.id));
        res.json(deleteUser);
    }
    catch (error) {
        res.status(400);
        res.json(error);
    }
};
const authenticate = async (req, res) => {
    try {
        const authUser = await store.authenticate(req.body.username, req.body.password);
        if (authUser === null) {
            throw new Error('Not Authorized!');
        }
        else {
            const token = jsonwebtoken_1.default.sign({
                user: authUser,
            }, `${process.env.TOKEN_SECRET}`);
            res.json(token);
        }
    }
    catch (error) {
        res.status(400);
        res.json(error);
    }
};
const users_route = (app) => {
    app.post('/verify/users', authenticate_1.authenticationToken, index);
    app.post('/verify/user/:id', authenticate_1.authenticationToken, show);
    app.post('/create/user', create);
    app.put('/user/:id', authenticate_1.authenticateUserId, update);
    app.delete('/user/:id', authenticate_1.authenticateUserId, deletes);
    app.post('/user/authenticate', authenticate);
};
exports.default = users_route;
//# sourceMappingURL=users.js.map