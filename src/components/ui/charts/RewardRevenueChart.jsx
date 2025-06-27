import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Props type
const RewardRevenueChart = ({ users = [] }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Generate chart data from user `createdAt`
  const chartData = generateChartData(users);

  const totalRewardValue = users.length * 10; // Example reward logic
  const targetValue = totalRewardValue;

  // Animate value on mount/update
  useEffect(() => {
    setIsVisible(true);
    const duration = 2500;
    const steps = 60;
    const increment = targetValue / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCurrentValue(increment * step);
      if (step >= steps) {
        setCurrentValue(targetValue);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [animationKey, targetValue]);

  const handleRefresh = () => {
    setAnimationKey(prev => prev + 1);
    setCurrentValue(0);
    setIsVisible(false);
    setHoveredBar(null);
    setTimeout(() => setIsVisible(true), 100);
  };

  // Generate chart data logic
  function generateChartData(users) {
    const dayMap = {};
    const now = new Date();

    users.forEach((user) => {
      const created = new Date(user.createdAt);
      const day = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      const label = `Day ${9 - day}`;
      if (!dayMap[label]) {
        dayMap[label] = { baseRewards: 0, bonusRewards: 0, projectedRewards: 0 };
      }

      // Example logic — customize as needed
      dayMap[label].baseRewards += 5;
      dayMap[label].bonusRewards += 2;
      dayMap[label].projectedRewards += 7;
    });

    const result = [];
    for (let i = 1; i <= 9; i++) {
      const label = `Day ${i}`;
      result.push({
        period: label,
        ...dayMap[label] || {
          baseRewards: 0,
          bonusRewards: 0,
          projectedRewards: 0,
        },
      });
    }

    return result;
  }

  return (
    <Card className="rounded-2xl shadow h-[42vh]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={`text-2xl font-bold transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
          Rewards Revenue
        </CardTitle>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-xs bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 font-medium"
        >
          🔄 Refresh
        </button>
      </CardHeader>
      <CardContent className="pt-2 h-[calc(100%-3.8rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            key={animationKey}
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(e) => e?.activeLabel && setHoveredBar(e.activeLabel)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 35]} label={{ value: "Zero Koin", angle: -90, position: "insideLeft" }} />
            <Tooltip
              cursor={{
                fill: "rgba(59, 130, 246, 0.1)",
                stroke: "#3b82f6",
                strokeWidth: 2,
                strokeDasharray: "5,5"
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(8px)',
                fontSize: '14px',
                fontWeight: '500'
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              animationDuration={200}
            />
            <Bar dataKey="baseRewards" stackId="rewards" fill="#0e7490" animationBegin={0} animationDuration={1500} animationEasing="ease-out">
              {chartData.map((entry, index) => (
                <Cell key={`base-${index}`} fill={hoveredBar === entry.period ? "#0891b2" : "#0e7490"} />
              ))}
            </Bar>
            <Bar dataKey="bonusRewards" stackId="rewards" fill="#84cc16" animationBegin={500} animationDuration={1500} animationEasing="ease-out">
              {chartData.map((entry, index) => (
                <Cell key={`bonus-${index}`} fill={hoveredBar === entry.period ? "#65a30d" : "#84cc16"} />
              ))}
            </Bar>
            <Bar dataKey="projectedRewards" stackId="rewards" fill="#c4b5fd" radius={[8, 8, 0, 0]} animationBegin={1000} animationDuration={1500} animationEasing="ease-out">
              {chartData.map((entry, index) => (
                <Cell key={`projected-${index}`} fill={hoveredBar === entry.period ? "#a78bfa" : "#c4b5fd"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className={`flex items-center justify-between text-sm text-gray-500 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="transition-all duration-300 hover:text-gray-700 hover:scale-105">Current start: sending Koin</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 transition-all duration-300 hover:text-blue-600 tabular-nums">
              ${currentValue.toFixed(2)}
            </span>
            <div className={`w-2 h-2 rounded-full bg-green-500 transition-all duration-300 ${currentValue === targetValue ? 'animate-pulse' : ''}`}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardRevenueChart;
