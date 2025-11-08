import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { StockDataPoint } from '@shared/types';
interface StockChartProps {
  data: StockDataPoint[];
}
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Price
            </span>
            <span className="font-bold text-foreground">
              ${payload[0].value.toFixed(2)}
            </span>
          </div>
        </div>
        {data.isPrediction && (
            <div className="mt-2 text-center text-xs text-blue-500">(Predicted)</div>
        )}
      </div>
    );
  }
  return null;
};
export function StockChart({ data }: StockChartProps) {
  const { isDark } = useTheme();
  const historicalData = data.filter((p) => !p.isPrediction);
  const predictionData = data.filter((p) => p.isPrediction);
  // To connect the last historical point with the first prediction point
  const fullPredictionData = historicalData.length > 0 ? [historicalData[historicalData.length - 1], ...predictionData] : predictionData;
  const formatYAxis = (tickItem: number) => `$${tickItem.toFixed(0)}`;
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "hsl(var(--muted))" : "hsl(var(--border))"} />
        <XAxis 
          dataKey="date" 
          stroke={isDark ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={isDark ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))"}
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="price"
          data={historicalData}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="Historical Price"
        />
        <Line
          type="monotone"
          dataKey="price"
          data={fullPredictionData}
          stroke="hsl(217 91% 60%)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Predicted Price"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}