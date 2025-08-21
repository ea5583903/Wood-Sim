import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../auth-test'

describe('Auth utilities', () => {
  it('should hash password correctly', async () => {
    const password = 'testpassword123'
    const hashedPassword = await hashPassword(password)
    
    expect(hashedPassword).toBeDefined()
    expect(hashedPassword).not.toBe(password)
    expect(hashedPassword.length).toBeGreaterThan(50)
  })

  it('should verify password correctly', async () => {
    const password = 'testpassword123'
    const hashedPassword = await hashPassword(password)
    
    const isValid = await verifyPassword(password, hashedPassword)
    expect(isValid).toBe(true)
    
    const isInvalid = await verifyPassword('wrongpassword', hashedPassword)
    expect(isInvalid).toBe(false)
  })
})