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
      // Veteran Benefits
      {
        category: "Veteran Benefits",
        name: "VA Caregiver Support",
        address: "810 Vermont Avenue, NW, Washington, DC 20420",
        email: "caregiversupport@va.gov",
        hours: "8 AM – 4 PM Monday–Friday"
      },
      {
        category: "Veteran Benefits",
        name: "Veterans Aid Foundation",
        address: "425 N Washington St, Alexandria, VA 22314",
        email: "info@veteransaid.org",
        hours: "9 AM – 5 PM Monday–Friday"
      },
      {
        category: "Veteran Benefits",
        name: "Military Family Support Alliance",
        address: "200 N Washington St, Falls Church, VA 22046",
        email: "contact@mfsa.org",
        hours: "8:30 AM – 4:30 PM Monday–Friday"
      },
      
      // Aging Life Care Professionals
      {
        category: "Aging Life Care Professionals",
        name: "Senior Life Navigators",
        address: "8300 Greensboro Dr, McLean, VA 22102",
        email: "info@seniorlifenavigators.com",
        hours: "9 AM – 5 PM Monday–Friday"
      },
      {
        category: "Aging Life Care Professionals",
        name: "Elder Care Solutions",
        address: "1005 N Glebe Rd, Arlington, VA 22201",
        email: "help@eldercaresolutions.com",
        hours: "8 AM – 6 PM Monday–Friday, 10 AM – 2 PM Saturday"
      },
      {
        category: "Aging Life Care Professionals",
        name: "Golden Years Consulting",
        address: "11710 Plaza America Dr, Reston, VA 20190",
        email: "appointments@goldenyearsconsulting.com",
        hours: "9 AM – 4 PM Monday–Thursday"
      },
      
      // Home Care Companies
      {
        category: "Home Care Companies",
        name: "Comfort Home Care",
        address: "4401 East West Hwy, Bethesda, MD 20814",
        email: "care@comforthomecare.com",
        hours: "24/7 Service, Office: 8 AM – 8 PM Daily"
      },
      {
        category: "Home Care Companies",
        name: "Visiting Angels",
        address: "459 Herndon Pkwy, Herndon, VA 20170",
        email: "info@visitingangels-nova.com",
        hours: "24/7 Service, Office: 8:30 AM – 5 PM Monday–Friday"
      },
      {
        category: "Home Care Companies",
        name: "Home Instead Senior Care",
        address: "4900 Leesburg Pike, Alexandria, VA 22302",
        email: "info@homeinstead-nova.com",
        hours: "24/7 Service, Office: 9 AM – 5 PM Monday–Friday"
      },
      
      // Government Agencies
      {
        category: "Government Agencies",
        name: "Area Agency on Aging",
        address: "3033 Wilson Blvd, Arlington, VA 22201",
        email: "aging@arlingtonva.us",
        hours: "8 AM – 5 PM Monday–Friday"
      },
      {
        category: "Government Agencies",
        name: "Social Security Administration",
        address: "1121 W Broad St, Falls Church, VA 22046",
        email: "fc.office@ssa.gov",
        hours: "9 AM – 4 PM Monday–Friday, Closed Wednesday"
      },
      {
        category: "Government Agencies",
        name: "Medicare Information Center",
        address: "7121 Leesburg Pike, Falls Church, VA 22043",
        email: "info@medicarehelp.gov",
        hours: "8:30 AM – 4:30 PM Monday–Friday"
      },
      
      // Financial Advisors
      {
        category: "Financial Advisors",
        name: "Retirement Planning Partners",
        address: "8270 Greensboro Dr, McLean, VA 22102",
        email: "info@retirementplanning.com",
        hours: "9 AM – 5 PM Monday–Friday"
      },
      {
        category: "Financial Advisors",
        name: "ElderWealth Financial",
        address: "1800 Tysons Blvd, McLean, VA 22102",
        email: "help@elderwealthfinancial.com",
        hours: "9 AM – 4 PM Monday–Friday"
      },
      {
        category: "Financial Advisors",
        name: "Senior Money Matters",
        address: "2070 Chain Bridge Rd, Vienna, VA 22182",
        email: "advisors@seniormoneymatters.com",
        hours: "8:30 AM – 5:30 PM Monday–Thursday, 8:30 AM – 3 PM Friday"
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
