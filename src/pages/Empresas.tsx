import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot, BarplotDataItem } from "@/components/charts/Barplot";
import {
  useRankingComparativoEmpresas,
  useRankingOcorrenciasPorEmpresa,
  RankingEmpresaItem,
  RankingOcorrenciasItem,
} from "@/hooks/useApiQueries";
import { useFilter } from "@/components/Filter";

const Empresas = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  // Usar os hooks do TanStack Query
  const rankingComparativo = useRankingComparativoEmpresas();
  const ocorrenciasPorEmpresa = useRankingOcorrenciasPorEmpresa();

  // Verificar se algum está carregando
  const loading = rankingComparativo.isLoading || ocorrenciasPorEmpresa.isLoading;

  // Verificar se algum tem erro
  const error = rankingComparativo.error || ocorrenciasPorEmpresa.error;

  // Função para converter dados do ranking comparativo para formato dos gráficos de barras
  const convertRankingComparativoToChartData = (
    ranking: RankingEmpresaItem[],
    metrica: keyof Pick<RankingEmpresaItem, "total_passageiros" | "total_ocorrencias" | "total_linhas">
  ): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.nome_empresa,
      value: item[metrica],
      fullName: item.nome_empresa,
      id: item.id_empresa,
    }));
  };

  // Função para converter dados de ocorrências para formato dos gráficos de barras
  const convertOcorrenciasToChartData = (ranking: RankingOcorrenciasItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.nome,
      value: item.total_ocorrencias,
      fullName: item.nome,
      id: item.id,
    }));
  };

  // Função para converter taxa de ocorrências para formato dos gráficos de barras
  const convertTaxaOcorrenciasToChartData = (ranking: RankingEmpresaItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.nome_empresa,
      value: Math.round(item.taxa_ocorrencias_por_10k_viagens * 100) / 100, // Arredondar para 2 casas decimais
      fullName: item.nome_empresa,
      id: item.id_empresa,
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
            <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasDateFilter = appliedStartDate && appliedEndDate;
  const filterText = hasDateFilter ? " (Período Filtrado)" : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      {/* Quantidade de passageiros por empresa */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Passageiros por Empresa{filterText}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingComparativo.data && (
              <Barplot
                data={convertRankingComparativoToChartData(rankingComparativo.data, "total_passageiros")}
                valueLabel="Passageiros"
                xAxisLabel="Empresas"
                yAxisLabel="Número de Passageiros"
                showExportButton={true}
                chartTitle="Passageiros por Empresa"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de ocorrências por empresa */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Ocorrências por Empresa{filterText}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingComparativo.data && (
              <Barplot
                data={convertRankingComparativoToChartData(rankingComparativo.data, "total_ocorrencias")}
                valueLabel="Ocorrências"
                xAxisLabel="Empresas"
                yAxisLabel="Número de Ocorrências"
                showExportButton={true}
                chartTitle="Ocorrências por Empresa"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de linhas atendidas por empresa */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Linhas Atendidas por Empresa{filterText}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingComparativo.data && (
              <Barplot
                data={convertRankingComparativoToChartData(rankingComparativo.data, "total_linhas")}
                valueLabel="Linhas"
                xAxisLabel="Empresas"
                yAxisLabel="Número de Linhas"
                showExportButton={true}
                chartTitle="Linhas por Empresa"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Taxa de ocorrências por empresa (métricas comparativas) */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Taxa de Ocorrências por Empresa{filterText}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingComparativo.data && (
              <Barplot
                data={convertTaxaOcorrenciasToChartData(rankingComparativo.data)}
                valueLabel="Taxa (por 10k viagens)"
                xAxisLabel="Empresas"
                yAxisLabel="Taxa de Ocorrências"
                showExportButton={true}
                chartTitle="Taxa de Ocorrências por Empresa"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo de passageiros médios por linha (calculado) */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Eficiência por Empresa{filterText}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingComparativo.data && (
              <Barplot
                data={rankingComparativo.data.map((item) => ({
                  name: item.nome_empresa,
                  value: Math.round((item.total_passageiros / (item.total_linhas || 1)) * 100) / 100,
                  fullName: item.nome_empresa,
                  id: item.id_empresa,
                }))}
                valueLabel="Passageiros por Linha"
                xAxisLabel="Empresas"
                yAxisLabel="Passageiros Médios por Linha"
                showExportButton={true}
                chartTitle="Eficiência por Empresa"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ranking de ocorrências detalhado por empresa */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Ranking Detalhado de Ocorrências{filterText}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {ocorrenciasPorEmpresa.data && (
              <Barplot
                data={convertOcorrenciasToChartData(ocorrenciasPorEmpresa.data)}
                valueLabel="Ocorrências"
                xAxisLabel="Empresas"
                yAxisLabel="Total de Ocorrências"
                showExportButton={true}
                chartTitle="Ranking de Ocorrências por Empresa"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Empresas;