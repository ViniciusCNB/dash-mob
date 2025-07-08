import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/components/Filter";

// Interfaces para os tipos de dados da API
export interface RankingItem {
  id: number;
  codigo: string;
  nome: string | null;
  valor: number;
}

export interface RankingResponse {
  metrica: string;
  ranking: RankingItem[];
}

export interface ContagemPorEntidadeItem {
  id: number;
  nome: string;
  quantidade_linhas: number;
}

export interface KpiGeral {
  total_passageiros: number;
  total_viagens: number;
  total_ocorrencias: number;
  eficiencia_passageiro_km: number;
}

// Interface para dados de geolocalização
export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][];
}

export interface GeoJSONFeature {
  type: string;
  geometry: GeoJSONGeometry;
  properties: Record<string, unknown>;
}

// Interfaces para pontos de parada
export interface GeoJSONPoint {
  type: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONPointFeature {
  type: string;
  geometry: GeoJSONPoint;
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: string;
  features: GeoJSONPointFeature[];
}

// Interface para dados de eficiência
export interface EficienciaLinha {
  id_linha: number;
  cod_linha: string;
  nome_linha: string | null;
  passageiros_por_km: number;
  passageiros_por_minuto: number;
  total_passageiros: number;
}

// Interfaces para dados de falhas mecânicas
export interface TaxaFalhasEmpresa {
  id_empresa: number;
  nome_empresa: string;
  taxa_falhas_por_10k_viagens: number;
}

export interface FalhaPorJustificativa {
  nome_justificativa: string;
  total_falhas: number;
}

export interface CorrelacaoIdadeFalha {
  id_veiculo: number;
  idade_veiculo_anos: number;
  total_falhas: number;
  nome_empresa: string;
}

export interface RankingLinhasFalhas {
  id_linha: number;
  cod_linha: string;
  nome_linha: string | null;
  total_falhas: number;
}

// Funções de fetch
const fetchKpis = async (dataInicio: string, dataFim: string): Promise<KpiGeral> => {
  const response = await fetch(`/api/v1/geral/kpis?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar KPIs");
  }
  return response.json();
};

const fetchRanking = async (
  metrica: "viagens" | "passageiros" | "ocorrencias",
  dataInicio: string,
  dataFim: string,
  limit = 10
): Promise<RankingResponse> => {
  const response = await fetch(
    `/api/v1/linhas/ranking/${metrica}?data_inicio=${dataInicio}&data_fim=${dataFim}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Erro ao buscar ranking de ${metrica}`);
  }
  return response.json();
};

const fetchContagemPontos = async (limit = 10): Promise<RankingResponse> => {
  const response = await fetch(`/api/v1/linhas/contagem-pontos?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar contagem de pontos");
  }
  return response.json();
};

const fetchContagemBairro = async (limit = 10): Promise<RankingResponse> => {
  const response = await fetch(`/api/v1/linhas/contagem-por-bairro?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar contagem por bairro");
  }
  return response.json();
};

const fetchContagemConcessionaria = async (): Promise<ContagemPorEntidadeItem[]> => {
  const response = await fetch("/api/v1/linhas/contagem-por-concessionaria");
  if (!response.ok) {
    throw new Error("Erro ao buscar contagem por concessionária");
  }
  return response.json();
};

const fetchContagemEmpresa = async (): Promise<ContagemPorEntidadeItem[]> => {
  const response = await fetch("/api/v1/linhas/contagem-por-empresa");
  if (!response.ok) {
    throw new Error("Erro ao buscar contagem por empresa");
  }
  return response.json();
};

const fetchPontosLinha = async (codLinha: string): Promise<GeoJSONFeatureCollection> => {
  const response = await fetch(`/api/v1/linhas/${codLinha}/pontos/geolocalizacao`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar pontos da linha ${codLinha}`);
  }
  return response.json();
};

const fetchLinhasParaFiltro = async (): Promise<LinhaParaFiltro[]> => {
  const response = await fetch("/api/v1/linhas/");
  if (!response.ok) {
    throw new Error("Erro ao buscar linhas para filtro");
  }
  return response.json();
};

const fetchEficiencia = async (dataInicio: string, dataFim: string): Promise<EficienciaLinha[]> => {
  const response = await fetch(`/api/v1/estudos/analise-eficiencia?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados de eficiência");
  }
  return response.json();
};

const fetchTaxaFalhasEmpresa = async (dataInicio: string, dataFim: string): Promise<TaxaFalhasEmpresa[]> => {
  const response = await fetch(`/api/v1/estudos/falhas-mecanicas/taxa-por-empresa?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar taxa de falhas por empresa");
  }
  return response.json();
};

