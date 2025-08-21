export interface User {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthContextType {
  user: User | null
  organization: Organization | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
}

export interface SignUpData {
  email: string
  password: string
  name: string
  organizationName: string
}