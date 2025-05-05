import { getDatabase, broadcastDatabaseChange, executeQuery } from './pglite';
import type { Patient, PatientInsert, Allergy, AllergyInsert, SavedQuery, SavedQueryInsert } from '@shared/schema';

// Re-export the executeQuery function
export { executeQuery };

// Patient CRUD operations
export async function getPatients(): Promise<Patient[]> {
  try {
    const db = await getDatabase();
    console.log('Successfully got database instance');
    
    const query = `SELECT * FROM patients ORDER BY registration_date DESC`;
    console.log('Executing query:', query);
    
    const results = await db.query(query);
    console.log('Query results:', results);
    
    // Cast results to the expected type
    return Array.isArray(results) ? results as Patient[] : [];
  } catch (error) {
    console.error('Error in getPatients:', error);
    return [];
  }
}

export async function getPatientById(id: number): Promise<Patient | null> {
  try {
    const db = await getDatabase();
    const results = await db.query(`
      SELECT * FROM patients WHERE id = $1
    `, [id]);
    
    // Safely check if results have data
    if (Array.isArray(results) && results.length > 0) {
      return results[0] as Patient;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getPatientById:', error);
    return null;
  }
}

export async function createPatient(patient: PatientInsert): Promise<Patient> {
  try {
    console.log('createPatient called with:', patient);
    const db = await getDatabase();
    console.log('Database connection obtained');
    
    // Ensure date is in the correct format (YYYY-MM-DD)
    let dobFormatted: string;
    if (typeof patient.dob === 'string') {
      dobFormatted = patient.dob;
    } else if (patient.dob instanceof Date) {
      dobFormatted = patient.dob.toISOString().split('T')[0];
    } else {
      console.error('Invalid date format:', patient.dob);
      throw new Error('Invalid date format');
    }
    
    console.log('Formatted DOB:', dobFormatted);
    
    // Build query and parameters
    const query = `
      INSERT INTO patients (
        first_name, last_name, date_of_birth, gender, email, phone, 
        address, insurance_provider, medical_history, registration_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
      ) RETURNING *
    `;
    
    const params = [
      patient.firstName,
      patient.lastName,
      dobFormatted,
      patient.gender || null,
      patient.email || null,
      patient.phone,
      patient.address || null,
      patient.insuranceProvider || null,
      patient.medicalHistory || null
    ];
    
    console.log('Executing INSERT query with params:', params);
    
    // Execute the query
    try {
      const result = await db.query(query, params);
      console.log('Patient creation raw result:', result);
      
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('No results returned from patient creation query');
      }
      
      // Convert the first result to a Patient object
      const newPatient = result[0] as Patient;
      console.log('New patient created:', newPatient);
      
      // Broadcast change to other tabs
      broadcastDatabaseChange({
        type: 'insert',
        table: 'patients',
        data: newPatient
      });
      
      return newPatient;
    } catch (queryError) {
      console.error('Error executing patient creation query:', queryError);
      throw queryError;
    }
  } catch (error) {
    console.error('Error in createPatient:', error);
    throw error;
  }
}

export async function updatePatient(id: number, patient: Partial<PatientInsert>): Promise<Patient | null> {
  const db = await getDatabase();
  
  // Get existing patient
  const existingPatient = await getPatientById(id);
  if (!existingPatient) return null;
  
  // Format date for SQL if provided
  const dobFormatted = patient.dob instanceof Date 
    ? patient.dob.toISOString().split('T')[0]
    : patient.dob;
  
  // Build update query dynamically based on provided fields
  let updateFields = '';
  const values: any[] = [];
  let paramCounter = 1;
  
  if (patient.firstName !== undefined) {
    updateFields += `first_name = $${paramCounter++}, `;
    values.push(patient.firstName);
  }
  
  if (patient.lastName !== undefined) {
    updateFields += `last_name = $${paramCounter++}, `;
    values.push(patient.lastName);
  }
  
  if (patient.dob !== undefined) {
    updateFields += `date_of_birth = $${paramCounter++}, `;
    values.push(dobFormatted);
  }
  
  if (patient.gender !== undefined) {
    updateFields += `gender = $${paramCounter++}, `;
    values.push(patient.gender);
  }
  
  if (patient.email !== undefined) {
    updateFields += `email = $${paramCounter++}, `;
    values.push(patient.email);
  }
  
  if (patient.phone !== undefined) {
    updateFields += `phone = $${paramCounter++}, `;
    values.push(patient.phone);
  }
  
  if (patient.address !== undefined) {
    updateFields += `address = $${paramCounter++}, `;
    values.push(patient.address);
  }
  
  if (patient.insuranceProvider !== undefined) {
    updateFields += `insurance_provider = $${paramCounter++}, `;
    values.push(patient.insuranceProvider);
  }
  
  if (patient.medicalHistory !== undefined) {
    updateFields += `medical_history = $${paramCounter++}, `;
    values.push(patient.medicalHistory);
  }
  
  // Remove trailing comma and space
  updateFields = updateFields.slice(0, -2);
  
  // Add ID for WHERE clause
  values.push(id);
  
  const result = await db.query(`
    UPDATE patients SET ${updateFields} WHERE id = $${paramCounter} RETURNING *
  `, values);
  
  const updatedPatient = result[0];
  
  // Broadcast change to other tabs
  broadcastDatabaseChange({
    type: 'update',
    table: 'patients',
    data: updatedPatient,
    id
  });
  
  return updatedPatient;
}

