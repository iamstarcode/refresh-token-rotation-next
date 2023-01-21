import useSWR from 'swr'
import { getSession, signOut } from 'next-auth/react'
import { axiosPrivate } from '../libs/axios'

const fetcher = async (url: string) => {
  const session = await getSession()

  if (session?.error) {
    //handle accordingly
  } else {
    const res = await axiosPrivate
      .get(url, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })
      .then(res => res.data)
      .catch(e => {
        console.log(e)
        if (e.response.status == 422) {
          signOut() //signout redirects to login page and also delete cookie
        }
      })
    return res
  }
}

export function useMe() {
  const { data, error, mutate } = useSWR('/user/me', fetcher)
  return {
    me: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
