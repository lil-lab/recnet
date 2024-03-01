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

const verticalMargin = 70;

function BarChart(props: RecsCycleBarChartProps) {
  const { parentWidth, parentHeight, data } = props;
  // bounds
  const xMax = parentWidth;
  const yMax = parentHeight - verticalMargin;

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
      <Group top={verticalMargin / 2}>
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
