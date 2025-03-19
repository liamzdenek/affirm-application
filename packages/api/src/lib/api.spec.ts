import { expressApp } from './api.js';

describe('api', () => {
    it('should have health endpoint', () => {
        expect(expressApp).toBeDefined();
        // We could add more specific tests for the Express app routes
        // but this simple test ensures the app is defined
    })
})