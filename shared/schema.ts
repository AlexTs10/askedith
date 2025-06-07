import { pgTable, text, serial, integer, boolean, timestamp, index, pgEnum, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Status enum for questionnaire completion
export const questionnaireStatusEnum = pgEnum('questionnaire_status', ['completed', 'abandoned', 'in_progress']);

// Categories enum for resources
export const resourceCategoryEnum = pgEnum('resource_category', [
  'Veteran Benefits', 
  'Aging Life Care Professionals', 
  'Home Care Companies', 
  'Government Agencies', 
  'Financial Advisors',
  'Other'
]);

// Enhanced Resources schema with expanded fields
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // Keeping as text for backward compatibility
  name: text("name").notNull(),
  companyName: text("company_name"),
  address: text("address"),
  county: text("county"),
  city: text("city"),
  zipCode: text("zip_code"),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  hours: text("hours"),
  description: text("description"),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// We'll create indexes later with migrations

export const insertResourceSchema = createInsertSchema(resources).pick({
  category: true,
  name: true,
  companyName: true,
  address: true,
  county: true,
  city: true,
  zipCode: true,
  email: true,
  phone: true,
  website: true,
  hours: true,
  description: true,
  latitude: true,
  longitude: true
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Enhanced Users schema for admin functionality
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  nylasGrantId: text("nylas_grant_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  isAdmin: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Questionnaires table to track completed and abandoned questionnaires
export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").default('in_progress').notNull(), // Using text instead of enum for simplicity
  answers: text("answers").notNull(), // JSON string of answers
  lastQuestionAnswered: integer("last_question_answered"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).pick({
  userId: true,
  status: true,
  answers: true,
  lastQuestionAnswered: true,
  ipAddress: true,
  userAgent: true,
  startedAt: true,
  completedAt: true
});

export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;
export type Questionnaire = typeof questionnaires.$inferSelect;

// Email logs to track sends for reporting and rate limiting
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionnaireId: integer("questionnaire_id").references(() => questionnaires.id),
  resourceId: integer("resource_id").references(() => resources.id),
  emailTo: text("email_to").notNull(),
  emailFrom: text("email_from").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull(), // 'sent', 'failed', 'queued'
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).pick({
  userId: true,
  questionnaireId: true,
  resourceId: true,
  emailTo: true,
  emailFrom: true,
  subject: true,
  body: true,
  status: true,
  errorMessage: true,
  sentAt: true
});

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
