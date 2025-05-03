import { storage } from '../server/storage';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    // Aquí deberías comparar la contraseña (hash)
    // Por simplicidad, solo compara texto plano (ajusta según tu lógica real)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    return res.status(200).json(user);
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 