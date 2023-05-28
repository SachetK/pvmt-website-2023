import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { OPTIONS } from "~/utils/options";

const Home: NextPage = () => {
  const { status } = useSession();

  return (
    <main>
      <Head>
        <title>PVMT 2023</title>
        <meta name="description" content="PVMT 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-row items-center justify-center space-x-2 rounded-r-xl py-2">
        <form className="flex flex-col rounded-l-xl bg-slate-100">
          {Object.entries(OPTIONS).map(([name, link], idx) => (
            <Link
              key={idx}
              className="p-2 text-center transition ease-in-out first:rounded-tl-xl last:rounded-bl-xl hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
              href={`/competition/${encodeURIComponent(link)}`}
              aria-disabled={status === "unauthenticated"}
            >
              <span>{name}</span>
            </Link>
          ))}
        </form>
        <button
          type="button"
          className="rounded-r-xl bg-slate-100 p-2 text-center transition ease-in-out hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
          onClick={() =>
            status === "unauthenticated"
              ? void signIn("google")
              : void signOut({
                  callbackUrl: "/",
                })
          }
        >
          {status === "unauthenticated" ? "Sign In" : "Sign Out"}
        </button>
      </div>
    </main>
  );
};

export default Home;
