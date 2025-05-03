import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching categories', error });
    }
  }
  if (req.method === 'POST') {
    try {
      const newCategory = await storage.createCategory(req.body);
      return res.status(201).json(newCategory);
    } catch (error) {
      return res.status(400).json({ message: 'Error creating category', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const updatedCategory = await storage.updateCategory(id, updates);
      return res.status(200).json(updatedCategory);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating category', error });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await storage.deleteCategory(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting category', error });
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 