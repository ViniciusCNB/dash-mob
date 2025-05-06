import { Barplot } from "@/components/charts/Barplot"
import { PieChart } from "@/components/charts/PieChart"
import { AreaChart } from "@/components/charts/AreaChart"
import { useEffect, useState } from "react";

const Index = () => {
  const data = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
    { name: "D", value: 40 },
    { name: "E", value: 50 },
    { name: "F", value: 60 },
    { name: "G", value: 70 },
    { name: "H", value: 80 },
    { name: "I", value: 90 },
    { name: "J", value: 100 },
  ];

  const pieData = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
    { name: "D", value: 40 },
    { name: "E", value: 50 },
  ];

  const areaData = [
    { x: 1, y: 10 },
    { x: 2, y: 35 },
    { x: 3, y: 20 },
    { x: 4, y: 50 },
  ];

  const [viagensPorLinha, setViagensPorLinha] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:80/viagens-por-linha");

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        const sortedData = [...data].sort((a, b) => b.quantidade_viagens - a.quantidade_viagens).slice(0, 10);

        const formattedData = sortedData.map((item: { linha: string; quantidade_viagens: number }) => ({
          name: item.linha,
          value: item.quantidade_viagens,
        }));

        setViagensPorLinha(formattedData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Falha ao carregar dados de viagens por linha");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-2 2xl:grid-cols-3 gap-4">
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">Top 10 Linhas com Mais Viagens</h1>
        {loading ? (
          <p>Carregando dados...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Barplot width={500} height={300} data={viagensPorLinha} />
        )}
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">Barplot</h1>
        <Barplot width={500} height={300} data={data} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">PieChart</h1>
        <PieChart width={500} height={300} data={pieData} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">AreaChart</h1>
        <AreaChart width={500} height={300} data={areaData} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">Barplot</h1>
        <Barplot width={500} height={300} data={data} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">PieChart</h1>
        <PieChart width={500} height={300} data={pieData} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">AreaChart</h1>
        <AreaChart width={500} height={300} data={areaData} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">Barplot</h1>
        <Barplot width={500} height={300} data={data} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">PieChart</h1>
        <PieChart width={500} height={300} data={pieData} />
      </div>
      <div className="bg-muted-foreground/5 p-4 rounded-lg w-fit text-center">
        <h1 className="text-xl font-bold">AreaChart</h1>
        <AreaChart width={500} height={300} data={areaData} />
      </div>
    </div>
  );
};

export default Index;