const fetchJustificativasFalhas = async (dataInicio: string, dataFim: string): Promise<FalhaPorJustificativa[]> => {
  const response = await fetch(`/api/v1/estudos/falhas-mecanicas/ranking-justificativas?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar justificativas de falhas");
  }
  return response.json();
};

const fetchCorrelacaoIdadeFalhas = async (dataInicio: string, dataFim: string): Promise<CorrelacaoIdadeFalha[]> => {
  const response = await fetch(`/api/v1/estudos/falhas-mecanicas/correlacao-idade-veiculo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar correlação idade-falhas");
  }
  return response.json();
};

const fetchRankingLinhasFalhas = async (dataInicio: string, dataFim: string): Promise<RankingLinhasFalhas[]> => {
  const response = await fetch(`/api/v1/estudos/falhas-mecanicas/ranking-linhas?data_inicio=${dataInicio}&data_fim=${dataFim}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar ranking de linhas por falhas");
  }
  return response.json();
};

// Hooks personalizados
export const useKpisData = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "kpis",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchKpis(formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useViagensData = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "ranking-viagens",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchRanking("viagens", formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const usePassageirosData = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "ranking-passageiros",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchRanking("passageiros", formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useOcorrenciasData = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "ranking-ocorrencias",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchRanking("ocorrencias", formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const usePontosData = () => {
  return useQuery({
    queryKey: ["contagem-pontos"],
    queryFn: () => fetchContagemPontos(),
  });
};

export const useBairroData = () => {
  return useQuery({
    queryKey: ["contagem-bairro"],
    queryFn: () => fetchContagemBairro(),
  });
};

export const useConcessionariaData = () => {
  return useQuery({
    queryKey: ["contagem-concessionaria"],
    queryFn: () => fetchContagemConcessionaria(),
  });
};

export const useEmpresaData = () => {
  return useQuery({
    queryKey: ["contagem-empresa"],
    queryFn: () => fetchContagemEmpresa(),
  });
};

export const usePontosLinha = (codLinha: string) => {
  return useQuery({
    queryKey: ["pontos-linha", codLinha],
    queryFn: () => fetchPontosLinha(codLinha),
    enabled: !!codLinha,
  });
};

// Hook para buscar pontos de múltiplas linhas
export const useMultiplasLinhasPontos = (codigosLinhas: string[]) => {
  return useQuery({
    queryKey: ["multiplas-linhas-pontos", codigosLinhas.sort().join(",")],
    queryFn: async () => {
      const promises = codigosLinhas.map((codigo) => fetchPontosLinha(codigo));
      const results = await Promise.allSettled(promises);

      // Consolidar todos os pontos em uma única coleção
      const allPoints: GeoJSONPointFeature[] = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.features) {
          result.value.features.forEach((point) => {
            // Adicionar código da linha nas propriedades do ponto
            allPoints.push({
              ...point,
              properties: {
                ...point.properties,
                codLinha: codigosLinhas[index],
              },
            });
          });
        }
      });

      return {
        type: "FeatureCollection",
        features: allPoints,
      } as GeoJSONFeatureCollection;
    },
    enabled: codigosLinhas.length > 0,
  });
};

export const useEficienciaData = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "eficiencia",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchEficiencia(formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useTaxaFalhasEmpresa = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "taxa-falhas-empresa",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchTaxaFalhasEmpresa(formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useJustificativasFalhas = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "justificativas-falhas",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchJustificativasFalhas(formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useCorrelacaoIdadeFalhas = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "correlacao-idade-falhas",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchCorrelacaoIdadeFalhas(formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useRankingLinhasFalhas = () => {
  const { appliedStartDate, appliedEndDate } = useFilter();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return useQuery({
    queryKey: [
      "ranking-linhas-falhas",
      appliedStartDate ? formatDate(appliedStartDate) : null,
      appliedEndDate ? formatDate(appliedEndDate) : null,
    ],
    queryFn: () => {
      if (!appliedStartDate || !appliedEndDate) {
        throw new Error("Datas não definidas");
      }
      return fetchRankingLinhasFalhas(formatDate(appliedStartDate), formatDate(appliedEndDate));
    },
    enabled: !!(appliedStartDate && appliedEndDate),
  });
};

export const useLinhasParaFiltro = () => {
  return useQuery({
    queryKey: ["linhas-para-filtro"],
    queryFn: fetchLinhasParaFiltro,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados de linhas não mudam frequentemente
  });
};
