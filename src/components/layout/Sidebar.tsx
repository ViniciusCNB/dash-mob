import {
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Route,
  Bus,
  Store,
  Building2,
  Pin,
  FilePen,
  Globe,
  ChartLine,
  Wrench,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "react-router";
import { useState, useEffect } from "react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface SubmenuItem {
  title: string;
  icon: any;
  path: string;
}

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  hasSubmenu?: boolean;
  submenuItems?: SubmenuItem[];
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
      hasSubmenu: true,
      submenuItems: [
        {
          title: "Análise Individual",
          path: "/linha-individual",
        },
        {
          title: "Análise Geral",
          path: "/linhas",
        },
      ],
    },
    {
      title: "Ocorrências",
      icon: FilePen,
      path: "/ocorrencias",
      hasSubmenu: true,
      submenuItems: [
        {
          title: "Análise Individual",
          path: "/ocorrencia-individual",
        },
        {
          title: "Análise Geral",
          path: "/ocorrencias",
        },
      ],
    },
    {
      title: "Bairros",
      icon: Building2,
      path: "/bairros",
      hasSubmenu: true,
      submenuItems: [
        {
          title: "Análise Individual",
          path: "/bairros-individual",
        },
        {
          title: "Análise Geral",
          path: "/bairros",
        },
      ],
    },
    {
      title: "Concessionárias",
      icon: Warehouse,
      path: "/concessionarias",
      hasSubmenu: true,
      submenuItems: [
        {
          title: "Análise Individual",
          path: "/concessionaria-individual",
        },
        {
          title: "Análise Geral",
          path: "/concessionarias",
        },
      ],
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

  const studiesItems = [
    {
      title: "Eficiência das Linhas",
      icon: ChartLine,
      path: "/eficiencia-das-linhas",
    },
    {
      title: "Falhas Mecânicas",
      icon: Wrench,
      path: "/falhas-mecanicas",
    },
  ];

  const isActiveItem = (item: any) => {
    if (item.hasSubmenu) {
      return (
        item.submenuItems?.some((subItem: any) => location.pathname === subItem.path) || location.pathname === item.path
      );
    }
    return location.pathname === item.path;
  };

  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleItemHover = (itemTitle: string) => {
    if (!isCollapsed) {
      // Cancelar qualquer timeout pendente
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setHoveredItem(itemTitle);
    }
  };

  const handleItemLeave = () => {
    // Pequeno delay para permitir que o usuário mova o mouse para o submenu
    const timeout = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleSubmenuEnter = (itemTitle: string) => {
    // Cancelar o timeout quando o mouse entra no submenu
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredItem(itemTitle);
  };

  const handleSubmenuLeave = () => {
    // Fechar o submenu quando o mouse sai dele
    setHoveredItem(null);
  };

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
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => item.hasSubmenu && handleItemHover(item.title)}
              onMouseLeave={() => item.hasSubmenu && handleItemLeave()}
            >
              <Link to={item.path}>
                <Button
                  variant={isActiveItem(item) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 cursor-pointer",
                    isActiveItem(item) && "bg-secondary",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.title}
                  {!isCollapsed && item.hasSubmenu && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Button>
              </Link>

              {/* Submenu */}
              {!isCollapsed && item.hasSubmenu && hoveredItem === item.title && (
                <div
                  className="absolute left-full top-0 ml-1 z-50 min-w-48 bg-background border rounded-md shadow-lg py-1"
                  onMouseEnter={() => handleSubmenuEnter(item.title)}
                  onMouseLeave={handleSubmenuLeave}
                  style={{
                    // Adicionar área invisível para facilitar a transição do mouse
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  {/* Área invisível para facilitar a transição do mouse */}
                  <div className="absolute -left-2 top-0 w-2 h-full bg-transparent"></div>
                  {item.submenuItems?.map((subItem: any) => (
                    <Link key={subItem.path} to={subItem.path}>
                      <Button
                        variant={location.pathname === subItem.path ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 rounded-none h-auto py-2 px-3",
                          location.pathname === subItem.path && "bg-secondary"
                        )}
                      >
                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                        {subItem.title}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">{isCollapsed ? "Est." : "Estudos de Caso"}</div>
          {studiesItems.map((item) => (
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
