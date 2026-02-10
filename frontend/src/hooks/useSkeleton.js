import { useState } from 'react';

export function useSkeleton(count = 6) {
  return Array.from({ length: count }, (_, i) => i);
}
