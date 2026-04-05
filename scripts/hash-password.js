#!/usr/bin/env node

/**
 * Utility to generate a bcrypt hash for the admin password
 *
 * Usage:
 *   node scripts/hash-password.js "YourPassword123!"
 *
 * Then set the output as ADMIN_PASSWORD_HASH in your environment variables:
 *   ADMIN_PASSWORD_HASH=$2a$12$...
 *
 * This is more secure than storing the password in plain text
 * as ADMIN_PASSWORD.
 */

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.error('Usage: node scripts/hash-password.js "your-password"')
  console.error('')
  console.error('Example:')
  console.error('  node scripts/hash-password.js "MySecurePassword123!"')
  console.error('')
  console.error('Then set ADMIN_PASSWORD_HASH in your environment:')
  console.error('  ADMIN_PASSWORD_HASH=<output-hash>')
  process.exit(1)
}

const SALT_ROUNDS = 12

async function main() {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    console.log('')
    console.log('Generated bcrypt hash:')
    console.log(hash)
    console.log('')
    console.log('Set this as your ADMIN_PASSWORD_HASH environment variable:')
    console.log(`  ADMIN_PASSWORD_HASH=${hash}`)
    console.log('')
  } catch (error) {
    console.error('Error generating hash:', error.message)
    process.exit(1)
  }
}

main()
