const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Profesional de prueba
  const passwordHash = await bcrypt.hash('password123', 10)

  const prof = await prisma.professional.upsert({
    where: { email: 'demo@turnobot.app' },
    update: {},
    create: {
      email: 'demo@turnobot.app',
      passwordHash,
      name: 'Dr. Demo',
      plan: 'STARTER',
      botConfig: {
        create: {}
      }
    }
  })

  // Servicios de prueba
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      {
        professionalId: prof.id,
        name: 'Consulta general',
        durationMin: 30,
        price: 5000,
        depositPct: 30
      },
      {
        professionalId: prof.id,
        name: 'Control de seguimiento',
        durationMin: 20,
        price: 3500,
        depositPct: 0
      }
    ]
  })

  console.log('✅ Seed completado. Profesional:', prof.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
