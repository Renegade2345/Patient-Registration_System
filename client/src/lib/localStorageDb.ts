import { BroadcastChannel } from 'broadcast-channel';
import type { Patient, PatientInsert, Allergy, AllergyInsert, SavedQuery, SavedQueryInsert } from '@shared/schema';

// Create a broadcast channel for cross-tab communication
const channel = new BroadcastChannel('patient-registration-app');

// Database change event types
export type DatabaseChangeEvent = {
  type: 'insert' | 'update' | 'delete';
  table: 'patients' | 'allergies' | 'saved_queries';
  data?: any;
  id?: number;
};

// Storage keys
const STORAGE_KEYS = {
  PATIENTS: 'patients_data',
  ALLERGIES: 'allergies_data',
  SAVED_QUERIES: 'saved_queries_data'
};

// Initialize localStorage if needed
function initializeStorage() {
  console.log('Initializing local storage database');
  
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.ALLERGIES)) {
    localStorage.setItem(STORAGE_KEYS.ALLERGIES, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES)) {
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify([]));
  }
  
  console.log('Local storage database initialized');
}

// Initialize the storage
initializeStorage();

// Set up cross-tab communication
channel.onmessage = (event: DatabaseChangeEvent) => {
  console.log('Received message from another tab:', event);
  // Handle the update (we could refresh data here if needed)
};

// Broadcast database changes to other tabs
export function broadcastDatabaseChange(event: DatabaseChangeEvent) {
  console.log('Broadcasting event:', event);
  channel.postMessage(event);
}

// Patient CRUD operations
export async function getPatients(): Promise<Patient[]> {
  try {
    console.log('Getting patients from localStorage');
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    // Sort by registration date descending
    return patients.sort((a: Patient, b: Patient) => 
      new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
    );
  } catch (error) {
    console.error('Error getting patients:', error);
    return [];
  }
}

export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const patient = patients.find((p: Patient) => p.id === id);
    return patient || null;
  } catch (error) {
    console.error('Error getting patient by ID:', error);
    return null;
  }
}

export async function createPatient(patient: PatientInsert): Promise<Patient> {
  try {
    console.log('Creating patient:', patient);
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    
    // Generate a new ID (max ID + 1)
    const newId = patients.length > 0 
      ? Math.max(...patients.map((p: Patient) => p.id)) + 1 
      : 1;
    
    // Create new patient with ID and registration date
    const newPatient: Patient = {
      id: newId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      gender: patient.gender,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      insuranceProvider: patient.insuranceProvider,
      medicalHistory: patient.medicalHistory,
      registrationDate: new Date().toISOString()
    };
    
    // Add to storage
    patients.push(newPatient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'insert',
      table: 'patients',
      data: newPatient
    });
    
    console.log('Patient created successfully:', newPatient);
    return newPatient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

export async function updatePatient(id: number, patient: Partial<PatientInsert>): Promise<Patient | null> {
  try {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const index = patients.findIndex((p: Patient) => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Update fields
    const updatedPatient = {
      ...patients[index],
      ...patient
    };
    
    patients[index] = updatedPatient;
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'update',
      table: 'patients',
      data: updatedPatient,
      id
    });
    
    return updatedPatient;
  } catch (error) {
    console.error('Error updating patient:', error);
    return null;
  }
}

export async function deletePatient(id: number): Promise<boolean> {
  try {
    // Delete patient
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const filteredPatients = patients.filter((p: Patient) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(filteredPatients));
    
    // Delete related allergies
    const allergies = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLERGIES) || '[]');
    const filteredAllergies = allergies.filter((a: Allergy) => a.patientId !== id);
    localStorage.setItem(STORAGE_KEYS.ALLERGIES, JSON.stringify(filteredAllergies));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'delete',
      table: 'patients',
      id
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
}

// Allergy CRUD operations
export async function getAllergiesByPatientId(patientId: number): Promise<Allergy[]> {
  try {
    const allergies = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLERGIES) || '[]');
    return allergies
      .filter((a: Allergy) => a.patientId === patientId)
      .sort((a: Allergy, b: Allergy) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch (error) {
    console.error('Error getting allergies by patient ID:', error);
    return [];
  }
}

export async function createAllergy(allergy: AllergyInsert): Promise<Allergy> {
  try {
    const allergies = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLERGIES) || '[]');
    
    // Generate a new ID
    const newId = allergies.length > 0 
      ? Math.max(...allergies.map((a: Allergy) => a.id)) + 1 
      : 1;
    
    // Create new allergy
    const newAllergy: Allergy = {
      id: newId,
      patientId: allergy.patientId,
      name: allergy.name,
      severity: allergy.severity,
      createdAt: new Date().toISOString()
    };
    
    // Add to storage
    allergies.push(newAllergy);
    localStorage.setItem(STORAGE_KEYS.ALLERGIES, JSON.stringify(allergies));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'insert',
      table: 'allergies',
      data: newAllergy
    });
    
    return newAllergy;
  } catch (error) {
    console.error('Error creating allergy:', error);
    throw error;
  }
}

export async function deleteAllergy(id: number): Promise<boolean> {
  try {
    const allergies = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLERGIES) || '[]');
    const filteredAllergies = allergies.filter((a: Allergy) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ALLERGIES, JSON.stringify(filteredAllergies));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'delete',
      table: 'allergies',
      id
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting allergy:', error);
    return false;
  }
}

// Saved Query CRUD operations
export async function getSavedQueries(): Promise<SavedQuery[]> {
  try {
    const queries = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES) || '[]');
    return queries.sort((a: SavedQuery, b: SavedQuery) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting saved queries:', error);
    return [];
  }
}

