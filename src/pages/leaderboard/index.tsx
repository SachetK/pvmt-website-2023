import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";
import { api } from "~/utils/api";
import { OPTIONS } from "~/utils/options";

const Leaderboard: NextPage = () => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
  } = api.reports.allByScore.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <main>
      <Head>
        <title>Leaderboard</title>
        <meta name="description" content="PVMT 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <h1 className="text-center text-3xl font-bold">Leaderboard</h1>
        <div className="flex flex-row justify-center">
          <div className="bg-slate-100 px-3 py-2 text-center font-semibold transition ease-in-out first:rounded-l-lg last:rounded-r-lg">
            {Object.entries(OPTIONS).map(([name, link], idx) => {
              return (
                <Link
                  className="p-2 transition ease-in-out first:rounded-tl-xl last:rounded-bl-xl hover:bg-slate-600 hover:text-white"
                  href={`/leaderboard/${encodeURIComponent(link)}`}
                  key={idx}
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
        <table className="mx-[25%] w-1/2 table-auto">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {data?.pages.map((page) =>
              page.reports.map((report, idx) => (
                <tr key={report.userId}>
                  <td>{idx + 1}</td>
                  <td>{report.student.name}</td>
                  <td>{report.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-center">
          {!hasPreviousPage && (
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              type="button"
              onClick={() => void fetchPreviousPage()}
            >
              Previous
            </button>
          )}
          {!hasNextPage && (
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

export const getStaticProps: GetStaticProps = async () => {
  const ssg = generateSSGHelper();

  await ssg.reports.allByScore.prefetch({});

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export default Leaderboard;
