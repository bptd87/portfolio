
import React, { memo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Globe, Map as MapIcon } from 'lucide-react';

// Topologies
const GEO_US_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const GEO_WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface VisitorMapProps {
    data: { name: string; views: number }[];
    type?: 'us' | 'world';
}

const VisitorMap = ({ data, type = 'us', onRegionClick }: VisitorMapProps & { onRegionClick?: (regionName: string) => void }) => {
    const [view, setView] = useState<'us' | 'world'>(type);

    // Switch internal view if prop changes, but allow manual toggle too
    React.useEffect(() => {
        if (type) setView(type);
    }, [type]);

    const maxValue = Math.max(...data.map(d => d.views), 1);

    const colorScale = scaleLinear<string>()
        .domain([0, maxValue])
        .range(["#1a1a1a", "#FFD700"]); // Darker base to brighter Gold for high contrast

    // Create a map for quick lookup
    // Normalize data keys for better matching (simple case-insensitive)
    const dataMap = new Map(data.map(d => {
        let name = d.name.toLowerCase();
        // Simple manual mapping for common mismatches
        if (name === 'united states') name = 'united states of america';
        return [name, d.views];
    }));

    return (
        <div className="relative w-full h-[400px] bg-neutral-900/30 rounded-lg overflow-hidden border border-white/5 group">

            {/* Map Toggle Controls */}
            <div className="absolute top-4 right-4 flex bg-neutral-900 rounded-lg p-1 border border-white/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setView('us')}
                    className={`p-2 rounded-md transition-colors ${view === 'us' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-white'}`}
                    title="US View"
                >
                    <MapIcon size={16} />
                </button>
                <button
                    onClick={() => setView('world')}
                    className={`p-2 rounded-md transition-colors ${view === 'world' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-white'}`}
                    title="World View"
                >
                    <Globe size={16} />
                </button>
            </div>

            <ComposableMap projection={view === 'us' ? "geoAlbersUsa" : "geoMercator"}>
                {/* Disable zoom/pan on US map by constraining zoom and using filter events (if available/needed) or just reliance on constraints */}
                <ZoomableGroup
                    center={[0, 0]}
                    zoom={1}
                    minZoom={view === 'us' ? 1 : 1}
                    maxZoom={view === 'us' ? 1 : 4}
                >
                    <Geographies geography={view === 'us' ? GEO_US_URL : GEO_WORLD_URL}>
                        {({ geographies }: { geographies: Array<{ rsmKey: string; properties: { name: string };[key: string]: unknown }> }) =>
                            geographies.map((geo: { rsmKey: string; properties: { name: string };[key: string]: unknown }) => {
                                const geoName = geo.properties.name?.toLowerCase();
                                const cur = dataMap.get(geoName);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={cur ? colorScale(cur) : "#333"}
                                        stroke="#1a1a1a"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: {
                                                fill: "#fff",
                                                outline: "none",
                                                cursor: "pointer",
                                                transition: "all 0.3s"
                                            },
                                            pressed: { outline: "none" },
                                        }}
                                        onClick={() => {
                                            if (onRegionClick) onRegionClick(geo.properties.name);
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
};

export default memo(VisitorMap);
