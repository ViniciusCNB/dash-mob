import { createContext, useContext, useState, ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon, CalendarIcon, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLinhasParaFiltro, useBairrosParaFiltro, LinhaParaFiltro, BairroParaFiltro } from "@/hooks/useApiQueries";
import { useLocation } from "react-router";

// Contexto para gerenciar o filtro de período, linhas e bairros
interface FilterContextType {
  startDate: Date | undefined;
  endDate: Date | undefined;
  appliedStartDate: Date | undefined;
  appliedEndDate: Date | undefined;
  selectedLinhas: LinhaParaFiltro[];
  appliedLinhas: LinhaParaFiltro[];
  selectedBairros: BairroParaFiltro[];
  appliedBairros: BairroParaFiltro[];
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  setSelectedLinhas: (linhas: LinhaParaFiltro[]) => void;
  setSelectedBairros: (bairros: BairroParaFiltro[]) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

interface FilterProviderProps {
  children: ReactNode;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter deve ser usado dentro de um FilterProvider");
  }
  return context;
};

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date("2024-12-31"));
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(new Date("2024-01-01"));
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(new Date("2024-12-31"));
  const [selectedLinhas, setSelectedLinhas] = useState<LinhaParaFiltro[]>([]);
  const [appliedLinhas, setAppliedLinhas] = useState<LinhaParaFiltro[]>([]);
  const [selectedBairros, setSelectedBairros] = useState<BairroParaFiltro[]>([]);
  const [appliedBairros, setAppliedBairros] = useState<BairroParaFiltro[]>([]);

  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedLinhas(selectedLinhas);
    setAppliedBairros(selectedBairros);
  };

  const clearFilters = () => {
    setStartDate(new Date("2024-01-01"));
    setEndDate(new Date("2024-12-31"));
    setSelectedLinhas([]);
    setSelectedBairros([]);
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
        selectedBairros,
        appliedBairros,
        setStartDate,
        setEndDate,
        setSelectedLinhas,
        setSelectedBairros,
        applyFilters,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

const Filter = () => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedLinhas,
    setSelectedLinhas,
    selectedBairros,
    setSelectedBairros,
    applyFilters,
    clearFilters,
  } = useFilter();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [startValue, setStartValue] = useState(formatDate(startDate));
  const [endValue, setEndValue] = useState(formatDate(endDate));
  const [linhaSelectOpen, setLinhaSelectOpen] = useState(false);
  const [bairroSelectOpen, setBairroSelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBairroTerm, setSearchBairroTerm] = useState("");
  const location = useLocation();

  // Buscar linhas e bairros da API
  const { data: linhasData, isLoading: isLoadingLinhas } = useLinhasParaFiltro();
  const { data: bairrosData, isLoading: isLoadingBairros } = useBairrosParaFiltro();

  // Verificar se estamos na página de análise individual
  const isAnaliseIndividualLinha = location.pathname === "/linha-individual";
  const isAnaliseIndividualBairro = location.pathname === "/bairro-individual";

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
    if (isAnaliseIndividualLinha) {
      // Modo de seleção única para análise individual
      const isAlreadySelected = selectedLinhas.some((l) => l.id_linha === linha.id_linha);

      if (isAlreadySelected) {
        // Remove a linha se já estiver selecionada (limpa seleção)
        setSelectedLinhas([]);
      } else {
        // Substitui qualquer seleção anterior por essa linha
        setSelectedLinhas([linha]);
      }
      setLinhaSelectOpen(false); // Fecha o dropdown após seleção
    } else {
      // Modo de seleção múltipla para outras páginas
      const isAlreadySelected = selectedLinhas.some((l) => l.id_linha === linha.id_linha);

      if (isAlreadySelected) {
        // Remove a linha se já estiver selecionada
        setSelectedLinhas(selectedLinhas.filter((l) => l.id_linha !== linha.id_linha));
      } else {
        // Adiciona a linha se não estiver selecionada
        setSelectedLinhas([...selectedLinhas, linha]);
      }
    }
  };

  // Funções para manipular seleção de bairros
  const handleBairroSelect = (bairro: BairroParaFiltro) => {
    if (isAnaliseIndividualBairro) {
      // Modo de seleção única para análise individual
      const isAlreadySelected = selectedBairros.some((b) => b.id_bairro === bairro.id_bairro);

      if (isAlreadySelected) {
        // Remove o bairro se já estiver selecionado (limpa seleção)
        setSelectedBairros([]);
      } else {
        // Substitui qualquer seleção anterior por esse bairro
        setSelectedBairros([bairro]);
      }
      setBairroSelectOpen(false); // Fecha o dropdown após seleção
    } else {
      // Modo de seleção múltipla para outras páginas
      const isAlreadySelected = selectedBairros.some((b) => b.id_bairro === bairro.id_bairro);

      if (isAlreadySelected) {
        // Remove o bairro se já estiver selecionado
        setSelectedBairros(selectedBairros.filter((b) => b.id_bairro !== bairro.id_bairro));
      } else {
        // Adiciona o bairro se não estiver selecionado
        setSelectedBairros([...selectedBairros, bairro]);
      }
    }
  };

  const formatLinhaDisplay = (linha: LinhaParaFiltro) => {
    return linha.nome_linha ? `${linha.cod_linha} - ${linha.nome_linha}` : linha.cod_linha;
  };

  const formatBairroDisplay = (bairro: BairroParaFiltro) => {
    return bairro.nome_bairro;
  };

  const getFilteredLinhas = () => {
    if (!linhasData) return [];
    return linhasData.filter((linha) => formatLinhaDisplay(linha).toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const getFilteredBairros = () => {
    if (!bairrosData) return [];
    return bairrosData.filter((bairro) =>
      formatBairroDisplay(bairro).toLowerCase().includes(searchBairroTerm.toLowerCase())
    );
  };

  const getLinhaDisplayText = () => {
    if (selectedLinhas.length === 0) {
      return "Selecione uma linha";
    }
    if (selectedLinhas.length === 1) {
      return formatLinhaDisplay(selectedLinhas[0]);
    }
    return `${selectedLinhas.length} linhas selecionadas`;
  };

  const getBairroDisplayText = () => {
    if (selectedBairros.length === 0) {
      return "Selecione um bairro";
    }
    if (selectedBairros.length === 1) {
      return formatBairroDisplay(selectedBairros[0]);
    }
    return `${selectedBairros.length} bairros selecionados`;
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
                  {getLinhaDisplayText()}
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
                          {!isAnaliseIndividualLinha && (
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
                          )}
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
          <div className="space-y-2">
            <Popover open={bairroSelectOpen} onOpenChange={setBairroSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={bairroSelectOpen}
                  className="w-full justify-between bg-background"
                >
                  {getBairroDisplayText()}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Pesquisar bairro..."
                    value={searchBairroTerm}
                    onChange={(e) => setSearchBairroTerm(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 h-8"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingBairros ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Carregando bairros...</div>
                  ) : getFilteredBairros().length > 0 ? (
                    <div className="space-y-1 p-2">
                      {getFilteredBairros().map((bairro) => (
                        <div
                          key={bairro.id_bairro}
                          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                            selectedBairros.some((b) => b.id_bairro === bairro.id_bairro) ? "bg-accent" : ""
                          }`}
                          onClick={() => handleBairroSelect(bairro)}
                        >
                          {!isAnaliseIndividualBairro && (
                            <div
                              className={`w-4 h-4 border-2 rounded-sm ${
                                selectedBairros.some((b) => b.id_bairro === bairro.id_bairro)
                                  ? "bg-primary border-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedBairros.some((b) => b.id_bairro === bairro.id_bairro) && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-sm" />
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1 text-sm">{formatBairroDisplay(bairro)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchBairroTerm ? "Nenhum bairro encontrado" : "Nenhum bairro disponível"}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
        <div className="flex gap-1">
          <Button
            onClick={clearFilters}
            className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-6 py-2"
            disabled={!startDate || !endDate}
            variant="outline"
          >
            Limpar
          </Button>
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
