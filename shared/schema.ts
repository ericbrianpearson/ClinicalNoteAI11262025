import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Practitioners table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  practiceType: text("practice_type").notNull(), // "family_medicine", "internal_medicine", etc.
  licenseNumber: text("license_number"),
  subscriptionStatus: text("subscription_status").notNull().default("trial"), // trial, active, canceled, expired
  subscriptionId: text("subscription_id"), // Stripe subscription ID
  customerId: text("customer_id"), // Stripe customer ID
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  role: text("role").notNull().default("practitioner"), // practitioner, admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitioner_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  allergies: text("allergies"),
  medications: text("medications"),
  medicalHistory: text("medical_history"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Patient portal users - separate authentication for patients
export const patientUsers = pgTable("patient_users", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const encounters = pgTable("encounters", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitioner_id").default(1),
  patientId: text("patient_id").notNull(),
  encounterType: text("encounter_type").notNull(),
  date: text("date").notNull(),
  audioFileName: text("audio_file_name"),
  transcriptionText: text("transcription_text"),
  transcriptionConfidence: integer("transcription_confidence"),
  summary: jsonb("summary"),
  emCoding: jsonb("em_coding"),
  processingStatus: text("processing_status").notNull().default("pending"),
  treatmentPlanStatus: text("treatment_plan_status").default("pending"),
  treatmentModifications: text("treatment_modifications"),
  referrals: jsonb("referrals"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs for compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // "view_patient", "create_encounter", "access_phi", etc.
  resourceType: text("resource_type").notNull(), // "patient", "encounter", "user"
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// AI Assistant insights and recommendations
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "efficiency", "clinical", "administrative", "learning"
  priority: text("priority").notNull(), // "high", "medium", "low"
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation"),
  metrics: jsonb("metrics"),
  isRead: boolean("is_read").notNull().default(false),
  isActionable: boolean("is_actionable").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow automation tasks
export const workflowTasks = pgTable("workflow_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  encounterId: integer("encounter_id").references(() => encounters.id),
  taskType: text("task_type").notNull(), // "follow_up", "referral", "lab_order", "prescription"
  status: text("status").notNull().default("pending"), // "pending", "completed", "cancelled"
  priority: integer("priority").notNull().default(5),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  automationRules: jsonb("automation_rules"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Smart suggestions and recommendations
export const smartSuggestions = pgTable("smart_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  encounterId: integer("encounter_id").references(() => encounters.id),
  category: text("category").notNull(), // "diagnosis", "treatment", "coding", "workflow"
  suggestion: text("suggestion").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  reasoning: text("reasoning").notNull(),
  references: text("references").array(),
  isAccepted: boolean("is_accepted"),
  isRejected: boolean("is_rejected"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = {
  patients: (user: typeof users) => ({
    many: patients,
    fields: [user.id],
    references: [patients.practitionerId],
  }),
  encounters: (user: typeof users) => ({
    many: encounters,
    fields: [user.id],
    references: [encounters.practitionerId],
  }),
};

export const patientsRelations = {
  practitioner: (patient: typeof patients) => ({
    one: users,
    fields: [patient.practitionerId],
    references: [users.id],
  }),
  encounters: (patient: typeof patients) => ({
    many: encounters,
    fields: [patient.id],
    references: [encounters.patientId],
  }),
};

export const encountersRelations = {
  practitioner: (encounter: typeof encounters) => ({
    one: users,
    fields: [encounter.practitionerId],
    references: [users.id],
  }),
  patient: (encounter: typeof encounters) => ({
    one: patients,
    fields: [encounter.patientId],
    references: [patients.id],
  }),
};

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientUserSchema = createInsertSchema(patientUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertEncounterSchema = createInsertSchema(encounters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type PatientUser = typeof patientUsers.$inferSelect;
export type InsertPatientUser = z.infer<typeof insertPatientUserSchema>;
export type Encounter = typeof encounters.$inferSelect;
export type InsertEncounter = z.infer<typeof insertEncounterSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const patientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const patientRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  dateOfBirth: z.string(),
  lastName: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s\-'\.]+$/, "Only letters, spaces, hyphens, apostrophes, and periods allowed"),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s\-'\.]+$/, "Only letters, spaces, hyphens, apostrophes, and periods allowed"),
  practiceType: z.string().min(1),
  licenseNumber: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Processing result types
export const transcriptionResultSchema = z.object({
  text: z.string(),
  confidence: z.number(),
  duration: z.string(),
});

export const summaryResultSchema = z.object({
  keyFindings: z.array(z.string()),
  diagnosis: z.string(),
  differentialDiagnosis: z.array(z.object({
    condition: z.string(),
    probability: z.number(),
    reasoning: z.string(),
  })),
  reviewOfSystems: z.object({
    constitutional: z.array(z.string()).optional(),
    cardiovascular: z.array(z.string()).optional(),
    respiratory: z.array(z.string()).optional(),
    gastrointestinal: z.array(z.string()).optional(),
    genitourinary: z.array(z.string()).optional(),
    musculoskeletal: z.array(z.string()).optional(),
    neurological: z.array(z.string()).optional(),
    psychiatric: z.array(z.string()).optional(),
    endocrine: z.array(z.string()).optional(),
    hematologic: z.array(z.string()).optional(),
    allergic: z.array(z.string()).optional(),
    integumentary: z.array(z.string()).optional(),
  }),
  treatment: z.string(),
});

export const emCodingResultSchema = z.object({
  history: z.object({
    level: z.number(),
    description: z.string(),
  }),
  exam: z.object({
    level: z.number(),
    description: z.string(),
  }),
  mdm: z.object({
    level: z.number(),
    description: z.string(),
  }),
  recommendedCode: z.string(),
  confidence: z.number(),
  rationale: z.string(),
});

// EHR Integration Systems
export const ehrSystems = pgTable("ehr_systems", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  systemType: text("system_type").notNull(), // "epic", "cerner", "athena", "medidata", "allscripts", "nextgen", "fhir"
  systemName: text("system_name").notNull(),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  orgId: text("org_id"),
  endpoint: text("endpoint"),
  facilityId: text("facility_id"),
  lastSyncAt: timestamp("last_sync_at"),
  isActive: boolean("is_active").notNull().default(true),
  syncSettings: jsonb("sync_settings"), // auto-sync frequency, enabled features
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// EHR Sync Logs
export const ehrSyncLogs = pgTable("ehr_sync_logs", {
  id: serial("id").primaryKey(),
  ehrSystemId: integer("ehr_system_id").notNull().references(() => ehrSystems.id),
  encounterId: integer("encounter_id").references(() => encounters.id),
  syncType: text("sync_type").notNull(), // "push", "pull", "bidirectional"
  status: text("status").notNull().default("pending"), // "success", "failed", "pending"
  itemsSynced: integer("items_synced").default(0),
  errorMessage: text("error_message"),
  fhirResourceType: text("fhir_resource_type"), // "Patient", "Encounter", "Observation"
  externalRecordId: text("external_record_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Clinical Protocols & Decision Support Rules
export const clinicalProtocols = pgTable("clinical_protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialtyArea: text("specialty_area").notNull(), // "cardiology", "oncology", etc.
  evidenceBase: text("evidence_base").notNull(), // "guideline_url" or evidence source
  protocolRules: jsonb("protocol_rules").notNull(), // Array of decision logic
  suggestedCodes: text("suggested_codes").array(), // Related E/M codes
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Drug Interaction Database
export const drugInteractions = pgTable("drug_interactions", {
  id: serial("id").primaryKey(),
  drug1: text("drug_1").notNull(),
  drug2: text("drug_2").notNull(),
  severity: text("severity").notNull(), // "contraindicated", "severe", "moderate", "mild"
  mechanism: text("mechanism").notNull(),
  clinical_effect: text("clinical_effect").notNull(),
  management: text("management"),
  source: text("source"), // "FDA", "NIH", "DrugBank"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clinical Alerts & Warnings
export const clinicalAlerts = pgTable("clinical_alerts", {
  id: serial("id").primaryKey(),
  encounterId: integer("encounter_id").notNull().references(() => encounters.id),
  alertType: text("alert_type").notNull(), // "drug_interaction", "allergy_conflict", "lab_abnormal", "guideline_variance"
  severity: text("severity").notNull(), // "critical", "high", "medium", "low"
  message: text("message").notNull(),
  suggestedAction: text("suggested_action"),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  dismissedAt: timestamp("dismissed_at"),
  dismissReason: text("dismiss_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Advanced Clinical Entity Extraction Results
export const clinicalEntities = pgTable("clinical_entities", {
  id: serial("id").primaryKey(),
  encounterId: integer("encounter_id").notNull().references(() => encounters.id),
  entityType: text("entity_type").notNull(), // "symptom", "medication", "diagnosis", "lab", "procedure", "allergy"
  value: text("value").notNull(),
  standardCode: text("standard_code"), // SNOMED CT, ICD-10, RxNorm, LOINC
  confidence: integer("confidence").notNull(), // 0-100
  context: text("context"), // surrounding text snippet
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-time Clinical Analytics
export const clinicalAnalytics = pgTable("clinical_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  metricType: text("metric_type").notNull(), // "transcription_quality", "coding_accuracy", "diagnostic_precision"
  value: integer("value").notNull(),
  benchmark: integer("benchmark").notNull(),
  timeframe: text("timeframe").notNull(), // "day", "week", "month"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TranscriptionResult = z.infer<typeof transcriptionResultSchema>;
export type SummaryResult = z.infer<typeof summaryResultSchema>;
export type EMCodingResult = z.infer<typeof emCodingResultSchema>;
