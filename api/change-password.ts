import { storage } from '../server/storage';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { username, oldPassword, newPassword } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
      await storage.updatePassword(username, newPassword);
      await storage.updateUser(user.id, { isFirstLogin: false });
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error changing password', error });
    }
  }
  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 