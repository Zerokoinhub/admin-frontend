'use client';

import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Wallet,
  User,
  Book,
  Trophy,
  Calculator,
  Settings,
} from 'lucide-react';
import MenuButton from './MenuButton';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r p-4">
      <div className="flex items-center space-x-2 text-xl font-bold mb-8 text-cyan-700">
        <Image src="/logo.png" alt="Zerokoin Logo" width={30} height={30} />
        <span>Zerokoin</span>
      </div>
    <hr/>
      <ul className="space-y-3">
        <li>
          <MenuButton label="Dashboard" Icon={LayoutDashboard} path="/dashboard" />
        </li>
        <li>
          <MenuButton label="User Management" Icon={Users} path="/user-management" />
        </li>
        <li>
          <MenuButton label="Coin Transfer" Icon={Wallet} path="/coin-transfer" />
        </li>
        <li>
          <MenuButton label="User Profile" Icon={User} path="/user-profile" />
        </li>
        <li>
          <MenuButton label="Course Management" Icon={Book} path="/course-management" />
        </li>
        <li>
          <MenuButton label="Rewards System" Icon={Trophy} path="/rewards-system" />
        </li>
        <li>
          <MenuButton label="Calculator" Icon={Calculator} path="/calculator" />
        </li>
        <li>
          <MenuButton label="Setting" Icon={Settings} path="/setting" />
        </li>
      </ul>
    </div>
  );
}
