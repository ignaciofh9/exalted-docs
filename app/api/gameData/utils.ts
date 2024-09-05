// docs/exalted-docs/app/api/gameData/utils.ts

import { Version, Versioned } from "@/app/types";

export function parseIntSafe(
  value: string | undefined,
  defaultValue: any = null
): number | typeof defaultValue {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function parseFloatSafe(
  value: string | undefined,
  defaultValue: any = null
): number | typeof defaultValue {
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function updateVersionedValue<T>(
  versioned: Versioned<T>,
  value: T,
  version: Version
) {
  const defaultValue = versioned.get(Version.DEFAULT);

  // Helper function for deep equality check, order-independent for objects and arrays
  function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      // Sort both arrays and compare
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      for (let i = 0; i < sortedA.length; i++) {
        if (!isEqual(sortedA[i], sortedB[i])) return false;
      }
      return true;
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      // Compare keys without regard to order
      if (!isEqual(keysA.sort(), keysB.sort())) return false;
      // Compare values
      for (let key of keysA) {
        if (!isEqual(a[key], b[key])) return false;
      }
      return true;
    }

    return false;
  }

  // If it's the DEFAULT version or the value is different from the default
  if (version === Version.DEFAULT || !isEqual(defaultValue, value)) {
    // For arrays or objects, we want to create a new instance to ensure a new identity
    if (Array.isArray(value)) {
      versioned[version] = [...value] as T;
    } else if (typeof value === 'object' && value !== null) {
      versioned[version] = {...value} as T;
    } else {
      versioned[version] = value;
    }
  }
}
