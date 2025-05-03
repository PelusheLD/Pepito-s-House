import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Si el usuario es admin, mostrar todos los platos
      // Aquí deberías agregar lógica de autenticación si es necesario
      const menuItems = await storage.getMenuItems();
      return res.status(200).json(menuItems);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching menu items', error });
    }
  }
  if (req.method === 'POST') {
    try {
      const newMenuItem = await storage.createMenuItem(req.body);
      return res.status(201).json(newMenuItem);
    } catch (error) {
      return res.status(400).json({ message: 'Error creating menu item', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const updatedMenuItem = await storage.updateMenuItem(id, updates);
      return res.status(200).json(updatedMenuItem);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating menu item', error });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await storage.deleteMenuItem(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting menu item', error });
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 