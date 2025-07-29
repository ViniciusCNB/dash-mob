import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot, BarplotDataItem } from "@/components/charts/Barplot";
import {
  useRankingBairrosLinhas,
  useRankingBairrosOcorrencias,
  useRankingBairrosPontos,
  RankingItem,
} from "@/hooks/useApiQueries";

const Bairros = () => {
  // Usar todos os hooks do TanStack Query para dados de bairros
  const rankingLinhas = useRankingBairrosLinhas();
  const rankingOcorrencias = useRankingBairrosOcorrencias();
  const rankingPontos = useRankingBairrosPontos();

  // Verificar se algum está carregando
  const loading =
    rankingLinhas.isLoading ||
    rankingOcorrencias.isLoading ||
    rankingPontos.isLoading;

  // Verificar se algum tem erro
  const error =
    rankingLinhas.error ||
    rankingOcorrencias.error ||
    rankingPontos.error;

  // Função para converter dados da API para formato dos gráficos de barras
  const convertRankingToChartData = (ranking: RankingItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.nome || item.codigo, // Para bairros, preferir o nome
      value: item.valor,
      fullName: item.nome || undefined,
      id: item.id,
      isHighlighted: false,
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        <Card className="col-span-full bg-red-50 border-red-200 text-center p-4">
          <CardContent>
            <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      {/* Quantidade de linhas por bairro */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Quantidade de Linhas por Bairro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingLinhas.data && (
              <Barplot
                data={convertRankingToChartData(rankingLinhas.data)}
                valueLabel="Linhas"
                xAxisLabel="Bairros"
                yAxisLabel="Número de Linhas"
                showExportButton={true}
                chartTitle="Linhas por Bairro"
                itemLabel="Bairro"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de ocorrências por bairro */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Ocorrências por Bairro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingOcorrencias.data && (
              <Barplot
                data={convertRankingToChartData(rankingOcorrencias.data)}
                valueLabel="Ocorrências"
                xAxisLabel="Bairros"
                yAxisLabel="Número de Ocorrências"
                showExportButton={true}
                chartTitle="Ocorrências por Bairro"
                itemLabel="Bairro"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Densidade de pontos de ônibus por bairro */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Densidade de Pontos por Bairro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingPontos.data && (
              <Barplot
                data={convertRankingToChartData(rankingPontos.data)}
                valueLabel="Pontos de Ônibus"
                xAxisLabel="Bairros"
                yAxisLabel="Número de Pontos"
                showExportButton={true}
                chartTitle="Pontos de Ônibus por Bairro"
                itemLabel="Bairro"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card informativo sobre a relação População vs Oferta de Transporte */}
      <Card className="col-span-full bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 text-center">
            📊 Relação População vs Oferta de Transporte
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <p className="text-amber-700">
              Os gráficos de <strong>Linhas por Bairro</strong> e <strong>Pontos de Ônibus por Bairro</strong> 
              representam indicadores da oferta de transporte público em cada região.
            </p>
            <p className="text-amber-600 text-sm">
              Para uma análise mais completa da relação população vs oferta, seria necessário 
              dados populacionais por bairro que podem ser integrados em versões futuras.
            </p>
            <p className="text-amber-600 text-sm">
              Atualmente, você pode usar a <strong>densidade de pontos</strong> e o <strong>número de linhas</strong> 
              como proxy para avaliar a cobertura do transporte público por região.
            </p>
            <p className="text-amber-600 text-sm mt-3">
              💡 Para análise detalhada de um bairro específico, visite a página <strong>Análise Individual de Bairros</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bairros;