import { DefaultSession } from 'next-auth'

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's role. */
    accessTokenExpires?: string
    tokenId?: string
    accessToken?: string
    user: any
  }
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    accessTokenExpires?: string
    error?: any
    user: {} & DefaultSession['user']
  }
  interface Profile {
    email_verified?: any
  }
}
