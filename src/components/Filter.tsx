import { createContext, useContext, useState, ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon, CalendarIcon, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLinhasParaFiltro, LinhaParaFiltro } from "@/hooks/useApiQueries";

// Contexto para gerenciar o filtro de período e linhas
interface FilterContextType {
  startDate: Date | undefined;
  endDate: Date | undefined;
  appliedStartDate: Date | undefined;
  appliedEndDate: Date | undefined;
  selectedLinhas: LinhaParaFiltro[];
  appliedLinhas: LinhaParaFiltro[];
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  setSelectedLinhas: (linhas: LinhaParaFiltro[]) => void;
  applyFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter deve ser usado dentro de um FilterProvider");
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date("2024-12-31"));
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(new Date("2024-01-01"));
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(new Date("2024-12-31"));
  const [selectedLinhas, setSelectedLinhas] = useState<LinhaParaFiltro[]>([]);
  const [appliedLinhas, setAppliedLinhas] = useState<LinhaParaFiltro[]>([]);

  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedLinhas(selectedLinhas);
  };

  return (
    <FilterContext.Provider
      value={{
        startDate,
        endDate,
        appliedStartDate,
        appliedEndDate,
        selectedLinhas,
        appliedLinhas,
        setStartDate,
        setEndDate,
        setSelectedLinhas,
        applyFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

const Filter = () => {
  const { startDate, endDate, setStartDate, setEndDate, selectedLinhas, setSelectedLinhas, applyFilters } = useFilter();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [startValue, setStartValue] = useState(formatDate(startDate));
  const [endValue, setEndValue] = useState(formatDate(endDate));
  const [linhaSelectOpen, setLinhaSelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar linhas da API
  const { data: linhasData, isLoading: isLoadingLinhas } = useLinhasParaFiltro();

  // Limites de data
  const minDate = new Date("2015-01-01");
  const maxDate = new Date("2024-12-31");

  function formatDate(date: Date | undefined) {
    if (!date) {
      return "";
    }
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function parseDate(dateString: string): Date | undefined {
    if (!dateString) return undefined;
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mês base 0
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date >= minDate && date <= maxDate) {
        return date;
      }
    }
    return undefined;
  }

  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false;
    }
    return !isNaN(date.getTime()) && date >= minDate && date <= maxDate;
  }

  // Funções para manipular seleção de linhas
  const handleLinhaSelect = (linha: LinhaParaFiltro) => {
    const isAlreadySelected = selectedLinhas.some((l) => l.id_linha === linha.id_linha);

    if (isAlreadySelected) {
      // Remove a linha se já estiver selecionada
      setSelectedLinhas(selectedLinhas.filter((l) => l.id_linha !== linha.id_linha));
    } else {
      // Adiciona a linha se não estiver selecionada
      setSelectedLinhas([...selectedLinhas, linha]);
    }
  };

  const formatLinhaDisplay = (linha: LinhaParaFiltro) => {
    return linha.nome_linha ? `${linha.cod_linha} - ${linha.nome_linha}` : linha.cod_linha;
  };

  // Filtrar linhas baseado no termo de pesquisa
  const getFilteredLinhas = () => {
    if (!linhasData) return [];

    const filtered = linhasData.filter((linha) => {
      const searchLower = searchTerm.toLowerCase();
      const codigoMatch = linha.cod_linha.toLowerCase().includes(searchLower);
      const nomeMatch = linha.nome_linha?.toLowerCase().includes(searchLower);
      return codigoMatch || nomeMatch;
    });

    // Ordenar: selecionadas primeiro, depois as não selecionadas
    return filtered.sort((a, b) => {
      const aSelected = selectedLinhas.some((l) => l.id_linha === a.id_linha);
      const bSelected = selectedLinhas.some((l) => l.id_linha === b.id_linha);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      // Se ambas têm o mesmo status de seleção, ordenar por código
      return a.cod_linha.localeCompare(b.cod_linha);
    });
  };

  const getDisplayText = () => {
    if (selectedLinhas.length === 0) {
      return "Todas as linhas";
    }
    return `${selectedLinhas.length} linha${selectedLinhas.length > 1 ? "s" : ""} selecionada${
      selectedLinhas.length > 1 ? "s" : ""
    }`;
  };

  return (
    <div className="flex flex-row gap-4 p-6 pb-0 w-full">
      <div className="bg-muted-foreground/5 p-4 px-6 rounded-lg w-full flex flex-row gap-6 justify-between items-end">
        <div className="flex flex-col gap-2 items-center justify-center self-center border-r border-r-muted-foreground/20 pr-6">
          <FilterIcon className="w-4 h-4" />
          <div className="text-sm font-medium">Filtros</div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Linha</div>
          <div className="space-y-2">
            <Popover open={linhaSelectOpen} onOpenChange={setLinhaSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={linhaSelectOpen}
                  className="w-full justify-between bg-background"
                >
                  {getDisplayText()}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Pesquisar linha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 h-8"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingLinhas ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Carregando linhas...</div>
                  ) : getFilteredLinhas().length > 0 ? (
                    <div className="space-y-1 p-2">
                      {getFilteredLinhas().map((linha) => (
                        <div
                          key={linha.id_linha}
                          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                            selectedLinhas.some((l) => l.id_linha === linha.id_linha) ? "bg-accent" : ""
                          }`}
                          onClick={() => handleLinhaSelect(linha)}
                        >
                          <div
                            className={`w-4 h-4 border-2 rounded-sm ${
                              selectedLinhas.some((l) => l.id_linha === linha.id_linha)
                                ? "bg-primary border-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedLinhas.some((l) => l.id_linha === linha.id_linha) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-sm" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-sm">{formatLinhaDisplay(linha)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchTerm ? "Nenhuma linha encontrada" : "Nenhuma linha disponível"}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Bairro</div>
          <Select>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Bairro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="centro">Centro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm font-medium">Ocorrência</div>
          <Select>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Ocorrência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acidente">Acidente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-col gap-3">
            <Label htmlFor="date-start" className="px-1">
              Período
            </Label>
            <div className="relative flex gap-2 items-center">
              <div className="relative">
                <Input
                  id="date-start"
                  value={startValue}
                  placeholder="01/01/2015"
                  className="bg-background pr-10"
                  onChange={(e) => {
                    setStartValue(e.target.value);
                    const parsedDate = parseDate(e.target.value);
                    if (parsedDate) {
                      setStartDate(parsedDate);
                    }
                  }}
                  onBlur={() => {
                    setStartValue(formatDate(startDate));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">Abrir calendário</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      captionLayout="dropdown"
                      month={startDate}
                      onMonthChange={setStartDate}
                      onSelect={(date) => {
                        if (date && isValidDate(date)) {
                          setStartDate(date);
                          setStartValue(formatDate(date));
                          setOpen(false);
                        }
                      }}
                      disabled={(date) => !isValidDate(date)}
                      fromDate={minDate}
                      toDate={maxDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-sm font-medium">até</span>
              <div className="relative">
                <Input
                  id="date-end"
                  value={endValue}
                  placeholder="31/12/2024"
                  className="bg-background pr-10"
                  onChange={(e) => {
                    setEndValue(e.target.value);
                    const parsedDate = parseDate(e.target.value);
                    if (parsedDate) {
                      setEndDate(parsedDate);
                    }
                  }}
                  onBlur={() => {
                    setEndValue(formatDate(endDate));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen2(true);
                    }
                  }}
                />
                <Popover open={open2} onOpenChange={setOpen2}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">Abrir calendário</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      captionLayout="dropdown"
                      month={endDate}
                      onMonthChange={setEndDate}
                      onSelect={(date) => {
                        if (date && isValidDate(date)) {
                          setEndDate(date);
                          setEndValue(formatDate(date));
                          setOpen2(false);
                        }
                      }}
                      disabled={(date) => !isValidDate(date) || (startDate ? date < startDate : false)}
                      fromDate={startDate || minDate}
                      toDate={maxDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            onClick={applyFilters}
            className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-6 py-2"
            disabled={!startDate || !endDate}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
