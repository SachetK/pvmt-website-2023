import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { MathJaxContext } from "better-react-mathjax";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import config from "~/utils/MathJaxConfig";
import Link from "next/link";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <MathJaxContext version={3} config={config}>
      <SessionProvider session={session}>
        <Header />
        <Component {...pageProps} />
      </SessionProvider>
    </MathJaxContext>
  );
};

const Header = () => {
  const { status } = useSession();
  const { data: team } = api.teams.byUser.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  return (
    <>
      <Link
        href={status === "authenticated" ? (team ? "/home" : "/register") : "/"}
        className="fixed left-4 top-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </Link>
      <button
          type="button"
          className="fixed right-20 top-4 rounded-xl bg-slate-100 px-4 py-2 text-lg text-center transition ease-in-out hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
          onClick={() =>
            status === "unauthenticated"
              ? void signIn("google", {
                  callbackUrl: team ? "/home" : "/register",
                })
              : void signOut({
                  callbackUrl: "/",
                })
          }
        >
          {status === "unauthenticated" ? "Sign In" : "Sign Out"}
        </button>
      <Link href="/leaderboard" className="fixed right-4 top-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      </Link>
    </>
  );
};

export default api.withTRPC(MyApp);
