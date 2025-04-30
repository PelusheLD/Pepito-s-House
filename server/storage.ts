import { users, menuItems, categories, staff, settings, locations, socialMedia } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import type { 
  User, InsertUser, 
  MenuItem, InsertMenuItem, 
  Category, InsertCategory,
  Staff, InsertStaff,
  Settings, InsertSettings,
  Location, InsertLocation,
  SocialMedia, InsertSocialMedia
} from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { hashPassword } from "./auth";

// Setup PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  initializeDefaultAdmin(): Promise<void>;
  
  // Menu item methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  getFeaturedMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Staff methods
  getStaffMembers(): Promise<Staff[]>;
  getStaffMemberById(id: number): Promise<Staff | undefined>;
  createStaffMember(member: InsertStaff): Promise<Staff>;
  updateStaffMember(id: number, updates: Partial<Staff>): Promise<Staff>;
  deleteStaffMember(id: number): Promise<void>;
  
  // Settings methods
  getSetting(key: string): Promise<string | undefined>;
  getAllSettings(): Promise<Settings[]>;
  updateSetting(key: string, value: string): Promise<Settings>;
  
  // Location methods
  getLocation(): Promise<Location | undefined>;
  updateLocation(updates: Partial<Location>): Promise<Location>;
  
  // Social Media methods
  getSocialMedias(): Promise<SocialMedia[]>;
  getSocialMediaById(id: number): Promise<SocialMedia | undefined>;
  createSocialMedia(social: InsertSocialMedia): Promise<SocialMedia>;
  updateSocialMedia(id: number, updates: Partial<SocialMedia>): Promise<SocialMedia>;
  deleteSocialMedia(id: number): Promise<void>;
  
  // Session store
  sessionStore: any; // Use 'any' to avoid the type error for now
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Use 'any' to avoid the SessionStore type error
  
  constructor() {
    // Use type assertion to avoid the Symbol indexing error
    const pool = (db as any)[Symbol.for('neon.client')];
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async initializeDefaultAdmin(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await hashPassword("admin123");
      await this.createUser({
        username: "admin",
        password: hashedPassword,
        isFirstLogin: true,
        role: "admin"
      });
      console.log("Default admin user created");

      // Initialize default settings
      await this.updateSetting("restaurantName", "LLAMAS!");
      await this.updateSetting("restaurantLogo", "https://images.unsplash.com/photo-1656137002630-6da73c6d5b11?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGZpcmUlMjBsb2dvfGVufDB8fDB8fHww");
      
      // Create default categories
      const categories = ["Entradas", "Platos Principales", "Postres", "Bebidas"];
      for (const name of categories) {
        await this.createCategory({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        });
      }
    }
  }
  
  // Menu item methods
  async getMenuItems(): Promise<MenuItem[]> {
    return db.select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(desc(menuItems.isFeatured));
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async getFeaturedMenuItems(): Promise<MenuItem[]> {
    return db.select().from(menuItems)
      .where(and(
        eq(menuItems.isFeatured, true),
        eq(menuItems.isAvailable, true)
      ));
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems)
      .where(and(
        eq(menuItems.categoryId, categoryId),
        eq(menuItems.isAvailable, true)
      ));
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }
  
  // Staff methods
  async getStaffMembers(): Promise<Staff[]> {
    return db.select().from(staff);
  }

  async getStaffMemberById(id: number): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id));
    return member;
  }

  async createStaffMember(member: InsertStaff): Promise<Staff> {
    const [newMember] = await db.insert(staff).values(member).returning();
    return newMember;
  }

  async updateStaffMember(id: number, updates: Partial<Staff>): Promise<Staff> {
    const [updatedMember] = await db
      .update(staff)
      .set(updates)
      .where(eq(staff.id, id))
      .returning();
    return updatedMember;
  }

  async deleteStaffMember(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }
  
  // Settings methods
  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async getAllSettings(): Promise<Settings[]> {
    return db.select().from(settings);
  }

  async updateSetting(key: string, value: string): Promise<Settings> {
    const existingSetting = await db.select().from(settings).where(eq(settings.key, key));
    
    if (existingSetting.length > 0) {
      const [updated] = await db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [newSetting] = await db
        .insert(settings)
        .values({ key, value })
        .returning();
      return newSetting;
    }
  }
  
  // Location methods
  async getLocation(): Promise<Location | undefined> {
    const [location] = await db.select().from(locations);
    return location;
  }

  async updateLocation(updates: Partial<Location>): Promise<Location> {
    const existingLocation = await db.select().from(locations);
    
    if (existingLocation.length > 0) {
      const [updated] = await db
        .update(locations)
        .set(updates)
        .where(eq(locations.id, existingLocation[0].id))
        .returning();
      return updated;
    } else {
      const [newLocation] = await db
        .insert(locations)
        .values(updates as InsertLocation)
        .returning();
      return newLocation;
    }
  }
  
  // Social Media methods
  async getSocialMedias(): Promise<SocialMedia[]> {
    return db.select().from(socialMedia);
  }

  async getSocialMediaById(id: number): Promise<SocialMedia | undefined> {
    const [media] = await db.select().from(socialMedia).where(eq(socialMedia.id, id));
    return media;
  }

  async createSocialMedia(social: InsertSocialMedia): Promise<SocialMedia> {
    const [newSocial] = await db.insert(socialMedia).values(social).returning();
    return newSocial;
  }

  async updateSocialMedia(id: number, updates: Partial<SocialMedia>): Promise<SocialMedia> {
    const [updatedSocial] = await db
      .update(socialMedia)
      .set(updates)
      .where(eq(socialMedia.id, id))
      .returning();
    return updatedSocial;
  }

  async deleteSocialMedia(id: number): Promise<void> {
    await db.delete(socialMedia).where(eq(socialMedia.id, id));
  }
}

export const storage = new DatabaseStorage();
