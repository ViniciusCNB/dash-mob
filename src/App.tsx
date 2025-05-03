import AppLayout from "./components/layout/AppLayout"
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter } from "react-router-dom";

function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="dashmob-theme">
      <BrowserRouter>
        <AppLayout>
          <h1>Hello World</h1>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
