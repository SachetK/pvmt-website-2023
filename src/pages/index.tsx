import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { OPTIONS } from "~/utils/options";

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-row items-center justify-center space-x-2 rounded-r-xl py-2">
      <form className="flex flex-col rounded-l-xl bg-slate-100">
        {Object.values(OPTIONS).map((option, idx) => (
          <Link
            key={idx}
            className="p-2 text-center transition ease-in-out first:rounded-tl-xl last:rounded-bl-xl focus:bg-blue-600"
            href={`/competition/${encodeURIComponent(option)}`}
          >
            <span>{option.toUpperCase()}</span>
          </Link>
        ))}
      </form>
      <button
        type="button"
        className="rounded-r-xl bg-slate-100 p-2 text-center transition ease-in-out hover:bg-blue-600 focus:bg-blue-600"
        onClick={() => void signIn("google")}
      >
        Sign in
      </button>
    </div>
  );
};

export default Home;
