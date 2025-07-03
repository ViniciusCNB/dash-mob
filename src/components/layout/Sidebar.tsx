import { ChevronLeft, ChevronRight, Warehouse, Route, Bus, Store, Building2, Pin, FilePen, Globe, ChartLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "react-router";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Visão Geral",
      icon: Globe,
      path: "/",
    },
    {
      title: "Linhas",
      icon: Route,
      path: "/linhas",
    },
    {
      title: "Ocorrências",
      icon: FilePen,
      path: "/ocorrencias",
    },
    {
      title: "Bairros",
      icon: Building2,
      path: "/bairros",
    },
    {
      title: "Concessionárias",
      icon: Warehouse,
      path: "/concessionarias",
    },
    {
      title: "Veículos",
      icon: Bus,
      path: "/veiculos",
    },
    {
      title: "Empresas",
      icon: Store,
      path: "/empresas",
    },
  ];
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center border-b px-4 justify-between">
        {!isCollapsed && (
          <div className="flex items-center text-xl font-bold gap-2">
            <img src="/dashboard.png" alt="DashMob" className="w-6 h-6" /> DashMob
          </div>
        )}{" "}
        <Button variant="ghost" size="icon" className="ml-auto cursor-pointer" onClick={onToggle}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          {!isCollapsed ? (
            <>
              <div className="text-sm font-medium">Localização</div>
              <Select defaultValue="beloHorizonte">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beloHorizonte">Belo Horizonte</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <div className="text-sm font-medium">Loc.</div>
              <Button
                variant="outline"
                className={cn("w-full justify-start gap-2 hover:bg-transparent", isCollapsed && "justify-center px-2")}
              >
                <Pin className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">{isCollapsed ? "Tem." : "Temas"}</div>
          {menuItems.map((item) => (
            <Link to={item.path} key={item.path}>
              <Button
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 cursor-pointer",
                  location.pathname === item.path && "bg-secondary",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && item.title}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
