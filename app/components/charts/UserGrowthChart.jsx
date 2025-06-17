import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

const UserGrowthChart = () => {
  const userData = [
    { period: "Week 1", users: 22, highlight: false },
    { period: "Week 2", users: 28, highlight: false },
    { period: "Week 3", users: 35, highlight: false },
    { period: "Week 4", users: 32, highlight: false },
    { period: "Week 5", users: 30, highlight: false },
    { period: "Week 6", users: 38, highlight: false },
    { period: "Week 7", users: 42, highlight: false },
    { period: "Week 8", users: 45, highlight: true }, // Highlighted point
    { period: "Week 9", users: 48, highlight: false },
    { period: "Week 10", users: 52, highlight: false },
  ];

  return (
    <Card className="rounded-2xl shadow h-[42vh]">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-gray-900">128,7K users</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4.8rem)] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={userData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c4b5fd" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="period" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12 }}
              hide={true}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value} Zero Koin`}
              domain={[15, 55]}
            />
            <Tooltip 
              cursor={{ stroke: '#0e7490', strokeWidth: 2 }}
              formatter={(value) => [`${value} Zero Koin`, 'Users']}
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
            <ReferenceLine 
              x="Week 8" 
              stroke="#84cc16" 
              strokeWidth={2}
              strokeDasharray="0"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>User Growth Tracking</span>
          <span className="text-sm font-medium text-gray-700">↗ +15.2% this month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGrowthChart;