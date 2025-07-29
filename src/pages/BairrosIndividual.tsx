import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilter } from "@/components/Filter";
import { Barplot } from "@/components/charts/Barplot";
import LeafletPointsMap from "@/components/charts/LeafletPointsMap";
import { useDashboardBairro } from "@/hooks/useApiQueries";
import { FilterIcon, MapPin } from "lucide-react";
import { useEffect } from "react";

const BairrosIndividual = () => {
  const { appliedBairros, selectedBairros, applyFilters } = useFilter();
  const bairroSelecionado = appliedBairros.length > 0 ? appliedBairros[0] : null;

  // Aplicar filtros automaticamente quando um bairro é selecionado
  useEffect(() => {
    if (selectedBairros.length > 0 && appliedBairros.length === 0) {
      applyFilters();
    }
  }, [selectedBairros, appliedBairros, applyFilters]);

  // Buscar dados do dashboard do bairro selecionado
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardBairro(bairroSelecionado?.id_bairro || 0);

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
      name: item.nome || item.codigo,
      value: item.valor,
      fullName: item.nome || item.codigo,
      isHighlighted: false
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

  if (!bairroSelecionado) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <FilterIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Selecione um bairro para análise</h3>
                <p className="text-sm">
                  Use o filtro acima para escolher um bairro específico e visualizar suas informações detalhadas
                </p>
                {selectedBairros.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Bairro selecionado: {selectedBairros[0].nome_bairro}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Clique em "Aplicar" no filtro para visualizar os dados
                    </p>
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">
          Bairro {bairroSelecionado.nome_bairro}
        </h1>
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
        {/* Informações do Bairro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Informações do Bairro</CardTitle>
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {getEstatisticasGrid().map((stat, index) => (
                    <div key={index}>
                      <span className="font-medium">{stat.label}</span>
                      <div className="text-muted-foreground">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString('pt-BR') : stat.value}
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
                    chartTitle={`Passageiros por dia da semana - Bairro ${bairroSelecionado.nome_bairro}`}
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
                    chartTitle={`Linhas mais utilizadas - Bairro ${bairroSelecionado.nome_bairro}`}
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

      {/* Mapa do Bairro */}
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="h-[600px]">
            {dashboardLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground bg-gray-50 rounded-lg">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p className="text-lg font-medium">Carregando mapa...</p>
                </div>
              </div>
            ) : dashboardError ? (
              <div className="flex items-center justify-center h-full text-muted-foreground bg-red-50 rounded-lg">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50 text-red-400" />
                  <p className="text-lg font-medium text-red-600">Erro ao carregar mapa</p>
                </div>
              </div>
            ) : (dashboardData?.mapa_pontos_bairro?.features && dashboardData.mapa_pontos_bairro.features.length > 0) || 
                (dashboardData?.mapa_geometria_bairro?.features && dashboardData.mapa_geometria_bairro.features.length > 0) ? (
              <LeafletPointsMap
                pontosData={dashboardData.mapa_pontos_bairro}
                bairrosData={dashboardData.mapa_geometria_bairro}
                height={600}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground bg-gray-50 rounded-lg">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Mapa não disponível</p>
                  <p className="text-sm">Não foram encontrados dados geográficos para este bairro</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BairrosIndividual;