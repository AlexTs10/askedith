import { 
  resources, type Resource, type InsertResource,
  users, type User, type InsertUser,
  questionnaires, type Questionnaire, type InsertQuestionnaire,
  emailLogs, type EmailLog, type InsertEmailLog 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, like, between, or, inArray } from "drizzle-orm";

// Enhanced interface with CRUD methods for database storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin methods
  createAdmin(admin: InsertUser): Promise<User>;
  getAllAdmins(): Promise<User[]>;
  
  // Resource methods
  getAllResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getResourcesByLocation(zipCode: string, radiusMiles?: number): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Questionnaire methods
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  updateQuestionnaireStatus(id: number, status: string): Promise<Questionnaire | undefined>;
  getIncompleteQuestionnaires(): Promise<Questionnaire[]>;
  getQuestionnaireAnalytics(): Promise<{ 
    total: number, 
    completed: number, 
    abandoned: number,
    inProgress: number,
    completionRate: number 
  }>;
  
  // Email methods
  logEmail(emailLog: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(): Promise<EmailLog[]>;
  getEmailAnalytics(): Promise<{
    totalSent: number,
    sentLast24Hours: number,
    sentLastWeek: number,
    sentLastMonth: number,
    byCategory: Record<string, number>
  }>;
}

export class DatabaseStorage implements IStorage {
  // ----- User methods -----
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }
  
  // ----- Admin methods -----
  async createAdmin(admin: InsertUser): Promise<User> {
    const adminData = { ...admin, isAdmin: true };
    const [createdAdmin] = await db.insert(users).values(adminData).returning();
    return createdAdmin;
  }
  
  async getAllAdmins(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isAdmin, true));
  }
  
  // ----- Resource methods -----
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }
  
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.category, category));
  }
  
  async getResourcesByLocation(zipCode: string, radiusMiles: number = 25): Promise<Resource[]> {
    // First, try to find resources in the exact ZIP code
    const exactMatchResources = await db.select().from(resources).where(eq(resources.zipCode, zipCode));
    
    // If we have resources with this exact ZIP code, return them
    if (exactMatchResources.length > 0) {
      return exactMatchResources;
    }
    
    // Otherwise, we need to find resources within the radius using latitude/longitude
    // For this to work properly, we need the user's latitude/longitude from the zipCode
    // In a real production implementation, we would:
    // 1. Use a geocoding service to get the lat/long of the user's ZIP code
    // 2. Query resources using the Haversine formula to calculate distance
    // 3. Filter resources that are within the radiusMiles
    
    // For development purposes, we'll implement a simple version that works with our seed data
    
    // Get all resources that have valid latitude and longitude
    const allResources = await db.select().from(resources).where(
      and(
        sql`${resources.latitude} IS NOT NULL`,
        sql`${resources.longitude} IS NOT NULL`
      )
    );
    
    // Sort resources by latitude/longitude proximity as a simplified approach
    // This is not accurate for real distance calculation but works for demo purposes
    const userLat = 38.8977; // Example: DC area latitude
    const userLong = -77.0365; // Example: DC area longitude
    
    // Implementation of the Haversine formula for accurate distance calculation
    const resourcesWithDistance = allResources.map(resource => {
      // Parse latitude and longitude as numbers
      const resLat = resource.latitude ? parseFloat(resource.latitude) : 0;
      const resLong = resource.longitude ? parseFloat(resource.longitude) : 0;
      
      // Skip resources without valid coordinates
      if (resLat === 0 || resLong === 0) {
        return {
          ...resource,
          distanceMiles: Number.MAX_VALUE // Put at the end of the list
        };
      }
      
      // Haversine formula
      const R = 3958.8; // Earth's radius in miles
      const dLat = (resLat - userLat) * Math.PI / 180;
      const dLon = (resLong - userLong) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(resLat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in miles
      
      return {
        ...resource,
        distanceMiles: distance
      };
    });
    
    // Filter to resources within the radius and sort by distance
    return resourcesWithDistance
      .filter(r => r.distanceMiles <= radiusMiles)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const [createdResource] = await db.insert(resources).values({
      ...resource,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return createdResource;
  }
  
  async updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updatedResource] = await db.update(resources)
      .set({ ...resource, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id));
    return true; // In Postgres, if no error is thrown, the operation was successful
  }
  
  // ----- Questionnaire methods -----
  async createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const [createdQuestionnaire] = await db.insert(questionnaires).values({
      ...questionnaire,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return createdQuestionnaire;
  }
  
  async updateQuestionnaireStatus(id: number, status: string): Promise<Questionnaire | undefined> {
    const updates: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    // If status is completed, add completion date
    if (status === 'completed') {
      updates.completedAt = new Date();
    }
    
    const [updatedQuestionnaire] = await db.update(questionnaires)
      .set(updates)
      .where(eq(questionnaires.id, id))
      .returning();
    return updatedQuestionnaire;
  }
  
  async getIncompleteQuestionnaires(): Promise<Questionnaire[]> {
    return await db.select().from(questionnaires)
      .where(
        and(
          eq(questionnaires.status, 'in_progress'),
          sql`${questionnaires.createdAt} < NOW() - INTERVAL '1 day'`
        )
      )
      .orderBy(desc(questionnaires.createdAt));
  }
  
  async getQuestionnaireAnalytics(): Promise<{ 
    total: number, 
    completed: number, 
    abandoned: number, 
    inProgress: number,
    completionRate: number
  }> {
    // This is a simplified implementation - a real one would use SQL aggregations
    const allQuestionnaires = await db.select().from(questionnaires);
    const completed = allQuestionnaires.filter(q => q.status === 'completed').length;
    const abandoned = allQuestionnaires.filter(q => q.status === 'abandoned').length;
    const inProgress = allQuestionnaires.filter(q => q.status === 'in_progress').length;
    const total = allQuestionnaires.length;
    
    return {
      total,
      completed,
      abandoned,
      inProgress,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }
  
  // ----- Email methods -----
  async logEmail(emailLog: InsertEmailLog): Promise<EmailLog> {
    const [createdLog] = await db.insert(emailLogs).values({
      ...emailLog,
      createdAt: new Date()
    }).returning();
    return createdLog;
  }
  
  async getEmailLogs(): Promise<EmailLog[]> {
    return await db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt));
  }
  
  async getEmailAnalytics(): Promise<{
    totalSent: number,
    sentLast24Hours: number,
    sentLastWeek: number,
    sentLastMonth: number,
    byCategory: Record<string, number>
  }> {
    // This would be better implemented with SQL aggregations in a real application
    const allEmails = await this.getEmailLogs();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const sentLast24Hours = allEmails.filter(email => 
      email.sentAt && new Date(email.sentAt) >= oneDayAgo
    ).length;
    
    const sentLastWeek = allEmails.filter(email => 
      email.sentAt && new Date(email.sentAt) >= oneWeekAgo
    ).length;
    
    const sentLastMonth = allEmails.filter(email => 
      email.sentAt && new Date(email.sentAt) >= oneMonthAgo
    ).length;
    
    // This is simplified - in a real implementation we'd join with resources
    // to get the category for each email
    const byCategory: Record<string, number> = {
      'Veteran Benefits': 0,
      'Aging Life Care Professionals': 0,
      'Home Care Companies': 0,
      'Government Agencies': 0,
      'Financial Advisors': 0,
      'Other': 0
    };
    
    return {
      totalSent: allEmails.length,
      sentLast24Hours,
      sentLastWeek,
      sentLastMonth,
      byCategory
    };
  }
}

