import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EficienciaLinha } from '@/hooks/useApiQueries';
import { Eye, EyeOff, Filter } from 'lucide-react';

interface ScatterPlotControlsProps {
  data: EficienciaLinha[];
  onDataChange: (filteredData: EficienciaLinha[]) => void;
  avgPassageirosPorKm: number;
  avgPassageirosPorMinuto: number;
}

export const ScatterPlotControls = ({ 
  data, 
  onDataChange, 
  avgPassageirosPorKm, 
  avgPassageirosPorMinuto 
}: ScatterPlotControlsProps) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('todos');
  const [showTop, setShowTop] = useState<number>(0); // 0 = todos, 10 = top 10, etc.

  // Classificar dados por quadrante
  const getQuadrant = (d: EficienciaLinha) => {
    const isHighX = d.passageiros_por_minuto >= avgPassageirosPorMinuto;
    const isHighY = d.passageiros_por_km >= avgPassageirosPorKm;
    
    if (isHighX && isHighY) return 'melhores';
    if (!isHighX && isHighY) return 'lentasLotadas';
    if (!isHighX && !isHighY) return 'alvosOtimizacao';
    return 'rapidasVazias';
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filteredData = [...data];

    // Filtrar por quadrante
    if (selectedQuadrant !== 'todos') {
      filteredData = filteredData.filter(d => getQuadrant(d) === selectedQuadrant);
    }

    // Filtrar por top N
    if (showTop > 0) {
      filteredData = filteredData
        .sort((a, b) => b.total_passageiros - a.total_passageiros)
        .slice(0, showTop);
    }

    onDataChange(filteredData);
  };

  // Aplicar filtros sempre que mudarem
  useEffect(() => {
    applyFilters();
  }, [selectedQuadrant, showTop, data]);

  const handleQuadrantChange = (value: string) => {
    setSelectedQuadrant(value);
  };

  const handleTopChange = (value: string) => {
    setShowTop(parseInt(value));
  };

  const quadrantOptions = [
    { value: 'todos', label: 'Todos os Quadrantes', color: '#6b7280' },
    { value: 'melhores', label: 'As Melhores', color: '#22c55e' },
    { value: 'lentasLotadas', label: 'Lentas e Lotadas', color: '#f59e0b' },
    { value: 'alvosOtimizacao', label: 'Alvos de Otimização', color: '#ef4444' },
    { value: 'rapidasVazias', label: 'Rápidas e Vazias', color: '#3b82f6' }
  ];

  const getQuadrantStats = () => {
    const stats = {
      melhores: data.filter(d => getQuadrant(d) === 'melhores').length,
      lentasLotadas: data.filter(d => getQuadrant(d) === 'lentasLotadas').length,
      alvosOtimizacao: data.filter(d => getQuadrant(d) === 'alvosOtimizacao').length,
      rapidasVazias: data.filter(d => getQuadrant(d) === 'rapidasVazias').length
    };
    return stats;
  };

  const stats = getQuadrantStats();

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800">Controles de Visualização</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Filtrar por Quadrante
          </label>
          <Select value={selectedQuadrant} onValueChange={handleQuadrantChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um quadrante" />
            </SelectTrigger>
            <SelectContent>
              {quadrantOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                    {option.value !== 'todos' && (
                      <Badge variant="outline" className="ml-2">
                        {stats[option.value as keyof typeof stats]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mostrar Top Linhas
          </label>
          <Select value={showTop.toString()} onValueChange={handleTopChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Quantidade de linhas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas as Linhas</SelectItem>
              <SelectItem value="10">Top 10 Linhas</SelectItem>
              <SelectItem value="25">Top 25 Linhas</SelectItem>
              <SelectItem value="50">Top 50 Linhas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{stats.melhores}</div>
          <div className="text-xs text-gray-600">Melhores</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{stats.lentasLotadas}</div>
          <div className="text-xs text-gray-600">Lentas/Lotadas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{stats.alvosOtimizacao}</div>
          <div className="text-xs text-gray-600">Otimização</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.rapidasVazias}</div>
          <div className="text-xs text-gray-600">Rápidas/Vazias</div>
        </div>
      </div>

      {(selectedQuadrant !== 'todos' || showTop > 0) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Exibindo {selectedQuadrant !== 'todos' ? 
              `quadrante "${quadrantOptions.find(q => q.value === selectedQuadrant)?.label}"` : 
              'todas as linhas'
            }
            {showTop > 0 && ` (Top ${showTop})`}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedQuadrant('todos');
              setShowTop(0);
            }}
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}; 