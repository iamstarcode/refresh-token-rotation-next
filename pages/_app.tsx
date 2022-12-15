import { ReactElement, ReactNode, useEffect, useState } from 'react'

import { AppProps } from 'next/app'
import type { NextPage } from 'next'

import { SessionProvider } from 'next-auth/react'

import '../styles/globals.css'

import { Global } from '@emotion/react'

import GlobalStyles from './../styles/GlobalStyles'
import { MantineProvider } from '@mantine/core'

import { ThemeProvider } from '../components/ThemeContext'

import stylesBase from '../styles/stylesBase'

import Auth from '../components/Auth'
//import { useSession } from '../hooks/api'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
  auth?: boolean
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? (page => page)
  return getLayout(
    <>
      <GlobalStyles />
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Global styles={stylesBase} />
        <ThemeProvider>
          <div tw="flex flex-col max-w-7xl mx-auto w-full items-center ">
            <SessionProvider session={session}>
              {Component.auth ? (
                <Auth>
                  <Component {...pageProps} />
                </Auth>
              ) : (
                <Component {...pageProps} />
              )}
            </SessionProvider>
          </div>
        </ThemeProvider>
      </MantineProvider>
    </>,
  )
}
