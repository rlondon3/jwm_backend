"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const pg_1 = require("pg");
dotenv.config();
const { POSTGRES_HOST, POSTGRES_DB, POSTGRES_DB_TEST, POSTGRES_DB_PROD, POSTGRES_USER, POSTGRES_PASSWORD, DB_PORT, ENV, } = process.env;
console.log(`Environment is currently running in ${ENV} mode...`);
let client = new pg_1.Pool();
if (ENV === 'dev') {
    client = new pg_1.Pool({
        host: POSTGRES_HOST,
        database: POSTGRES_DB,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        port: 5432,
    });
}
else if (ENV === 'test') {
    client = new pg_1.Pool({
        host: POSTGRES_HOST,
        database: POSTGRES_DB_TEST,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        port: 5432,
    });
}
else if (ENV === 'prod') {
    client = new pg_1.Pool({
        host: POSTGRES_HOST,
        database: POSTGRES_DB_PROD,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        port: Number(DB_PORT),
    });
}
else {
    throw new Error(`Invalid ENV value: ${ENV}`);
}
exports.default = client;
//# sourceMappingURL=database.js.map