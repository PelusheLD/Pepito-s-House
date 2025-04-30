import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { insertMenuItemSchema, insertCategorySchema, insertStaffSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Middleware to check if user is authenticated and is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };

  // Menu items routes
  app.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu items" });
    }
  });

  app.get("/api/menu-items/featured", async (req, res) => {
    try {
      const featuredItems = await storage.getFeaturedMenuItems();
      res.json(featuredItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItemById(id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu item" });
    }
  });

  app.post("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const newMenuItem = await storage.createMenuItem(validatedData);
      res.status(201).json(newMenuItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data", error });
    }
  });

  app.put("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItemById(id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      const updatedMenuItem = await storage.updateMenuItem(id, req.body);
      res.json(updatedMenuItem);
    } catch (error) {
      res.status(400).json({ message: "Error updating menu item", error });
    }
  });

  app.delete("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting menu item" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data", error });
    }
  });

  app.put("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const updatedCategory = await storage.updateCategory(id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: "Error updating category", error });
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staffMembers = await storage.getStaffMembers();
      res.json(staffMembers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching staff members" });
    }
  });

  app.post("/api/staff", isAdmin, async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const newStaffMember = await storage.createStaffMember(validatedData);
      res.status(201).json(newStaffMember);
    } catch (error) {
      res.status(400).json({ message: "Invalid staff member data", error });
    }
  });

  app.put("/api/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.getStaffMemberById(id);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      const updatedStaffMember = await storage.updateStaffMember(id, req.body);
      res.json(updatedStaffMember);
    } catch (error) {
      res.status(400).json({ message: "Error updating staff member", error });
    }
  });

  app.delete("/api/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStaffMember(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting staff member" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      if (!value) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json({ key: req.params.key, value });
    } catch (error) {
      res.status(500).json({ message: "Error fetching setting" });
    }
  });

  app.put("/api/settings/:key", isAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const updatedSetting = await storage.updateSetting(req.params.key, value);
      res.json(updatedSetting);
    } catch (error) {
      res.status(500).json({ message: "Error updating setting" });
    }
  });

  // Location routes
  app.get("/api/location", async (req, res) => {
    try {
      const location = await storage.getLocation();
      res.json(location || {});
    } catch (error) {
      res.status(500).json({ message: "Error fetching location" });
    }
  });

  app.put("/api/location", isAdmin, async (req, res) => {
    try {
      const updatedLocation = await storage.updateLocation(req.body);
      res.json(updatedLocation);
    } catch (error) {
      res.status(500).json({ message: "Error updating location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
