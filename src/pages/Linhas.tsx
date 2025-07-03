import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot, BarplotDataItem } from "@/components/charts/Barplot";
import LeafletPointsMap from "@/components/charts/LeafletPointsMap";
import {
  useViagensData,
  usePassageirosData,
  useOcorrenciasData,
  usePontosData,
  useBairroData,
  useMultiplasLinhasPontos,
  RankingItem,
} from "@/hooks/useApiQueries";
import { useState } from "react";

const Linhas = () => {
  const [selectedLine, setSelectedLine] = useState<string>("");

  // Usar todos os hooks do TanStack Query
  const viagens = useViagensData();
  const passageiros = usePassageirosData();
  const ocorrencias = useOcorrenciasData();
  const pontos = usePontosData();
  const bairro = useBairroData();
  // const concessionaria = useConcessionariaData();
  // const empresa = useEmpresaData();

  // Obter códigos das top 10 linhas para o mapa (usando dados de viagens)
  const codigosTopLinhas = viagens.data?.ranking.slice(0, 10).map((item) => item.codigo) || [];
  const pontosData = useMultiplasLinhasPontos(codigosTopLinhas);

  // Verificar se algum está carregando
  const loading =
    viagens.isLoading ||
    passageiros.isLoading ||
    ocorrencias.isLoading ||
    pontos.isLoading ||
    bairro.isLoading ||
    pontosData.isLoading;
  // concessionaria.isLoading ||
  // empresa.isLoading;

  // Verificar se algum tem erro
  const error =
    viagens.error || passageiros.error || ocorrencias.error || pontos.error || bairro.error || pontosData.error;
  // concessionaria.error ||
  // empresa.error;

  // Função para converter dados da API para formato dos gráficos de barras
  const convertRankingToChartData = (ranking: RankingItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.codigo,
      value: item.valor,
      fullName: item.nome || undefined,
      id: item.id,
      isHighlighted: selectedLine ? item.codigo === selectedLine : false,
    }));
  };

  // Função específica para converter dados de bairro (usa nome no eixo X)
  const convertBairroToChartData = (ranking: RankingItem[]): BarplotDataItem[] => {
    return ranking.map((item) => ({
      name: item.nome || item.codigo, // Usa o nome do bairro no eixo X
      value: item.valor,
      fullName: item.nome || undefined,
      id: item.id,
      isHighlighted: false, // Bairros não têm destaque como linhas
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {[...Array(7)].map((_, index) => (
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
      {/* Mapa das Top 10 Linhas */}
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-muted-foreground text-center">
              Pontos de Parada das Top 10 Linhas (por Viagens)
            </CardTitle>
            {selectedLine && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Linha selecionada: <strong>{selectedLine}</strong>
                </span>
                <button
                  onClick={() => setSelectedLine("")}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
                >
                  Limpar seleção
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-96">
            {pontosData.data && pontosData.data.features && pontosData.data.features.length > 0 && (
              <LeafletPointsMap
                pontosData={pontosData.data}
                height={384}
                selectedLine={selectedLine}
                onLineSelect={setSelectedLine}
              />
            )}
            {pontosData.data && pontosData.data.features && pontosData.data.features.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nenhum ponto de parada disponível para as linhas selecionadas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações da Linha Selecionada */}
      {selectedLine && (
        <Card className="col-span-full bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800 text-center">Detalhes da Linha {selectedLine}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {/* Viagens */}
              {viagens.data && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Viagens</div>
                  <div className="text-lg font-bold text-blue-600">
                    {viagens.data.ranking.find((item) => item.codigo === selectedLine)?.valor.toLocaleString("pt-BR") ||
                      "N/A"}
                  </div>
                </div>
              )}

              {/* Passageiros */}
              {passageiros.data && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Passageiros</div>
                  <div className="text-lg font-bold text-green-600">
                    {passageiros.data.ranking
                      .find((item) => item.codigo === selectedLine)
                      ?.valor.toLocaleString("pt-BR") || "N/A"}
                  </div>
                </div>
              )}

              {/* Ocorrências */}
              {ocorrencias.data && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Ocorrências</div>
                  <div className="text-lg font-bold text-red-600">
                    {ocorrencias.data.ranking
                      .find((item) => item.codigo === selectedLine)
                      ?.valor.toLocaleString("pt-BR") || "N/A"}
                  </div>
                </div>
              )}

              {/* Pontos de Parada */}
              {pontos.data && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Pontos de Parada</div>
                  <div className="text-lg font-bold text-purple-600">
                    {pontos.data.ranking.find((item) => item.codigo === selectedLine)?.valor.toLocaleString("pt-BR") ||
                      "N/A"}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantidade de viagens por linha */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">Viagens por Linha</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {viagens.data && <Barplot data={convertRankingToChartData(viagens.data.ranking)} valueLabel="Viagens" />}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de passageiros por linha */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center ">Passageiros por Linha</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {passageiros.data && (
              <Barplot data={convertRankingToChartData(passageiros.data.ranking)} valueLabel="Passageiros" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de ocorrências por linha */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center ">Ocorrências por Linha</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {ocorrencias.data && (
              <Barplot data={convertRankingToChartData(ocorrencias.data.ranking)} valueLabel="Ocorrências" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de pontos por linha */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center ">Pontos de Parada por Linha</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {pontos.data && (
              <Barplot data={convertRankingToChartData(pontos.data.ranking)} valueLabel="Pontos de Parada" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de linhas por concessionária */}
      {/* <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center ">Linhas por Concessionária</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {concessionaria.data && concessionaria.data.length > 0 && (
              <PieChart
                data={convertContagemToChartData(concessionaria.data)}
                valueLabel="Linhas"
              />
            )}
          </div>
        </CardContent>
      </Card> */}

      {/* Quantidade de linhas por empresa */}
      {/* <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center ">Linhas por Empresa</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {empresa.data && empresa.data.length > 0 && (
              <PieChart
                data={convertContagemToChartData(empresa.data)}
                valueLabel="Linhas"
              />
            )}
          </div>
        </CardContent>
      </Card> */}

      {/* Quantidade de linhas por bairro */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center ">Linhas por Bairro</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {bairro.data && (
              <Barplot
                data={convertBairroToChartData(bairro.data.ranking)}
                valueLabel="Linhas"
                itemLabel="Bairro"
                rotateLabels={true}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Linhas;
