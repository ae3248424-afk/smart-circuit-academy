import { describe, expect, it } from 'vitest';
import { DIPLOMA_PASS, examQuestions, gradeExam, levels } from '@/lib/diploma';
import { certificateAttempt, parseExam, type DiplomaAttempt } from '@/lib/diploma-progress';

describe('diploma requirements', () => {
  it('has four levels', () => { expect(levels.map(l => l.id)).toEqual(['beginner', 'intermediate', 'advanced', 'expert']); });
  it.each(levels)('$id has four parts', level => { expect(level.parts).toHaveLength(4); });
  it.each(levels)('$id level exam has exactly 50 questions', level => { expect(examQuestions(level, null)).toHaveLength(50); });
  it.each(levels)('$id has an exam for every part', level => {
    level.parts.forEach((part, i) => {
      expect(examQuestions(level, i)).toHaveLength(13);
      expect(gradeExam(level, i, part.concepts.map(q => q.answer))).toEqual({ correct: 13, total: 13, score: 100 });
    });
  });
  it('grades 40 out of 50 as 80 percent', () => {
    const level = levels[0];
    if (!level) throw new Error('Missing beginner level');
    const answers = examQuestions(level, null).map((q, i) => i < 40 ? q.answer : (q.answer + 1) % 4);
    expect(gradeExam(level, null, answers)).toEqual({ correct: 40, total: 50, score: 80 });
  });
  it('requires every question to be answered', () => {
    const level = levels[0];
    if (!level) throw new Error('Missing beginner level');
    expect(() => gradeExam(level, null, [])).toThrow();
  });
  it('unlocks a certificate at 80 percent, not below', () => {
    expect(DIPLOMA_PASS).toBe(80);
    const a: DiplomaAttempt = { id: 'test', levelId: 'beginner', partIndex: null, score: 79, correct: 39, total: 50, name: 'Student', date: '2026-10-21' };
    expect(certificateAttempt([a], 'beginner', null)).toBeUndefined();
    expect(certificateAttempt([{ ...a, score: 80, correct: 40 }], 'beginner', null)?.score).toBe(80);
  });
  it('does not unlock other level or part certificates', () => {
    const a: DiplomaAttempt = { id: 'test', levelId: 'beginner', partIndex: 0, score: 100, correct: 13, total: 13, name: 'Student', date: '2026-10-21' };
    expect(certificateAttempt([a], 'beginner', null)).toBeUndefined();
    expect(certificateAttempt([a], 'intermediate', 0)).toBeUndefined();
  });
  it('accepts only a level exam or one of four parts', () => {
    expect(parseExam('level')).toBeNull();
    expect(parseExam('4')).toBe(3);
    expect(parseExam('5')).toBeUndefined();
    expect(parseExam('0')).toBeUndefined();
  });
});