import { signOut, getSession } from 'next-auth/react'

import { useMe } from '../hooks/api'
import ThemeToggle from '../components/ThemeToggle'
import ClientOnly from '../components/ClientOnly'

const Page = () => {
  //console.log(session)
  const { me, isLoading, mutate } = useMe()

  const handleSignOut = async () => {
    const session = await getSession()
    console.log(session)

    if (session) {
      signOut()
    }
  }
  return (
    <div>
      <div className="w-full flex flex-col justify-center gap-y-5 mt-5">
        <ClientOnly>
          <ThemeToggle />
        </ClientOnly>

        <button
          onClick={() => handleSignOut()}
          className="bg-red-700 mt-10 px-2 py-3 rounded text-white"
        >
          Sign Out
        </button>
        <div className="w-80 flex flex-col  items-center space-y-2 p-5 bg-gray-300 text-secondary rounded-lg shadow">
          <button
            onClick={() => mutate()}
            className="px-2 py-3 bg-green-400 rounded shadow "
          >
            Protected endpoint
          </button>
          {!isLoading && <p className="text-secondary">{me}</p>}
        </div>
      </div>
    </div>
  )
}

//Page.auth = true
export default Page
