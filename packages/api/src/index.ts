import { expressApp } from './lib/api.js';

// Define the port
const port = process.env.PORT || 3001;

// Start the server
expressApp.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

// Export for serverless environments
export * from './lib/api.js';
