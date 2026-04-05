// src/routes/patient.js
module.exports = async function (fastify) {
  const { db } = fastify;

  // 1. CREATE: Tambah Pasien Baru
  fastify.post('/patients', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const patient = await db.patient.create({
        data: request.body
      });
      return reply.code(201).send(patient);
    } catch (error) {
      if (error.code === 'P2002') { // Error Prisma untuk Unique Constraint
        return reply.code(400).send({ error: 'Email sudah terdaftar' });
      }
      return reply.code(500).send({ error: 'Gagal membuat data pasien' });
    }
  });

  // 2. READ ALL: Ambil Semua Pasien
  fastify.get('/patients', async () => {
    return await db.patient.findMany({
      include: { records: true } // Menampilkan riwayat medis mereka juga
    });
  });

  // 3. READ ONE: Ambil Pasien Spesifik
  fastify.get('/patients/:id', async (request, reply) => {
    const { id } = request.params;
    const patient = await db.patient.findUnique({
      where: { id },
      include: { records: true }
    });

    if (!patient) return reply.code(404).send({ message: 'Pasien tidak ditemukan' });
    return patient;
  });

  // 4. DELETE: Hapus Pasien
  fastify.delete('/patients/:id', async (request, reply) => {
    const { id } = request.params;
    await db.patient.delete({ where: { id } });
    return reply.code(204).send();
  });
};