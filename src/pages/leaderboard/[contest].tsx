import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { z } from "zod";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";
import { api } from "~/utils/api";
import type { Option } from "~/utils/options";
import { LeaderboardNavigation } from ".";
import { useRouter } from "next/router";

export function getStaticPaths() {
  return {
    paths: [
      { params: { contest: "algebra" } },
      { params: { contest: "geometry" } },
      { params: { contest: "combinatorics" } },
    ],
    fallback: false,
  };
}

const Leaderboard: NextPage<{ option: Uppercase<Exclude<Option, "team">> }> = ({
  option,
}) => {
  const router = useRouter();
  void router.push("/home");

  const {
    data,
    hasNextPage,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
  } = api.reports.byScore.useInfiniteQuery(
    { contest: option },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <main>
      <Head>
        <title>
          Leaderboard |{" "}
          {`${option.substring(0, 1)}${option.substring(1).toLowerCase()}`}
        </title>
        <meta name="description" content="PVMT 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        <h1 className="text-center text-3xl font-bold">
          Leaderboard -{" "}
          {`${option.substring(0, 1)}${option.substring(1).toLowerCase()}`}
        </h1>
        <LeaderboardNavigation />
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const ssg = generateSSGHelper();

  const contest = z
    .enum(["algebra", "geometry", "combinatorics"])
    .parse(params?.contest);

  const test = contest.toUpperCase() as Uppercase<
    Exclude<typeof contest, "team">
  >;

  await ssg.reports.byScore.prefetch({ contest: test });

  return {
    redirect: {
      destination: `/`,
      permanent: false,
    },
    // props: {
    //   trpcState: ssg.dehydrate(),
    //   option: contest.toUpperCase(),
    // },
  };
};

export default Leaderboard;
