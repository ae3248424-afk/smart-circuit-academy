import { useEffect, useState } from 'react';
import { DIPLOMA_PASS, getLevel, type LevelId } from './diploma';

export type DiplomaAttempt = {
  id: string;
  levelId: LevelId;
  partIndex: number | null;
  correct: number;
  total: number;
  score: number;
  name: string;
  date: string;
};
const KEY = 'smart-lab-diploma-attempts-v1';
const EVENT = 'smart-lab-progress';

export function isAttempt(value: unknown): value is DiplomaAttempt {
  if (!value || typeof value !== 'object') return false;
  const a = value as Partial<DiplomaAttempt>;
  return typeof a.id === 'string' && typeof a.levelId === 'string' && !!getLevel(a.levelId)
    && (a.partIndex === null || (Number.isInteger(a.partIndex) && Number(a.partIndex) >= 0 && Number(a.partIndex) < 4))
    && typeof a.score === 'number' && a.score >= 0 && a.score <= 100
    && typeof a.total === 'number' && a.total > 0 && typeof a.correct === 'number'
    && a.correct >= 0 && a.correct <= a.total && typeof a.name === 'string' && typeof a.date === 'string';
}
export function readAttempts(): DiplomaAttempt[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(data) ? data.filter(isAttempt) : [];
  } catch { return []; }
}
export function saveAttempt(attempt: DiplomaAttempt) {
  localStorage.setItem(KEY, JSON.stringify([attempt, ...readAttempts()].slice(0, 100)));
  window.dispatchEvent(new Event(EVENT));
}
export function certificateAttempt(attempts: DiplomaAttempt[], levelId: LevelId, partIndex: number | null) {
  return attempts.find(a => a.levelId === levelId && a.partIndex === partIndex && a.score >= DIPLOMA_PASS);
}
export function parseExam(exam: string): number | null | undefined {
  if (exam === 'level') return null;
  return /^[1-4]$/.test(exam) ? Number(exam) - 1 : undefined;
}
export function useDiplomaProgress() {
  const [attempts, setAttempts] = useState<DiplomaAttempt[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const update = () => { setAttempts(readAttempts()); setLoaded(true); };
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(EVENT, update); window.removeEventListener('storage', update); };
  }, []);
  return { attempts, loaded };
}