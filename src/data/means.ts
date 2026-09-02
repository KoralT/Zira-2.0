import type { MeansItem } from './types';

// הקצאת אמצעים — דומיין חדש (איסוף / תקיפה / אש / תצפית). מקושר למבצעים הקיימים.
export const meansItems: MeansItem[] = [
  { id: 'me1', name: 'אמצעי איסוף KORAL-NORTH-01', type: 'collection', typeLabel: 'איסוף', status: 'allocated', relatedMissionId: 'm1', sourceId: 'src-collect' },
  { id: 'me2', name: 'אמצעי תקיפה STRIKE-03', type: 'strike', typeLabel: 'תקיפה', status: 'pending', relatedMissionId: 'm1', sourceId: 'src-fire' },
  { id: 'me3', name: 'אמצעי אש FIRE-SUPPORT-02', type: 'fire', typeLabel: 'אש', status: 'partial', relatedMissionId: 'm1', sourceId: 'src-fire' },
  { id: 'me4', name: 'אמצעי תצפית OBS-11', type: 'observation', typeLabel: 'תצפית', status: 'allocated', relatedMissionId: 'm3', sourceId: 'src-collect' },
  { id: 'me5', name: 'אמצעי איסוף EAST-04', type: 'collection', typeLabel: 'איסוף', status: 'unavailable', relatedMissionId: 'm2', sourceId: 'src-collect' },
];

export const meansForMission = (missionId?: string) =>
  missionId ? meansItems.filter(m => m.relatedMissionId === missionId) : meansItems;
