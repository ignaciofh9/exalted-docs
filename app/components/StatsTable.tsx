// docs/exalted-docs/app/components/StatsTable.tsx
"use client";
import React, { useState, useMemo } from "react";
import {
  GrowthStat,
  NonGrowthStat,
} from "@/app/types";
import LevelInput from "./LevelInput";
import StatCell from "./StatCell";
import { useGameData } from "@/app/GameDataContext";
import StatsSkeleton from "./StatsSkeleton";

interface Props {
  unitName: string;
}

const StatsTable: React.FC<Props> = ({ unitName }) => {
  const { gameData, currentVersion, isLoading, error } = useGameData();
  const [levels, setLevels] = useState<number[]>([]);

  const unitData = useMemo(() => {
    if (!gameData || !unitName) return null;
    return gameData.units[unitName] || null;
  }, [gameData, unitName]);

  useMemo(() => {
    if (unitData && unitData.tiers) {
      setLevels(
        unitData.tiers.map((tier) => {
          const defaultLevel =
            tier.defaultPromoLevel.get(currentVersion) ??
            (unitData.isLaguz ? 40 : 10);

          if (unitData.isLaguz) {
            const laguzCaps = [15, 23, 30, 45];
            return Math.max(Math.min(defaultLevel, laguzCaps[tier.tierIndex]), unitData.baseLevel.get(currentVersion) || 1);
          } else {
            return Math.min(defaultLevel, 20);
          }
        })
      );
    }
  }, [unitData]);

  const growthStatHeaders = Object.values(GrowthStat);

  const calculateStats = () => {
    if (!unitData) return null;

    let currentStats = Object.fromEntries(
      Object.entries(unitData.baseStats).map(([stat, value]) => [
        stat,
        value.get(currentVersion) || 0,
      ])
    );

    return unitData.tiers.map((tier, index) => {
      const level = levels[index];
      let tierStats: Record<string, number> = { ...currentStats };

      // Calculate growth-based stats
      Object.values(GrowthStat).forEach((stat) => {
        const baseValue = currentStats[stat];
        const growth = unitData.growths[stat].get(currentVersion) || 0;
        const cap = tier.caps[stat].get(currentVersion) || Infinity;

        const baseLevel = unitData.baseLevel.get(currentVersion) || 1;
        let withinTierLevel = level;

        if (unitData.isLaguz) {
          if (index == 0) {
            withinTierLevel -= baseLevel;
          } else {
            withinTierLevel -= [1, 15, 23, 30][tier.tierIndex];
          }
        } else {
          if (index == 0) {
            withinTierLevel -= baseLevel;
          } else {
            withinTierLevel -= 1;
          }
        }

        tierStats[stat] = Math.min(
          baseValue + withinTierLevel * (growth / 100),
          cap
        );
      });

      // Maintain non-growth stats
      Object.values(NonGrowthStat).forEach((stat) => {
        tierStats[stat] = currentStats[stat];
      });

      const promoBonuses: Record<string, number> = {};

      // Apply promotion bonuses for the current tier
      if (index < unitData.tiers.length - 1 && tier.statsPromo) {
        Object.entries(tier.statsPromo).forEach(([statType, versionedStat]) => {
          const promoBonus = versionedStat.get(currentVersion) || 0;
          promoBonuses[statType] = promoBonus;
        });
      }

      currentStats = Object.fromEntries(
        Object.entries(tierStats).map(([stat, value]) => [
          stat,
          value + (promoBonuses[stat] || 0),
        ])
      );

      return { tier, stats: tierStats };
    });
  };

  if (isLoading) return <StatsSkeleton />;
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;
  if (!unitData) return <div className="text-center">Unit not found</div>;

  const calculatedStats = calculateStats();
  const tierNames = ["T1", "T2", "T3", "T4"];

  return (
    <div className="font-sans w-[98%] mt-2 rounded-sm border border-neutral-300 dark:border-neutral-700/80 shadow-md overflow-hidden">
      <table className="w-full h-full my-0 not-prose">
        <thead>
          <tr className="bg-neutral-200 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-200 text-md">
            <th className="text-right pr-4 py-2 font-semibold w-[10em] border-r border-b border-neutral-300 dark:border-neutral-700/80">
              Stat
            </th>
            {growthStatHeaders.map((header, index) => (
              <th
                key={header}
                className={`w-16 text-center text-md py-2 font-semibold border-b border-neutral-300 dark:border-neutral-700/80 ${
                  index < growthStatHeaders.length - 1
                    ? "border-r"
                    : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800/25 text-neutral-900 dark:text-neutral-200">
          {/* Growth Rates Row */}
          <tr className="border-b border-neutral-300 dark:border-neutral-700/80">
            <td className="text-right pr-4 py-2 border-r border-neutral-300 dark:border-neutral-700/80">
              Growths
            </td>
            {growthStatHeaders.map((stat, index) => {
              const growthResult =
                unitData.growths[stat].getWithVersionInfo(currentVersion);
              return (
                <td
                  key={stat}
                  className={`text-center py-2 ${
                    index < growthStatHeaders.length - 1
                      ? "border-r border-neutral-300 dark:border-neutral-700/80"
                      : ""
                  } ${growthResult.version}-version`}
                >
                  {growthResult.value}%
                </td>
              );
            })}
          </tr>

          {/* Base Stats Row */}
          <tr className="border-none border-neutral-300 dark:border-neutral-700/80">
            <td className="text-right pr-4 py-2 border-b-4 border-r border-neutral-300 dark:border-neutral-700/80">
              Base (LV {unitData.baseLevel.get(currentVersion)})
            </td>
            {growthStatHeaders.map((stat, index) => {
              const baseStatResult =
                unitData.baseStats[stat].getWithVersionInfo(currentVersion);
              return (
                <td
                  key={stat}
                  className={`text-center py-2 border-b-4 border-neutral-300 dark:border-neutral-700/80 ${
                    index < growthStatHeaders.length - 1 ? "border-r" : ""
                  } ${baseStatResult.version}-version`}
                >
                  {baseStatResult.value}
                </td>
              );
            })}
          </tr>

          {/* Calculated Stats Rows */}
          {calculatedStats?.map(({ tier, stats }, index) => (
            <React.Fragment key={tier.name}>
              <tr className="border-y border-neutral-300 dark:border-neutral-700/80">
                <td className="text-right pr-4 py-2 border-r border-neutral-300 dark:border-neutral-700/80">
                  {tierNames[tier.tierIndex]} Avg (LV{" "}
                  <LevelInput
                    value={levels[index]}
                    onChange={(newLevel: number) =>
                      setLevels(
                        levels.map((l, i) => (i === index ? newLevel : l))
                      )
                    }
                    min={
                      index === 0
                        ? unitData.baseLevel.get(currentVersion) || 1
                        : unitData.isLaguz
                        ? [1, 15, 23, 30][tier.tierIndex]
                        : 1
                    }
                    max={
                      unitData.isLaguz ? [15, 23, 30, 45][tier.tierIndex] : 20
                    }
                  />
                  )
                </td>
                {growthStatHeaders.map((stat, statIndex) => (
                  <StatCell
                    key={stat}
                    value={stats[stat]}
                    cap={tier.caps[stat].get(currentVersion)}
                    className={
                      statIndex < growthStatHeaders.length - 1
                        ? "border-r border-neutral-300 dark:border-neutral-700/80"
                        : ""
                    }
                  />
                ))}
              </tr>
              <tr
                className={`text-[0.9375rem] border-neutral-300 dark:border-neutral-700/80`}
              >
                <td className="text-right pr-4 py-1 text-neutral-600 dark:text-neutral-400 border-r border-neutral-300 dark:border-neutral-700/80">
                  Caps
                </td>
                {growthStatHeaders.map((stat, statIndex) => {
                  const capResult =
                    tier.caps[stat].getWithVersionInfo(currentVersion);
                  return (
                    <td
                      key={stat}
                      className={`text-center py-1 text-neutral-600 dark:text-neutral-400 ${
                        statIndex < growthStatHeaders.length - 1
                          ? "border-r border-neutral-300 dark:border-neutral-700/80"
                          : ""
                      } ${capResult.version}-version`}
                    >
                      /{capResult.value}
                    </td>
                  );
                })}
              </tr>
              {index < unitData.tiers.length - 1 &&
                unitData.tiers[index].statsPromo && (
                  <tr
                    className={`text-[0.9375rem] ${
                      index < calculatedStats.length - 1 ? "border-b-4" : ""
                    } border-neutral-300 dark:border-neutral-700/80`}
                  >
                    <td className="text-right pr-4 py-1 text-neutral-600 dark:text-neutral-400 border-r border-1 border-neutral-300 dark:border-neutral-700/80">
                      Promo
                    </td>
                    {growthStatHeaders.map((stat, statIndex) => {
                      const promoBonusResult = tier.statsPromo?.[
                        stat
                      ]?.getWithVersionInfo(currentVersion) || {
                        value: 0,
                        version: currentVersion,
                      };
                      return (
                        <td
                          key={stat}
                          className={`text-center py-1 text-neutral-600 dark:text-neutral-400 ${
                            statIndex < growthStatHeaders.length - 1
                              ? "border-r border-1 border-neutral-300 dark:border-neutral-700/80"
                              : ""
                          } ${promoBonusResult.version}-version`}
                        >
                          +{promoBonusResult.value}
                        </td>
                      );
                    })}
                  </tr>
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;