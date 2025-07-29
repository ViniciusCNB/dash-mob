import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot } from "@/components/charts/Barplot";
import { 
  useDashboardConcessionaria, 
  useConcessionariasParaFiltro,
  ConcessionariaParaFiltro 
} from "@/hooks/useApiQueries";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";

const ConcessionariaIndividual = () => {
  // Por enquanto, vou simular uma concessionária selecionada (ID 1)
  // No futuro, isso pode vir de props, URL params ou filtro
  const [concessionariaSelecionada, setConcessionariaSelecionada] = useState<ConcessionariaParaFiltro | null>(null);
  
  // Buscar lista de concessionárias para permitir seleção
  const { data: concessionarias, isLoading: concessionariasLoading } = useConcessionariasParaFiltro();
  
  // Buscar dados do dashboard da concessionária selecionada
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useDashboardConcessionaria(concessionariaSelecionada?.id_concessionaria || 0);

  // Selecionar automaticamente a primeira concessionária disponível
  useEffect(() => {
    if (concessionarias && concessionarias.length > 0 && !concessionariaSelecionada) {
      setConcessionariaSelecionada(concessionarias[0]);
    }
  }, [concessionarias, concessionariaSelecionada]);

  // Transformar dados da API para o formato dos gráficos
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

  // Organizar estatísticas em grid
  const getEstatisticasGrid = () => {
    if (!dashboardData?.estatisticas_detalhadas) return [];
    
    return dashboardData.estatisticas_detalhadas.map(stat => ({
      label: stat.label,
      value: stat.value
    }));
  };

  if (concessionariasLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando concessionárias...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!concessionariaSelecionada) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Selecione uma concessionária para análise</h3>
                <p className="text-sm">
                  Escolha uma concessionária específica para visualizar suas informações detalhadas
                </p>
                {concessionarias && concessionarias.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Concessionárias disponíveis:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {concessionarias.map((conc) => (
                        <button
                          key={conc.id_concessionaria}
                          onClick={() => setConcessionariaSelecionada(conc)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          {conc.nome_concessionaria}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">
          Concessionária {concessionariaSelecionada.nome_concessionaria}
        </h1>
        {concessionarias && concessionarias.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Trocar concessionária:</label>
            <select 
              value={concessionariaSelecionada.id_concessionaria}
              onChange={(e) => {
                const selected = concessionarias.find(c => c.id_concessionaria === parseInt(e.target.value));
                if (selected) setConcessionariaSelecionada(selected);
              }}
              className="px-3 py-1 text-sm border rounded-md"
            >
              {concessionarias.map((conc) => (
                <option key={conc.id_concessionaria} value={conc.id_concessionaria}>
                  {conc.nome_concessionaria}
                </option>
              ))}
            </select>
          </div>
        )}
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
        {/* Informações da Concessionária */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Estatísticas da Concessionária</CardTitle>
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
                <div className="grid grid-cols-1 gap-4 text-sm">
                  {getEstatisticasGrid().map((stat, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{stat.label}</span>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString("pt-BR") : stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Passageiros por Dia da Semana */}
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
                    chartTitle={`Passageiros por dia da semana - ${concessionariaSelecionada.nome_concessionaria}`}
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
            <CardTitle className="text-lg font-semibold text-center">Linhas mais utilizadas</CardTitle>
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
                    preserveOrder={false}
                    showExportButton={true}
                    chartTitle={`Linhas mais utilizadas - ${concessionariaSelecionada.nome_concessionaria}`}
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
    </div>
  );
};

export default ConcessionariaIndividual;