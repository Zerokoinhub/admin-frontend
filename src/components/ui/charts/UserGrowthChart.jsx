"use client"

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { parseISO } from 'date-fns';

// Helper to get ISO week number
function getISOWeek(date) {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNum;
}

export default function UserGrowthChart({ users }) {
  const chartData = useMemo(() => {
    const weekMap = new Map();

    for (const user of users) {
      const week = getISOWeek(user.createdAt);
      weekMap.set(week, (weekMap.get(week) || 0) + 1);
    }

    const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0]);

    const maxWeek = Math.max(...sortedWeeks.map(([week]) => week));

    return sortedWeeks.map(([week, count]) => ({
      period: `Week ${week}`,
      users: count,
      highlight: week === maxWeek,
    }));
  }, [users]);

  const totalUsers = users.length;

  return (
    <Card className="rounded-2xl shadow h-[42vh]">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-gray-900">
          {Intl.NumberFormat().format(totalUsers)} users
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4.8rem)] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c4b5fd" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" hide />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value} users`}
            />
            <Tooltip
              cursor={{ stroke: '#0e7490', strokeWidth: 2 }}
              formatter={(value) => [`${value} users`, 'Registrations']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#0e7490"
              strokeWidth={3}
              fill="url(#userGradient)"
              dot={{ fill: '#0e7490', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#0e7490' }}
            />
            {chartData.find((d) => d.highlight) && (
              <ReferenceLine
                x={chartData.find((d) => d.highlight).period}
                stroke="#84cc16"
                strokeWidth={2}
                strokeDasharray="0"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>User Growth Tracking</span>
          <span className="text-sm font-medium text-gray-700">↗ +15.2% this month</span>
        </div>
      </CardContent>
    </Card>
  );
}
