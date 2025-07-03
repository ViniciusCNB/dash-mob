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
