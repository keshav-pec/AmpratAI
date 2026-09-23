import type { Animation } from '@/lib/types';
import { s1Animations } from './s1';
import { s2Animations } from './s2';
import { s3Animations } from './s3';
import { s4Animations } from './s4';

export const animations: Animation[] = [...s1Animations, ...s2Animations, ...s3Animations, ...s4Animations];
