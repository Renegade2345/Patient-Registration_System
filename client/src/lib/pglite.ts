import { PGlite } from '@electric-sql/pglite';
import { BroadcastChannel } from 'broadcast-channel';
import { patients, allergies, savedQueries } from '@shared/schema';

// SQL queries for table creation
const CREATE_PATIENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    insurance_provider TEXT,
    medical_history TEXT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const CREATE_ALLERGIES_TABLE = `
  CREATE TABLE IF NOT EXISTS allergies (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    severity TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
  );
`;

const CREATE_SAVED_QUERIES_TABLE = `
  CREATE TABLE IF NOT EXISTS saved_queries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Singleton PGlite instance
let db: PGlite | null = null;

// Promise for tracking initialization
let initializationPromise: Promise<PGlite> | null = null;

// Broadcast channel for cross-tab communication
const channel = new BroadcastChannel('patient-registration-app');

// Database change event types
export type DatabaseChangeEvent = {
  type: 'insert' | 'update' | 'delete';
  table: 'patients' | 'allergies' | 'saved_queries';
  data?: any;
  id?: number;
};

/**
 * Broadcast a database change to other tabs
 */
export function broadcastDatabaseChange(event: DatabaseChangeEvent) {
  console.log('Broadcasting event:', event);
  channel.postMessage(event);
}

/**
 * Initialize the database
 */
export async function initializeDatabase(): Promise<PGlite> {
  // Return existing instance if available
  if (db) {
    console.log('Returning existing PGlite instance');
    return db;
  }

  // Return existing initialization promise if in progress
  if (initializationPromise) {
    console.log('Returning existing initialization promise');
    return initializationPromise;
  }

  console.log('Starting database initialization');
  
  // Create a new initialization promise
  initializationPromise = (async () => {
    try {
      console.log('Creating new PGlite instance');
      
      // Create new PGlite instance
      const pglite = new PGlite({
        database: 'patient_db' 
      });
      
      console.log('PGlite instance created, creating tables');
      
      // Create tables
      await pglite.exec(CREATE_PATIENTS_TABLE);
      console.log('Patients table created or verified');
      
      await pglite.exec(CREATE_ALLERGIES_TABLE);
      console.log('Allergies table created or verified');
      
      await pglite.exec(CREATE_SAVED_QUERIES_TABLE);
      console.log('Saved queries table created or verified');
      
      // Set up cross-tab communication
      channel.onmessage = (event: DatabaseChangeEvent) => {
        console.log('Received message from another tab:', event);
      };
      
      // Store the instance
      db = pglite;
      console.log('Database initialization complete');
      return pglite;
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Reset initialization promise so we can try again
      initializationPromise = null;
      throw error;
    }
  })();
  
  return initializationPromise;
}

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<PGlite> {
  if (!db) {
    console.log('Getting database - need to initialize');
    return initializeDatabase();
  }
  console.log('Getting existing database instance');
  return db;
}

/**
 * Execute a SQL query
 */
export async function executeQuery(query: string): Promise<{ results: any[]; time: number; count: number }> {
  console.log('executeQuery called with:', query);
  const startTime = performance.now();
  
  try {
    const pglite = await getDatabase();
    console.log('Database ready, executing query');
    
    const results = await pglite.query(query);
    console.log('Query execution complete, results:', results);
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime) / 1000; // convert to seconds
    
    // Ensure we have an array to work with
    const resultsArray = Array.isArray(results) ? results : [];
    
    return {
      results: resultsArray,
      time: parseFloat(executionTime.toFixed(3)),
      count: resultsArray.length
    };
  } catch (error) {
    console.error('Query execution failed:', error);
    return {
      results: [],
      time: 0,
      count: 0
    };
  }
}

// Clean up when tab is closed
window.addEventListener('beforeunload', () => {
  if (db) {
    console.log('Closing database connection');
    db.close();
    channel.close();
  }
});
