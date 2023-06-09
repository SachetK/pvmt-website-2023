import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { status } = useSession();
  const { data: team } = api.teams.byUser.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const router = useRouter();

  if (team && status === "authenticated") {
    team ? void router.push("/home") : void router.push("/register");
  }

  return (
    <main>
      <Head>
        <title>PVMT 2023</title>
        <meta name="description" content="PVMT 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 rounded-r-xl py-2">
        <h1 className="text-4xl font-bold">Welcome to PVMT 2023!</h1>
        <button
          type="button"
          className="rounded-xl bg-slate-100 px-4 py-2 text-center text-2xl transition ease-in-out hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white"
          onClick={() =>
            status === "unauthenticated"
              ? void signIn("google", {
                  callbackUrl: "/home",
                })
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
