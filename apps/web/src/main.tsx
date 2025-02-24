import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import { Web3Providers } from "./providers/Web3Providers";
import "./index.css";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Web3Providers>
      <HashRouter>
        <App />
      </HashRouter>
    </Web3Providers>
  </StrictMode>,
);