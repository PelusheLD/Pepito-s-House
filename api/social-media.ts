import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const socialMedias = await storage.getSocialMedias();
      return res.status(200).json(socialMedias);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching social media links', error });
    }
  }
  if (req.method === 'POST') {
    try {
      const newSocial = await storage.createSocialMedia(req.body);
      return res.status(201).json(newSocial);
    } catch (error) {
      return res.status(400).json({ message: 'Error creating social media link', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const updatedSocial = await storage.updateSocialMedia(id, updates);
      return res.status(200).json(updatedSocial);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating social media link', error });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await storage.deleteSocialMedia(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting social media link', error });
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 