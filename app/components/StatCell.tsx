'use client';
import React from 'react';
import { Version } from '../types';

export interface StatCellProps {
  value?: number;
  cap?: number;
  className?: string;
  version?: Version;
}

const StatCell = ({ value, cap, className, version }: StatCellProps): JSX.Element => {
  const displayValue = value ? (value % 1 === 0 ? value.toString() : value.toFixed(1)) : '-';
  const isCapped = (value && cap) ? value >= cap : false;

  const versionClass = (version && version !== Version.DEFAULT) ? `${version}-version` : '';
  const cappedClass = isCapped ? 'capped' : '';

  return (
    <td className={`text-center py-2 ${className}`}>
      <span className={`${versionClass} ${cappedClass}`}>
        {displayValue}
      </span>
    </td>
  );
};

export default StatCell;