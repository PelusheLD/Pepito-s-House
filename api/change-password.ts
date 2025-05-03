import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { username, oldPassword, newPassword } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Aquí deberías comparar la contraseña (hash)
      // Por simplicidad, solo compara texto plano (ajusta según tu lógica real)
      if (user.password !== oldPassword) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
      // Actualizar la contraseña en la base de datos
      await storage.updateSetting(`user:${username}:password`, newPassword);
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error changing password', error });
    }
  }
  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 