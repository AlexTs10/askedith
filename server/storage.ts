import { resources, type Resource, type InsertResource } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// Interface with CRUD methods for storage
export interface IStorage {
  // User methods (keeping for reference)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resource methods
  getAllResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resources: Map<number, Resource>;
  currentUserId: number;
  currentResourceId: number;

  constructor() {
    this.users = new Map();
    this.resources = new Map();
    this.currentUserId = 1;
    this.currentResourceId = 1;
    
    // Initialize with the three default resources
    this.initializeResources();
  }

  private initializeResources() {
    const defaultResources: InsertResource[] = [
      {
        category: "Financial Solutions",
        name: "Second Act Bank",
        address: "1600 Diagonal Road, Suite 600, Alexandria, VA 22314",
        email: "elias@secondactfs.com",
        hours: "9 AM – 5 PM Monday–Friday"
      },
      {
        category: "Home Sale Solutions",
        name: "Second Act Bank",
        address: "1600 Diagonal Road, Suite 600, Alexandria, VA 22314",
        email: "elias@secondactfs.com",
        hours: "9 AM – 5 PM Monday–Friday"
      },
      {
        category: "Insurance Solutions",
        name: "Second Act Bank",
        address: "1600 Diagonal Road, Suite 600, Alexandria, VA 22314",
        email: "elias@secondactfs.com",
        hours: "9 AM – 5 PM Monday–Friday"
      }
    ];

    defaultResources.forEach(resource => {
      this.createResource(resource);
    });
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }

  // User methods (keeping for reference)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
