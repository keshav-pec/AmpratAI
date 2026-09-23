import type { Animation } from '@/lib/types';
import { s1Animations } from './s1';
import { s2Animations } from './s2';
import { s3Animations } from './s3';
import { s4Animations } from './s4';
import { s5Animations } from './s5';
import { s6Animations } from './s6';
import { s7Animations } from './s7';

export const animations: Animation[] = [
  ...s1Animations, ...s2Animations, ...s3Animations, ...s4Animations, ...s5Animations,
  ...s6Animations, ...s7Animations,
];
