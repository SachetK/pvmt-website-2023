import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { MathJaxContext } from "better-react-mathjax";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import config from "~/utils/MathJaxConfig";
import Link from "next/link";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <MathJaxContext version={3} config={config}>
      <SessionProvider session={session}>
        <Header />
        <Component {...pageProps} />
      </SessionProvider>
    </MathJaxContext>
  );
};

const Header = () => {

  return (
    <nav className="absolute left-4 top-4">
      <Link href="/">
        <svg width="48" height="48" viewBox="0 0 24 24">
          <path d="M3 10v11h6v-7h6v7h6v-11L12,3z" />
        </svg>
      </Link>
    </nav>
  );
};

export default api.withTRPC(MyApp);
