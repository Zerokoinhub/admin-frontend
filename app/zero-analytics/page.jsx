import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800">
        This section is under development
      </h1>
      <p className="text-gray-600 mt-2">
        We’re working hard to bring this feature to life. Please check back soon.
      </p>
    </div>
  );
};

export default Page;
