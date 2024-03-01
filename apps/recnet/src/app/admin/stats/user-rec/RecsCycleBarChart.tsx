"use client";

import { useMemo } from "react";
import { scaleUtc, scaleLinear } from "@visx/scale";
import { ParentSize } from "@visx/responsive";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";

type Timestamp = string;

interface RecsCycleBarChartProps {
  parentWidth: number;
  parentHeight: number;
  data: Record<Timestamp, number>;
}

function BarChart(props: RecsCycleBarChartProps) {
  const { parentWidth, parentHeight, data } = props;
  // bounds
  const margin = { top: 40, right: 0, bottom: 0, left: 0 };
  const xMax = parentWidth;
  const yMax = parentHeight - margin.top;

  // data
  const timestamps = Object.keys(data).map((ts) => parseInt(ts, 10));

  const xScale = useMemo(() => {
    return scaleUtc({
      domain: [
        new Date(Math.min(...timestamps)),
        new Date(Math.max(...timestamps)),
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
    <svg width={parentWidth} height={parentHeight}>
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
            const barWidth = 20;
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
              />
            );
          })}
      </Group>
    </svg>
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
