// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import type { ForceRanking } from "@/lib/types/board";
import { cn } from "@/lib/utils";

// GeoJSON path
const GEO_URL = "/data/uk-police-forces.json";

// Force name mapping: Airtable name -> GeoJSON code
const FORCE_NAME_MAP: Record<string, string> = {
  "Metropolitan Police": "met",
  "Met Police": "met",
  "Thames Valley Police": "thames-valley",
  "Thames Valley": "thames-valley",
  "Kent Police": "kent",
  "Kent": "kent",
  "Surrey Police": "surrey",
  "Surrey": "surrey",
  "Sussex Police": "sussex",
  "Sussex": "sussex",
  "Hampshire Constabulary": "hampshire",
  "Hampshire": "hampshire",
  "Essex Police": "essex",
  "Essex": "essex",
  "Hertfordshire Constabulary": "hertfordshire",
  "Hertfordshire": "hertfordshire",
  "Bedfordshire Police": "bedfordshire",
  "Bedfordshire": "bedfordshire",
  "Cambridgeshire Constabulary": "cambridgeshire",
  "Cambridgeshire": "cambridgeshire",
  "Norfolk Constabulary": "norfolk",
  "Norfolk": "norfolk",
  "Suffolk Constabulary": "suffolk",
  "Suffolk": "suffolk",
  "Northamptonshire Police": "northamptonshire",
  "Northamptonshire": "northamptonshire",
  "Leicestershire Police": "leicestershire",
  "Leicestershire": "leicestershire",
  "Lincolnshire Police": "lincolnshire",
  "Lincolnshire": "lincolnshire",
  "Nottinghamshire Police": "nottinghamshire",
  "Nottinghamshire": "nottinghamshire",
  "Derbyshire Constabulary": "derbyshire",
  "Derbyshire": "derbyshire",
  "Staffordshire Police": "staffordshire",
  "Staffordshire": "staffordshire",
  "West Midlands Police": "west-midlands",
  "West Midlands": "west-midlands",
  "Warwickshire Police": "warwickshire",
  "Warwickshire": "warwickshire",
  "West Mercia Police": "west-mercia",
  "West Mercia": "west-mercia",
  "Gloucestershire Constabulary": "gloucestershire",
  "Gloucestershire": "gloucestershire",
  "Wiltshire Police": "wiltshire",
  "Wiltshire": "wiltshire",
  "Dorset Police": "dorset",
  "Dorset": "dorset",
  "Devon and Cornwall Police": "devon-cornwall",
  "Devon & Cornwall": "devon-cornwall",
  "Avon and Somerset Police": "avon-somerset",
  "Avon and Somerset": "avon-somerset",
  "Avon & Somerset": "avon-somerset",
  "South Yorkshire Police": "south-yorkshire",
  "South Yorkshire": "south-yorkshire",
  "West Yorkshire Police": "west-yorkshire",
  "West Yorkshire": "west-yorkshire",
  "North Yorkshire Police": "north-yorkshire",
  "North Yorkshire": "north-yorkshire",
  "Humberside Police": "humberside",
  "Humberside": "humberside",
  "Cleveland Police": "cleveland",
  "Cleveland": "cleveland",
  "Durham Constabulary": "durham",
  "Durham": "durham",
  "Northumbria Police": "northumbria",
  "Northumbria": "northumbria",
  "Cumbria Constabulary": "cumbria",
  "Cumbria": "cumbria",
  "Lancashire Constabulary": "lancashire",
  "Lancashire": "lancashire",
  "Greater Manchester Police": "greater-manchester",
  "Greater Manchester": "greater-manchester",
  "Merseyside Police": "merseyside",
  "Merseyside": "merseyside",
  "Cheshire Constabulary": "cheshire",
  "Cheshire": "cheshire",
  "North Wales Police": "north-wales",
  "North Wales": "north-wales",
  "Dyfed-Powys Police": "dyfed-powys",
  "Dyfed-Powys": "dyfed-powys",
  "South Wales Police": "south-wales",
  "South Wales": "south-wales",
  "Gwent Police": "gwent",
  "Gwent": "gwent",
  "City of London Police": "city-of-london",
  "City of London": "city-of-london",
};

// Colour scale for opportunity score (0-200)
const colorScale = scaleLinear<string>()
  .domain([0, 100, 200])
  .range(["hsl(220, 15%, 25%)", "hsl(45, 90%, 50%)", "hsl(0, 85%, 55%)"]);

interface TooltipData {
  name: string;
  score: number;
  heat: number;
  heatStatus: string;
  x: number;
  y: number;
}

interface UKForceMapProps {
  forces: ForceRanking[];
  onForceClick?: (force: ForceRanking) => void;
  className?: string;
}

export function UKForceMap({ forces, onForceClick, className }: UKForceMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [forceDataMap, setForceDataMap] = useState<Map<string, ForceRanking>>(new Map());

  // Build a map of GeoJSON code -> force data
  useEffect(() => {
    const map = new Map<string, ForceRanking>();
    for (const force of forces) {
      const code = FORCE_NAME_MAP[force.name];
      if (code) {
        map.set(code, force);
      }
    }
    setForceDataMap(map);
  }, [forces]);

  const handleMouseEnter = useCallback(
    (geo: { properties: Record<string, unknown> }, event: React.MouseEvent) => {
      const code = geo.properties.code as string;
      const force = forceDataMap.get(code);
      if (force) {
        setTooltip({
          name: force.name,
          score: force.opportunityScore,
          heat: force.engagementHeat,
          heatStatus: force.engagementStatus,
          x: event.clientX,
          y: event.clientY,
        });
      }
    },
    [forceDataMap]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (geo: { properties: Record<string, unknown> }) => {
      const code = geo.properties.code as string;
      const force = forceDataMap.get(code);
      if (force && onForceClick) {
        onForceClick(force);
      }
    },
    [forceDataMap, onForceClick]
  );

  return (
    <div className={cn("relative", className)}>
      {/* Map Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">
          UK Police Forces — Opportunity Heat
        </h3>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-foreground/60">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-red-500" />
            <span>Hot (100+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-yellow-500" />
            <span>Warm (50-99)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "hsl(220, 15%, 25%)" }} />
            <span>Cold (0-49)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg border border-border/40 bg-card/30 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 2800,
            center: [-2, 53.5],
          }}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code as string;
                  const force = forceDataMap.get(code);
                  const score = force?.opportunityScore ?? 0;
                  const fillColor = colorScale(score);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="hsl(220, 15%, 35%)"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "hsl(220, 60%, 60%)",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "hsl(220, 60%, 50%)",
                          outline: "none",
                        },
                      }}
                      onMouseEnter={(event) => handleMouseEnter(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Click hint */}
        <div className="absolute bottom-2 left-2 text-xs text-foreground/40">
          Click a force for details
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-md bg-popover border border-border shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          <div className="text-sm font-medium text-foreground">{tooltip.name}</div>
          <div className="mt-1 flex items-center gap-3 text-xs text-foreground/70">
            <span>Score: {tooltip.score}</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                tooltip.heatStatus === "hot" && "bg-red-500/20 text-red-400",
                tooltip.heatStatus === "warm" && "bg-yellow-500/20 text-yellow-400",
                tooltip.heatStatus === "cold" && "bg-muted text-muted-foreground"
              )}
            >
              {tooltip.heatStatus.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
