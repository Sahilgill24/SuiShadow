import { Routes, Route, Navigate } from "react-router";
import { HomePage, Dashboard } from "./pages";
import { Providers } from "./providers";
import { useAuthStore } from "./lib/auth-store";

export default function App() {
  const { loggedIn } = useAuthStore();
  return (
    <Providers>
      <Routes>
        <Route
          index
          element={loggedIn ? <Navigate to="/dashboard" /> : <HomePage />}
        />
        <Route
          path="/dashboard"
          element={!loggedIn ? <Navigate to="/" /> : <Dashboard />}
        />
      </Routes>
    </Providers>
  );
}
