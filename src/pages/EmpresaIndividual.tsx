import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barplot } from "@/components/charts/Barplot";
import { AreaChart } from "@/components/charts/AreaChart";
import { useDashboardEmpresa, useEmpresasParaFiltro, EmpresaParaFiltro } from "@/hooks/useApiQueries";
import { FilterIcon, Search } from "lucide-react";
import { useState, useEffect } from "react";

const EmpresaIndividual = () => {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaParaFiltro | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar empresas e dados do dashboard
  const { data: empresasData, isLoading: isLoadingEmpresas } = useEmpresasParaFiltro();
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardEmpresa(empresaSelecionada?.id_empresa || 0);

  // Abrir dialog automaticamente se não há empresa selecionada
  useEffect(() => {
    if (!empresaSelecionada) {
      setIsDialogOpen(true);
    }
  }, [empresaSelecionada]);

  // Filtrar empresas baseado no termo de pesquisa
  const getFilteredEmpresas = () => {
    if (!empresasData) return [];

    return empresasData.filter((empresa) => {
      const searchLower = searchTerm.toLowerCase();
      const nomeMatch = empresa.nome_empresa.toLowerCase().includes(searchLower);
      return nomeMatch;
    });
  };

  // Transformar dados da API para o formato dos gráficos
  const getDadosJustificativas = () => {
    if (!dashboardData?.grafico_justificativas) return [];
    
    return dashboardData.grafico_justificativas.map(item => ({
      name: item.category,
      value: item.value,
      fullName: item.category,
      isHighlighted: false,
    }));
  };

  const getDadosLinhasMaisUtilizadas = () => {
    if (!dashboardData?.grafico_linhas_mais_utilizadas) return [];
    
    return dashboardData.grafico_linhas_mais_utilizadas.map(item => ({
      name: item.codigo,
      value: item.valor,
      fullName: item.nome || item.codigo,
      id: item.id,
      isHighlighted: false,
    }));
  };

  const getDadosPassageirosPorDia = () => {
    if (!dashboardData?.grafico_media_passageiros_dia_semana) return [];
    
    // Mapeamento dos dias da semana para ordenação e tradução
    const ordemDias: { [key: string]: { ordem: number; nomePortugues: string } } = {
      // Português
      'segunda': { ordem: 0, nomePortugues: 'Segunda' },
      'segunda-feira': { ordem: 0, nomePortugues: 'Segunda' },
      'seg': { ordem: 0, nomePortugues: 'Segunda' },
      'terça': { ordem: 1, nomePortugues: 'Terça' },
      'terça-feira': { ordem: 1, nomePortugues: 'Terça' },
      'ter': { ordem: 1, nomePortugues: 'Terça' },
      'quarta': { ordem: 2, nomePortugues: 'Quarta' },
      'quarta-feira': { ordem: 2, nomePortugues: 'Quarta' },
      'qua': { ordem: 2, nomePortugues: 'Quarta' },
      'quinta': { ordem: 3, nomePortugues: 'Quinta' },
      'quinta-feira': { ordem: 3, nomePortugues: 'Quinta' },
      'qui': { ordem: 3, nomePortugues: 'Quinta' },
      'sexta': { ordem: 4, nomePortugues: 'Sexta' },
      'sexta-feira': { ordem: 4, nomePortugues: 'Sexta' },
      'sex': { ordem: 4, nomePortugues: 'Sexta' },
      'sábado': { ordem: 5, nomePortugues: 'Sábado' },
      'sabado': { ordem: 5, nomePortugues: 'Sábado' },
      'sab': { ordem: 5, nomePortugues: 'Sábado' },
      'domingo': { ordem: 6, nomePortugues: 'Domingo' },
      'dom': { ordem: 6, nomePortugues: 'Domingo' },
      // Inglês (traduzindo para português)
      'monday': { ordem: 0, nomePortugues: 'Segunda' },
      'mon': { ordem: 0, nomePortugues: 'Segunda' },
      'tuesday': { ordem: 1, nomePortugues: 'Terça' },
      'tue': { ordem: 1, nomePortugues: 'Terça' },
      'wednesday': { ordem: 2, nomePortugues: 'Quarta' },
      'wed': { ordem: 2, nomePortugues: 'Quarta' },
      'thursday': { ordem: 3, nomePortugues: 'Quinta' },
      'thu': { ordem: 3, nomePortugues: 'Quinta' },
      'friday': { ordem: 4, nomePortugues: 'Sexta' },
      'fri': { ordem: 4, nomePortugues: 'Sexta' },
      'saturday': { ordem: 5, nomePortugues: 'Sábado' },
      'sat': { ordem: 5, nomePortugues: 'Sábado' },
      'sunday': { ordem: 6, nomePortugues: 'Domingo' },
      'sun': { ordem: 6, nomePortugues: 'Domingo' }
    };

    // Transformar os dados
    const dadosTransformados = dashboardData.grafico_media_passageiros_dia_semana.map(item => {
      const diaLower = item.category.toLowerCase();
      const diaInfo = ordemDias[diaLower] || { ordem: 7, nomePortugues: item.category };
      
      return {
        name: diaInfo.nomePortugues,
        value: item.value,
        fullName: diaInfo.nomePortugues,
        isHighlighted: false,
        ordem: diaInfo.ordem
      };
    });

    // Ordenar pelos dias da semana (segunda a domingo)
    const dadosOrdenados = dadosTransformados.sort((a, b) => a.ordem - b.ordem);
    
    return dadosOrdenados;
  };

  const getDadosEvolucaoPassageiros = () => {
    if (!dashboardData?.grafico_evolucao_passageiros_ano) return [];
    
    return dashboardData.grafico_evolucao_passageiros_ano.map(item => ({
      x: parseInt(item.category) || 0, // Converte o ano para número
      y: item.value,
      label: item.category, // Mantém o label original para tooltip
    }));
  };

  // Organizar estatísticas em grid
  const getEstatisticasGrid = () => {
    if (!dashboardData?.estatisticas_detalhadas) return [];
    
    return dashboardData.estatisticas_detalhadas.map(stat => ({
      label: stat.label,
      value: stat.value
    }));
  };

  const handleSelectEmpresa = (empresa: EmpresaParaFiltro) => {
    setEmpresaSelecionada(empresa);
    setIsDialogOpen(false);
  };

  const handleChangeEmpresa = () => {
    setIsDialogOpen(true);
  };

  if (!empresaSelecionada) {
    return (
      <>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <FilterIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">Selecione uma empresa para análise</h3>
                  <p className="text-sm">
                    Escolha uma empresa para visualizar suas informações detalhadas
                  </p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)} 
                    className="mt-4 bg-[#1976d2] hover:bg-[#1565c0] text-white"
                  >
                    Selecionar Empresa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de seleção */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Selecionar Empresa</DialogTitle>
              <DialogDescription>
                Escolha uma empresa para analisar
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Lista de empresas */}
              <div className="max-h-[300px] overflow-y-auto">
                {isLoadingEmpresas ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Carregando empresas...
                  </div>
                ) : getFilteredEmpresas().length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma empresa encontrada
                  </div>
                ) : (
                  <div className="space-y-1">
                    {getFilteredEmpresas().map((empresa) => (
                      <Button
                        key={empresa.id_empresa}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => handleSelectEmpresa(empresa)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {empresa.nome_empresa}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {empresa.id_empresa}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">
          Empresa: {empresaSelecionada.nome_empresa}
        </h1>
        <Button 
          variant="outline" 
          onClick={handleChangeEmpresa}
          className="text-[#1976d2] border-[#1976d2] hover:bg-[#1976d2] hover:text-white"
        >
          Alterar Empresa
        </Button>
      </div>

      {/* Aviso de erro geral */}
      {dashboardError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-sm font-medium">⚠️ Alguns dados podem não estar disponíveis devido a um erro no servidor</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {dashboardLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : dashboardError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-xl">!</span>
                  </div>
                  <p className="text-sm text-red-600">Erro ao carregar dados</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  {/* Informações básicas da empresa */}
                  <div>
                    <span className="font-medium">ID da Empresa</span>
                    <div className="text-muted-foreground">
                      {empresaSelecionada.id_empresa}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Nome da Empresa</span>
                    <div className="text-muted-foreground">
                      {empresaSelecionada.nome_empresa}
                    </div>
                  </div>
                  
                  {/* Estatísticas do dashboard */}
                  {getEstatisticasGrid().map((stat, index) => (
                    <div key={index}>
                      <span className="font-medium">{stat.label}</span>
                      <div className="text-muted-foreground">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Média de Passageiros por Dia da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Média de passageiros por dia da semana</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-center">
            <div className="h-72 w-full">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : dashboardError ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Erro ao carregar gráfico</p>
                </div>
              ) : getDadosPassageirosPorDia().length > 0 ? (
                <div className="w-full h-full">
                  <Barplot 
                    data={getDadosPassageirosPorDia()} 
                    valueLabel="Passageiros"
                    itemLabel=""
                    preserveOrder={true}
                    showExportButton={true}
                    chartTitle={`Passageiros por dia da semana - ${empresaSelecionada.nome_empresa}`}
                    xAxisLabel="Dias da Semana"
                    yAxisLabel="Número de Passageiros"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Linhas Mais Utilizadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Linhas que mais atendeu</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-center">
            <div className="h-72 w-full">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : dashboardError ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Erro ao carregar gráfico</p>
                </div>
              ) : getDadosLinhasMaisUtilizadas().length > 0 ? (
                <div className="w-full h-full">
                  <Barplot 
                    data={getDadosLinhasMaisUtilizadas()} 
                    valueLabel="Passageiros"
                    itemLabel="Linha"
                    showExportButton={true}
                    chartTitle={`Linhas mais utilizadas - ${empresaSelecionada.nome_empresa}`}
                    xAxisLabel="Linhas"
                    yAxisLabel="Número de Passageiros"
                    rotateLabels={true}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha com gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Justificativas por Ocorrência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Justificativa por ocorrência</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-center">
            <div className="h-72 w-full">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : dashboardError ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Erro ao carregar gráfico</p>
                </div>
              ) : getDadosJustificativas().length > 0 ? (
                <div className="w-full h-full">
                  <Barplot 
                    data={getDadosJustificativas()} 
                    valueLabel="Ocorrências"
                    itemLabel="Justificativa"
                    showExportButton={true}
                    chartTitle={`Justificativas de ocorrências - ${empresaSelecionada.nome_empresa}`}
                    xAxisLabel="Justificativas"
                    yAxisLabel="Número de Ocorrências"
                    rotateLabels={true}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Evolução de Passageiros por Ano */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Evolução: passageiros atendidos por ano</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-center">
            <div className="h-72 w-full">
              {dashboardLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : dashboardError ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Erro ao carregar gráfico</p>
                </div>
              ) : getDadosEvolucaoPassageiros().length > 0 ? (
                <div className="w-full h-full">
                                     <AreaChart 
                     data={getDadosEvolucaoPassageiros()} 
                     showExportButton={true}
                     chartTitle={`Evolução de passageiros por ano - ${empresaSelecionada.nome_empresa}`}
                     xAxisLabel="Ano"
                     yAxisLabel="Número de Passageiros"
                   />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de seleção (reutilizado) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Empresa</DialogTitle>
            <DialogDescription>
              Escolha uma nova empresa para analisar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Lista de empresas */}
            <div className="max-h-[300px] overflow-y-auto">
              {isLoadingEmpresas ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Carregando empresas...
                </div>
              ) : getFilteredEmpresas().length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma empresa encontrada
                </div>
              ) : (
                <div className="space-y-1">
                  {getFilteredEmpresas().map((empresa) => (
                    <Button
                      key={empresa.id_empresa}
                      variant={empresaSelecionada?.id_empresa === empresa.id_empresa ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => handleSelectEmpresa(empresa)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {empresa.nome_empresa}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {empresa.id_empresa}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmpresaIndividual;