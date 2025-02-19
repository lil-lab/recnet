"use client";

import { Text } from "@radix-ui/themes";
import { AxisBottom } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleUtc, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { useMemo, useState } from "react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";

import { WeekTs, formatDate } from "@recnet/recnet-date-fns";

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

interface PeriodStats {
  recommendations: {
    userId: string;
    userName: string;
    userHandle: string;
    recId: string;
    recTitle: string;
    recLink: string;
    timestamp: number;
  }[];
  periodStart: number;
  periodEnd: number;
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
  const [selectedBar, setSelectedBar] = useState<TooltipData | null>(null);
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();
  const { mutateAsync: getPeriodStats } = trpc.getPeriodStats.useMutation();

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
  const yMax = 220; // Fixed height for the chart area
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
    <div className="flex flex-col gap-4">
      <div className="relative h-[300px]">
        <svg width={parentWidth} height={300} ref={containerRef}>
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
                    fill={selectedBar?.ts === d.ts ? "#0066CC" : "#0091FF"}
                    onClick={async () => {
                      setSelectedBar(
                        selectedBar?.ts === d.ts
                          ? null
                          : { ts: d.ts, count: d.count }
                      );

                      if (selectedBar?.ts !== d.ts) {
                        try {
                          const stats = await getPeriodStats(d.ts);
                          setPeriodStats(stats);
                        } catch (error) {
                          console.error("Failed to fetch stats:", error);
                        }
                      }
                    }}
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
            top={yMax + margin.top}
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
        {tooltipData && tooltipOpen && (
          <TooltipInPortal
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              ...tooltipStyles,
              position: "absolute",
            }}
          >
            <Text className="text-[14px] text-blue-7 py-1 font-medium">{`${formatDate(new Date(tooltipData.ts - WeekTs))} ~ ${formatDate(new Date(tooltipData.ts))}`}</Text>
            <div>Num of Rec: {tooltipData.count}</div>
          </TooltipInPortal>
        )}
      </div>

      {selectedBar && periodStats && (
        <div className="p-4 bg-gray-1 dark:bg-gray-dark-1 shadow-sm">
          <Text className="text-[14px] text-blue-7 dark:text-blue-dark-7 py-1 font-medium">
            {`${formatDate(new Date(periodStats.periodStart))} ~ ${formatDate(new Date(periodStats.periodEnd))}`}
          </Text>
          <table className="w-full mt-2">
            <thead>
              <tr className="border-b border-gray-3 dark:border-gray-dark-3">
                <th className="text-left py-2 px-4 text-[14px] font-bold text-gray-11 dark:text-gray-dark-11">
                  User
                </th>
                <th className="text-left py-2 px-4 text-[14px] font-bold text-gray-11 dark:text-gray-dark-11">
                  Recommendation
                </th>
              </tr>
            </thead>
            <tbody>
              {periodStats.recommendations.map((item) => (
                <tr
                  key={item.recId}
                  className="border-b border-gray-3 dark:border-gray-dark-3 hover:bg-gray-2 dark:hover:bg-gray-dark-2"
                >
                  <td className="py-2 px-4 text-[14px]">
                    <a
                      href={`/${item.userHandle}`}
                      className="text-blue-9 hover:text-blue-10 dark:text-blue-dark-9 dark:hover:text-blue-dark-10 hover:underline"
                    >
                      {item.userName}
                    </a>
                  </td>
                  <td className="py-2 px-4 text-[14px] max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[400px]">
                    <a
                      href={item.recLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-9 hover:text-blue-10 dark:text-blue-dark-9 dark:hover:text-blue-dark-10 hover:underline block truncate"
                      title={item.recTitle}
                    >
                      {item.recTitle}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
