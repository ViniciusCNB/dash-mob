import { Barplot } from "@/components/charts/Barplot"
import { AreaChart } from "@/components/charts/AreaChart"
import { PieChart } from "@/components/charts/PieChart"


const Ocorrencias = () => {
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
    { name: "F", value: 60 },
  ];

  const areaData = [
    { x: 1, y: 10 },
    { x: 2, y: 35 },
    { x: 3, y: 20 },
    { x: 4, y: 50 },
  ];

  return (
    <div className="grid grid-cols-2 2xl:grid-cols-3 gap-4">
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

export default Ocorrencias;