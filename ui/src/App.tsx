import { Routes, Route } from "react-router";
import { HomePage, Dashboard } from "./pages";
import { Providers } from "./providers";

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Providers>
  );
}
