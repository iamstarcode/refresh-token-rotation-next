import { useReducer } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GetServerSideProps } from 'next'

import { getSession, signIn } from 'next-auth/react'

import { axiosPrivate } from '../../libs/axios'

interface IFormValues {
  email?: string
  password?: string
}
const initiialFormValues: IFormValues = { email: '', password: '' }

const Register = () => {
  const router = useRouter()
  const [formValues, setFormValues] = useReducer(
    (prev: IFormValues, next: IFormValues) => {
      return { ...prev, ...next }
    },
    initiialFormValues,
  )

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.post('/auth/sign-up', {
        ...formValues,
      })

      if (response.status == 201) {
        const response: any = await signIn('credentials', {
          ...formValues,
          callbackUrl: `${window.location.origin}/`,
          redirect: false,
        })
        if (response?.ok) {
          router.push('/')
        }
        if (!response?.ok) {
          alert('Credentials incorrect')
        }
      }
    } catch (error: any) {
      //console.error(error.response)
      alert(error?.response?.data?.message)
    }
  }

  return (
    <>
      <div className="flex flex-col w-full pb-5 justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-5 rounded-lg shadow-lg w-96 mx-auto"
        >
          <h1 className="text-center text-2xl mb-6 text-gray-600 font-bold font-sans">
            Register
          </h1>
          <div>
            <label className="text-gray-800 font-semibold block my-3">
              Email
            </label>
            <input
              onChange={(e: any) =>
                setFormValues({
                  email: e.target.value,
                })
              }
              value={formValues.email}
              className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none"
              type="text"
              name="email"
              id="email"
              placeholder="@email"
            />
          </div>
          <div>
            <label className="text-gray-800 font-semibold block my-3">
              Password
            </label>
            <input
              onChange={(e: any) => setFormValues({ password: e.target.value })}
              value={formValues.password}
              className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none"
              type="password"
              name="password"
              id="password"
              placeholder="password"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-6 mb-3 bg-indigo-100 rounded-lg px-4 py-2 text-lg text-gray-800 tracking-wide font-semibold font-sans"
          >
            Register
          </button>
          <div className="inline-flex space-x-2">
            <h2 className="text-xs">Already have an account?</h2>
            <Link href="/auth/sign-in">
              <h2 className="text-blue-500 text-xs">Sign in</h2>
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getSession(context)
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

export default Register
