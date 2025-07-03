import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos após não ser usado
      gcTime: 10 * 60 * 1000,
      // Retry automático em caso de erro
      retry: 2,
      // Refetch quando a janela ganhar foco
      refetchOnWindowFocus: false,
      // Refetch em caso de reconexão
      refetchOnReconnect: true,
    },
  },
});
