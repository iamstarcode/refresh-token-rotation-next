import { signOut, getSession } from 'next-auth/react'

import { useMe } from '../hooks/api'
import { ClientOnly, ThemeToggle } from '../components'
const Index = () => {
  const { me, isLoading, mutate } = useMe()

  const handleSignOut = async () => {
    const session = await getSession() //get session before signing out
    if (session) {
      signOut()
    }
  }
  return (
    <div>
      <div className="flex flex-col w-96 mx-auto items-center justify-center gap-y-5 mt-5">
        <div className="w-60">
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>
        </div>

        <button
          onClick={() => handleSignOut()}
          className="w-full bg-red-700 mt-10 px-2 py-3 rounded text-white"
        >
          Sign Out
        </button>
        <div className="w-full flex flex-col  items-center space-y-2 p-5 bg-gray-300 text-secondary rounded-lg shadow">
          <button
            onClick={() => mutate()}
            className="w-full px-2 py-3 bg-green-400 rounded shadow "
          >
            Protected endpoint
          </button>
          {!isLoading && <p className="text-secondary">{me}</p>}
        </div>
      </div>
    </div>
  )
}

export default Index
