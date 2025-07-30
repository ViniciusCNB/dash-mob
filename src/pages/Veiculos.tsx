import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot, BarplotDataItem } from "@/components/charts/Barplot";
import {
  useRankingVeiculosPassageiros,
  useRankingVeiculosOcorrencias,
  useRankingVeiculosKmPercorrido,
  RankingVeiculoItem,
} from "@/hooks/useApiQueries";
import { useFilter } from "@/components/Filter";

const Veiculos = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  // Usar todos os hooks do TanStack Query para veículos
  const passageiros = useRankingVeiculosPassageiros();
  const ocorrencias = useRankingVeiculosOcorrencias();
  const kmPercorrido = useRankingVeiculosKmPercorrido();

  // Verificar se algum está carregando
  const loading = passageiros.isLoading || ocorrencias.isLoading || kmPercorrido.isLoading;

  // Verificar se algum tem erro
  const error = passageiros.error || ocorrencias.error || kmPercorrido.error;

  // Função para converter dados da API para formato dos gráficos de barras
  const convertVeiculoToChartData = (ranking: RankingVeiculoItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.identificador_veiculo.toString(),
      value: item.valor,
      fullName: `Veículo ${item.identificador_veiculo}${item.nome_empresa ? ` - ${item.nome_empresa}` : ""}`,
      id: item.id_veiculo,
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
      {/* Ranking por Passageiros */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Passageiros por Veículo
          </CardTitle>
          {/* {appliedStartDate && appliedEndDate && (
            <p className="text-xs text-center text-muted-foreground">
              {appliedStartDate.toLocaleDateString("pt-BR")} a {appliedEndDate.toLocaleDateString("pt-BR")}
            </p>
          )} */}
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {passageiros.data && (
              <Barplot
                data={convertVeiculoToChartData(passageiros.data)}
                valueLabel="Passageiros"
                xAxisLabel="Veículos"
                yAxisLabel="Número de Passageiros"
                showExportButton={true}
                chartTitle="Passageiros por Veículo"
                itemLabel="Veículo"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ranking por Ocorrências */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Ocorrências por Veículo
          </CardTitle>
          {/* {appliedStartDate && appliedEndDate && (
            <p className="text-xs text-center text-muted-foreground">
              {appliedStartDate.toLocaleDateString("pt-BR")} a {appliedEndDate.toLocaleDateString("pt-BR")}
            </p>
          )} */}
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {ocorrencias.data && (
              <Barplot
                data={convertVeiculoToChartData(ocorrencias.data)}
                valueLabel="Ocorrências"
                xAxisLabel="Veículos"
                yAxisLabel="Número de Ocorrências"
                showExportButton={true}
                chartTitle="Ocorrências por Veículo"
                itemLabel="Veículo"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ranking por Km Percorrido */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Km Percorrido por Veículo
          </CardTitle>
          {/* {appliedStartDate && appliedEndDate && (
            <p className="text-xs text-center text-muted-foreground">
              {appliedStartDate.toLocaleDateString("pt-BR")} a {appliedEndDate.toLocaleDateString("pt-BR")}
            </p>
          )} */}
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {kmPercorrido.data && (
              <Barplot
                data={convertVeiculoToChartData(kmPercorrido.data)}
                valueLabel="Km Percorrido"
                xAxisLabel="Veículos"
                yAxisLabel="Quilômetros Percorridos"
                showExportButton={true}
                chartTitle="Km Percorrido por Veículo"
                itemLabel="Veículo"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Análise Comparativa */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Resumo dos Dados de Veículos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Total de Veículos com Passageiros */}
            {passageiros.data && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-muted-foreground">Veículos Analisados (Passageiros)</div>
                <div className="text-2xl font-bold text-green-600">{passageiros.data.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total de passageiros: {passageiros.data.reduce((sum, item) => sum + item.valor, 0).toLocaleString("pt-BR")}
                </div>
              </div>
            )}

            {/* Total de Veículos com Ocorrências */}
            {ocorrencias.data && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-muted-foreground">Veículos com Ocorrências</div>
                <div className="text-2xl font-bold text-red-600">{ocorrencias.data.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total de ocorrências: {ocorrencias.data.reduce((sum, item) => sum + item.valor, 0).toLocaleString("pt-BR")}
                </div>
              </div>
            )}

            {/* Total de Veículos com Km */}
            {kmPercorrido.data && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-muted-foreground">Veículos Ativos (Km)</div>
                <div className="text-2xl font-bold text-purple-600">{kmPercorrido.data.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total km percorrido: {kmPercorrido.data.reduce((sum, item) => sum + item.valor, 0).toLocaleString("pt-BR")} km
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Veiculos;