import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEficienciaData } from "@/hooks/useApiQueries";
import { ScatterPlot } from "@/components/charts/ScatterPlot";
import { QuadrantLegend } from "@/components/charts/QuadrantLegend";
import { ScatterPlotControls } from "@/components/charts/ScatterPlotControls";
import { useMemo, useState, useEffect } from "react";
import { TrendingUp, Clock, Users, BarChart3 } from "lucide-react";

const Eficiencia = () => {
  const { data: eficienciaData, isLoading, error } = useEficienciaData();
  const [filteredData, setFilteredData] = useState(eficienciaData || []);

  // Sincronizar dados filtrados com dados da API
  useEffect(() => {
    if (eficienciaData) {
      setFilteredData(eficienciaData);
    }
  }, [eficienciaData]);

  // Calcular estatísticas resumidas
  const stats = useMemo(() => {
    if (!eficienciaData || eficienciaData.length === 0) return null;

    const avgPassageirosPorKm = eficienciaData.reduce((sum, d) => sum + d.passageiros_por_km, 0) / eficienciaData.length;
    const avgPassageirosPorMinuto = eficienciaData.reduce((sum, d) => sum + d.passageiros_por_minuto, 0) / eficienciaData.length;

    // Classificar linhas por quadrante
    const quadrantes = {
      melhores: eficienciaData.filter(d => d.passageiros_por_minuto >= avgPassageirosPorMinuto && d.passageiros_por_km >= avgPassageirosPorKm),
      lentasLotadas: eficienciaData.filter(d => d.passageiros_por_minuto < avgPassageirosPorMinuto && d.passageiros_por_km >= avgPassageirosPorKm),
      alvosOtimizacao: eficienciaData.filter(d => d.passageiros_por_minuto < avgPassageirosPorMinuto && d.passageiros_por_km < avgPassageirosPorKm),
      rapidasVazias: eficienciaData.filter(d => d.passageiros_por_minuto >= avgPassageirosPorMinuto && d.passageiros_por_km < avgPassageirosPorKm)
    };

    // Encontrar extremos
    const maisEficienteKm = eficienciaData.reduce((prev, curr) => prev.passageiros_por_km > curr.passageiros_por_km ? prev : curr);
    const maisEficienteMinuto = eficienciaData.reduce((prev, curr) => prev.passageiros_por_minuto > curr.passageiros_por_minuto ? prev : curr);
    const maiorImpacto = eficienciaData.reduce((prev, curr) => prev.total_passageiros > curr.total_passageiros ? prev : curr);
    const menosEficiente = eficienciaData.reduce((prev, curr) => (prev.passageiros_por_km + prev.passageiros_por_minuto) < (curr.passageiros_por_km + curr.passageiros_por_minuto) ? prev : curr);

    return {
      totalLinhas: eficienciaData.length,
      avgPassageirosPorKm,
      avgPassageirosPorMinuto,
      totalPassageiros: eficienciaData.reduce((sum, d) => sum + d.total_passageiros, 0),
      quadrantes,
      maisEficienteKm,
      maisEficienteMinuto,
      maiorImpacto,
      menosEficiente
    };
  }, [eficienciaData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados de eficiência...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Erro ao carregar dados: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">
          Eficiência das Linhas{" "}
          <Badge variant="secondary" className="self-start">
            Estudo de caso
          </Badge>
        </h1>
        
        {/* KPIs Resumidos */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Linhas</p>
                    <p className="text-2xl font-bold">{stats.totalLinhas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Passageiros</p>
                    <p className="text-2xl font-bold">{stats.totalPassageiros.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Média Pass./Km</p>
                    <p className="text-2xl font-bold">{stats.avgPassageirosPorKm.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Média Pass./Min</p>
                    <p className="text-2xl font-bold">{stats.avgPassageirosPorMinuto.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Pergunta</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Quais linhas representam o melhor (e o pior) retorno sobre o investimento operacional? Como podemos medir
              a eficiência de uma linha não apenas pela <strong>distância</strong> que ela percorre, mas também pelo{" "}
              <strong>tempo</strong> que ela gasta em trânsito? Onde estão as verdadeiras oportunidades de otimização?
            </p>
          </CardContent>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Métricas Utilizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Eficiência por Distância</strong>:{" "}
                <Badge variant="outline" className="text-sm">
                  Passageiros/Km
                </Badge>
                . Mede o quão cheia a linha é.
              </li>
              <li>
                <strong>Eficiência por Tempo</strong>:{" "}
                <Badge variant="outline" className="text-sm">
                  Passageiros/Minuto
                </Badge>
                . Mede o quão rápida a linha é.
              </li>
              <li>
                <strong>Impacto</strong>: Total de passageiros transportados. Mede o quão importante a linha é.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

            {/* Gráfico de Dispersão */}
      {eficienciaData && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Análise de Quadrantes - Eficiência das Linhas
              {filteredData.length < eficienciaData.length && (
                <Badge variant="secondary" className="text-xs">
                  {filteredData.length} de {eficienciaData.length} linhas
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cada ponto representa uma linha. O tamanho indica o total de passageiros transportados.
              As linhas tracejadas representam as médias e dividem o gráfico em quatro quadrantes.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScatterPlotControls 
              data={eficienciaData}
              onDataChange={setFilteredData}
              avgPassageirosPorKm={stats.avgPassageirosPorKm}
              avgPassageirosPorMinuto={stats.avgPassageirosPorMinuto}
            />
            <ScatterPlot 
              data={filteredData}
              className="min-h-[500px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Legenda dos Quadrantes */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretação dos Quadrantes</CardTitle>
          <p className="text-sm text-gray-600">
            As médias de Passageiros/Km e Passageiros/Minuto dividem o gráfico em quatro quadrantes, 
            cada um contando uma parte da história:
          </p>
        </CardHeader>
        <CardContent>
          <QuadrantLegend />
        </CardContent>
      </Card>

      {/* Destaques */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Destaques da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">🏆 Mais Eficiente por Distância</h4>
                  <p className="text-sm">
                    <strong>Linha {stats.maisEficienteKm.cod_linha}</strong>
                    {stats.maisEficienteKm.nome_linha && ` - ${stats.maisEficienteKm.nome_linha}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.maisEficienteKm.passageiros_por_km.toFixed(2)} passageiros/km
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">⚡ Mais Eficiente por Tempo</h4>
                  <p className="text-sm">
                    <strong>Linha {stats.maisEficienteMinuto.cod_linha}</strong>
                    {stats.maisEficienteMinuto.nome_linha && ` - ${stats.maisEficienteMinuto.nome_linha}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.maisEficienteMinuto.passageiros_por_minuto.toFixed(2)} passageiros/minuto
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">👥 Maior Impacto</h4>
                  <p className="text-sm">
                    <strong>Linha {stats.maiorImpacto.cod_linha}</strong>
                    {stats.maiorImpacto.nome_linha && ` - ${stats.maiorImpacto.nome_linha}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.maiorImpacto.total_passageiros.toLocaleString()} passageiros transportados
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ Precisa de Atenção</h4>
                  <p className="text-sm">
                    <strong>Linha {stats.menosEficiente.cod_linha}</strong>
                    {stats.menosEficiente.nome_linha && ` - ${stats.menosEficiente.nome_linha}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    Baixa eficiência geral - candidata à otimização
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo por Quadrantes */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Quadrantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.quadrantes.melhores.length}</div>
                <div className="text-sm text-green-600">As Melhores</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{stats.quadrantes.lentasLotadas.length}</div>
                <div className="text-sm text-orange-600">Lentas e Lotadas</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{stats.quadrantes.alvosOtimizacao.length}</div>
                <div className="text-sm text-red-600">Alvos de Otimização</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.quadrantes.rapidasVazias.length}</div>
                <div className="text-sm text-blue-600">Rápidas e Vazias</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Em vez de uma conclusão única, este estudo de caso permite que o gestor tenha múltiplos insights acionáveis: 
            <strong> As linhas no quadrante "Lentas e Lotadas" não precisam de mais veículos, mas sim de melhorias no 
            trânsito de suas rotas.</strong> As linhas no quadrante <strong>"Alvos de Otimização" precisam ser reavaliadas, 
            pois representam um uso ineficiente de recursos públicos.</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Eficiencia;
