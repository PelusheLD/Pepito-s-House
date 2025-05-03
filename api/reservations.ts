import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const reservations = await storage.getReservations();
      return res.status(200).json(reservations);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching reservations', error });
    }
  }
  if (req.method === 'POST') {
    try {
      const newReservation = await storage.createReservation(req.body);
      return res.status(201).json(newReservation);
    } catch (error) {
      return res.status(400).json({ message: 'Error creating reservation', error });
    }
  }
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const updatedReservation = await storage.updateReservation(id, updates);
      return res.status(200).json(updatedReservation);
    } catch (error) {
      return res.status(400).json({ message: 'Error updating reservation', error });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await storage.deleteReservation(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting reservation', error });
    }
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 