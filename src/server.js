require('dotenv').config(); 
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg'); // Perbaikan di sini
const { PrismaClient } = require('@prisma/client');
const fastify = require('fastify')({ logger: true });

// Setup Koneksi Pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Inisialisasi Client dengan Adapter
const prisma = new PrismaClient({ adapter });

fastify.decorate('db', prisma);
fastify.register(require('./routes/health'), { prefix: '/api/v1' });
fastify.register(require('./routes/patient'), { prefix: '/api/v1' }); // TAMBAHKAN INI

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server Health API Siap!');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();