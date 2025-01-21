"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingJournalStore = void 0;
exports.validateTrainingEntry = validateTrainingEntry;
const tslib_1 = require("tslib");
const database_1 = tslib_1.__importDefault(require("../database"));
const yup_1 = require("yup");
class TrainingJournalStore {
    async getEntriesByUserId(user_id) {
        try {
            const sql = 'SELECT * FROM training_entries WHERE user_id=($1) ORDER BY practice_date DESC;';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [user_id]);
            conn.release();
            return res.rows;
        }
        catch (error) {
            throw new Error(`Can't retrieve training entries: ${error}`);
        }
    }
    async getEntriesForMonth(user_id, date) {
        try {
            const sql = `
                SELECT * FROM training_entries 
                WHERE user_id=($1) 
                AND practice_date >= date_trunc('month', $2::date)
                AND practice_date < date_trunc('month', $2::date) + interval '1 month'
            `;
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [user_id, date]);
            conn.release();
            return res.rows;
        }
        catch (error) {
            throw new Error(`Can't retrieve monthly entries: ${error}`);
        }
    }
    async getEntryById(id) {
        try {
            const sql = 'SELECT * FROM training_entries WHERE id=($1);';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [id]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Can't find training entry: ${error}`);
        }
    }
    async create(entry) {
        try {
            const conn = await database_1.default.connect();
            const sql = `
                INSERT INTO training_entries (
                    user_id, practice_date, practice_type, 
                    session_duration, content, reflection
                ) VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *
            `;
            const res = await conn.query(sql, [
                entry.user_id,
                entry.practice_date,
                entry.practice_type,
                entry.session_duration,
                entry.content,
                entry.reflection,
            ]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Could not create training entry: ${error}`);
        }
    }
    async update(entry) {
        try {
            const sql = `
                UPDATE training_entries 
                SET practice_date=($1), practice_type=($2), 
                    session_duration=($3), content=($4), reflection=($5)
                WHERE id=($6) AND user_id=($7)
                RETURNING *
            `;
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [
                entry.practice_date,
                entry.practice_type,
                entry.session_duration,
                entry.content,
                entry.reflection,
                entry.id,
                entry.user_id,
            ]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Could not update training entry: ${error}`);
        }
    }
    async delete(id, user_id) {
        try {
            const sql = 'DELETE FROM training_entries WHERE id=($1) AND user_id=($2) RETURNING *;';
            const conn = await database_1.default.connect();
            const res = await conn.query(sql, [id, user_id]);
            conn.release();
            return res.rows[0];
        }
        catch (error) {
            throw new Error(`Could not delete training entry: ${error}`);
        }
    }
}
exports.TrainingJournalStore = TrainingJournalStore;
function validateTrainingEntry(entry) {
    const entrySchema = (0, yup_1.object)({
        user_id: (0, yup_1.number)().required(),
        practice_date: (0, yup_1.date)()
            .required()
            .max(new Date(), 'Practice date cannot be in the future'),
        practice_type: (0, yup_1.string)()
            .required()
            .oneOf(['solo', 'partnered'], 'Practice type must be either solo or partnered'),
        session_duration: (0, yup_1.number)()
            .required()
            .min(1, 'Session must be at least 1 minute')
            .max(480, 'Session cannot exceed 8 hours'),
        content: (0, yup_1.string)()
            .required()
            .min(10, 'Content must be at least 10 characters')
            .max(5000, 'Content cannot exceed 5000 characters'),
        reflection: (0, yup_1.string)()
            .required()
            .min(10, 'Reflection must be at least 10 characters')
            .max(1000, 'Reflection cannot exceed 1000 characters'),
    });
    return entrySchema.validate(entry);
}
//# sourceMappingURL=trainingEntry.js.map