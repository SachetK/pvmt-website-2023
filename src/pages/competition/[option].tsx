import type { GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import ErrorComponent from "next/error";
import { z } from "zod";
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

const Test: React.FC<{
  option: Uppercase<Option>;
  userId: string;
}> = ({ option, userId }) => {
  const { data: problems } = api.problems.getBySubject.useQuery(option);
  const { mutate: submitTest } = api.reports.submitTest.useMutation();

  if (!problems) return <div>No problems found</div>;

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const answers = Array.from(data.entries())
          .map(([id, answer]) => {
            try {
              return {
                problemId: z.coerce.string().parse(id.split("-")[0]),
                answer: z.coerce.number().parse(answer),
              };
            } catch (e) {
              return null;
            }
          })
          .filter((x) => x !== null);

        void submitTest({
          userId,
          contest: option,
          endTime: new Date(),
          answers: answers as { problemId: string; answer: number }[],
        });
      }}
    >
      {problems.map((problem, idx) => (
        <div key={idx} className="flex flex-col space-y-2">
          <div className="flex flex-row space-x-2">
            <span className="font-bold">{idx + 1}.</span>
            <span>{problem.question}</span>
          </div>
          <div className="flex flex-row space-x-2">
            <label>
              <span>Answer:</span>
              <input
                id={`${problem.id}-answer`}
                name={`${problem.id}-answer`}
                type="number"
              />
            </label>
          </div>
        </div>
      ))}
      <button type="submit">Submit Test</button>
    </form>
  );
};
const CompetitionPage: NextPage<{ option: Uppercase<Option> }> = ({
  option,
}) => {
  const { data: session, status } = useSession();

  const { data: report } = api.reports.byUser.useQuery({
    userId: session?.user.id ?? "",
    contest: option,
  });

  const { mutate: startTest } = api.reports.startTest.useMutation({
    onSuccess: () => {
      void api.useContext().reports.byUser.invalidate({
        userId: session?.user.id ?? "",
        contest: option,
      });
    },
  });

  if (status === "loading") return <div>Loading...</div>;
  if (status !== "authenticated")
    return <ErrorComponent statusCode={500} title={"Unauthenticated"} />;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-row items-center justify-center">
        <h1 className="text-4xl font-bold">{option}</h1>
      </div>
      {!report && (
        <button
          type="button"
          onClick={() =>
            void startTest({ userId: session.user.id, contest: option })
          }
        >
          Start Test
        </button>
      )}
      {report?.draft && (
        <div>
          <Test option={option} userId={session.user.id} />
        </div>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const ssg = generateSSGHelper();

  const option = params?.option;

  if (
    option !== "algebra" &&
    option !== "geometry" &&
    option !== "combinatorics" &&
    option !== "team" &&
    option !== "tiebreaker"
  ) {
    throw new Error("invalid option");
  }

  const test = option.toUpperCase() as Uppercase<typeof option>;

  await ssg.problems.getBySubject.prefetch(test);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      option: option.toUpperCase(),
    },
  };
};

export default CompetitionPage;
