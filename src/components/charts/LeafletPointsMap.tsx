import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { GeoJSONFeatureCollection } from "@/hooks/useApiQueries";
import "leaflet/dist/leaflet.css";

interface LeafletPointsMapProps {
  pontosData: GeoJSONFeatureCollection | null;
  height?: number;
  selectedLine?: string;
  onLineSelect?: (codigo: string) => void;
}

// Componente para ajustar os bounds do mapa
const MapBoundsUpdater: React.FC<{ pontosData: GeoJSONFeatureCollection | null }> = ({ pontosData }) => {
  const map = useMap();

  useEffect(() => {
    if (!pontosData?.features?.length) return;

    const bounds: [number, number][] = [];
    pontosData.features.forEach((point) => {
      if (point.geometry?.coordinates) {
        const [lng, lat] = point.geometry.coordinates;
        bounds.push([lat, lng]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [pontosData, map]);

  return null;
};

const LeafletPointsMap: React.FC<LeafletPointsMapProps> = ({
  pontosData,
  height = 400,
  selectedLine,
  onLineSelect,
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Forçar re-render quando os dados mudam
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [pontosData]);

  // Obter linhas únicas dos pontos
  const getUniqueLines = (data: GeoJSONFeatureCollection): string[] => {
    if (!data?.features?.length) return [];

    const lines = new Set<string>();
    data.features.forEach((point) => {
      const codLinha = point.properties.codLinha as string;
      if (codLinha) lines.add(codLinha);
    });

    return Array.from(lines).sort();
  };

  // Cores para as linhas (mesmo esquema do D3)
  const getLineColor = (codLinha: string): string => {
    const colors = [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
    ];
    const index = codLinha.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!pontosData?.features?.length) {
    return (
      <div
        className="flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500">Carregando pontos de parada...</div>
      </div>
    );
  }

  const uniqueLines = getUniqueLines(pontosData);
  const totalPoints = pontosData.features.length;

  // Calcular centro inicial
  const centerLat =
    pontosData.features.reduce((sum, point) => sum + point.geometry.coordinates[1], 0) / pontosData.features.length;
  const centerLng =
    pontosData.features.reduce((sum, point) => sum + point.geometry.coordinates[0], 0) / pontosData.features.length;

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <MapContainer
        key={mapKey}
        center={[centerLat, centerLng]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater pontosData={pontosData} />

        {pontosData.features.map((point, index) => {
          if (!point.geometry?.coordinates) return null;

          const [lng, lat] = point.geometry.coordinates;
          const codLinha = point.properties.codLinha as string;
          const color = getLineColor(codLinha);
          const isSelected = selectedLine === codLinha;
          const isHighlighted = selectedLine ? isSelected : false;

          return (
            <CircleMarker
              key={`${codLinha}-${index}`}
              center={[lat, lng]}
              radius={isHighlighted ? 8 : 5}
              pathOptions={{
                fillColor: color,
                color: "white",
                weight: isHighlighted ? 3 : 2,
                fillOpacity: isHighlighted ? 1 : 0.8,
                opacity: 1,
              }}
              eventHandlers={{
                click: () => {
                  onLineSelect?.(codLinha);
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">🚏 Ponto de Parada</div>
                  <div style={{ color }} className="font-medium">
                    Linha {codLinha}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Clique para filtrar linha</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legenda */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg max-h-60 overflow-y-auto border z-10">
        <h4 className="font-semibold text-sm mb-2 text-gray-700">🚏 Pontos de Parada</h4>
        <div className="space-y-1">
          {uniqueLines.slice(0, 12).map((codLinha) => {
            const color = getLineColor(codLinha);
            const pointsCount = pontosData.features.filter((p) => p.properties.codLinha === codLinha).length;

            return (
              <div
                key={codLinha}
                className={`flex items-center justify-between gap-2 text-xs cursor-pointer p-2 rounded transition-colors ${
                  selectedLine === codLinha ? "bg-blue-100 border border-blue-200" : "hover:bg-gray-100"
                }`}
                onClick={() => onLineSelect?.(codLinha)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: color, boxShadow: "1px 1px 3px rgba(0,0,0,0.3)" }}
                  />
                  <span className="font-medium">{codLinha}</span>
                </div>
                <span className="text-gray-500 text-xs">{pointsCount}</span>
                {selectedLine === codLinha && <span className="text-blue-600 text-xs">✓</span>}
              </div>
            );
          })}
          {uniqueLines.length > 12 && (
            <div className="text-xs text-gray-500 pt-1 italic">+{uniqueLines.length - 12} outras linhas</div>
          )}
        </div>
      </div>

      {/* Informações do mapa */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs border z-10">
        <div className="font-semibold text-gray-700 mb-1">📍 Informações do Mapa</div>
        <div className="text-gray-600">
          Pontos: <span className="font-medium">{totalPoints.toLocaleString("pt-BR")}</span>
        </div>
        <div className="text-gray-600">
          Linhas: <span className="font-medium">{uniqueLines.length}</span>
        </div>
        <div className="text-gray-400 mt-2 text-xs">🖱️ Arraste • 🔍 Zoom • 📍 Clique nos pontos</div>
      </div>
    </div>
  );
};

export default LeafletPointsMap;
