import useSWR from 'swr'
//import axios from '../libs/axios'
import axios from 'axios'
import { getSession, signOut, useSession as useSessionX } from 'next-auth/react'
import { axiosPrivate } from '../libs/axios'

export const fetcher = async (url: string) => {
  const session = await getSession()
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
        // signOut() signout redirects to login page and also delete cookie
      }
    })
  return res
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
