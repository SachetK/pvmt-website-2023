import { type NextPage } from "next";
import Link from "next/link";
import { useState } from "react";

import { OPTIONS, type Option } from "~/utils/options";

const Home: NextPage = () => {
  const [option, setOption] = useState<Option>();

  return (
    <div className="flex min-h-screen flex-row items-center justify-center space-x-2 rounded-r-xl py-2">
      <form className="flex flex-col rounded-r-xl bg-slate-100">
        {Object.values(OPTIONS).map((option, idx) => (
          <Link
            key={idx}
            className="p-2 text-center transition ease-in-out first:rounded-tr-xl last:rounded-br-xl focus:bg-blue-600"
            href={`/problems/${option}`}
            onClick={() => setOption(option)}
          >
            <span>{option.toUpperCase()}</span>
          </Link>
        ))}
      </form>
    </div>
  );
};

export default Home;
