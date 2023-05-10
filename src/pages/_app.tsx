import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { MathJaxContext } from "better-react-mathjax";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import config from "~/utils/MathJaxConfig";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <MathJaxContext version={3} config={config}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </MathJaxContext>
  );
};

export default api.withTRPC(MyApp);
