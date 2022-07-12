import { ReactElement, useEffect, useState } from "react";


import Image from 'next/image'
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from 'next'

import { getSession, signIn } from "next-auth/react";




import { useForm } from "@mantine/hooks";

import { axiosPrivate } from "../../libs/axios";

import { useAtom } from "jotai";

import Layout from "../../layouts/default";

export interface RegisterProps {

}

const Register = ({ }: RegisterProps) => {
    //const { session, setSession } = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const form = useForm({
        initialValues: {
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            phone: '',
            referal: ''
        },

        validationRules: {
            firstname: (value) => value.trim().length >= 2,
            lastname: (value) => value.trim().length >= 2,
            email: (value) => /^\S+@\S+$/.test(value),
            password: (value) => value.trim().length >= 8,
            // phone: (value) => isValidPhoneNumber(value + "")
        },

        errorMessages: {
            firstname: 'First name must include at least 2 characters',
            lastname: 'Last name must include at least 2 characters',
            email: 'Supplied email is not valid',
            password: 'Password shoould contain at least 8 chararcters',
            phone: 'Enter a valid number'
        },
    });


    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {

            const response = await axiosPrivate.post('/auth/sign-up',
                { email, password }
            )

            if (response.status == 201) {
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

        } catch (error: any) {
            //console.error(error.response)
            alert(error?.response?.data?.message)
        }

    }


    return (
        <>
            <div tw="flex flex-col w-full pb-5 justify-center">
                <form onSubmit={handleSubmit} tw="bg-white p-10 rounded-lg shadow-lg min-w-full">

                    <h1 tw="text-center text-2xl mb-6 text-gray-600 font-bold font-sans">Register</h1>
                    <div>
                        <label tw="text-gray-800 font-semibold block my-3" >Email</label>
                        <input onChange={(e: any) => setEmail(e.target.value)} value={email} tw="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none" type="text" name="email" id="email" placeholder="@email" />
                    </div>
                    <div>
                        <label tw="text-gray-800 font-semibold block my-3" >Password</label>
                        <input onChange={(e: any) => setPassword(e.target.value)} value={password} tw="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none" type="password" name="password" id="password" placeholder="password" />
                    </div>
                    <button type="submit" tw="w-full mt-6 mb-3 bg-indigo-100 rounded-lg px-4 py-2 text-lg text-gray-800 tracking-wide font-semibold font-sans">Register</button>
                    <div tw="inline-flex space-x-2">
                        <h2 tw="text-xs">Already have an account?</h2>
                        <Link href="/auth/signin" passHref>
                            <h2 tw="text-blue-500 text-xs">Sign in</h2>
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

Register.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {/*  <Back  rightDiv={ <div>{<Badge tw="bg-[#EEF8FF] text-[#279AED] normal-case font-normal px-2 py-3" variant="filled">Step 1 of 3</Badge>}</div>}>
            {page}
            </Back> */}
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