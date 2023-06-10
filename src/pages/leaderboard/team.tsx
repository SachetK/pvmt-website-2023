import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { LeaderboardNavigation } from ".";
import { useRouter } from "next/router";

const Leaderboard: NextPage = () => {
  const router = useRouter();
  void router.push("/home");

  const {
    data,
    hasNextPage,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
  } = api.teams.byScore.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

    return <></>

  return (
    <main>
      <Head>
        <title>Leaderboard | Team</title>
        <meta name="description" content="PVMT 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        <h1 className="text-center text-3xl font-bold">Leaderboard - Team</h1>
        <LeaderboardNavigation />
        <table className="mx-[25%] w-1/2 table-auto">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {data?.pages.map((page) =>
              page.teams.map((team, idx) => (
                <tr key={team.id}>
                  <td>{idx + 1}</td>
                  <td>{team.name}</td>
                  <td>{team.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-center">
          {hasPreviousPage && (
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              type="button"
              onClick={() => void fetchPreviousPage()}
            >
              Previous
            </button>
          )}
          {hasNextPage && (
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              type="button"
              onClick={() => void fetchNextPage()}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Leaderboard;
