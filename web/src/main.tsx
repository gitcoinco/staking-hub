import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import { Web3Providers } from "./providers/Web3Providers";
import { Router } from "./Router";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Web3Providers>
      <HashRouter>
        <Router />
      </HashRouter>
    </Web3Providers>
  </StrictMode>
);