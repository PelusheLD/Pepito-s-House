import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema.js';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { users, defaultAdmin } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './migrations' });
  
  // Crear usuario admin por defecto si no existe
  const adminUser = await db.select().from(users).where(eq(users.username, defaultAdmin.username));
  
  if (adminUser.length === 0) {
    console.log('Creating default admin user...');
    await db.insert(users).values(defaultAdmin);
    console.log('Default admin user created!');
  } else {
    console.log('Admin user already exists');
  }
  
  console.log('Migrations completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed');
  console.error(err);
  process.exit(1);
}); 