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
    <div className="w-64 h-screen bg-white border-r border-gray-200  py-6 flex flex-col">
      {/* Logo & Title */}
      <div className="flex items-center gap-2 text-xl px-9 font-semibold text-cyan-700 mb-6">
        <Image src="/logo.png" alt="Zerokoin Logo" width={33} height={33} />
        <span className='text-3xl'>Zerokoin</span>
      </div>

      <hr className="border-gray-300 mb-6" />

      {/* Navigation Links */}
      <nav>
        <ul className="space-y-2 px-4">
          <li>
            <MenuButton label="Dashboard" Icon={LayoutDashboard} path="/" />
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
      </nav>
    </div>
  );
}








