"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CategoryData {
  categoryId: string;
  categoryName: string;
  color: string | null;
  total: number;
}

interface CategoryDonutChartProps {
  data: CategoryData[];
  currency: string;
}

const DEFAULT_COLORS = [
  "#2E7D52", "#4CAF78", "#E53935", "#43A047",
  "#1976D2", "#FB8C00", "#8E24AA", "#00ACC1",
  "#E64A19", "#546E7A",
];

export default function CategoryDonutChart({
  data,
  currency,
}: CategoryDonutChartProps) {
  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted text-center py-8">
            No expense data this month
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 28;

  // Compute arcs
  let cumAngle = -Math.PI / 2;
  const arcs = data.map((item, idx) => {
    const fraction = total > 0 ? item.total / total : 0;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const color = item.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

    return {
      ...item,
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      color,
      fraction,
    };
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {arcs.map((arc, idx) => (
                <path
                  key={arc.categoryId ?? idx}
                  d={arc.d}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                />
              ))}
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                className="text-xs fill-text-muted"
                fontSize={10}
              >
                Total
              </text>
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                className="fill-text-primary font-semibold"
                fontSize={11}
              >
                {formatCurrency(currency, total)}
              </text>
            </svg>
          </div>

          <div className="w-full space-y-1.5">
            {arcs.map((arc, idx) => (
              <div key={arc.categoryId ?? idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: arc.color }}
                  />
                  <span className="text-text-primary truncate">{arc.categoryName}</span>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-text-muted text-xs">
                    {(arc.fraction * 100).toFixed(0)}%
                  </span>
                  <span className="text-text-primary font-medium">
                    {formatCurrency(currency, arc.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
