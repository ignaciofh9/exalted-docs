import React from 'react';
import Image from 'next/image';

const SiteTitle: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src="/images/logo.png"
        alt="FE10 Exalted Logo"
        width={50}
        height={50}
        className="rounded-sm"
      />
      {/* <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        FE10 Exalted
      </span> */}
    </div>
  );
};

export default SiteTitle;