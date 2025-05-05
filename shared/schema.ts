import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("date_of_birth").notNull(),
  gender: text("gender"),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  insuranceProvider: text("insurance_provider"),
  medicalHistory: text("medical_history"),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
});

// Allergies table
export const allergies = pgTable("allergies", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  name: text("name").notNull(),
  severity: text("severity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved queries table
export const savedQueries = pgTable("saved_queries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  query: text("query").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const patientsRelations = relations(patients, ({ many }) => ({
  allergies: many(allergies),
}));

export const allergiesRelations = relations(allergies, ({ one }) => ({
  patient: one(patients, { fields: [allergies.patientId], references: [patients.id] }),
}));

// Validation schemas
export const patientInsertSchema = createInsertSchema(patients, {
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  phone: (schema) => schema.min(10, "Phone number must be at least 10 characters"),
  email: (schema) => schema.email("Must be a valid email").optional().nullable(),
});

export const allergyInsertSchema = createInsertSchema(allergies, {
  name: (schema) => schema.min(2, "Allergy name must be at least 2 characters"),
});

export const savedQueryInsertSchema = createInsertSchema(savedQueries, {
  name: (schema) => schema.min(2, "Query name must be at least 2 characters"),
  query: (schema) => schema.min(5, "Query must be at least 5 characters"),
});

// Export types
export type Patient = typeof patients.$inferSelect;
export type PatientInsert = z.infer<typeof patientInsertSchema>;

export type Allergy = typeof allergies.$inferSelect;
export type AllergyInsert = z.infer<typeof allergyInsertSchema>;

export type SavedQuery = typeof savedQueries.$inferSelect;
export type SavedQueryInsert = z.infer<typeof savedQueryInsertSchema>;
