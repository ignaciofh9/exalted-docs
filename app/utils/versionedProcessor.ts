import { Versioned, Version, createVersioned, GameData } from "@/app/types";

function isVersionedLike(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    Object.keys(obj).some((key) =>
      Object.values(Version).includes(key as Version)
    )
  );
}

function recursivelyTransformVersionedInPlace(data: any): void {
  if (typeof data !== "object" || data === null) {
    return; // Nothing to transform for primitive values
  }

  if (Array.isArray(data)) {
    // Transform each element of the array in place
    for (let i = 0; i < data.length; i++) {
      recursivelyTransformVersionedInPlace(data[i]);
    }
    return;
  }

  if (isVersionedLike(data)) {
    // Transform Versioned-like object in place
    Object.setPrototypeOf(data, createVersioned({}));
    return;
  }

  // Regular object, recursively transform its properties
  for (const key of Object.keys(data)) {
    recursivelyTransformVersionedInPlace(data[key]);
  }
}

export function transformGameData(rawGameData: any): GameData {
  recursivelyTransformVersionedInPlace(rawGameData);
  return rawGameData as GameData;
}
