import type { GetStaticProps, NextPage } from "next";
import ErrorComponent from "next/error";
import { generateSSGHelper } from "~/server/helpers/ssgHelpers";
import { api } from "~/utils/api";
import type { Option } from "~/utils/options";

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

const TestPage: NextPage<{ option: Uppercase<Option> }> = ({ option }) => {
  
  
const { data: problems } = api.problems.getBySubject.useQuery(option);

  if (!problems) return <ErrorComponent statusCode={404} />;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-row items-center justify-center">
        <h1 className="text-4xl font-bold">{option}</h1>
      </div>
      <div className="flex flex-col space-y-4">
        {problems.map((problem, idx) => (
          <div key={idx} className="flex flex-col space-y-2">
            <div className="flex flex-row space-x-2">
              <span className="font-bold">{idx + 1}.</span>
              <span>{problem.question}</span>
            </div>
            <div className="flex flex-row space-x-2">
              <span className="font-bold">Answer:</span>
              <span>{problem.answer}</span>
            </div>
          </div>
        ))}
      </div>
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

export default TestPage;
