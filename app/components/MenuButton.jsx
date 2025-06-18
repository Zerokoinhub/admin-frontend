'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const MenuButton = ({ label, Icon, path, onClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === path;

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(); // Close sidebar first
    router.push(path);      // Then navigate
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
        isActive ? 'bg-cyan-700 text-white' : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

export default MenuButton;
