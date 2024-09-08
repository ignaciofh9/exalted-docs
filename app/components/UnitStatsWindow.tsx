"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import StatsTable from "./StatsTable";
import ImageIcon from "./ImageIcon";

interface UnitStatsWindowProps {
  unitName: string;
  children?: React.ReactNode;
}

const UnitStatsWindow: React.FC<UnitStatsWindowProps> = ({
  unitName,
  children,
}) => {
  const childrenRef = useRef<HTMLDivElement>(null);

  const formatIconPath = (name: string) => {
    return `units/${name.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const linkPath = `/docs/${formatIconPath(unitName)}`;

  useEffect(() => {
    if (childrenRef.current) {
      const anchor = childrenRef.current.querySelector("a");
      if (anchor) {
        anchor.href = linkPath;
      }
    }
  }, [unitName, linkPath]);

  return (
    <div className="mb-4">
      <nav className="flex items-end space-x-2 my-0 not-prose">
        <Link href={linkPath} passHref>
          <ImageIcon
            iconPath={formatIconPath(unitName)}
            title={unitName}
            size={2.5}
            className="mr-0 cursor-pointer"
          />
        </Link>
        <div
          ref={childrenRef}
          className="block text-2xl font-bold leading-none -mb-[0.225rem]"
        >
          {children}
        </div>
      </nav>
      <StatsTable unitName={unitName} />
    </div>
  );
};

export default UnitStatsWindow;
