import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const staffMembers = await storage.getStaffMembers();
      return res.status(200).json(staffMembers);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching staff members', error });
    }
  }
  if (req.method === 'POST') {
    try {
      const newStaff = await storage.createStaffMember(req.body);
      return res.status(201).json(newStaff);
    } catch (error) {
      return res.status(400).json({ message: 'Error creating staff member', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const updatedStaff = await storage.updateStaffMember(id, updates);
      return res.status(200).json(updatedStaff);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating staff member', error });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await storage.deleteStaffMember(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting staff member', error });
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 