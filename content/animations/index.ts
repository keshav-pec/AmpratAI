import type { Animation } from '@/lib/types';
import { s1Animations } from './s1';
import { s2Animations } from './s2';

export const animations: Animation[] = [...s1Animations, ...s2Animations];
