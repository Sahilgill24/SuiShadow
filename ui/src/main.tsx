import { createRoot } from "react-dom/client";
import "./index.css";
import "@mysten/dapp-kit/dist/index.css";
import App from "./App";
import React from "react";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster/>
  </React.StrictMode>
);
