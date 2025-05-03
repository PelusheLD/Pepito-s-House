import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      const newUser = await storage.createUser({ username, password });
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(400).json({ message: 'Error registering user', error });
    }
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 