import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// In production, __API_URL__ is injected at build time via vite.config.ts define
declare const __API_URL__: string;
if (typeof __API_URL__ !== "undefined" && __API_URL__) {
  setBaseUrl(__API_URL__);
}

createRoot(document.getElementById("root")!).render(<App />);

