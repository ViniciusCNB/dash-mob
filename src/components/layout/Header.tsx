import { useTheme } from "@/components/theme-provider";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 mx-auto flex h-16 items-center justify-between">
        <div></div>
        <Button className="cursor-pointer" variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
