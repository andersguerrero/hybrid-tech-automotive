#!/usr/bin/env node

/**
 * Bootstrap (or update) an admin user.
 *
 * Usage:
 *   node scripts/create-admin.js <email> <password>
 *   node scripts/create-admin.js  (interactive)
 *
 * Requires DATABASE_URL to be set and the AdminUser table to exist
 * (run `prisma db push` first).
 */

const bcrypt = require('bcryptjs')
const readline = require('readline')

const SALT_ROUNDS = 12

function prompt(question, { silent = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    if (silent) {
      // Hide input for password
      const stdin = process.openStdin()
      const onData = (char) => {
        char = char.toString()
        if (char === '\n' || char === '\r' || char === '') {
          stdin.removeListener('data', onData)
        } else {
          process.stdout.clearLine?.(0)
          readline.cursorTo(process.stdout, 0)
          process.stdout.write(question + Array(rl.line.length + 1).join('*'))
        }
      }
      process.stdin.on('data', onData)
    }
    rl.question(question, (answer) => {
      rl.close()
      if (silent) process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set.')
    process.exit(1)
  }

  let email = process.argv[2]
  let password = process.argv[3]

  if (!email) email = await prompt('Admin email: ')
  if (!password) password = await prompt('Admin password: ', { silent: true })

  if (!email || !email.includes('@')) {
    console.error('Error: invalid email')
    process.exit(1)
  }
  if (!password || password.length < 8) {
    console.error('Error: password must be at least 8 characters')
    process.exit(1)
  }

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const normalizedEmail = email.toLowerCase().trim()

    const result = await prisma.adminUser.upsert({
      where: { email: normalizedEmail },
      update: { passwordHash },
      create: {
        email: normalizedEmail,
        passwordHash,
        role: 'admin',
      },
    })

    console.log('')
    console.log('✓ Admin user saved:')
    console.log(`  id:    ${result.id}`)
    console.log(`  email: ${result.email}`)
    console.log(`  role:  ${result.role}`)
    console.log('')
  } catch (err) {
    console.error('Failed to create admin user:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
