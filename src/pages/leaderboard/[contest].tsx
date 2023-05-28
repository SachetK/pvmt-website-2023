import type { GetStaticProps, NextPage } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";
import { api } from "~/utils/api";
import type { Option } from "~/utils/options";

export function getStaticPaths() {
  return {
    paths: [
      { params: { contest: "algebra" } },
      { params: { contest: "geometry" } },
      { params: { contest: "combinatorics" } },
      { params: { contest: "team" } },
      { params: { contest: "tiebreaker" } },
    ],
    fallback: false,
  };
}

const Leaderboard: NextPage<{ option: Uppercase<Option> }> = ({ option }) => {
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
    <div className="flex min-h-screen flex-col">
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
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const ssg = generateSSGHelper();

  const contest = params?.contest;

  if (
    contest !== "algebra" &&
    contest !== "geometry" &&
    contest !== "combinatorics" &&
    contest !== "team" &&
    contest !== "tiebreaker"
  ) {
    throw new Error("invalid option");
  }

  const test = contest.toUpperCase() as Uppercase<typeof contest>;

  await ssg.reports.byScore.prefetch({ contest: test });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      option: contest.toUpperCase(),
    },
  };
};

export default Leaderboard;
