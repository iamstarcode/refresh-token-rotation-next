import NextAuth, { NextAuthOptions } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'

import axios from '../../../libs/axios'
import dayjs from 'dayjs'

import Client from 'ioredis'
import Redlock from 'redlock'

const redis = new Client(6379, 'localhost', {})

const redlock = new Redlock([redis], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
})

async function refreshAccessToken(tokenObject: any) {
  try {
    const tokenResponse = await axios.get('/auth/refresh', {
      headers: {
        Authorization: `Bearer ${tokenObject.refreshToken}`,
        'Token-Id': tokenObject.tokenId,
      },
    })

    return {
      ...tokenObject,
      accessToken: tokenResponse.data.accessToken,
      refreshToken: tokenResponse.data.refreshToken,
      accessTokenExpires: tokenResponse.data.accessTokenExpires,
    }
  } catch (error: any) {
    console.log('refresh error', error.response.data)
    return {
      ...tokenObject,
      error: 'RefreshAccessTokenError',
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      async authorize(credentials: any, req): Promise<any | null> {
        let user = {}

        try {
          const response = await axios.post('/auth/sign-in', {
            email: credentials?.email,
            password: credentials?.password,
          })

          if (response.status == 201) {
            user = response.data
            return user
          }
        } catch (e: any) {
          console.log(e.response.data)
        }
        return null
      },
      credentials: {},
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        let data: any = user

        token = {
          refreshToken: data?.refreshToken,
          accessToken: data?.accessToken,
          tokenId: data?.tokenId,
          accessTokenExpires: data?.accessTokenExpires,
          type: data?.type,
          user: data?.user,
        }

        await redis.set(`token:${token.tokenId}`, JSON.stringify(token))
        return token
      }

      // Return previous token if the access token has not expired yet
      const expires = dayjs(token?.accessTokenExpires)
      const diff = expires.diff(dayjs(), 'second')
      if (diff > 0) {
        return token
      }

      // Access token has expired, try to do a refresh
      return await redlock.using(
        [token?.user.userId, 'jwt-refresh'],
        5000,
        async () => {
          // Always get the refresh_token from redis, that's the source of truth
          // NEVER get the refresh_token from the current jwt property
          const redisToken = await redis.get(`token:${token.tokenId}`)
          const currentToken = JSON.parse(redisToken ?? '')

          // This can happen when the there are multiple requests
          // and the first request already refreshed the tokens
          // so the consecutive requests already have access to the updated tokens
          const expires = dayjs(token.accessTokenExpires)
          const diff = expires.diff(dayjs(), 'second')
          if (diff > 0) {
            return currentToken
          }

          // If it's the first request to refresh the tokens then
          // get your new tokens here, something like this:
          const newTokens = await refreshAccessToken(currentToken)

          // Save new jwt token object to redis for the next requests
          await redis.set(
            `token:${newTokens.tokenId}`,
            JSON.stringify(newTokens),
          )

          // Return new jwt token
          return newTokens
        },
      )
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.accessTokenExpires = token.accessTokenExpires
      session.user = token.user

      session.error = token.error
      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        return profile?.email_verified
      }
      return true // Do different verification for other providers that don't have `email_verified`
    },
  },
  events: {
    signOut: async message => {
      try {
        const response = await axios.post(
          '/auth/sign-out',
          {},
          {
            headers: {
              Authorization: `Bearer ${message.token.accessToken}`,
              'Token-Id': message.token.tokenId ?? '',
            },
          },
        )

        if (response.status == 200) {
          //console.log(response.data)
          await redis.del(`token:${message.token.tokenId}`)
        }
      } catch (error) {}
    },
  },
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions)
