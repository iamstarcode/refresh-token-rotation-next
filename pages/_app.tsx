import { AppProps } from 'next/app'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ThemeProvider>
      <SessionProvider session={session}>
        <div className="flex flex-col max-w-7xl mx-auto w-full items-center ">
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </ThemeProvider>
  )
}
