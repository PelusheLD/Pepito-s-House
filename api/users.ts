import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await storage.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching users', error });
    }
  }
  if (req.method === 'POST') {
    try {
      const newUser = await storage.createUser(req.body);
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(400).json({ message: 'Error creating user', error });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { username } = req.body;
      await storage.deleteUser(username);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting user', error });
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 