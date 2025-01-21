"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const authenticate_1 = require("../services/authenticate");
const trainingEntry_1 = require("../models/trainingEntry");
dotenv_1.default.config();
const store = new trainingEntry_1.TrainingJournalStore();
const index = async (req, res) => {
    try {
        const entries = await store.getEntriesByUserId(req.user?.id);
        return res.status(200).json(entries);
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
const show = async (req, res) => {
    try {
        const entry = await store.getEntryById(parseInt(req.params.id));
        if (entry.user_id !== req.user?.id) {
            return res
                .status(403)
                .json({ error: 'User ID does not match entry owner' });
        }
        return res.status(200).json(entry);
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
const create = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const entry = {
        user_id: req.user.id,
        practice_date: new Date(req.body.practice_date),
        practice_type: req.body.practice_type,
        session_duration: req.body.session_duration,
        content: req.body.content,
        reflection: req.body.reflection,
    };
    try {
        await (0, trainingEntry_1.validateTrainingEntry)(entry);
        const newEntry = await store.create(entry);
        return res.status(201).json(newEntry);
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};
const update = async (req, res) => {
    try {
        const existingEntry = await store.getEntryById(parseInt(req.params.id));
        if (existingEntry.user_id !== req.user?.id) {
            return res
                .status(403)
                .json({ error: 'User ID does not match entry owner' });
        }
        const entry = {
            id: parseInt(req.params.id),
            user_id: req.user?.id,
            practice_date: new Date(req.body.practice_date),
            practice_type: req.body.practice_type,
            session_duration: req.body.session_duration,
            content: req.body.content,
            reflection: req.body.reflection,
        };
        await (0, trainingEntry_1.validateTrainingEntry)(entry);
        const updatedEntry = await store.update(entry);
        return res.status(200).json(updatedEntry);
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};
const deleteEntry = async (req, res) => {
    try {
        const existingEntry = await store.getEntryById(parseInt(req.params.id));
        if (existingEntry.user_id !== req.user?.id) {
            return res
                .status(403)
                .json({ error: 'User ID does not match entry owner' });
        }
        const deletedEntry = await store.delete(parseInt(req.params.id), req.user?.id);
        return res.status(200).json(deletedEntry);
    }
    catch (error) {
        return res.status(400).json(error);
    }
};
const trainingJournalRoutes = (app) => {
    app.get('/journal/entries', authenticate_1.authenticationToken, index);
    app.get('/journal/entries/:id', authenticate_1.authenticationToken, show);
    app.post('/journal/entries', authenticate_1.authenticationToken, create);
    app.put('/journal/entries/:id', authenticate_1.authenticationToken, update);
    app.delete('/journal/entries/:id', authenticate_1.authenticationToken, deleteEntry);
};
exports.default = trainingJournalRoutes;
//# sourceMappingURL=trainingJournal.js.map