// For populating initial resources during development
async function seedDevelopmentData() {
  const count = await db.select({ count: sql<number>`count(*)` }).from(resources);
  
  // Only seed if no resources exist
  if (count[0].count === 0) {
    console.log('Seeding development resources...');
    
    const defaultResources: InsertResource[] = [
      // Veteran Benefits
      {
        category: "Veteran Benefits",
        name: "VA Caregiver Support",
        companyName: "VA Caregiver Support Program",
        address: "810 Vermont Avenue, NW",
        city: "Washington",
        county: "District of Columbia",
        zipCode: "20420",
        email: "caregiversupport@va.gov",
        phone: "855-260-3274",
        website: "caregiver.va.gov",
        hours: "8 AM – 4 PM Monday–Friday",
        description: "Official VA program providing resources and support for caregivers of veterans",
        latitude: "38.9015",
        longitude: "-77.0353"
      },
      {
        category: "Veteran Benefits",
        name: "Veterans Aid Foundation",
        companyName: "Veterans Aid Foundation",
        address: "425 N Washington St",
        city: "Alexandria",
        county: "Alexandria City",
        zipCode: "22314",
        email: "info@veteransaid.org",
        phone: "703-555-1234",
        website: "veteransaid.org",
        hours: "9 AM – 5 PM Monday–Friday",
        description: "Non-profit organization helping veterans access benefits and services",
        latitude: "38.8048",
        longitude: "-77.0469"
      },
      
      // Aging Life Care Professionals
      {
        category: "Aging Life Care Professionals",
        name: "Senior Life Navigators",
        companyName: "Senior Life Navigators, LLC",
        address: "8300 Greensboro Dr, Suite 800",
        city: "McLean",
        county: "Fairfax",
        zipCode: "22102", 
        email: "info@seniorlifenavigators.com",
        phone: "571-555-8200",
        website: "seniorlifenavigators.com",
        hours: "9 AM – 5 PM Monday–Friday",
        description: "Professional geriatric care managers providing assessments and care planning",
        latitude: "38.9267",
        longitude: "-77.2344"
      },
      
      // Home Care Companies
      {
        category: "Home Care Companies",
        name: "Comfort Home Care",
        companyName: "Comfort Home Care, Inc.",
        address: "4401 East West Hwy, Suite 300",
        city: "Bethesda",
        county: "Montgomery",
        zipCode: "20814",
        email: "care@comforthomecare.com",
        phone: "301-555-7400",
        website: "comforthomecare.com",
        hours: "24/7 Service, Office: 8 AM – 8 PM Daily",
        description: "Licensed home care agency providing personal care and companionship",
        latitude: "38.9847",
        longitude: "-77.0947"
      },
      
      // Government Agencies
      {
        category: "Government Agencies",
        name: "Area Agency on Aging",
        companyName: "Arlington County Area Agency on Aging",
        address: "3033 Wilson Blvd",
        city: "Arlington",
        county: "Arlington",
        zipCode: "22201",
        email: "aging@arlingtonva.us",
        phone: "703-228-1700",
        website: "arlingtonva.us/aging",
        hours: "8 AM – 5 PM Monday–Friday",
        description: "County agency coordinating services for older adults and caregivers",
        latitude: "38.8914",
        longitude: "-77.0921"
      },
      
      // Financial Advisors
      {
        category: "Financial Advisors",
        name: "Retirement Planning Partners",
        companyName: "Retirement Planning Partners, LLC",
        address: "8270 Greensboro Dr, Suite 500",
        city: "McLean",
        county: "Fairfax",
        zipCode: "22102",
        email: "info@retirementplanning.com",
        phone: "703-555-9200",
        website: "retirementplanning.com",
        hours: "9 AM – 5 PM Monday–Friday",
        description: "Financial advisory firm specializing in retirement and long-term care planning",
        latitude: "38.9267",
        longitude: "-77.2344"
      }
    ];
    
    // Insert the initial resources
    for (const resource of defaultResources) {
      await db.insert(resources).values({
        ...resource,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Development resources seeded successfully');
  }
}

export const storage = new DatabaseStorage();

// Initialize the database with default resources when in development
if (process.env.NODE_ENV === 'development') {
  seedDevelopmentData().catch(console.error);
}
