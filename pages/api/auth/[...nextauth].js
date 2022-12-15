import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import axios from '../../../libs/axios'
import {
  googleAuthFlow,
  faceBookAuthFlow,
} from '../../../utils/AuthFlowHelpers'
import * as dayjs from 'dayjs'

//import { UAParser } from 'ua-parser-js'

var UAParser = require('ua-parser-js')

import Client from 'ioredis'
import Redlock from 'redlock'

/* const redis = new Client('redis://:p75614420629ae32a6542ad6078667e192005620b7be56c15cc412d95ea3bd110@ec2-44-205-222-104.compute-1.amazonaws.com:29060',{
  tls:{
    rejectUnauthorized:false
  }
})
 */
/* const redis = new Client(
  '17099',
  'redis-17099.c57.us-east-1-4.ec2.cloud.redislabs.com',
  {
    password: 'bqhC8452trFGW5bOV1ypISCxdzRZxeEA',
  },
) */
const redis = new Client('6379', 'localhost')
const redlock = new Redlock([redis], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
})
async function refreshAccessToken(tokenObject) {
  try {
    const tokenResponse = await axios.get('/auth/refresh', {
      headers: {
        Authorization: `Bearer ${tokenObject.refreshToken}`,
        'Token-Id': tokenObject.tokenId,
      },
    })
    //console.log('refresh', tokenResponse.data)
    return {
      ...tokenObject,
      accessToken: tokenResponse.data.accessToken,
      refreshToken: tokenResponse.data.refreshToken, // ?? tokenObject.refreshToken,
      accessTokenExpires: tokenResponse.data.accessTokenExpires,
    }
  } catch (error) {
    //console.log('refresh error', error.response.data)
    return {
      ...tokenObject,
      error: 'RefreshAccessTokenError',
    }
  }
}

const Auth = (req, res) =>
  NextAuth(req, res, {
    providers: [
      CredentialsProvider({
        name: 'credentials',
        authorize: async credentials => {
          let user = {}
          const userAgent = generateUserAgent(req.headers['user-agent'])
          const stringyUserAgent = JSON.stringify(userAgent)
          //console.log(stringyUserAgent)
          try {
            const response = await axios.post(
              '/auth/sign-in',
              {
                email: credentials.email,
                password: credentials.password,
              },
              {
                headers: {
                  'user-agent': req.headers['user-agent'],
                  'x-user-agent': stringyUserAgent,
                },
              },
            )

            if (response.status == 201) {
              user = response.data
              //console.log(response.data)
              return user
            }
          } catch (e) {
            console.log(e.response.data)
          }
          return null
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      }),
    ],
    callbacks: {
      async jwt({ token, user, account, profile }) {
        if (account && user) {
          let data = {}
          switch (account.provider) {
            case 'google':
              data = await googleAuthFlow(profile)
              break
            case 'facebook':
              data = await faceBookAuthFlow(profile)
              break
            default:
              data = user
          }
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
        const expires = dayjs(token.accessTokenExpires)
        const diff = expires.diff(dayjs(), 'second')
        if (diff > 0) {
          //console.log('not expired')
          return token
        }

        // Access token has expired, try to do a refresh
        return await redlock.using(
          [token.tokenId, 'jwt-refresh'],
          5000,
          async () => {
            // Always get the refresh_token from redis, that's the source of truth
            // NEVER get the refresh_token from the current jwt property
            const redisToken = await redis.get(`token:${token.tokenId}`)
            const currentToken = JSON.parse(redisToken)

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
        if (account.provider === 'google') {
          return profile.email_verified
        }
        return true // Do different verification for other providers that don't have `email_verified`
      },
    },

    events: {
      signOut: async message => {
        //console.log(message)
        try {
          const response = await axios.post(
            '/auth/sign-out',
            {},
            {
              headers: {
                Authorization: `Bearer ${message.token.accessToken}`,
                'Token-Id': message.token.tokenId,
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
      signIn: '/auth/signin',
    },
    session: {
      strategy: 'jwt',
    },
  })

function generateUserAgent(userAgent) {
  let device = {}
  const parser = new UAParser(userAgent)
  if (parser.getDevice().model == undefined) {
    //web browser
    device.appType = parser.getBrowser().name
    device.device = parser.getOS().name + ' ' + parser.getOS().version
  } else {
    // a mobile web browser
    device.device = `${parser.getDevice().vendor}  ${parser.getDevice().model}`
    device.appType = parser.getBrowser().name
  }

  return device
}
export default Auth
