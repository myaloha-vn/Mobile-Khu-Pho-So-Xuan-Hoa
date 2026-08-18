import { createRoot } from "react-dom/client";
import { AppRouter } from "./router";
import "../../../shared/styles/index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />);
