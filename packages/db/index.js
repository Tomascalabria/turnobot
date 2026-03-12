const { PrismaClient } = require('@prisma/client')

// En monorepos Next.js dev recicla el módulo; evitar instancias múltiples
const globalForPrisma = globalThis

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

module.exports = { prisma }
