"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStore = void 0;
exports.handleUserErrors = handleUserErrors;
const tslib_1 = require("tslib");
const database_1 = tslib_1.__importDefault(require("../database"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const yup = tslib_1.__importStar(require("yup"));
const yup_1 = require("yup");
dotenv_1.default.config();
const { SALT_ROUNDS, PEPPER } = process.env;
class UserStore {
    async index() {
        try {
            const sql = 'SELECT * FROM users;';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql);
            conn.release();
            return res.rows;
        }
        catch (error) {
            throw new Error(`Can't retrieve users: ${error}`);
        }
    }
    async show(id) {
        try {
            const sql = 'SELECT * FROM users WHERE id=($1);';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [id]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Can't find user: ${error}`);
        }
    }
    async create(user) {
        try {
            const conn = await database_1.default.connect();
            const sql = 'INSERT INTO users (firstname, lastname, age, city, country, email, martial_art, username, password, isAdmin, subscription_start, subscription_end, progress, active, subscription_tier) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *';
            const hash = bcrypt_1.default.hashSync(user.password + `${PEPPER}.processs.env`, parseInt(`${SALT_ROUNDS}.process.env`));
            const res = await conn.query(sql, [
                user.firstname,
                user.lastname,
                user.age,
                user.city,
                user.country,
                user.email,
                user.martial_art,
                user.username,
                hash,
                user.isAdmin,
                user.subscription_start,
                user.subscription_end,
                user.progress,
                user.active,
                user.subscription_tier,
            ]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Could not add user" ${error}`);
        }
    }
    // tslint:disable-next-line: no-unused-variable
    async update(user, _id) {
        try {
            const sql = 'UPDATE users SET firstname=($1), lastname=($2), age=($3), city=($4), country=($5), email=($6), martial_art=($7), username=($8), password=($9), isAdmin=($10), subscription_start=($11), subscription_end=($12), progress=($13), active=($14), subscription_tier=($15) WHERE id=($16) RETURNING *';
            const conn = await database_1.default.connect();
            const hash = bcrypt_1.default.hashSync(user.password + `${PEPPER}`, parseInt(`${SALT_ROUNDS}`));
            const res = await conn.query(sql, [
                user.firstname,
                user.lastname,
                user.age,
                user.city,
                user.country,
                user.email,
                user.martial_art,
                user.username,
                hash,
                user.isAdmin,
                user.subscription_start,
                user.subscription_end,
                user.progress,
                user.active,
                user.subscription_tier,
                user.id,
            ]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Could not update user: ${error}`);
        }
    }
    async delete(id) {
        try {
            const sql = 'DELETE FROM users WHERE id=($1) RETURNING *;';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [id]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Could not delete user: ${error}`);
        }
    }
    async authenticate(username, password) {
        try {
            const sql = 'SELECT * FROM users WHERE username=($1)';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [username]);
            if (res.rows.length) {
                bcrypt_1.default.compareSync(password + `${PEPPER}`, res.rows[0].password);
                return res.rows[0];
            }
            return null;
        }
        catch (error) {
            throw new Error(`Could not authenticate: ${error}`);
        }
    }
    async emailExists(email) {
        const conn = await database_1.default.connect();
        try {
            const sql = 'SELECT COUNT(*) FROM users WHERE email = $1';
            const res = await conn.query(sql, [email]);
            if (res.rows) {
                return parseInt(res.rows[0].count) > 0;
            }
            return false;
        }
        finally {
            conn.release();
        }
    }
    async usernameExists(username) {
        const conn = await database_1.default.connect();
        try {
            const sql = 'SELECT COUNT(*) FROM users WHERE username = $1';
            const res = await conn.query(sql, [username]);
            if (res.rows) {
                return parseInt(res.rows[0].count) > 0;
            }
            return false;
        }
        finally {
            conn.release();
        }
    }
}
exports.UserStore = UserStore;
function handleUserErrors(user) {
    let userSchema = (0, yup_1.object)({
        firstname: (0, yup_1.string)().required(),
        lastname: (0, yup_1.string)().required(),
        age: (0, yup_1.number)().required().positive().integer(),
        city: (0, yup_1.string)().required(),
        country: (0, yup_1.string)().required(),
        email: (0, yup_1.string)().email(),
        martial_art: (0, yup_1.string)().required(),
        password: (0, yup_1.string)()
            .required()
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character'),
        isAdmin: (0, yup_1.boolean)().default(false),
        subscription_start: (0, yup_1.date)().required(),
        subscription_end: (0, yup_1.date)()
            .required()
            .min(yup.ref('subscription_start'), 'Subscription end date must be after the start date.'),
        progress: (0, yup_1.number)().min(0).max(100).required(),
        active: (0, yup_1.boolean)().required(),
        subscription_tier: (0, yup_1.number)()
            .required()
            .integer()
            .test('is-valid-tier', 'Subscription tier must be 0 or a positive number', (value) => value >= 0),
    });
    return userSchema.validate(user);
}
//# sourceMappingURL=user.js.map