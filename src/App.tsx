import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter } from "react-router-dom";
import Index from "./pages/Index";

function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="dashmob-theme">
      <BrowserRouter>
        <AppLayout>
          <Index />
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
