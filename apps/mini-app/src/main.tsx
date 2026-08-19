import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "../../../shared/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
