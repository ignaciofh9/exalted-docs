import React from "react";
import Skeleton from "@/app/components/ui/Skeleton";

const StatsSkeleton = () => {
  const growthStatHeaders = [
    "HP",
    "Str",
    "Mag",
    "Skl",
    "Spd",
    "Lck",
    "Def",
    "Res",
  ];
  const numTiers = 3;

  return (
    <div className="font-sans w-[98%] mt-2 rounded-sm border border-neutral-300 dark:border-neutral-700/80 shadow-md overflow-hidden">
      <table className="w-full h-full my-0 not-prose">
        <thead>
          <tr className="bg-neutral-200 dark:bg-neutral-800/70">
            <th className="w-[10em] p-2">
              <Skeleton className="h-6 w-full" />
            </th>
            {growthStatHeaders.map((_, index) => (
              <th key={index} className="w-16 p-2">
                <Skeleton className="h-6 w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800/25">
          {/* Growth Rates Row */}
          <tr>
            <td className="p-2 border-r border-neutral-300 dark:border-neutral-700/80">
              <Skeleton className="h-6 w-full" />
            </td>
            {growthStatHeaders.map((_, index) => (
              <td
                key={index}
                className="p-2 border-r border-neutral-300 dark:border-neutral-700/80"
              >
                <Skeleton className="h-6 w-full" />
              </td>
            ))}
          </tr>
          {/* Base Stats Row */}
          <tr>
            <td className="p-2 border-r border-neutral-300 dark:border-neutral-700/80">
              <Skeleton className="h-6 w-full" />
            </td>
            {growthStatHeaders.map((_, index) => (
              <td
                key={index}
                className="p-2 border-r border-neutral-300 dark:border-neutral-700/80"
              >
                <Skeleton className="h-6 w-full" />
              </td>
            ))}
          </tr>
          {/* Tier Rows */}
          {[...Array(numTiers)].map((_, tierIndex) => (
            <React.Fragment key={tierIndex}>
              <tr>
                <td className="p-2 border-r border-neutral-300 dark:border-neutral-700/80">
                  <Skeleton className="h-6 w-full" />
                </td>
                {growthStatHeaders.map((_, index) => (
                  <td
                    key={index}
                    className="p-2 border-r border-neutral-300 dark:border-neutral-700/80"
                  >
                    <Skeleton className="h-6 w-full" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-1 border-r border-neutral-300 dark:border-neutral-700/80">
                  <Skeleton className="h-4 w-full" />
                </td>
                {growthStatHeaders.map((_, index) => (
                  <td
                    key={index}
                    className="p-1 border-r border-neutral-300 dark:border-neutral-700/80"
                  >
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-1 border-r border-neutral-300 dark:border-neutral-700/80">
                  <Skeleton className="h-4 w-full" />
                </td>
                {growthStatHeaders.map((_, index) => (
                  <td
                    key={index}
                    className="p-1 border-r border-neutral-300 dark:border-neutral-700/80"
                  >
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsSkeleton;
