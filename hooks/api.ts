import useSWR from 'swr'
//import axios from '../libs/axios'
import axios from 'axios'
import { signOut, useSession as useSessionX } from 'next-auth/react'
import { axiosPrivate } from '../libs/axios'

import dayjs from 'dayjs'

const fetcher = async (url: string) => {
  const res = await axios
    .get(url)
    .then(res => {
      //console.log('session ', dayjs(res.data.accessTokenExpires).format('m:s'))
      if (res.data?.error === 'RefreshAccessTokenError') {
        //console.log('error')
        signOut()
        //if (res.status == 403) signOut() // display session expired
      }
      return res.data
    })
    .catch(e => {
      //console.log(e)
      if (e.response.status == 403) {
        signOut() //signout redirects to login page and also delete cookie
      }
    })
  return res
}

export function useMe() {
  const { data, error } = useSWR('/user/me', fetcher)
  return {
    me: data?.data?.data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function useSendMail() {
  const { data, error } = useSWR('/api/me', fetcher2)
  return {
    me: data?.data?.data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function useDashboard() {
  const { data, error } = useSWR('/api/user-dashboard', fetcher)
  return {
    dashboard: data?.data.data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function useSession() {
  const { data, error, mutate } = useSWR('/api/auth/session', fetcher)
  return {
    session: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
export function useTranaction(tid: string | undefined) {
  const { data, error } = useSWR(`/api/get-transaction/?tid=${tid}`, fetcher)
  return {
    transaction: data?.data?.data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function useGiftCards() {
  const fetcher = async (url: string) =>
    await axios.get(url).then(res => res.data)
  const { data, error } = useSWR('/api/fetch-gift-cards', fetcher)

  return {
    cards: data?.data?.data,
    isLoading: !error && !data,
    isError: error,
  }
}

export async function apiRequest(url: string): Promise<void> {
  const res = await fetcher('/api/auth/session')

  try {
    const response = await axiosPrivate.get(url, {
      headers: {
        Authorization: `Bearer ${res.accessToken}`,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

export const fetcher2 = async (url: string) => {
  const token = await fetcher('/api/auth/session')
  const res = await axiosPrivate
    .get(url, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
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
export function useDevices() {
  const { data, error } =  useSWR('/user/devices', fetcher2)
  return {
    devices: data,
    isLoading: !error && !data,
    isError: error,
  }
}