export async function createSavedQuery(query: SavedQueryInsert): Promise<SavedQuery> {
  try {
    const queries = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES) || '[]');
    
    // Generate a new ID
    const newId = queries.length > 0 
      ? Math.max(...queries.map((q: SavedQuery) => q.id)) + 1 
      : 1;
    
    // Create new saved query
    const newQuery: SavedQuery = {
      id: newId,
      name: query.name,
      query: query.query,
      description: query.description,
      createdAt: new Date().toISOString()
    };
    
    // Add to storage
    queries.push(newQuery);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(queries));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'insert',
      table: 'saved_queries',
      data: newQuery
    });
    
    return newQuery;
  } catch (error) {
    console.error('Error creating saved query:', error);
    throw error;
  }
}

export async function deleteSavedQuery(id: number): Promise<boolean> {
  try {
    const queries = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_QUERIES) || '[]');
    const filteredQueries = queries.filter((q: SavedQuery) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUERIES, JSON.stringify(filteredQueries));
    
    // Broadcast change
    broadcastDatabaseChange({
      type: 'delete',
      table: 'saved_queries',
      id
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting saved query:', error);
    return false;
  }
}

// Search and filter patients
export async function searchPatients(searchTerm: string): Promise<Patient[]> {
  try {
    const patients = await getPatients();
    
    if (!searchTerm.trim()) {
      return patients;
    }
    
    const term = searchTerm.toLowerCase();
    
    return patients.filter((patient: Patient) => 
      patient.firstName.toLowerCase().includes(term) ||
      patient.lastName.toLowerCase().includes(term) ||
      (patient.email && patient.email.toLowerCase().includes(term)) ||
      patient.phone.includes(term) ||
      (patient.address && patient.address.toLowerCase().includes(term)) ||
      (patient.insuranceProvider && patient.insuranceProvider.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
}

export async function filterPatients(filters: {
  ageMin?: number,
  ageMax?: number,
  gender?: string[],
  registrationDateStart?: string,
  registrationDateEnd?: string,
  insuranceProvider?: string
}): Promise<Patient[]> {
  try {
    const patients = await getPatients();
    
    return patients.filter((patient: Patient) => {
      // Age filter
      if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
        const dob = new Date(patient.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear() - 
          (today.getMonth() < dob.getMonth() || 
            (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
        
        if (filters.ageMin !== undefined && age < filters.ageMin) {
          return false;
        }
        
        if (filters.ageMax !== undefined && age > filters.ageMax) {
          return false;
        }
      }
      
      // Gender filter
      if (filters.gender && filters.gender.length > 0) {
        if (!patient.gender || !filters.gender.includes(patient.gender)) {
          return false;
        }
      }
      
      // Registration date filter
      if (filters.registrationDateStart) {
        const startDate = new Date(filters.registrationDateStart);
        const registrationDate = new Date(patient.registrationDate);
        if (registrationDate < startDate) {
          return false;
        }
      }
      
      if (filters.registrationDateEnd) {
        const endDate = new Date(filters.registrationDateEnd);
        const registrationDate = new Date(patient.registrationDate);
        if (registrationDate > endDate) {
          return false;
        }
      }
      
      // Insurance provider filter
      if (filters.insuranceProvider && filters.insuranceProvider !== '') {
        if (patient.insuranceProvider !== filters.insuranceProvider) {
          return false;
        }
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error filtering patients:', error);
    return [];
  }
}

// Execute custom SQL query (simulated)
export async function executeQuery(query: string): Promise<{ results: any[]; time: number; count: number }> {
  console.log('Executing query (simulated):', query);
  const startTime = performance.now();
  
  try {
    // This is a very primitive SQL parser for demonstration purposes
    // It will handle a few basic query patterns but is not a real SQL engine
    query = query.trim().toLowerCase();
    
    // SELECT queries
    if (query.startsWith('select')) {
      const patients = await getPatients();
      const allergies = [];
      const savedQueries = await getSavedQueries();
      
      let results: any[] = [];
      
      // Handle simple patterns
      if (query.includes('from patients')) {
        results = patients;
        
        // WHERE clause
        if (query.includes('where')) {
          // Handle a few common conditions
          if (query.includes('where date_of_birth <')) {
            const match = query.match(/date_of_birth\s*<\s*'([^']+)'/);
            if (match && match[1]) {
              const date = match[1];
              results = results.filter(p => p.dob < date);
            }
          }
          
          if (query.includes('where gender =')) {
            const match = query.match(/gender\s*=\s*'([^']+)'/);
            if (match && match[1]) {
              const gender = match[1];
              results = results.filter(p => p.gender === gender);
            }
          }
        }
        
        // ORDER BY
        if (query.includes('order by')) {
          if (query.includes('order by last_name')) {
            const isAsc = !query.includes('desc');
            results.sort((a, b) => {
              return isAsc 
                ? a.lastName.localeCompare(b.lastName) 
                : b.lastName.localeCompare(a.lastName);
            });
          }
          
          if (query.includes('order by registration_date')) {
            const isAsc = !query.includes('desc');
            results.sort((a, b) => {
              const dateA = new Date(a.registrationDate).getTime();
              const dateB = new Date(b.registrationDate).getTime();
              return isAsc ? dateA - dateB : dateB - dateA;
            });
          }
        }
      } else if (query.includes('from allergies')) {
        results = allergies;
      } else if (query.includes('from saved_queries')) {
        results = savedQueries;
      }
      
      const endTime = performance.now();
      const executionTime = (endTime - startTime) / 1000; // Convert to seconds
      
      return {
        results,
        time: parseFloat(executionTime.toFixed(3)),
        count: results.length
      };
    }
    
    // Default for unsupported queries
    return {
      results: [],
      time: 0,
      count: 0
    };
  } catch (error) {
    console.error('Error executing query:', error);
    return {
      results: [],
      time: 0,
      count: 0
    };
  }
}