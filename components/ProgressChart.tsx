import React from "react";
import { View, Text, Dimensions } from "react-native";
import { cn } from "@/lib/utils/cn";

export interface ChartDataPoint {
  date: string; // ISO date string
  weight: number;
}

export interface ProgressChartProps {
  data: ChartDataPoint[];
  className?: string;
}

/**
 * Simple line chart showing weight progression over time
 * Uses React Native View components for cross-platform compatibility
 */
export function ProgressChart({ data, className }: ProgressChartProps) {
  // Empty state
  if (data.length === 0) {
    return (
      <View
        testID="progress-chart"
        className={cn("items-center justify-center py-12", className)}
      >
        <Text className="text-text-muted text-center">
          No data available yet.{"\n"}Complete more workouts to see your
          progress!
        </Text>
      </View>
    );
  }

  // Chart dimensions
  const chartWidth = Dimensions.get("window").width - 64; // Account for padding
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate min and max for Y-axis
  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 10; // Avoid division by zero

  // Add some padding to Y-axis range
  const yAxisMin = Math.floor(minWeight - weightRange * 0.1);
  const yAxisMax = Math.ceil(maxWeight + weightRange * 0.1);
  const yAxisRange = yAxisMax - yAxisMin;

  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate positions for each data point
  const points = sortedData.map((point, index) => {
    const x = (index / Math.max(sortedData.length - 1, 1)) * plotWidth;
    const y =
      plotHeight - ((point.weight - yAxisMin) / yAxisRange) * plotHeight;
    return { x, y, ...point };
  });

  // Format date for X-axis labels (show first, middle, last)
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Select dates to show on X-axis (first, middle, last)
  const xAxisDates =
    sortedData.length > 2
      ? [
          formatDate(sortedData[0].date),
          formatDate(sortedData[Math.floor(sortedData.length / 2)].date),
          formatDate(sortedData[sortedData.length - 1].date),
        ]
      : sortedData.map((d) => formatDate(d.date));

  return (
    <View
      testID="progress-chart"
      className={cn("bg-surface-dark rounded-2xl p-4", className)}
    >
      {/* Y-axis label */}
      <View className="absolute left-0 top-1/2 -rotate-90 origin-center">
        <Text className="text-xs font-medium text-text-muted">
          Weight (lbs)
        </Text>
      </View>

      {/* Chart container */}
      <View
        style={{
          width: chartWidth,
          height: chartHeight,
          position: "relative",
        }}
      >
        {/* Y-axis labels */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: padding.top,
            width: padding.left - 8,
            height: plotHeight,
          }}
        >
          <Text
            className="text-xs text-text-muted absolute top-0 right-0"
            style={{ transform: [{ translateY: -6 }] }}
          >
            {yAxisMax}
          </Text>
          <Text
            className="text-xs text-text-muted absolute bottom-0 right-0"
            style={{ transform: [{ translateY: 6 }] }}
          >
            {yAxisMin}
          </Text>
        </View>

        {/* Plot area */}
        <View
          style={{
            position: "absolute",
            left: padding.left,
            top: padding.top,
            width: plotWidth,
            height: plotHeight,
          }}
        >
          {/* Grid lines */}
          <View className="absolute inset-0">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <View
                key={i}
                className="absolute w-full h-[1px] bg-white/5"
                style={{ top: ratio * plotHeight }}
              />
            ))}
          </View>

          {/* Line connecting points */}
          {points.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = points[index - 1];

            // Calculate line angle and length
            const dx = point.x - prevPoint.x;
            const dy = point.y - prevPoint.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            return (
              <View
                key={`line-${index}`}
                className="absolute bg-primary h-[2px]"
                style={{
                  left: prevPoint.x,
                  top: prevPoint.y,
                  width: length,
                  transform: [
                    { rotate: `${angle}rad` },
                    { translateY: -1 },
                  ],
                }}
              />
            );
          })}

          {/* Data points */}
          {points.map((point, index) => (
            <View
              key={`point-${index}`}
              className="absolute w-3 h-3 rounded-full bg-primary border-2 border-background-dark"
              style={{
                left: point.x - 6,
                top: point.y - 6,
              }}
            />
          ))}
        </View>

        {/* X-axis labels */}
        <View
          style={{
            position: "absolute",
            left: padding.left,
            bottom: 0,
            width: plotWidth,
            height: padding.bottom,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {xAxisDates.map((date, index) => (
            <Text
              key={`x-label-${index}`}
              className="text-xs text-text-muted"
            >
              {date}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
