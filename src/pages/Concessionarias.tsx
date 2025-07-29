import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barplot, BarplotDataItem } from "@/components/charts/Barplot";
import {
  useConcessionariaData,
  useRankingOcorrenciasPorConcessionaria,
  useRankingComparativoConcessionarias,
  ContagemPorEntidadeItem,
  RankingOcorrenciasItem,
  RankingConcessionariaItem,
} from "@/hooks/useApiQueries";
import { useFilter } from "@/components/Filter";
import { useState } from "react";

const Concessionarias = () => {
  const [selectedConcessionaria, setSelectedConcessionaria] = useState<string>("");
  const { appliedLinhas } = useFilter();

  // Usar os hooks do TanStack Query para buscar dados
  const contagemLinhas = useConcessionariaData();
  const ocorrenciasPorConcessionaria = useRankingOcorrenciasPorConcessionaria();
  const rankingComparativo = useRankingComparativoConcessionarias();

  // Verificar se algum está carregando
  const loading =
    contagemLinhas.isLoading ||
    ocorrenciasPorConcessionaria.isLoading ||
    rankingComparativo.isLoading;

  // Verificar se algum tem erro
  const error =
    contagemLinhas.error ||
    ocorrenciasPorConcessionaria.error ||
    rankingComparativo.error;

  // Função para converter dados de contagem para formato dos gráficos de barras
  const convertContagemToChartData = (data: ContagemPorEntidadeItem[]): BarplotDataItem[] => {
    return data.map((item) => ({
      name: item.nome,
      value: item.quantidade_linhas,
      fullName: item.nome,
      id: item.id,
      isHighlighted: selectedConcessionaria ? item.nome === selectedConcessionaria : false,
    }));
  };

  // Função para converter dados de ocorrências para formato dos gráficos
  const convertOcorrenciasToChartData = (data: RankingOcorrenciasItem[]): BarplotDataItem[] => {
    return data.map((item) => ({
      name: item.nome,
      value: item.total_ocorrencias,
      fullName: item.nome,
      id: item.id,
      isHighlighted: selectedConcessionaria ? item.nome === selectedConcessionaria : false,
    }));
  };

  // Função para converter dados de passageiros do ranking comparativo
  const convertPassageirosToChartData = (data: RankingConcessionariaItem[]): BarplotDataItem[] => {
    return data.map((item) => ({
      name: item.nome_concessionaria,
      value: item.total_passageiros,
      fullName: item.nome_concessionaria,
      id: item.id_concessionaria,
      isHighlighted: selectedConcessionaria ? item.nome_concessionaria === selectedConcessionaria : false,
    }));
  };

  // Função para calcular pontos por concessionária (baseado no total de linhas)
  const calcularPontosPorConcessionaria = (): BarplotDataItem[] => {
    if (!contagemLinhas.data || !rankingComparativo.data) return [];
    
    return rankingComparativo.data.map((item) => ({
      name: item.nome_concessionaria,
      value: item.total_linhas * 15, // Estimativa média de 15 pontos por linha
      fullName: item.nome_concessionaria,
      id: item.id_concessionaria,
      isHighlighted: selectedConcessionaria ? item.nome_concessionaria === selectedConcessionaria : false,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      {/* Informações da Concessionária Selecionada */}
      {selectedConcessionaria && rankingComparativo.data && (
        <Card className="col-span-full bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-800 text-center">
                Detalhes da Concessionária {selectedConcessionaria}
              </CardTitle>
              <button
                onClick={() => setSelectedConcessionaria("")}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
              >
                Limpar seleção
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {(() => {
              const concessionariaData = rankingComparativo.data.find(
                (item) => item.nome_concessionaria === selectedConcessionaria
              );
              if (!concessionariaData) return null;

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Linhas</div>
                    <div className="text-lg font-bold text-blue-600">
                      {concessionariaData.total_linhas.toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Passageiros</div>
                    <div className="text-lg font-bold text-green-600">
                      {concessionariaData.total_passageiros.toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Ocorrências</div>
                    <div className="text-lg font-bold text-red-600">
                      {concessionariaData.total_ocorrencias.toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Taxa Ocorrências/10k</div>
                    <div className="text-lg font-bold text-orange-600">
                      {concessionariaData.taxa_ocorrencias_por_10k_viagens.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Quantidade de linhas por concessionária */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Linhas por Concessionária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {contagemLinhas.data && (
              <Barplot
                data={convertContagemToChartData(contagemLinhas.data)}
                valueLabel="Linhas"
                xAxisLabel="Concessionárias"
                yAxisLabel="Número de Linhas"
                showExportButton={true}
                chartTitle="Linhas por Concessionária"
                rotateLabels={true}

              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de ocorrências por concessionária */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Ocorrências por Concessionária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {ocorrenciasPorConcessionaria.data && (
              <Barplot
                data={convertOcorrenciasToChartData(ocorrenciasPorConcessionaria.data)}
                valueLabel="Ocorrências"
                xAxisLabel="Concessionárias"
                yAxisLabel="Número de Ocorrências"
                showExportButton={true}
                chartTitle="Ocorrências por Concessionária"
                rotateLabels={true}

              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de pontos atendidos por concessionária (estimativa) */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Pontos Atendidos por Concessionária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            <Barplot
              data={calcularPontosPorConcessionaria()}
              valueLabel="Pontos"
              xAxisLabel="Concessionárias"
              yAxisLabel="Número de Pontos (Estimativa)"
              showExportButton={true}
              chartTitle="Pontos Atendidos por Concessionária"
              rotateLabels={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de passageiros atendidos por concessionária */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Passageiros por Concessionária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80">
            {rankingComparativo.data && (
              <Barplot
                data={convertPassageirosToChartData(rankingComparativo.data)}
                valueLabel="Passageiros"
                xAxisLabel="Concessionárias"
                yAxisLabel="Número de Passageiros"
                showExportButton={true}
                chartTitle="Passageiros por Concessionária"
                rotateLabels={true}

              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo de métricas entre concessionárias */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-muted-foreground text-center text-lg">
            Comparativo de Métricas por Concessionária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {rankingComparativo.data && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Concessionária</th>
                    <th className="border border-gray-300 p-2 text-center">Linhas</th>
                    <th className="border border-gray-300 p-2 text-center">Passageiros</th>
                    <th className="border border-gray-300 p-2 text-center">Ocorrências</th>
                    <th className="border border-gray-300 p-2 text-center">Taxa Ocorrências/10k</th>
                    <th className="border border-gray-300 p-2 text-center">Passageiros/Linha</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingComparativo.data.map((item) => (
                    <tr 
                      key={item.id_concessionaria}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedConcessionaria === item.nome_concessionaria ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedConcessionaria(item.nome_concessionaria)}
                    >
                      <td className="border border-gray-300 p-2 font-medium">
                        {item.nome_concessionaria}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.total_linhas.toLocaleString("pt-BR")}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.total_passageiros.toLocaleString("pt-BR")}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.total_ocorrencias.toLocaleString("pt-BR")}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.taxa_ocorrencias_por_10k_viagens < 50 
                            ? 'bg-green-100 text-green-800' 
                            : item.taxa_ocorrencias_por_10k_viagens < 100
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.taxa_ocorrencias_por_10k_viagens.toFixed(2)}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {(item.total_passageiros / item.total_linhas).toLocaleString("pt-BR", {
                          maximumFractionDigits: 0
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Concessionarias;