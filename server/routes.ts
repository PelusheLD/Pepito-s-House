import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertMenuItemSchema, 
  insertCategorySchema, 
  insertStaffSchema,
  insertSocialMediaSchema,
  insertReservationSchema
} from "../shared/schema.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function authenticateJWT(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export async function registerRoutes(app: Express): Promise<Express> {
  // Menu items routes
  app.get("/api/menu-items", async (req, res) => {
    try {
        const menuItems = await storage.getMenuItems();
        return res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      return res.status(500).json({ message: "Error fetching menu items" });
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

  app.post("/api/menu-items", async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const newMenuItem = await storage.createMenuItem(validatedData);
      res.status(201).json(newMenuItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data", error });
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
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

  app.delete("/api/menu-items/:id", async (req, res) => {
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

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data", error });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
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

  app.delete("/api/categories/:id", async (req, res) => {
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

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const newStaffMember = await storage.createStaffMember(validatedData);
      res.status(201).json(newStaffMember);
    } catch (error) {
      res.status(400).json({ message: "Invalid staff member data", error });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
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

  app.delete("/api/staff/:id", async (req, res) => {
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

  app.put("/api/settings/:key", async (req, res) => {
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

  app.put("/api/location", async (req, res) => {
    try {
      const updatedLocation = await storage.updateLocation(req.body);
      res.json(updatedLocation);
    } catch (error) {
      res.status(500).json({ message: "Error updating location" });
    }
  });

  // Social Media routes
  app.get("/api/social-media", async (req, res) => {
    try {
      const socialMedias = await storage.getSocialMedias();
      res.json(socialMedias);
    } catch (error) {
      res.status(500).json({ message: "Error fetching social media links" });
    }
  });

  app.get("/api/social-media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const socialMedia = await storage.getSocialMediaById(id);
      if (!socialMedia) {
        return res.status(404).json({ message: "Social media link not found" });
      }
      res.json(socialMedia);
    } catch (error) {
      res.status(500).json({ message: "Error fetching social media link" });
    }
  });

  app.post("/api/social-media", async (req, res) => {
    try {
      const validatedData = insertSocialMediaSchema.parse(req.body);
      const newSocialMedia = await storage.createSocialMedia(validatedData);
      res.status(201).json(newSocialMedia);
    } catch (error) {
      res.status(400).json({ message: "Invalid social media data", error });
    }
  });

  app.put("/api/social-media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const socialMedia = await storage.getSocialMediaById(id);
      if (!socialMedia) {
        return res.status(404).json({ message: "Social media link not found" });
      }
      
      const updatedSocialMedia = await storage.updateSocialMedia(id, req.body);
      res.json(updatedSocialMedia);
    } catch (error) {
      res.status(400).json({ message: "Error updating social media link", error });
    }
  });

  app.delete("/api/social-media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocialMedia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting social media link" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Verificar que hemos obtenido los usuarios correctamente
      console.log("Users found:", users.length);
      return res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        password,
        isFirstLogin: true,
        role: "admin"
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Error creating user", error });
    }
  });

  app.post("/api/users/:id/reset-password", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.updateUser(id, {
        password,
        isFirstLogin: true
      });
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ message: "Error resetting password" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting the default admin
      if (user.username === "admin") {
        return res.status(400).json({ message: "Cannot delete default admin user" });
      }
      
      await storage.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Reservation routes
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservations" });
    }
  });

  app.get("/api/reservations/status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const reservations = await storage.getReservationsByStatus(status);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservations by status" });
    }
  });

  app.get("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservationById(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservation" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      // Validar los datos con nuestro schema personalizado
      const validatedData = insertReservationSchema.parse(req.body);
      
      // El manejo de la fecha se realiza en el método storage.createReservation
      const newReservation = await storage.createReservation(validatedData);
      
      // Aquí podríamos implementar la integración con WhatsApp para notificar
      // al restaurante sobre la nueva reserva
      
      res.status(201).json(newReservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(400).json({ message: "Invalid reservation data", error });
    }
  });

  app.put("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservationById(id);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      
      const updatedReservation = await storage.updateReservation(id, req.body);
      
      // Si el estado ha cambiado, podríamos enviar una notificación por WhatsApp
      if (reservation.status !== updatedReservation.status) {
        // Implementar notificación por WhatsApp aquí
      }
      
      res.json(updatedReservation);
    } catch (error) {
      res.status(400).json({ message: "Error updating reservation", error });
    }
  });

  app.delete("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReservation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting reservation" });
    }
  });

  // Endpoint de login con JWT
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // No devuelvas la contraseña
    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: "2h" });
    res.json({ user: userWithoutPassword, token });
  });

  // Endpoint para obtener el usuario autenticado (requiere JWT)
  app.get("/api/user", authenticateJWT, async (req, res) => {
    res.json((req as any).user);
  });

  // Endpoint para cerrar sesión (opcional con JWT, solo frontend borra el token)
  app.post("/api/logout", (req, res) => {
    res.status(200).json({ message: "Sesión cerrada" });
  });

  // Endpoint para cambiar contraseña (requiere JWT)
  app.post("/api/change-password", authenticateJWT, async (req, res) => {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    const dbUser = await storage.getUserByUsername(user.username);
    if (!dbUser || dbUser.password !== currentPassword) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }
    await storage.updateUser(dbUser.id, { password: newPassword, isFirstLogin: false });
    const updatedUser = await storage.getUserByUsername(user.username);
    res.status(200).json(updatedUser);
  });

  return app;
}
