import '../styles/globals.css'
import { AppProps } from 'next/app'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <div className="max-w-7xl mx-auto p-6">
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
