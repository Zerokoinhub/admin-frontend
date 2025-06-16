'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MenuButton = ({ label, Icon, path }) => {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link href={path}>
      <div
        className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
          isActive ? 'bg-cyan-700 text-white' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </div>
    </Link>
  );
};

export default MenuButton;
