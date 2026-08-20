"use client";

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; count: number };

export function BarChartCard({
  title,
  data,
  color = "#0d4029",
}: {
  title: string;
  data: Point[];
  color?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 h-64">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted">
            No data in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
