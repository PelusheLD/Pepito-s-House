export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (req.session) {
      req.session.destroy(() => {
        res.status(200).json({ message: 'Sesión cerrada' });
      });
    } else {
      res.status(200).json({ message: 'Sesión cerrada' });
    }
    return;
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 