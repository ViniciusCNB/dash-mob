import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "@/components/theme-provider";
import { FilterProvider } from "@/components/Filter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
      <QueryClientProvider client={queryClient}>
        <FilterProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </FilterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App
