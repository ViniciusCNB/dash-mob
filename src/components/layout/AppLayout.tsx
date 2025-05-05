import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Filter from "../Filter";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div 
        className={`transition-all duration-300 ease-in-out w-full ${
          isCollapsed ? "ml-[64px]" : "ml-[240px]"
        }`}
      >
        <Header />
        <Filter />
        <main className="mx-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
