import { ReactElement, useEffect } from "react"
//import NextNProgress from "nextjs-progressbar";
import { useRouter } from "next/router";

//import { useSession, useMe } from '../hooks/api'

import { useSession } from '../hooks/api'
import { signIn, signOut } from "next-auth/react";
import { Loader } from "@mantine/core";

interface AuthProps {
    children: ReactElement
}
export default function Auth({ children }: AuthProps) {

    const router = useRouter()
    const { session, isLoading } = useSession()

    const hasUser = !!session?.user;
    //console.log(session)
    useEffect(() => {
        if (!isLoading && !hasUser) {
            router.push("/auth/signin");
        }

        if (!isLoading && hasUser && session?.error === "RefreshAccessTokenError") {
            signOut()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, hasUser])

    if (isLoading || !hasUser) {
        return <>
            {/* <NextNProgress options={{ showSpinner: false }} /> */}
            <div tw="flex items-center justify-center  max-h-screen fixed inset-0 bg-white">
                <div tw="flex flex-col justify-center items-center space-y-3 text-sm">
                   <Loader size="lg"/>
                </div>
            </div>
        </>
    }
    return children;
};





