import { signOut } from 'next-auth/react'
import tw from 'twin.macro'
import { Button, Logo } from '../components'
import ThemeToggle from '../components/ThemeToggle'


import { Switch } from '@mantine/core'
import axios, { axiosPrivate } from '../libs/axios'

import { apiRequest, useMe, useSendMail, useSession, useDevices } from '../hooks/api'
import { mutate } from 'swr'
import { useEffect } from 'react'
const styles = {
  // Move long class sets out of jsx to keep it scannable
  container: ({ hasBackground }: { hasBackground: boolean }) => [
    tw`flex flex-col items-center justify-center h-screen`,
    hasBackground && tw`bg-gradient-to-b from-electric to-ribbon`,
  ],
}

const Index = () => {

  const { session, mutate } = useSession()
  //console.log(session)
  const { devices, isLoading } = useDevices()

  //const { me, } = useMe()

 
  console.log(devices)
  const test = async () => {
    await apiRequest('/user/me')

  }

  const handleSignOut = () => {

  }
  return (
    <div >
      <div tw="w-full flex flex-col justify-center gap-y-5 mt-5">
        <div tw="w-full space-y-4">
          <div tw="flex justify-between ">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" x="0px" y="0px" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>

            <Switch />
          </div>

          <div tw="flex justify-between">
            <svg stroke="currentColor" fill="#1751b3" strokeWidth="0" version="1.1" viewBox="0 0 16 16" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 3h2.5v-3h-2.5c-1.93 0-3.5 1.57-3.5 3.5v1.5h-2v3h2v8h3v-8h2.5l0.5-3h-3v-1.5c0-0.271 0.229-0.5 0.5-0.5z"></path></svg>

            <Switch />
          </div>
        </div>
        {devices && devices.map((device: any) => (
          <p>{device.createdAt}</p>
        ))}
        <Button variant="primary" onClick={() => signOut()}>Sign Out</Button>
        <Button variant="primary" onClick={test}>Protected endpoint</Button>

        <ThemeToggle />
      </div>
    </div>


  )
}

Index.auth = true
export default Index
