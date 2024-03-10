"use client";

import { useMemo } from "react";
import { scaleUtc, scaleLinear } from "@visx/scale";
import { ParentSize } from "@visx/responsive";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom } from "@visx/axis";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { WeekTs, formatDate } from "@recnet/recnet-web/utils/date";
import { Text } from "@radix-ui/themes";

type Timestamp = string;

interface RecsCycleBarChartProps {
  parentWidth: number;
  parentHeight: number;
  data: Record<Timestamp, number>;
}

interface TooltipData {
  ts: number;
  count: number;
}

const themeColor = "#2A78D0";
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: "black",
  color: "white",
};
let tooltipTimeout: number;

function BarChart(props: RecsCycleBarChartProps) {
  const { parentWidth, parentHeight, data } = props;
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });
  // data
  const timestamps = Object.keys(data).map((key) => parseInt(key, 10));

  // bounds
  const margin = { top: 40, right: 0, bottom: 40, left: 0 };
  const xMax = parentWidth;
  const yMax = parentHeight - margin.top - margin.bottom;
  const barWidth = parentWidth / timestamps.length - 5;

  const xScale = useMemo(() => {
    return scaleUtc({
      domain: [
        Math.min(...timestamps),
        Math.max(...timestamps) + 604800000, // add 1 week
      ],
      range: [0, xMax],
    });
  }, [xMax, timestamps]);

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [0, Math.max(...Object.values(data))],
      range: [yMax, 0],
    });
  }, [yMax, data]);

  return (
    <>
      <svg width={parentWidth} height={parentHeight} ref={containerRef}>
        <Group top={margin.top}>
          {Object.keys(data)
            .map((key) => {
              const ts = parseInt(key, 10);
              return {
                ts,
                count: data[key],
              };
            })
            .map((d) => {
              const barHeight = yMax - (yScale(d.count) ?? 0);
              const barX = xScale(new Date(d.ts));
              const barY = yMax - barHeight;
              return (
                <Bar
                  key={`bar-${d.ts}`}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="#0091FF"
                  onClick={() => {}}
                  onMouseLeave={() => {
                    tooltipTimeout = window.setTimeout(() => {
                      hideTooltip();
                    }, 300);
                  }}
                  onMouseMove={(event) => {
                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    // TooltipInPortal expects coordinates to be relative to containerRef
                    // localPoint returns coordinates relative to the nearest SVG, which
                    // is what containerRef is set to.
                    const eventSvgCoords = localPoint(event);
                    const left = barX + barWidth / 2;
                    showTooltip({
                      tooltipData: {
                        ts: d.ts,
                        count: d.count,
                      },
                      tooltipTop: eventSvgCoords?.y,
                      tooltipLeft: left,
                    });
                  }}
                />
              );
            })}
        </Group>
        <AxisBottom
          top={yMax + margin.bottom}
          scale={xScale}
          tickFormat={(d) => {
            if (d instanceof Date) {
              return xScale.tickFormat(undefined, "%b %d")(d);
            }
            return "";
          }}
          stroke={themeColor}
          tickStroke={themeColor}
          tickLabelProps={{
            fill: themeColor,
            fontSize: 9,
            textAnchor: "middle",
          }}
        />
      </svg>
      {tooltipData && tooltipOpen ? (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
          className="flex flex-col gap-y-2 p-2 rounded-8"
        >
          <Text className="text-[14px] text-blue-7 py-1 font-medium">{`${formatDate(new Date(tooltipData.ts - WeekTs))} ~ ${formatDate(new Date(tooltipData.ts))}`}</Text>
          <div>Num of Rec: {tooltipData.count}</div>
        </TooltipInPortal>
      ) : null}
    </>
  );
}

export function RecsCycleBarChart(props: Pick<RecsCycleBarChartProps, "data">) {
  return (
    <ParentSize>
      {(parent) => (
        <BarChart
          {...props}
          parentWidth={parent.width}
          parentHeight={parent.height}
        />
      )}
    </ParentSize>
  );
}
