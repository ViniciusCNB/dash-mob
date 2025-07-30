import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "@/components/theme-provider";
import { FilterProvider } from "@/components/Filter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Linhas from "./pages/Linhas";
import LinhaIndividual from "./pages/LinhaIndividual";
import Ocorrencias from "./pages/Ocorrencias";
import OcorrenciaIndividual from "./pages/OcorrenciaIndividual";
import Eficiencia from "./pages/case-studies/Eficiencia";
import Falhas from "./pages/case-studies/Falhas";
import Bairros from "./pages/Bairros";
import BairrosIndividual from "./pages/BairrosIndividual";
import Concessionarias from "./pages/Concessionarias";
import ConcessionariaIndividual from "./pages/ConcessionariaIndividual";
import Veiculos from "./pages/Veiculos";
import VeiculoIndividual from "./pages/VeiculoIndividual";
import Empresas from "./pages/Empresas";
import EmpresaIndividual from "./pages/EmpresaIndividual";

const routes = [
  { path: "/", element: <Index /> },
  { path: "/linhas", element: <Linhas /> },
  { path: "/linha-individual", element: <LinhaIndividual /> },
  { path: "/ocorrencias", element: <Ocorrencias /> },
  { path: "/ocorrencia-individual", element: <OcorrenciaIndividual /> },
  { path: "/bairros", element: <Bairros /> },
  { path: "/bairros-individual", element: <BairrosIndividual /> },
  { path: "/concessionarias", element: <Concessionarias /> },
  { path: "/concessionaria-individual", element: <ConcessionariaIndividual /> },
  { path: "/veiculos", element: <Veiculos /> },
  { path: "/veiculo-individual", element: <VeiculoIndividual /> },
  { path: "/empresas", element: <Empresas /> },
  { path: "/empresa-individual", element: <EmpresaIndividual /> },
  { path: "/eficiencia-das-linhas", element: <Eficiencia /> },
  { path: "/falhas-mecanicas", element: <Falhas /> },
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
