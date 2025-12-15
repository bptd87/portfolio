
import React, { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

// US States Topology
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface VisitorMapProps {
    data: { name: string; views: number }[]; // Changed from 'country' to 'name' (state name)
}

const VisitorMap = ({ data }: VisitorMapProps) => {
    const maxValue = Math.max(...data.map(d => d.views), 1);

    const colorScale = scaleLinear<string>()
        .domain([0, maxValue])
        .range(["#262626", "#D4AF37"]); // Neutral-800 to Brand Gold

    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.name, d.views]));

    return (
        <div className="w-full h-[400px] bg-neutral-900/30 rounded-lg overflow-hidden border border-white/5">
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const cur = dataMap.get(geo.properties.name);
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
                                            cursor: "pointer"
                                        },
                                        pressed: { outline: "none" },
                                    }}
                                    title={`${geo.properties.name}: ${cur || 0} views`}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
};

export default memo(VisitorMap);
