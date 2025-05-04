import { Request, Response } from "express";
import { storage } from "./storage"; // Asegúrate de que este import exista

// Extender la interfaz Request para incluir user
interface AuthenticatedRequest extends Request {
  user: {
    username: string;
  };
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!user || !user.username) {
      console.error("No hay usuario autenticado en la request.");
      return res.status(401).json({ error: "No autenticado" });
    }

    // Validar contraseña actual
    const isValid = await storage.validatePassword(user.username, currentPassword);
    if (!isValid) {
      console.warn(`Contraseña incorrecta para usuario: ${user.username}`);
      return res.status(400).json({ error: "Contraseña actual incorrecta" });
    }

    // Actualizar contraseña
    await storage.updatePassword(user.username, newPassword);

    // Obtener el usuario de la base de datos para obtener el id
    const userDb = await storage.getUserByUsername(user.username);
    if (!userDb) {
      console.error(`Usuario no encontrado en la base de datos: ${user.username}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar isFirstLogin a false usando el id
    await storage.updateUser(userDb.id, { isFirstLogin: false });

    // Obtener el usuario actualizado
    const updatedUser = await storage.getUserByUsername(user.username);
    console.log("Usuario actualizado correctamente:", updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
} 