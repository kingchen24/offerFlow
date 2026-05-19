import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const results = {}

  // Check env vars
  results.envVars = {
    DATABASE_URL: (process.env.DATABASE_URL || '').replace(/\/\/(.*?):(.*?)@/, '//$1:***@'),
    DIRECT_URL: (process.env.DIRECT_URL || '').replace(/\/\/(.*?):(.*?)@/, '//$1:***@'),
    NODE_ENV: process.env.NODE_ENV,
  }

  // Try connecting
  try {
    const start = Date.now()
    await prisma.$connect()
    results.connectMs = Date.now() - start

    const result = await prisma.$queryRaw`SELECT version(), current_database(), now()`
    results.dbInfo = result

    // Test query
    const userCount = await prisma.user.count()
    results.userCount = userCount

    await prisma.$disconnect()
    results.status = 'ok'
  } catch (e) {
    results.status = 'error'
    results.error = {
      name: e.name,
      message: e.message,
      stack: e.stack?.split('\n').slice(0, 5).join('\n'),
    }
  }

  return NextResponse.json(results)
}
