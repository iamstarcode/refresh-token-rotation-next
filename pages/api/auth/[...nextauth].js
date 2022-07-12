import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import axios from '../../../libs/axios'
import {
  googleAuthFlow,
  faceBookAuthFlow,
} from '../../../utils/AuthFlowHelpers'

async function refreshAccessToken(tokenObject) {
  try {
    // Get a new set of tokens with a refreshToken
    console.log('in refresh', tokenObject.refreshToken)
    const tokenResponse = await axios.get('/auth/refresh', {
      headers: {
        Authorization: `Bearer ${tokenObject.refreshToken}`,
      },
    })

    return {
      ...tokenObject,
      accessToken: tokenResponse.data.accessToken,
      refreshToken: tokenResponse.data.refreshToken, // ?? tokenObject.refreshToken,
      accessTokenExpires: tokenResponse.data.accessTokenExpires,
    }
  } catch (error) {
    console.log('refresh error', error.response.data)
    return {
      ...tokenObject,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      authorize: async credentials => {
        let user = {}
        try {
          const response = await axios.post('/auth/sign-in', {
            email: credentials.email,
            password: credentials.password,
          })

          if (response.status == 201) {
            user = response.data
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
       // console.log(user)
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
        console.log('user ',user)
        token.refreshToken = data.refreshToken
        token.accessToken = data.accessToken
        token.accessTokenExpires = data.accessTokenExpires
        token.type = data.type
        token.user = data.user
        return token
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        console.log('not expired yet' , Date.now(), token.accessTokenExpires)
        return token
      }
      // Access token has expired, try to update it

      //console.log('expired yet' , Date.now(), token.accessTokenExpires)
      token = await refreshAccessToken(token)

      //console.log(token)
      return token
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
        const response = await axios.post('/auth/sign-out', {
          refreshToken: message.token.refreshToken,
        },{
          headers: {
            Authorization: `Bearer ${message.token.accessToken}`,
          }
        })

        if(response.status == 200){
          //console.log(response.data)
        }
      } catch (error) {

      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
})
