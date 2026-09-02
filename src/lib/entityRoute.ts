import type { EntityRef } from '../data/types';

export function resolveEntityRoute(ref: EntityRef): string | null {
  switch (ref.type) {
    case 'mission': return `/portfolio/${ref.id}`;
    case 'directive': return `/directives/${ref.id}`;
    default: return null;
  }
}
