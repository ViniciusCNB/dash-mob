import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useTaxaFalhasEmpresa, 
  useJustificativasFalhas, 
  useCorrelacaoIdadeFalhas, 
  useRankingLinhasFalhas,
  RankingLinhasFalhas
} from "@/hooks/useApiQueries";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { PieChart } from "@/components/charts/PieChart";
import { ScatterPlotCorrelacao } from "@/components/charts/ScatterPlotCorrelacao";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { useMemo, useState } from "react";
import { AlertTriangle, Wrench, TrendingUp, Clock, Car, Factory } from "lucide-react";

const Falhas = () => {
  const { data: taxaFalhasData, isLoading: loadingTaxas, error: errorTaxas } = useTaxaFalhasEmpresa();
  const { data: justificativasData, isLoading: loadingJustificativas, error: errorJustificativas } = useJustificativasFalhas();
  const { data: correlacaoData, isLoading: loadingCorrelacao, error: errorCorrelacao } = useCorrelacaoIdadeFalhas();
  const { data: rankingLinhasData, isLoading: loadingRanking, error: errorRanking } = useRankingLinhasFalhas();

  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(null);

  const isLoading = loadingTaxas || loadingJustificativas || loadingCorrelacao || loadingRanking;
  const error = errorTaxas || errorJustificativas || errorCorrelacao || errorRanking;

  // Transformar dados de justificativas para o PieChart
  const dadosJustificativasPieChart = useMemo(() => {
    if (!justificativasData) return [];
    return justificativasData.map(item => ({
      name: item.nome_justificativa,
      value: item.total_falhas
    }));
  }, [justificativasData]);

  // Estatísticas resumidas
  const stats = useMemo(() => {
    if (!taxaFalhasData || !correlacaoData || !rankingLinhasData) return null;

    // Empresa com maior taxa de falhas
    const empresaComMaiorTaxa = taxaFalhasData.reduce((prev, curr) => 
      prev.taxa_falhas_por_10k_viagens > curr.taxa_falhas_por_10k_viagens ? prev : curr
    );

    // Média geral de idade dos veículos
    const idadeMedia = correlacaoData.reduce((sum, v) => sum + v.idade_veiculo_anos, 0) / correlacaoData.length;

    // Veículo com mais falhas
    const veiculoComMaisFalhas = correlacaoData.reduce((prev, curr) => 
      prev.total_falhas > curr.total_falhas ? prev : curr
    );

    // Total de falhas
    const totalFalhas = correlacaoData.reduce((sum, v) => sum + v.total_falhas, 0);

    // Linha com mais falhas
    const linhaComMaisFalhas = rankingLinhasData[0];

    return {
      empresaComMaiorTaxa,
      idadeMedia,
      veiculoComMaisFalhas,
      totalFalhas,
      linhaComMaisFalhas,
      totalVeiculos: correlacaoData.length,
      totalLinhas: rankingLinhasData.length
    };
  }, [taxaFalhasData, correlacaoData, rankingLinhasData]);

  const handleLinhaClick = (linha: RankingLinhasFalhas) => {
    setLinhaSelecionada(linha.cod_linha === linhaSelecionada ? null : linha.cod_linha);
  };

  // Dados da linha selecionada
  const dadosLinhaSelecionada = useMemo(() => {
    if (!linhaSelecionada || !rankingLinhasData) return null;
    return rankingLinhasData.find(linha => linha.cod_linha === linhaSelecionada);
  }, [linhaSelecionada, rankingLinhasData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados de falhas mecânicas...</p>
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
          Distribuição das Falhas Mecânicas{" "}
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
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Falhas</p>
                    <p className="text-2xl font-bold">{stats.totalFalhas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Veículos Analisados</p>
                    <p className="text-2xl font-bold">{stats.totalVeiculos.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Idade Média</p>
                    <p className="text-2xl font-bold">{stats.idadeMedia.toFixed(1)} anos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Linhas Afetadas</p>
                    <p className="text-2xl font-bold">{stats.totalLinhas}</p>
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
              As falhas mecânicas no sistema de transporte são eventos aleatórios e imprevisíveis, ou seguem um padrão que pode ser identificado? 
              Elas estão concentradas em empresas específicas com frotas mais antigas? E quais são as rotas e os tipos de falha que mais impactam 
              a operação, sinalizando onde os esforços de manutenção e investimento teriam o <strong>maior retorno</strong>?
            </p>
          </CardContent>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Metodologia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              O estudo possui três etapas analíticas:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Identificar</strong> os principais responsáveis pelas falhas</li>
              <li><strong>Investigar</strong> a correlação com idade da frota</li>
              <li><strong>Analisar</strong> onde e como esses problemas se manifestam</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Etapa 1: O Panorama das Falhas - Quem e Como? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Etapa 1: O Panorama das Falhas - Quem e Como?
          </CardTitle>
          <p className="text-sm text-gray-600">
            Identificação dos principais responsáveis e tipos de falha mais comuns
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Taxa de Falhas por Empresa */}
            <div>
              <h4 className="font-semibold mb-4">Taxa de Falhas por Empresa (por 10.000 viagens)</h4>
              {taxaFalhasData && (
                <HorizontalBarChart 
                  data={taxaFalhasData} 
                  width={500} 
                  height={Math.max(300, taxaFalhasData.length * 40)}
                />
              )}
            </div>
            
            {/* Tipos de Falha */}
            <div>
              <h4 className="font-semibold mb-4">Distribuição dos Tipos de Falha</h4>
                             {dadosJustificativasPieChart.length > 0 && (
                 <div className="h-[300px]">
                   <PieChart data={dadosJustificativasPieChart} valueLabel="Falhas" />
                 </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Etapa 2: A Correlação com a Idade da Frota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Etapa 2: A Correlação com a Idade da Frota - O Porquê?
          </CardTitle>
          <p className="text-sm text-gray-600">
            Análise da relação entre idade do veículo e frequência de falhas, por empresa
          </p>
        </CardHeader>
        <CardContent>
          {correlacaoData && (
            <ScatterPlotCorrelacao data={correlacaoData} className="min-h-[600px]" />
          )}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Interpretação:</strong> Se os pontos mostram uma tendência ascendente da esquerda para a direita, 
              isso confirma que veículos mais antigos têm maior probabilidade de falha. 
              Pontos de uma mesma cor concentrados na área superior direita indicam empresas com frotas antigas e problemáticas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Etapa 3: O Impacto nas Rotas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Etapa 3: O Impacto nas Rotas - Onde?
          </CardTitle>
          <p className="text-sm text-gray-600">
            Identificação das linhas mais afetadas por falhas mecânicas
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold">Top 10 Linhas com Mais Falhas Mecânicas</h4>
            {rankingLinhasData && (
              <VerticalBarChart 
                data={rankingLinhasData}
                onBarClick={handleLinhaClick}
                selectedLinha={linhaSelecionada}
                width={800}
                height={400}
              />
            )}
            
            {/* Detalhes da linha selecionada */}
            {dadosLinhaSelecionada && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-semibold text-red-800 mb-2">
                  📍 Linha Selecionada: {dadosLinhaSelecionada.cod_linha}
                  {dadosLinhaSelecionada.nome_linha && ` - ${dadosLinhaSelecionada.nome_linha}`}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-700">
                      <strong>Total de Falhas:</strong> {dadosLinhaSelecionada.total_falhas}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Esta linha registrou {dadosLinhaSelecionada.total_falhas} falhas mecânicas no período analisado.
                    </p>
                  </div>
                  <div className="text-xs text-red-600">
                    <p>
                      <strong>💡 Próximo passo:</strong> Verificar se esta linha opera em região de relevo acidentado 
                      ou trânsito intenso, e analisar os tipos específicos de falha (motor, freios, etc.) 
                      para direcionar ações de manutenção preventiva.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Destaques da Análise */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Destaques da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">🏭 Empresa Mais Problemática</h4>
                  <p className="text-sm">
                    <strong>{stats.empresaComMaiorTaxa.nome_empresa}</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.empresaComMaiorTaxa.taxa_falhas_por_10k_viagens.toFixed(1)} falhas por 10.000 viagens
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">🚌 Veículo Mais Afetado</h4>
                  <p className="text-sm">
                    <strong>ID {stats.veiculoComMaisFalhas.id_veiculo}</strong> - {stats.veiculoComMaisFalhas.nome_empresa}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.veiculoComMaisFalhas.total_falhas} falhas ({stats.veiculoComMaisFalhas.idade_veiculo_anos} anos)
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Linha Prioritária</h4>
                  <p className="text-sm">
                    <strong>Linha {stats.linhaComMaisFalhas.cod_linha}</strong>
                    {stats.linhaComMaisFalhas.nome_linha && ` - ${stats.linhaComMaisFalhas.nome_linha}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {stats.linhaComMaisFalhas.total_falhas} falhas mecânicas registradas
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Justificativa Mais Comum</h4>
                  {justificativasData && justificativasData[0] && (
                    <>
                      <p className="text-sm">
                        <strong>{justificativasData[0].nome_justificativa}</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        {justificativasData[0].total_falhas} ocorrências
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>Conclusão Acionável</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-gray-700 leading-relaxed">
              {stats && (
                <>
                  A análise revela que a <strong>{stats.empresaComMaiorTaxa.nome_empresa}</strong>, que possui frota com idade média de{" "}
                  <strong>{stats.idadeMedia.toFixed(1)} anos</strong>, é desproporcionalmente responsável pelas falhas mecânicas. 
                  A correlação entre idade e número de falhas é evidente no gráfico de dispersão. 
                  
                  {justificativasData && justificativasData[0] && (
                    <>
                      {" "}Essas falhas, majoritariamente de <strong>{justificativasData[0].nome_justificativa.toLowerCase()}</strong>, 
                      concentram-se especialmente na linha <strong>{stats.linhaComMaisFalhas.cod_linha}</strong>.
                    </>
                  )}
                  
                  <br /><br />
                  
                  <strong>💡 Recomendação:</strong> Implementar um plano de manutenção preventiva focado nos veículos mais antigos 
                  da {stats.empresaComMaiorTaxa.nome_empresa} que servem as linhas de maior incidência de falhas, 
                  ou considerar a alocação de veículos mais novos para essas rotas críticas, 
                  visando reduzir interrupções e melhorar a confiabilidade do serviço.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Falhas;