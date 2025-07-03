import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Linhas from "./pages/Linhas";
import Ocorrencias from "./pages/Ocorrencias";

const routes = [
  { path: "/", element: <Index /> },
  { path: "/linhas", element: <Linhas /> },
  { path: "/ocorrencias", element: <Ocorrencias /> },
  { path: "/eficiencia-das-linhas", element: <Eficiencia /> },
];

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="dashmob-theme">
      <BrowserRouter>
        <AppLayout>
          <Index />
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
