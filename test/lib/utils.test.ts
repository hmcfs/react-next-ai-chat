import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('should merge tailwind classes', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('should filter falsy values', () => {
    const result = cn('base', false && 'hidden', null, undefined, 'block');
    expect(result).toBe('base block');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle single class', () => {
    const result = cn('flex');
    expect(result).toBe('flex');
  });

  it('should resolve tailwind conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('btn', isActive && 'btn-active');
    expect(result).toBe('btn btn-active');
  });

  it('should handle disabled conditional classes', () => {
    const isActive = false;
    const result = cn('btn', isActive && 'btn-active');
    expect(result).toBe('btn');
  });
});
