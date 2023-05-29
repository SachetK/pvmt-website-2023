import type { GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import ErrorComponent from "next/error";
import Head from "next/head";
import { z } from "zod";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
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
    ],
    fallback: "blocking",
  };
}

const Test: React.FC<{
  option: Uppercase<Exclude<Option, "team">>;
  userId: string;
}> = ({ option, userId }) => {
  const { data: problems, isLoading } =
    api.problems.getBySubject.useQuery(option);
  const ctx = api.useContext();
  const { mutateAsync: submitTest, isLoading: isSubmitting } =
    api.reports.submitTest.useMutation({
      onSuccess: () => {
        void ctx.reports.byUser.invalidate({
          userId,
          contest: option,
        });
      },
    });

  if (!problems) return <div>No problems found</div>;
  if (isLoading) return <LoadingSpinner />;

  return (
    <form
      className="flex w-full flex-col items-center space-y-4 pb-4"
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
          contest: option,
          endTime: new Date(),
          answers: answers as { problemId: string; answer: number }[],
        });
      }}
    >
      {problems.map((problem, idx) => (
        <div
          key={idx}
          className="flex flex-col space-y-2 rounded-2xl bg-blue-200 p-4"
        >
          <div className="flex w-1/2 flex-row space-x-2">
            <span className="font-bold">{idx + 1}.</span>
            <span>{problem.question}</span>
          </div>
          <div className="flex flex-row space-x-2">
            <label>
              <span>Answer: </span>
              <input
                id={`${problem.id}-answer`}
                name={`${problem.id}-answer`}
                type="number"
                className="rounded-md border-2 border-gray-300 focus:appearance-none focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>
          </div>
        </div>
      ))}
      <div className="flex flex-row items-center justify-center space-x-2">
        <button
          className="w-fit rounded-full border-b-4 border-red-500 bg-red-400 px-3 py-2  active:border-b-2 disabled:cursor-not-allowed disabled:border-opacity-50 disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          Submit Test
        </button>
        {isSubmitting && <LoadingSpinner size={36} />}
      </div>
    </form>
  );
};

const CompetitionPage: NextPage<{ option: Uppercase<Exclude<Option, "team">> }> = ({
  option,
}) => {
  const { data: session, status } = useSession();

  const ctx = api.useContext();

  const { data: report, isLoading } = api.reports.byUser.useQuery(
    {
      userId: session?.user.id ?? "",
      contest: option,
    },
    {
      enabled: !!session?.user.id,
    }
  );

  const { mutateAsync: startTest, isLoading: isStarting } =
    api.reports.startTest.useMutation({
      onSuccess: () => {
        void ctx.reports.byUser.invalidate({
          userId: session?.user.id ?? "",
          contest: option,
        });
      },
    });

  if (status === "unauthenticated")
    return <ErrorComponent statusCode={500} title={"Unauthenticated"} />;

  if (isLoading || status === "loading") return <LoadingPage />;

  return (
    <main>
      <Head>
        <title>
          Competition |{" "}
          {`${option.substring(0, 1)}${option.substring(1).toLowerCase()}`}
        </title>
        <meta
          name="description"
          content={`Competition page for ${option.toLocaleLowerCase()} `}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-full max-h-screen min-h-full flex-col gap-4 pt-4">
        <div className="flex flex-row items-center justify-center">
          <h1 className="text-4xl font-bold">{option}</h1>
        </div>
        <div className="flex h-full flex-row items-center justify-center">
          {!report && (
            <button
              type="button"
              onClick={() => {
                void startTest({ contest: option });
              }}
              disabled={isStarting}
              className="w-fit rounded-md bg-blue-500 p-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStarting ? "Starting..." : "Start Test"}
            </button>
          )}
        </div>
        {report?.draft ? (
          <div className="flex w-full justify-center">
            <Test option={option} userId={session?.user.id ?? ""} />
          </div>
        ) : (
          report && (
            <div className="grid w-full grid-cols-1 place-items-center font-bold">
              All completed! Check your score on the leaderboard!
            </div>
          )
        )}
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const ssg = generateSSGHelper();

  const option = z
    .enum(["algebra", "geometry", "combinatorics"])
    .parse(params?.option);

  const test = option.toUpperCase() as Uppercase<Exclude<typeof option, "team">>;

  await ssg.problems.getBySubject.prefetch(test);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      option: option.toUpperCase(),
    },
  };
};

export default CompetitionPage;
