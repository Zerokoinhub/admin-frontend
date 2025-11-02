"use client"

import React, { useMemo, useState, useEffect } from 'react';
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

// Helper to get ISO week number
function getISOWeek(date) {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNum;
}

// Custom hook for responsive breakpoints
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  return { windowSize, isMobile, isTablet, isDesktop };
};

export default function UserGrowthChart({ users = [] }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Responsive configuration
  const config = useMemo(() => ({
    chart: {
      height: isMobile ? "280px" : isTablet ? "320px" : "380px",
      margins: isMobile 
        ? { top: 10, right: 10, left: 5, bottom: 5 }
        : isTablet 
        ? { top: 15, right: 20, left: 10, bottom: 5 }
        : { top: 20, right: 30, left: 20, bottom: 5 },
      strokeWidth: isMobile ? 2 : 3,
      dotRadius: isMobile ? 3 : 4,
      activeDotRadius: isMobile ? 5 : 6,
    },
    text: {
      title: isMobile ? "text-2xl" : isTablet ? "text-3xl" : "text-4xl",
      axis: isMobile ? 10 : isTablet ? 11 : 12,
      tooltip: isMobile ? "12px" : "14px",
      footer: isMobile ? "text-xs" : "text-sm",
    },
    spacing: {
      padding: isMobile ? "px-3" : "px-6",
      headerPadding: isMobile ? "px-3 py-3" : "px-6 py-4",
      contentPadding: isMobile ? "px-3 pb-3" : "px-6 pb-4",
    },
  }), [isMobile, isTablet, isDesktop]);

  const chartData = useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) {
      return [];
    }

    const weekMap = new Map();
    
    for (const user of users) {
      if (!user.createdAt) continue;
      
      try {
        const week = getISOWeek(user.createdAt);
        weekMap.set(week, (weekMap.get(week) || 0) + 1);
      } catch (error) {
        console.warn('Invalid date format for user:', user);
        continue;
      }
    }

    if (weekMap.size === 0) {
      return [];
    }

    const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0]);
    const maxWeek = Math.max(...sortedWeeks.map(([week]) => week));

    return sortedWeeks.map(([week, count]) => ({
      period: isMobile ? `W${week}` : `Week ${week}`,
      fullPeriod: `Week ${week}`,
      users: count,
      highlight: week === maxWeek,
    }));
  }, [users, isMobile]);

  const totalUsers = users.length;

  // Format number based on screen size
  const formatNumber = (num) => {
    if (isMobile && num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return Intl.NumberFormat().format(num);
  };

  if (chartData.length === 0) {
    return (
      <Card 
        className="rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[280px]"
        style={{ height: config.chart.height }}
      >
        <CardHeader className={config.spacing.headerPadding}>
          <CardTitle className={`${config.text.title} font-bold text-gray-900`}>
            {formatNumber(totalUsers)} users
          </CardTitle>
        </CardHeader>
        <CardContent className={`${config.spacing.contentPadding} flex items-center justify-center h-[calc(100%-5rem)]`}>
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p className={config.text.footer}>No user growth data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className=""
      style={{ height: config.chart.height }}
    >
      <CardHeader className={config.spacing.headerPadding}>
        <CardTitle className={`${config.text.title} font-bold text-gray-900 transition-all duration-300`}>
          {formatNumber(totalUsers)} users
        </CardTitle>
      </CardHeader>

      <CardContent className={`${config.spacing.contentPadding} h-[calc(100%-5rem)] pt-2`}>
        <div className="h-[calc(100%-2rem)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={config.chart.margins}
            >
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4b5fd" stopOpacity={isMobile ? 0.2 : 0.3} />
                  <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <XAxis 
                dataKey="period" 
                hide={isMobile}
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: config.text.axis,
                  fill: "#6b7280"
                }}
                interval={isMobile ? 1 : 0}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: config.text.axis,
                  fill: "#6b7280"
                }}
                tickFormatter={(value) => isMobile ? `${value}` : `${value} users`}
                width={isMobile ? 25 : isTablet ? 35 : 45}
              />

              <Tooltip
                cursor={{ 
                  stroke: '#0e7490', 
                  strokeWidth: isMobile ? 1 : 2,
                  strokeDasharray: isMobile ? "3,3" : "5,5"
                }}
                formatter={(value) => [`${value} users`, 'Registrations']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return `Period: ${payload[0].payload.fullPeriod}`;
                  }
                  return `Period: ${label}`;
                }}
                contentStyle={{
                  //backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  //boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                  backdropFilter: 'blur(8px)',
                  fontSize: config.text.tooltip,
                  fontWeight: '500',
                  padding: isMobile ? '8px' : '12px',
                  maxWidth: isMobile ? '200px' : 'none',
                }}
                labelStyle={{
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: config.text.tooltip,
                }}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke="#0e7490"
                strokeWidth={config.chart.strokeWidth}
                fill="url(#userGradient)"
                dot={{ 
                  fill: '#0e7490', 
                  strokeWidth: isMobile ? 1 : 2, 
                  r: config.chart.dotRadius 
                }}
                activeDot={{ 
                  r: config.chart.activeDotRadius, 
                  fill: '#0e7490',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />

              {chartData.find((d) => d.highlight) && (
                <ReferenceLine
                  x={chartData.find((d) => d.highlight).period}
                  stroke="#84cc16"
                  strokeWidth={isMobile ? 1 : 2}
                  strokeDasharray="0"
                  label={!isMobile ? { value: "Peak", position: "top" } : undefined}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer with responsive layout */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 ${config.text.footer} text-gray-500 mt-2 transition-all duration-300`}>
          <span className="transition-all duration-300 hover:text-gray-700">
            User Growth Tracking
          </span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 transition-all duration-300 hover:text-green-600`}>
              ↗ +15.2% this month
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}