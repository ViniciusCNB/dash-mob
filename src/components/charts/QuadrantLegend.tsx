import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuadrantInfo {
  title: string;
  description: string;
  color: string;
  characteristics: string;
  story: string;
}

const quadrants: QuadrantInfo[] = [
  {
    title: "Lentas e Lotadas",
    description: "Quadrante Superior Esquerdo",
    color: "#f59e0b",
    characteristics: "Baixa eficiência por tempo, mas alta por distância",
    story: "Estas são as linhas \"cavalos de batalha\". Elas estão sempre cheias, mas provavelmente ficam presas em corredores de trânsito intenso. O insight aqui não é sobre a linha em si, mas sobre a infraestrutura. Melhorias como faixas exclusivas ou otimização de semáforos em suas rotas poderiam movê-las para o quadrante das \"Melhores\"."
  },
  {
    title: "As Melhores",
    description: "Quadrante Superior Direito",
    color: "#22c55e",
    characteristics: "Alta eficiência por tempo e por distância",
    story: "São as linhas mais performáticas. Elas são rápidas e transportam muitos passageiros pela distância que percorrem. São os modelos a serem estudados."
  },
  {
    title: "Alvos de Otimização",
    description: "Quadrante Inferior Esquerdo",
    color: "#ef4444",
    characteristics: "Baixa eficiência em ambos os eixos",
    story: "Estas são as novas \"Linhas Fantasma\". São lentas e transportam poucos passageiros. Elas são as principais candidatas a uma reestruturação completa: reavaliação de rota, de frequência ou até mesmo a sua descontinuação para alocar recursos em áreas mais necessitadas."
  },
  {
    title: "Rápidas e Vazias",
    description: "Quadrante Inferior Direito",
    color: "#3b82f6",
    characteristics: "Alta eficiência por tempo, mas baixa por distância",
    story: "São linhas que cumprem seu trajeto rapidamente, mas com poucos passageiros. Podem ser linhas expressas que servem nichos específicos ou rotas que poderiam ser estendidas para capturar mais demanda em outras áreas."
  }
];

export const QuadrantLegend = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {quadrants.map((quadrant, index) => (
        <Card key={index} className="border-l-4" style={{ borderLeftColor: quadrant.color }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: quadrant.color }}
              />
              <CardTitle className="text-lg">{quadrant.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {quadrant.description}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Características:</h4>
              <p className="text-sm text-gray-600">{quadrant.characteristics}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Análise:</h4>
              <p className="text-sm text-gray-600">{quadrant.story}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 