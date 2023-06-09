import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";

const Registration: NextPage = () => {
  const { data: team } = api.teams.byUser.useQuery();
  const router = useRouter();

  if (team) void router.push("/home");

  return (
    <main>
      <Head>
        <title>PVMT 2023 | Team Registration</title>
        <meta name="description" content="PVMT 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid h-screen w-screen place-content-center text-center">
        <h1>Join a team!</h1>
        <TeamSelect />
      </div>
    </main>
  );
};

const TeamSelect: React.FC = () => {
  const [search, setSearch] = useState("");
  const [join, setJoin] = useState("");

  const router = useRouter();

  const { mutate: joinTeam, isLoading: isJoining } = api.teams.join.useMutation({
    onSuccess: () => {
      setJoin("");
      void router.push("/home");
    },
  });

  const {
    data,
  } = api.teams.all.useQuery({});

  return <></>

  return (
    <div className="flex flex-col rounded-2xl bg-slate-100">
      <div className="m-2 flex justify-center space-x-2 rounded-2xl bg-white p-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a team"
          autoFocus
          className="rounded-xl px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {/* <button
          type="button"
          className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white transition-opacity duration-300 ease-in-out hover:opacity-80 active:opacity-60"
          onClick={() => void fetchPreviousPage()}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-xl bg-blue-700 px-4 py-2 font-bold text-white transition-opacity duration-300 ease-in-out hover:opacity-80 active:opacity-60"
          onClick={() => void fetchNextPage()}
        >
          Next
        </button> */}
      </div>

      {/* {teams?.pages.map((page, idx) => {
        return (
          <div
            key={idx}
            className="m-2 flex justify-center space-x-2 rounded-2xl bg-white p-2"
          > */}
            {data?.teams
              .filter(
                ({ name, members }) =>
                  name.toLowerCase().includes(search.toLowerCase()) && members.length < 3
              )
              .map((team) => {
                return (
                  <div
                    key={team.id}
                    className="mx-2 flex w-full flex-row items-center justify-between space-x-2"
                  >
                    <h1>{team.name}</h1>
                    <button
                      type="button"
                      onClick={() => setJoin(team.name)}
                      className="rounded-full bg-blue-600 px-4 py-2 font-bold text-white"
                    >
                      Join
                    </button>
                  </div>
                );
              })}
          {/* </div> */}
        {/* // ); */}
      {/* // })} */}
      {join && (
        <div>
          <label className="m-2">
            Are you sure you want to join {join}?
            <button
              type="button"
              onClick={() => setJoin("")}
              className="m-2 rounded-full  bg-blue-400 px-4 py-2 text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                void joinTeam({
                  name: join,
                })
              }
              className="mr-2 rounded-full bg-blue-400 px-4 py-2 text-white"
            >
              Join
            </button>
            {isJoining && <LoadingSpinner />}
          </label>
        </div>
      )}
    </div>
  );
};

export default Registration;
