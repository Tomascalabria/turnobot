import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plan } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const existing = await prisma.professional.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const professional = await prisma.professional.create({
      data: {
        name,
        email,
        passwordHash,
        plan: plan || 'FREE',
        botConfig: { create: {} }
      }
    })

    return NextResponse.json({ id: professional.id }, { status: 201 })
  } catch (err) {
    console.error('Error en registro:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
