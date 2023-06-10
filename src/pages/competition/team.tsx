import type { GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { z } from "zod";
import { LoadingSpinner, LoadingPage } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";
import { api } from "~/utils/api";
import ErrorComponent from "next/error";
import { useMemo, useRef, useEffect } from "react";
import useCountdown from "~/utils/useCountdown";

const Test: React.FC<{ teamId: string; startTime: Date }> = ({
  teamId,
  startTime,
}) => {
  const { data: problems, isLoading } =
    api.problems.getBySubject.useQuery("TEAM");

  const ctx = api.useContext();
  const finalTime = useMemo(() => {
    return new Date(startTime.getTime() + 60 * 60 * 1000);
  }, [startTime]);

  const { minutes, seconds, isFinished } = useCountdown(finalTime);

  const form = useRef<HTMLFormElement>(null);
  const submit = useRef<HTMLButtonElement>(null);

  const { mutateAsync: submitTest, isLoading: isSubmitting } =
    api.teams.submitTest.useMutation({
      onSuccess: () => {
        void ctx.teams.byId.invalidate({
          teamId,
        });
      },
    });

  useEffect(() => {
    if (isFinished) {
      alert("Time's up!");
      form.current?.requestSubmit(submit.current);
    }
  }, [isFinished]);

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
          endTime: new Date(),
          answers: answers as { problemId: string; answer: number }[],
        });
      }}
      ref={form}
    >
      <div className="flex flex-row space-x-2">
        <span className="font-bold">Time Remaining:</span>
        <span>{`${minutes.toString().length < 2 ? `0${minutes}` : minutes}:${
          seconds.toString().length < 2 ? `0${seconds}` : seconds
        }`}</span>
      </div>
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
          ref={submit}
        >
          Submit Test
        </button>
        {isSubmitting && <LoadingSpinner size={36} />}
      </div>
    </form>
  );
};

const CompetitionPage: NextPage = () => {
  const { data: session, status } = useSession();

  const ctx = api.useContext();

  const {
    data: team,
    isLoading,
    isError,
  } = api.teams.byUser.useQuery(undefined, {
    enabled: !!session?.user.id,
    retry: false,
  });

  const { mutateAsync: startTest, isLoading: isStarting } =
    api.teams.startTest.useMutation({
      onSuccess: () => {
        void ctx.teams.byUser.invalidate();
      },
    });

  if (status === "unauthenticated")
    return <ErrorComponent statusCode={500} title={"Unauthenticated"} />;

  if (isLoading || status === "loading") return <LoadingPage />;

  if (isError)
    return <ErrorComponent statusCode={500} title={"Team not found"} />;

  return (
    <main>
      <Head>
        <title>Competition | Team</title>
        <meta name="description" content={`Competition page for Team `} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-full max-h-screen min-h-full flex-col gap-4 pt-4">
        <div className="flex flex-row items-center justify-center">
          <h1 className="text-4xl font-bold">TEAM</h1>
        </div>
        <div className="flex h-full flex-row items-center justify-center">
          {!team && (
            <button
              type="button"
              onClick={() => {
                void startTest({
                  startTime: new Date(),
                });
              }}
              // disabled={isStarting}
              disabled
              className="w-fit rounded-md bg-blue-500 p-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStarting ? "Starting..." : "Start Test"}
            </button>
          )}
        </div>
        {team?.submitted ? (
          <div className="flex w-full justify-center">
            <Test teamId={team?.id ?? ""} startTime={team.startTime} />
          </div>
        ) : (
          team && (
            <div className="grid w-full grid-cols-1 place-items-center font-bold">
              All completed! Check your score on the leaderboard!
            </div>
          )
        )}
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = generateSSGHelper();

  await ssg.teams.byUser.prefetch();
  await ssg.problems.getBySubject.prefetch("TEAM");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export default CompetitionPage;
