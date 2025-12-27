import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSessionWithUserId } from '@/lib/auth'
import { Role } from '@prisma/client'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).refine(
    (password) => {
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      return hasUpperCase && hasLowerCase && hasSpecialChar
    },
    {
      message: 'Password must contain uppercase, lowercase, and special character',
    }
  ),
  retypePassword: z.string(),
  role: z.enum(['EMPLOYEE', 'TECHNICIAN', 'MANAGER', 'ADMIN']).optional(),
}).refine((data) => data.password === data.retypePassword, {
  message: "Passwords don't match",
  path: ['retypePassword'],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = signupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role } = validation.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Validate role and default to EMPLOYEE if not provided or invalid
    const userRole = role && Object.values(Role).includes(role as Role) 
      ? (role as Role) 
      : Role.EMPLOYEE

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    })

    await createSessionWithUserId(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

