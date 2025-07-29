import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot, BarplotDataItem } from "@/components/charts/Barplot";
import { PieChart, PieChartDataItem } from "@/components/charts/PieChart";
import { AreaChart } from "@/components/charts/AreaChart";
import {
  useRankingOcorrenciasPorJustificativa,
  useRankingOcorrenciasPorEmpresa,
  useRankingOcorrenciasPorConcessionaria,
  useRankingOcorrenciasPorLinha,
  useTendenciaTemporalOcorrencias,
  useOcorrenciasPorTipoDia,
  RankingOcorrenciasItem,
  TendenciaTemporalItem,
  OcorrenciasPorTipoDiaItem,
} from "@/hooks/useApiQueries";

const Ocorrencias = () => {
  // Usar todos os hooks do TanStack Query para ocorrências
  const rankingJustificativa = useRankingOcorrenciasPorJustificativa();
  const rankingEmpresa = useRankingOcorrenciasPorEmpresa();
  const rankingConcessionaria = useRankingOcorrenciasPorConcessionaria();
  const rankingLinha = useRankingOcorrenciasPorLinha();
  const tendenciaTemporal = useTendenciaTemporalOcorrencias();
  const ocorrenciasTipoDia = useOcorrenciasPorTipoDia();

  // Verificar se algum está carregando
  const loading =
    rankingJustificativa.isLoading ||
    rankingEmpresa.isLoading ||
    rankingConcessionaria.isLoading ||
    rankingLinha.isLoading ||
    tendenciaTemporal.isLoading ||
    ocorrenciasTipoDia.isLoading;

  // Verificar se algum tem erro
  const error =
    rankingJustificativa.error ||
    rankingEmpresa.error ||
    rankingConcessionaria.error ||
    rankingLinha.error ||
    tendenciaTemporal.error ||
    ocorrenciasTipoDia.error;

  // Função para converter dados da API para formato dos gráficos de barras
  const convertRankingToChartData = (ranking: RankingOcorrenciasItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.nome,
      value: item.total_ocorrencias,
      fullName: item.nome,
      id: item.id,
      isHighlighted: false,
    }));
  };

  // Função para converter dados de tendência temporal para área chart
  const convertTendenciaToAreaData = (data: TendenciaTemporalItem[]) => {
    return data.map((item, index) => ({
      x: index,
      y: item.total_ocorrencias,
      label: item.periodo, // Manter o formato de data original para o AreaChart processar
    }));
  };

  // Função para agrupar dados de tipo de dia conforme solicitado
  const convertTipoDiaToPieData = (data: OcorrenciasPorTipoDiaItem[]): PieChartDataItem[] => {
    const grupos = {
      "DIA UTIL": 0,
      SABADO: 0,
      "DOMINGO E FERIADO": 0,
      OUTROS: 0,
    };

    // Array para guardar detalhes dos "outros"
    const outrosDetalhes: string[] = [];

    data.forEach((item) => {
      const tipo = item.tipo_dia.toUpperCase();

      if (tipo.includes("DIA UTIL") || tipo.includes("ÚTIL")) {
        grupos["DIA UTIL"] += item.total_ocorrencias;
      } else if (tipo.includes("SABADO") || tipo.includes("SÁBADO")) {
        grupos["SABADO"] += item.total_ocorrencias;
      } else if (tipo.includes("DOMINGO") || tipo.includes("FERIADO")) {
        grupos["DOMINGO E FERIADO"] += item.total_ocorrencias;
      } else {
        grupos["OUTROS"] += item.total_ocorrencias;
        outrosDetalhes.push(`${item.tipo_dia}: ${item.total_ocorrencias.toLocaleString("pt-BR")}`);
      }
    });

    return Object.entries(grupos)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        // Adicionar detalhes nos "outros" se houver
        tooltip:
          name === "OUTROS" && outrosDetalhes.length > 0
            ? `${name}: ${value.toLocaleString("pt-BR")}\n\nDetalhes:\n${outrosDetalhes.join("\n")}`
            : undefined,
      }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
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
            <p className="text-red-600">Erro ao carregar dados de ocorrências: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid principal de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {/* Tendência Temporal */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-center text-lg">
              Tendência Temporal das Ocorrências
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full">
              {tendenciaTemporal.data && tendenciaTemporal.data.length > 0 && (
                <AreaChart
                  data={convertTendenciaToAreaData(tendenciaTemporal.data)}
                  xAxisLabel="Período"
                  yAxisLabel="Número de Ocorrências"
                  showExportButton={true}
                  chartTitle="Tendência Temporal das Ocorrências"
                />
              )}
              {(!tendenciaTemporal.data || tendenciaTemporal.data.length === 0) && (
                <div className="flex items-center justify-center h-80 text-gray-500">
                  Sem dados de tendência temporal disponíveis
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ranking por Justificativa */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-center text-lg">Ocorrências por Justificativa</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="w-full h-72">
              {rankingJustificativa.data && (
                <Barplot
                  data={convertRankingToChartData(rankingJustificativa.data)}
                  valueLabel="Ocorrências"
                  itemLabel=""
                  xAxisLabel=""
                  yAxisLabel="Ocorrências"
                  rotateLabels={true}
                  showExportButton={true}
                  chartTitle=""
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ranking por Empresa */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-center text-lg">Ocorrências por Empresa</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="w-full h-72">
              {rankingEmpresa.data && (
                <Barplot
                  data={convertRankingToChartData(rankingEmpresa.data)}
                  valueLabel="Ocorrências"
                  itemLabel=""
                  xAxisLabel=""
                  yAxisLabel="Ocorrências"
                  rotateLabels={true}
                  showExportButton={true}
                  chartTitle=""
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ranking por Concessionária */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-center text-lg">Ocorrências por Concessionária</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="w-full h-72">
              {rankingConcessionaria.data && (
                <Barplot
                  data={convertRankingToChartData(rankingConcessionaria.data)}
                  valueLabel="Ocorrências"
                  itemLabel=""
                  xAxisLabel="Concessionária"
                  yAxisLabel="Ocorrências"
                  rotateLabels={false}
                  showExportButton={true}
                  chartTitle="Ocorrências por Concessionária"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ranking por Linha */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-center text-lg">Ocorrências por Linha</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="w-full h-72">
              {rankingLinha.data && (
                <Barplot
                  data={convertRankingToChartData(rankingLinha.data)}
                  valueLabel="Ocorrências"
                  xAxisLabel="Linha"
                  yAxisLabel="Ocorrências"
                  showExportButton={true}
                  chartTitle=""
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ocorrências por Tipo de Dia */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-center text-lg">Ocorrências por Tipo de Dia</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="w-full h-72">
              {ocorrenciasTipoDia.data && (
                <PieChart
                  data={convertTipoDiaToPieData(ocorrenciasTipoDia.data)}
                  valueLabel="Ocorrências"
                  showExportButton={true}
                  chartTitle="Ocorrências por Tipo de Dia"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ocorrencias;
