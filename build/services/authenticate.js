"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUserId = exports.authenticationToken = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticationToken = (req, res, next) => {
    try {
        const authHead = req.headers.authorization;
        const token = authHead.split(' ')[1];
        jsonwebtoken_1.default.verify(token, `${process.env.TOKEN_SECRET}`);
        next();
    }
    catch (error) {
        res.status(400);
        res.json(`Not authorized: ${error}`);
    }
};
exports.authenticationToken = authenticationToken;
const authenticateUserId = (req, res, next) => {
    try {
        const authHead = req.headers.authorization;
        const token = authHead.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, `${process.env.TOKEN_SECRET}`);
        const id = decoded.user.id;
        if (id !== parseInt(req.params.id)) {
            throw new Error('ID is invalid!');
        }
        next();
    }
    catch (error) {
        res.status(401);
        res.json(error);
        return;
    }
};
exports.authenticateUserId = authenticateUserId;
//# sourceMappingURL=authenticate.js.map