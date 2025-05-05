import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    // Check if the database already has patients
    const existingPatients = await db.query.patients.findMany({
      limit: 1,
    });

    // Only seed if no patients exist
    if (existingPatients.length === 0) {
      console.log("Seeding database with initial data...");

      // Insert sample patients
      const patientsData = [
        {
          firstName: "John",
          lastName: "Smith",
          dob: new Date("1990-05-15"),
          gender: "male",
          email: "john.smith@example.com",
          phone: "(555) 123-4567",
          address: "123 Main St, Anytown, USA",
          insuranceProvider: "Blue Cross",
          medicalHistory: "No significant medical history.",
        },
        {
          firstName: "Jane",
          lastName: "Doe",
          dob: new Date("1985-08-23"),
          gender: "female",
          email: "jane.doe@example.com",
          phone: "(555) 987-6543",
          address: "456 Oak Ave, Somewhere, USA",
          insuranceProvider: "Aetna",
          medicalHistory: "Allergic to penicillin.",
        },
        {
          firstName: "Robert",
          lastName: "Johnson",
          dob: new Date("1978-12-10"),
          gender: "male",
          email: "robert.johnson@example.com",
          phone: "(555) 456-7890",
          address: "789 Pine St, Elsewhere, USA",
          insuranceProvider: "Cigna",
          medicalHistory: "Hypertension, Type 2 diabetes.",
        },
        {
          firstName: "Sarah",
          lastName: "Wilson",
          dob: new Date("1992-03-07"),
          gender: "female",
          email: "sarah.wilson@example.com",
          phone: "(555) 234-5678",
          address: "321 Elm St, Nowhere, USA",
          insuranceProvider: "UnitedHealthcare",
          medicalHistory: "Mild asthma, seasonal allergies.",
        },
        {
          firstName: "Michael",
          lastName: "Brown",
          dob: new Date("1972-09-28"),
          gender: "male",
          email: "michael.brown@example.com",
          phone: "(555) 876-5432",
          address: "654 Maple Ave, Anyplace, USA",
          insuranceProvider: "Medicare",
          medicalHistory: "Knee replacement (right) in 2018.",
        },
      ];

      // Insert patients
      for (const patientData of patientsData) {
        const [patient] = await db.insert(schema.patients).values(patientData).returning();
        
        // Add allergies for some patients
        if (patient.id === 1) {
          await db.insert(schema.allergies).values([
            { patientId: patient.id, name: "Penicillin", severity: "High" },
            { patientId: patient.id, name: "Peanuts", severity: "Moderate" },
          ]);
        } else if (patient.id === 2) {
          await db.insert(schema.allergies).values([
            { patientId: patient.id, name: "Shellfish", severity: "High" },
            { patientId: patient.id, name: "Latex", severity: "Mild" },
          ]);
        } else if (patient.id === 4) {
          await db.insert(schema.allergies).values([
            { patientId: patient.id, name: "Dust", severity: "Moderate" },
            { patientId: patient.id, name: "Pollen", severity: "Moderate" },
            { patientId: patient.id, name: "Pet Dander", severity: "Mild" },
          ]);
        }
      }

      // Insert some saved queries
      const savedQueriesData = [
        {
          name: "All Patients",
          query: "SELECT * FROM patients ORDER BY last_name ASC;",
          description: "Retrieves all patients sorted by last name",
        },
        {
          name: "Patients with Allergies",
          query: "SELECT p.id, p.first_name, p.last_name, a.name as allergy, a.severity FROM patients p JOIN allergies a ON p.id = a.patient_id ORDER BY p.last_name ASC;",
          description: "Lists all patients with their allergies",
        },
        {
          name: "Patient Count by Gender",
          query: "SELECT gender, COUNT(*) as count FROM patients GROUP BY gender;",
          description: "Shows patient distribution by gender",
        },
      ];

      await db.insert(schema.savedQueries).values(savedQueriesData);

      console.log("Database seeded successfully!");
    } else {
      console.log("Database already contains data, skipping seed process.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
