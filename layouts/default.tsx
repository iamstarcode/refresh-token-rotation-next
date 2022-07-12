
import Head from 'next/head'
import Image from 'next/image'
import GlobalStyles from '../styles/GlobalStyles'
import { MantineProvider } from '@mantine/styles'
import tw from "twin.macro"

const Layout = ({ children }: any) => {


  return (
    <>
      <GlobalStyles />
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
        }}
      >
          <div tw="flex flex-col max-w-lg mx-auto w-full items-center">
            {children}
          </div>
      </MantineProvider>

      <style global jsx>{
        `
        body {
          font-family: 'Karla', sans-serif;
        }

        `
      }</style>
    </>
  )
}

export default Layout
