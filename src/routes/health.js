// src/routes/health.js
module.exports = async function (fastify) {
  const { db } = fastify;

  // Skema Validasi untuk POST (Performa & Keamanan)
  const postSchema = {
    body: {
      type: 'object',
      required: ['patientId', 'diagnosis'],
      properties: {
        patientId: { type: 'string', format: 'uuid' },
        diagnosis: { type: 'string', minLength: 3 },
        treatment: { type: 'string' }
      }
    }
  };

  // CREATE
  fastify.post('/records', { schema: postSchema }, async (request, reply) => {
    try {
      const record = await db.record.create({
        data: request.body
      });
      return reply.code(201).send(record);
    } catch (error) {
      return reply.code(500).send({ error: 'Gagal menyimpan data medis' });
    }
  });

  // READ (dengan select field spesifik untuk keamanan)
  fastify.get('/records/:id', async (request, reply) => {
    const { id } = request.params;
    const record = await db.record.findUnique({
      where: { id },
      select: { // Keamanan: Jangan kirim field sensitif jika tidak perlu
        id: true,
        diagnosis: true,
        treatment: true,
        createdAt: true,
        patient: { select: { name: true } }
      }
    });
    
    if (!record) return reply.code(404).send({ message: 'Data tidak ditemukan' });
    return record;
  });
  fastify.get('/records', async (request, reply) => {
  const records = await db.record.findMany({
    include: { patient: true }
  });
  return records;
});
};