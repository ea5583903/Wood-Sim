import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      organizationId: string
      organization: {
        id: string
        name: string
        slug: string
      }
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    organizationId: string
    organization: {
      id: string
      name: string
      slug: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    organizationId: string
    organization: {
      id: string
      name: string
      slug: string
    }
  }
}