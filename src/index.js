import React from "react";
import { createRoot } from "react-dom/client";
import App2 from "./App2";
import "./styles/App2.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
      <App2 />
  </React.StrictMode>
);