export async function deletePatient(id: number): Promise<boolean> {
  const db = await getDatabase();
  
  // First delete any allergies for this patient
  await db.query('DELETE FROM allergies WHERE patient_id = $1', [id]);
  
  // Then delete the patient
  const result = await db.query('DELETE FROM patients WHERE id = $1', [id]);
  
  // Broadcast change to other tabs
  broadcastDatabaseChange({
    type: 'delete',
    table: 'patients',
    id
  });
  
  return result.length > 0;
}

// Allergy CRUD operations
export async function getAllergiesByPatientId(patientId: number): Promise<Allergy[]> {
  const db = await getDatabase();
  const results = await db.query(`
    SELECT * FROM allergies WHERE patient_id = $1 ORDER BY created_at DESC
  `, [patientId]);
  
  return results;
}

export async function createAllergy(allergy: AllergyInsert): Promise<Allergy> {
  const db = await getDatabase();
  
  const result = await db.query(`
    INSERT INTO allergies (
      patient_id, name, severity, created_at
    ) VALUES (
      $1, $2, $3, CURRENT_TIMESTAMP
    ) RETURNING *
  `, [
    allergy.patientId,
    allergy.name,
    allergy.severity || null
  ]);
  
  const newAllergy = result[0];
  
  // Broadcast change to other tabs
  broadcastDatabaseChange({
    type: 'insert',
    table: 'allergies',
    data: newAllergy
  });
  
  return newAllergy;
}

export async function deleteAllergy(id: number): Promise<boolean> {
  const db = await getDatabase();
  
  const result = await db.query('DELETE FROM allergies WHERE id = $1', [id]);
  
  // Broadcast change to other tabs
  broadcastDatabaseChange({
    type: 'delete',
    table: 'allergies',
    id
  });
  
  return result.length > 0;
}

// Saved Query CRUD operations
export async function getSavedQueries(): Promise<SavedQuery[]> {
  const db = await getDatabase();
  const results = await db.query(`
    SELECT * FROM saved_queries ORDER BY created_at DESC
  `);
  
  return results;
}

export async function createSavedQuery(query: SavedQueryInsert): Promise<SavedQuery> {
  const db = await getDatabase();
  
  const result = await db.query(`
    INSERT INTO saved_queries (
      name, query, description, created_at
    ) VALUES (
      $1, $2, $3, CURRENT_TIMESTAMP
    ) RETURNING *
  `, [
    query.name,
    query.query,
    query.description || null
  ]);
  
  const newQuery = result[0];
  
  // Broadcast change to other tabs
  broadcastDatabaseChange({
    type: 'insert',
    table: 'saved_queries',
    data: newQuery
  });
  
  return newQuery;
}

export async function deleteSavedQuery(id: number): Promise<boolean> {
  const db = await getDatabase();
  
  const result = await db.query('DELETE FROM saved_queries WHERE id = $1', [id]);
  
  // Broadcast change to other tabs
  broadcastDatabaseChange({
    type: 'delete',
    table: 'saved_queries',
    id
  });
  
  return result.length > 0;
}

// Search and filter patients
export async function searchPatients(searchTerm: string): Promise<Patient[]> {
  const db = await getDatabase();
  
  const searchParam = `%${searchTerm}%`;
  
  const results = await db.query(`
    SELECT * FROM patients 
    WHERE 
      first_name ILIKE $1 OR 
      last_name ILIKE $1 OR 
      email ILIKE $1 OR 
      phone ILIKE $1 OR
      address ILIKE $1 OR
      insurance_provider ILIKE $1
    ORDER BY registration_date DESC
  `, [searchParam]);
  
  return results;
}

export async function filterPatients(filters: {
  ageMin?: number,
  ageMax?: number,
  gender?: string[],
  registrationDateStart?: string,
  registrationDateEnd?: string,
  insuranceProvider?: string
}): Promise<Patient[]> {
  const db = await getDatabase();
  
  let whereClause = '';
  const params: any[] = [];
  let paramCount = 1;
  
  // Age filter (convert to date of birth)
  if (filters.ageMin !== undefined) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - filters.ageMax! - 1);
    date.setDate(date.getDate() + 1); // Add one day to make it inclusive
    
    whereClause += `date_of_birth >= $${paramCount++} AND `;
    params.push(date.toISOString().split('T')[0]);
  }
  
  if (filters.ageMax !== undefined) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - filters.ageMin!);
    
    whereClause += `date_of_birth <= $${paramCount++} AND `;
    params.push(date.toISOString().split('T')[0]);
  }
  
  // Gender filter
  if (filters.gender && filters.gender.length > 0) {
    whereClause += `(`;
    filters.gender.forEach((g, index) => {
      whereClause += index > 0 ? ` OR gender = $${paramCount++}` : `gender = $${paramCount++}`;
      params.push(g);
    });
    whereClause += `) AND `;
  }
  
  // Registration date filter
  if (filters.registrationDateStart) {
    whereClause += `registration_date >= $${paramCount++} AND `;
    params.push(filters.registrationDateStart);
  }
  
  if (filters.registrationDateEnd) {
    whereClause += `registration_date <= $${paramCount++} AND `;
    params.push(filters.registrationDateEnd);
  }
  
  // Insurance provider filter
  if (filters.insuranceProvider && filters.insuranceProvider !== '') {
    whereClause += `insurance_provider = $${paramCount++} AND `;
    params.push(filters.insuranceProvider);
  }
  
  // Remove trailing 'AND ' if whereClause is not empty
  if (whereClause.length > 0) {
    whereClause = 'WHERE ' + whereClause.slice(0, -5);
  }
  
  const query = `
    SELECT * FROM patients 
    ${whereClause}
    ORDER BY registration_date DESC
  `;
  
  const results = await db.query(query, params);
  return results;
}
