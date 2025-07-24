import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, useMap } from "react-leaflet";
import { GeoJSONFeatureCollection, GeoJSONPolygonFeatureCollection } from "@/hooks/useApiQueries";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Layers } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Tipos para controle de camadas
type LayerType = "pontos" | "bairros";

interface LayerControl {
  pontos: boolean;
  bairros: boolean;
}

interface LeafletPointsMapProps {
  pontosData: GeoJSONFeatureCollection | null;
  bairrosData?: GeoJSONPolygonFeatureCollection | null;
  height?: number;
  selectedLine?: string;
  onLineSelect?: (codigo: string) => void;
}

// Componente para ajustar os bounds do mapa
const MapBoundsUpdater: React.FC<{
  pontosData: GeoJSONFeatureCollection | null;
  bairrosData?: GeoJSONPolygonFeatureCollection | null;
}> = ({ pontosData, bairrosData }) => {
  const map = useMap();

  useEffect(() => {
    const bounds: [number, number][] = [];

    // Adicionar bounds dos pontos
    pontosData?.features?.forEach((point) => {
      if (point.geometry?.coordinates) {
        const [lng, lat] = point.geometry.coordinates;
        bounds.push([lat, lng]);
      }
    });

    // Adicionar bounds dos bairros (centro dos polígonos)
    bairrosData?.features?.forEach((feature) => {
      if (feature.geometry?.coordinates) {
        try {
          // Para polígonos, calcular o centro aproximado
          if (feature.geometry.type === "Polygon") {
            const polygonCoords = feature.geometry.coordinates as number[][][];
            const coords = polygonCoords[0];
            if (coords && coords.length > 0) {
              const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
              const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
              bounds.push([centerLat, centerLng]);
            }
          } else if (feature.geometry.type === "MultiPolygon") {
            const multiPolygonCoords = feature.geometry.coordinates as number[][][][];
            const coords = multiPolygonCoords[0][0];
            if (coords && coords.length > 0) {
              const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
              const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
              bounds.push([centerLat, centerLng]);
            }
          }
        } catch (error) {
          console.warn("Erro ao processar geometria do bairro:", error);
        }
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [pontosData, bairrosData, map]);

  return null;
};

// Componente do seletor de camadas (versão discreta)
const LayerSelector: React.FC<{
  layers: LayerControl;
  onLayerToggle: (layer: LayerType) => void;
}> = ({ layers, onLayerToggle }) => {
  return (
    <div className="absolute bottom-6 right-2 flex flex-col gap-2 z-10 bg-white/50 backdrop-blur-sm p-2 rounded-sm shadow-lg border">
      <div className="flex items-center gap-1 text-[11px] text-gray-500">
        <Layers className="w-4 h-4 text-gray-500" />
        <div className="font-medium">Camadas</div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant={layers.pontos ? "default" : "outline"}
          size="sm"
          onClick={() => onLayerToggle("pontos")}
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-gray-100"
          title="Pontos de Parada"
        >
          <MapPin className="w-4 h-4 text-black" />
        </Button>
        <Button
          variant={layers.bairros ? "default" : "outline"}
          size="sm"
          onClick={() => onLayerToggle("bairros")}
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-gray-100"
          title="Bairros"
        >
          <Building2 className="w-4 h-4 text-black" />
        </Button>
      </div>
    </div>
  );
};

const LeafletPointsMap: React.FC<LeafletPointsMapProps> = ({
  pontosData,
  bairrosData,
  height = 400,
  selectedLine,
  onLineSelect,
}) => {
  const [mapKey, setMapKey] = useState(0);
  const [layers, setLayers] = useState<LayerControl>({
    pontos: true,
    bairros: true,
  });

  // Forçar re-render quando os dados mudam
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [pontosData, bairrosData]);

  // Função para alternar camadas
  const handleLayerToggle = (layer: LayerType) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // Obter linhas únicas dos pontos
  const getUniqueLines = (data: GeoJSONFeatureCollection): string[] => {
    if (!data?.features?.length) return [];

    const lines = new Set<string>();
    data.features.forEach((point) => {
      if (!point.properties || !point.geometry?.coordinates) return;

      const codLinha = point.properties.codLinha as string;
      if (codLinha && typeof codLinha === "string" && codLinha.trim() !== "") {
        lines.add(codLinha);
      }
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
    if (!codLinha) return colors[0];
    const index = codLinha.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Estilos para polígonos dos bairros
  const getBairroStyle = () => ({
    fillColor: "#3b82f6",
    weight: 2,
    opacity: 0.8,
    color: "#1d4ed8",
    fillOpacity: 0.2,
  });

  if (!pontosData?.features?.length && !bairrosData?.features?.length) {
    return (
      <div
        className="flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500">Carregando dados do mapa...</div>
      </div>
    );
  }

  const uniqueLines = getUniqueLines(pontosData || { type: "FeatureCollection", features: [] });
  const totalPoints = pontosData?.features?.length || 0;
  const totalBairros = bairrosData?.features?.length || 0;

  // Calcular centro inicial
  const validFeatures =
    pontosData?.features?.filter(
      (point) =>
        point.geometry?.coordinates &&
        typeof point.geometry.coordinates[0] === "number" &&
        typeof point.geometry.coordinates[1] === "number"
    ) || [];

  const centerLat =
    validFeatures.length > 0
      ? validFeatures.reduce((sum, point) => sum + point.geometry.coordinates[1], 0) / validFeatures.length
      : -19.9167; // Belo Horizonte default

  const centerLng =
    validFeatures.length > 0
      ? validFeatures.reduce((sum, point) => sum + point.geometry.coordinates[0], 0) / validFeatures.length
      : -43.9345; // Belo Horizonte default

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

        <MapBoundsUpdater pontosData={pontosData} bairrosData={bairrosData} />

        {/* Renderizar bairros se a camada estiver ativada */}
        {layers.bairros &&
          bairrosData?.features?.map((feature, index) => (
            <GeoJSON
              key={`bairro-${index}`}
              data={feature as import("geojson").GeoJsonObject}
              style={getBairroStyle}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                <div class="text-sm">
                  <div class="font-semibold mb-1">🏘️ Bairro</div>
                  <div class="font-medium text-blue-700">
                    ${feature.properties?.nome_bairro || "Nome não disponível"}
                  </div>
                  <div class="text-gray-600 text-xs mt-1">
                    Área servida pela linha
                  </div>
                </div>
              `);
              }}
            />
          ))}

        {/* Renderizar pontos se a camada estiver ativada */}
        {layers.pontos &&
          pontosData?.features?.map((point, index) => {
            if (!point.geometry?.coordinates || !point.properties) return null;

            const [lng, lat] = point.geometry.coordinates;
            if (typeof lng !== "number" || typeof lat !== "number") return null;

            const codLinha = point.properties.codLinha as string;
            if (!codLinha || typeof codLinha !== "string" || codLinha.trim() === "") return null;

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

      {/* Seletor de camadas */}
      <LayerSelector layers={layers} onLayerToggle={handleLayerToggle} />

      {/* Legenda das linhas */}
      {layers.pontos && uniqueLines.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg max-h-60 overflow-y-auto border z-10">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">🚏 Linhas de Ônibus</h4>
          <div className="space-y-1">
            {uniqueLines.slice(0, 12).map((codLinha) => {
              const color = getLineColor(codLinha);
              const pointsCount =
                pontosData?.features?.filter(
                  (p) =>
                    p.properties?.codLinha === codLinha &&
                    p.geometry?.coordinates &&
                    typeof p.geometry.coordinates[0] === "number" &&
                    typeof p.geometry.coordinates[1] === "number"
                ).length || 0;

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
      )}

      {/* Informações do mapa */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs border z-10">
        <div className="font-semibold text-gray-700 mb-1">Informações do Mapa</div>
        {layers.pontos && (
          <div className="text-gray-600">
            Pontos: <span className="font-medium">{totalPoints.toLocaleString("pt-BR")}</span>
          </div>
        )}
        {layers.bairros && (
          <div className="text-gray-600">
            Bairros: <span className="font-medium">{totalBairros}</span>
          </div>
        )}
        {layers.pontos && (
          <div className="text-gray-600">
            Linhas: <span className="font-medium">{uniqueLines.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeafletPointsMap;
