import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const settings = await storage.getAllSettings();
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching settings', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { key, value } = req.body;
      const updatedSetting = await storage.updateSetting(key, value);
      return res.status(200).json(updatedSetting);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating settings', error });
    }
  }
  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 