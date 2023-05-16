import type { GetStaticProps, NextPage } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";
import { api } from "~/utils/api";
import type { Option } from "~/utils/options";

export function getStaticPaths() {
  return {
    paths: [
      { params: { option: "algebra" } },
      { params: { option: "geometry" } },
      { params: { option: "combinatorics" } },
      { params: { option: "team" } },
      { params: { option: "tiebreaker" } },
    ],
    fallback: false,
  };
}

const Leaderboard: NextPage<{ option: Uppercase<Option> }> = ({ option }) => {
  
  const { data: reports } = api.reports.byScore.useQuery({ contest: option });

  return (
    <div className="flex min-h-screen flex-col">
      <table className="table-auto">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {reports?.map((report, idx) => (
            <tr key={report.userId}>
              <td>{idx + 1}</td>
              <td>{report.student.name}</td>
              <td>{report.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
