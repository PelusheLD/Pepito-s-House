import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const location = await storage.getLocation();
      return res.status(200).json(location);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching location', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const updatedLocation = await storage.updateLocation(updates);
      return res.status(200).json(updatedLocation);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating location', error });
    }
  }
  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 