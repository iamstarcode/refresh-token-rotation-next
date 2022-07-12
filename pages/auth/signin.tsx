import { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from 'next/link'
import tw from "twin.macro";

import { GetServerSideProps } from 'next'
import { getSession, signIn } from 'next-auth/react';


import { useForm } from "@mantine/hooks";
import { Button } from "@mantine/core";

import Layout from "../../layouts/default";

export interface RegisterProps {

}

const Register = ({ }: RegisterProps) => {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const response: any = await signIn('credentials',
            {
                email,
                password,
                callbackUrl: `${window.location.origin}/`,
                redirect: false,
            }
        )
        if (response?.ok) {
            router.push('/')
        }
        if (!response?.ok) {
            alert("Credentials incorrect")
        }
    }

    return (
        <>
            <div tw="flex flex-col w-full pb-5 justify-center">
                <form onSubmit={handleSubmit} tw="bg-gray-100 p-10 rounded-lg shadow-lg min-w-full">
                    <h1 tw="text-center text-2xl mb-6 text-gray-600 font-bold font-sans">Login</h1>

                    <div>
                        <label tw="text-gray-800 font-semibold block my-3" >Email</label>
                        <input onChange={(e: any) => setEmail(e.target.value)} value={email} tw="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none" type="text" name="email" id="email" placeholder="@email" />
                    </div>
                    <div>
                        <label tw="text-gray-800 font-semibold block my-3" >Password</label>
                        <input onChange={(e: any) => setPassword(e.target.value)} value={password} tw="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none" type="password" name="password" id="password" placeholder="password" />
                    </div>

                    <button type="submit" tw="w-full mt-6 mb-3 bg-indigo-100 rounded-lg px-4 py-2 text-lg text-gray-800 tracking-wide font-semibold font-sans">Login</button>
                    <div tw="inline-flex space-x-2">
                        <h2 tw="text-xs">Don't have an account?</h2>
                        <Link href="/auth/register" passHref>
                            <h2 tw="text-blue-500 text-xs">Register</h2>
                        </Link>
                    </div>

                    <Button type="button"
                    mt="sm"
                        onClick={() => signIn('google')}
                        variant="white"
                        color="red"
                        fullWidth
                        leftIcon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>}
                    >
                        Sign in with Google
                    </Button>
                    <Button type="button"
                        variant="filled"
                        color="#1877f2"
                        leftIcon={<svg xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="-204.79995 -341.33325 1774.9329 2047.9995"><path d="M1365.333 682.667C1365.333 305.64 1059.693 0 682.667 0 305.64 0 0 305.64 0 682.667c0 340.738 249.641 623.16 576 674.373V880H402.667V682.667H576v-150.4c0-171.094 101.917-265.6 257.853-265.6 74.69 0 152.814 13.333 152.814 13.333v168h-86.083c-84.804 0-111.25 52.623-111.25 106.61v128.057h189.333L948.4 880H789.333v477.04c326.359-51.213 576-333.635 576-674.373" fill="#1877f2"/><path d="M948.4 880l30.267-197.333H789.333V554.609C789.333 500.623 815.78 448 900.584 448h86.083V280s-78.124-13.333-152.814-13.333c-155.936 0-257.853 94.506-257.853 265.6v150.4H402.667V880H576v477.04a687.805 687.805 0 00106.667 8.293c36.288 0 71.91-2.84 106.666-8.293V880H948.4" fill="#fff"/></svg>}
                        fullWidth
                        mt="sm"
                        onClick={() => signIn('facebook')}
                    >
                        Sign in with Facebook
                    </Button>
                </form>


            </div>
        </>
    );
}

Register.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <div tw="w-full px-4 py-5">
                {page}
            </div>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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
        props: { session }
    }
}

export default Register