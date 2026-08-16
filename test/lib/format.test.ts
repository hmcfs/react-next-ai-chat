import { formatFileSize } from '@/lib/format';
import { describe, expect, it } from 'vitest';

describe('formatFileSize', () => {
  it('should return empty string for null/undefined', () => {
    expect(formatFileSize(null as unknown as number)).toBe('');
    expect(formatFileSize(undefined)).toBe('');
  });

  it('should return empty string for NaN', () => {
    expect(formatFileSize(NaN)).toBe('');
  });

  it('should format bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10240)).toBe('10.0 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(1048576 * 2)).toBe('2.0 MB');
  });

  it('should handle decimal precision', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});
