import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NavigationProvider } from "./contexts/NavigationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
