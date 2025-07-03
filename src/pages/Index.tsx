import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKpisData } from "@/hooks/useApiQueries";

const Index = () => {
  const { data: kpis, isLoading: loading, error } = useKpisData();

  if (loading) {
    return (
      <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-muted-foreground/5 p-4 gap-0 rounded-lg text-center animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4">
        <Card className="col-span-full bg-red-50 border-red-200 text-center p-4">
          <CardContent>
            <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4">
      <Card className="bg-muted-foreground/5 p-4 gap-0 rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Total de Viagens Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-[#1976d2]">{kpis?.total_viagens?.toLocaleString("pt-BR") || 0}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted-foreground/5 p-4 gap-0 rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Total de Passageiros Transportados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-[#1976d2]">{kpis?.total_passageiros?.toLocaleString("pt-BR") || 0}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted-foreground/5 p-4 gap-0 rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Total de Ocorrências Reportadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-[#1976d2]">{kpis?.total_ocorrencias?.toLocaleString("pt-BR") || 0}</p>
        </CardContent>
      </Card>

      <Card className="bg-muted-foreground/5 p-4 gap-0 rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Eficiência de Passageiros/Km</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-[#1976d2]">{kpis?.eficiencia_passageiro_km?.toFixed(2) || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
