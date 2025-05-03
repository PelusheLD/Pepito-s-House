export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Aquí podrías limpiar la sesión o el token, según tu lógica de autenticación
    return res.status(200).json({ message: 'Logged out successfully' });
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 