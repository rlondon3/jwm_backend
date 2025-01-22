"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trainingEntry_1 = require("../trainingEntry");
const store = new trainingEntry_1.TrainingJournalStore();
const test_entry = {
    user_id: 1,
    practice_date: new Date(),
    practice_type: 'solo',
    session_duration: 30,
    content: 'Practiced seated meditation focusing on releasing tension.',
    reflection: 'Found difficulty in maintaining empty shoulders.',
};
describe('TrainingJournalStore Model', () => {
    it('should have a get entries by id method', () => {
        expect(store.getEntriesByUserId).toBeDefined();
    });
    it('should have a get entries by user id method', () => {
        expect(store.getEntriesByUserId).toBeDefined();
    });
    it('should have a get entries by month method', () => {
        expect(store.getEntriesForMonth).toBeDefined();
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
});
describe('Entry Validation', () => {
    it('should validate a correct user', async () => {
        const result = await (0, trainingEntry_1.validateTrainingEntry)(test_entry);
        expect(result).toBeDefined();
        expect(result.user_id).toEqual(1);
    });
    it('should fail for a date set in the future', async () => {
        test_entry.practice_date = new Date('2030-01-01');
        await (0, trainingEntry_1.validateTrainingEntry)(test_entry).catch((err) => {
            expect(err.errors).toContain('Practice date cannot be in the future');
        });
    });
    it('should validate correct practice type', async () => {
        test_entry.practice_date = new Date('2025-01-01');
        const result = await (0, trainingEntry_1.validateTrainingEntry)(test_entry);
        expect(result).toBeDefined();
        expect(result.practice_type).toEqual('solo');
    });
    it('should fail for a sessioin duration that is too short', async () => {
        test_entry.session_duration = 0;
        await (0, trainingEntry_1.validateTrainingEntry)(test_entry).catch((err) => {
            expect(err.errors).toContain('Session must be at least 1 minute');
        });
    });
    it('should fail for imcomplete or short content', async () => {
        test_entry.session_duration = 1; //update previous failing value
        test_entry.content = 'I trained!';
        await (0, trainingEntry_1.validateTrainingEntry)(test_entry).catch((err) => {
            expect(err.errors[0]).toContain('Content must be at least 10 characters');
        });
    });
    it('should fail for imcomplete or short reflections', async () => {
        test_entry.content =
            'Practiced seated meditation focusing on releasing tension.'; //update previous failing value
        test_entry.reflection = 'It was fun!';
        await (0, trainingEntry_1.validateTrainingEntry)(test_entry).catch((err) => {
            expect(err.errors[0]).toContain('Reflection must be at least 10 characters');
        });
    });
});
//# sourceMappingURL=trainingJournal_spec.js.map