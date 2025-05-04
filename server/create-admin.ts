import 'dotenv/config';
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
neonConfig.webSocketConstructor = ws;
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users, defaultAdmin } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('Checking for admin user...');
  
  const adminUser = await db.select().from(users).where(eq(users.username, defaultAdmin.username));
  
  if (adminUser.length === 0) {
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
    await db.insert(users).values({ ...defaultAdmin, password: hashedPassword });
    console.log('Default admin user created!');
  } else {
    console.log('Admin user already exists');
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create admin user');
  console.error(err);
  process.exit(1);
}); 