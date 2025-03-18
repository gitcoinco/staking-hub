import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import { Router } from "./Router";
import { SquidProvider } from "./providers/SquidProvider";
import { Web3Providers } from "./providers/Web3Providers";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Web3Providers>
      <SquidProvider>
        <HashRouter>
          <Router />
        </HashRouter>
      </SquidProvider>
    </Web3Providers>
  </StrictMode>,
);
