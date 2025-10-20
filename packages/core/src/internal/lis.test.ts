/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { longestIncreasingSubsequence, configureLIS } from './lis';

describe('Longest Increasing Subsequence Algorithm', () => {
  // Reset configuration before each test
  beforeEach(() => {
    configureLIS({ smallArrayThreshold: 64 });
  });

  describe('Basic Functionality', () => {
    it('should return an empty array for an empty input', () => {
      expect(longestIncreasingSubsequence([])).toEqual([]);
    });

    it('should handle a simple, already increasing sequence', () => {
      const seq = [0, 1, 2, 3, 4];
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should handle a simple decreasing sequence', () => {
      const seq = [4, 3, 2, 1, 0];
      // The LIS is any single element, algorithm picks the last
      expect(longestIncreasingSubsequence(seq)).toEqual([4]);
    });

    it('should find the LIS in a mixed sequence', () => {
      const seq = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(6);

      // Verify it's strictly increasing
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });
  });

  describe('Edge Cases - Single Element', () => {
    it('should handle single element array (small path)', () => {
      const seq = [42];
      expect(longestIncreasingSubsequence(seq)).toEqual([0]);
    });

    it('should handle single element with -1 (small path)', () => {
      const seq = [-1];
      expect(longestIncreasingSubsequence(seq)).toEqual([]);
    });

    it('should handle single element array (large path)', () => {
      // Force large path by setting threshold to 0
      configureLIS({ smallArrayThreshold: 0 });
      const seq = [42];
      expect(longestIncreasingSubsequence(seq)).toEqual([0]);
    });

    it('should handle single element with -1 (large path)', () => {
      configureLIS({ smallArrayThreshold: 0 });
      const seq = [-1];
      expect(longestIncreasingSubsequence(seq)).toEqual([]);
    });
  });

  describe('Sentinel Value Handling (-1)', () => {
    it('should handle negative values representing new items', () => {
      const seq = [0, -1, 1, -1, 2];
      // The -1 values should be ignored
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 2, 4]);
    });

    it('should handle edge case: all -1 values', () => {
      const seq = [-1, -1, -1];
      expect(longestIncreasingSubsequence(seq)).toEqual([]);
    });

    it('should handle -1 at the beginning', () => {
      const seq = [-1, -1, 1, 2, 3];
      expect(longestIncreasingSubsequence(seq)).toEqual([2, 3, 4]);
    });

    it('should handle -1 at the end', () => {
      const seq = [1, 2, 3, -1, -1];
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 1, 2]);
    });

    it('should handle -1 scattered throughout', () => {
      const seq = [-1, 5, -1, 10, -1, 15, -1, 20];
      expect(longestIncreasingSubsequence(seq)).toEqual([1, 3, 5, 7]);
    });

    it('should handle -1 in large arrays', () => {
      // Create an array > 64 elements with -1 scattered
      const seq = Array.from({ length: 100 }, (_, i) =>
        i % 3 === 0 ? -1 : i
      );
      const result = longestIncreasingSubsequence(seq);

      // Verify all indices are valid and not -1
      result.forEach(idx => {
        expect(seq[idx]).not.toBe(-1);
      });

      // Verify strictly increasing
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });
  });

  describe('Binary Search and Replacement', () => {
    it('should handle binary search and replacement correctly', () => {
      const seq = [10, 20, 5, 30, 15, 40];
      const result = longestIncreasingSubsequence(seq);

      // Should find an LIS of length 4
      expect(result).toHaveLength(4);

      // Verify strict increasing property
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle sequences with duplicate values', () => {
      const seq = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15, 15];
      const result = longestIncreasingSubsequence(seq);

      // Should find LIS of length 6
      expect(result).toHaveLength(6);

      // Verify strict increasing (duplicates cannot both be included)
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle multiple duplicates', () => {
      const seq = [1, 1, 1, 2, 2, 2, 3, 3, 3];
      const result = longestIncreasingSubsequence(seq);

      // Should find LIS: one of each value
      expect(result).toHaveLength(3);
      expect(seq[result[0]]).toBe(1);
      expect(seq[result[1]]).toBe(2);
      expect(seq[result[2]]).toBe(3);
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle null input', () => {
      expect(longestIncreasingSubsequence(null as any)).toEqual([]);
    });

    it('should handle undefined input', () => {
      expect(longestIncreasingSubsequence(undefined as any)).toEqual([]);
    });

    it('should handle non-array-like input', () => {
      expect(longestIncreasingSubsequence({} as any)).toEqual([]);
    });

    it('should handle input with invalid length', () => {
      expect(longestIncreasingSubsequence({ length: Infinity } as any)).toEqual([]);
    });

    it('should handle input with NaN length', () => {
      expect(longestIncreasingSubsequence({ length: NaN } as any)).toEqual([]);
    });
  });

  describe('Configuration', () => {
    it('should allow configuration of smallArrayThreshold', () => {
      configureLIS({ smallArrayThreshold: 10 });

      // Small array (< 10)
      const smallSeq = [1, 2, 3, 4, 5];
      expect(longestIncreasingSubsequence(smallSeq)).toEqual([0, 1, 2, 3, 4]);

      // Large array (>= 10)
      const largeSeq = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(longestIncreasingSubsequence(largeSeq)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should merge partial configuration', () => {
      // Set to a known value
      configureLIS({ smallArrayThreshold: 32 });

      // This should update only the specified property
      configureLIS({ smallArrayThreshold: 128 });

      // Verify with a medium-sized array
      const seq = Array.from({ length: 100 }, (_, i) => i);
      expect(longestIncreasingSubsequence(seq)).toHaveLength(100);
    });

    it('should force small path with threshold = Infinity', () => {
      configureLIS({ smallArrayThreshold: Infinity });

      // Even large arrays use small path
      const seq = Array.from({ length: 200 }, (_, i) => i);
      expect(longestIncreasingSubsequence(seq)).toHaveLength(200);
    });

    it('should force large path with threshold = 0', () => {
      configureLIS({ smallArrayThreshold: 0 });

      // Even tiny arrays use large path
      const seq = [1, 2, 3];
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 1, 2]);
    });
  });

  describe('Large Array Performance (TypedArray path)', () => {
    it('should handle large arrays efficiently', () => {
      const seq = Array.from({ length: 100 }, (_, i) => i);
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(100);
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });

    it('should handle large decreasing arrays', () => {
      const seq = Array.from({ length: 100 }, (_, i) => 100 - i);
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(1);
    });

    it('should handle large arrays with mixed patterns', () => {
      // Create a zigzag pattern
      const seq = Array.from({ length: 100 }, (_, i) =>
        i % 2 === 0 ? i : 100 - i
      );
      const result = longestIncreasingSubsequence(seq);

      // Verify result is valid
      expect(result.length).toBeGreaterThan(0);
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should utilize workBuffer when provided', () => {
      const seq = Array.from({ length: 100 }, (_, i) => i);
      const workBuffer = new Uint32Array(200);
      const result = longestIncreasingSubsequence(seq, workBuffer);
      expect(result).toHaveLength(100);
    });

    it('should work with insufficient workBuffer', () => {
      const seq = Array.from({ length: 100 }, (_, i) => i);
      const workBuffer = new Uint32Array(50); // Too small
      const result = longestIncreasingSubsequence(seq, workBuffer);
      expect(result).toHaveLength(100);
    });

    it('should handle large arrays with all -1 except a few', () => {
      const seq = Array.from({ length: 100 }, (_, i) =>
        i === 10 || i === 50 || i === 90 ? i : -1
      );
      const result = longestIncreasingSubsequence(seq);
      expect(result).toEqual([10, 50, 90]);
    });

    it('should handle large arrays where only first element is valid', () => {
      const seq = Array.from({ length: 100 }, (_, i) =>
        i === 0 ? 42 : -1
      );
      const result = longestIncreasingSubsequence(seq);
      expect(result).toEqual([0]);
    });

    it('should handle large arrays where only last element is valid', () => {
      const seq = Array.from({ length: 100 }, (_, i) =>
        i === 99 ? 42 : -1
      );
      const result = longestIncreasingSubsequence(seq);
      expect(result).toEqual([99]);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle threshold boundary (exactly 64 elements)', () => {
      const seq = Array.from({ length: 64 }, (_, i) => i);
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(64);
    });

    it('should handle just below threshold (63 elements)', () => {
      const seq = Array.from({ length: 63 }, (_, i) => i);
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(63);
    });

    it('should handle just above threshold (65 elements)', () => {
      const seq = Array.from({ length: 65 }, (_, i) => i);
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(65);
    });
  });

  describe('Reconstruction Edge Cases', () => {
    it('should handle reconstruction with no valid predecessors', () => {
      const seq = [5, 4, 3, 2, 1];
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(4); // Last element
    });

    it('should handle reconstruction with complex predecessor chain', () => {
      const seq = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const result = longestIncreasingSubsequence(seq);

      // Verify validity
      expect(result.length).toBeGreaterThan(0);
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('should handle large array with complex predecessor chain', () => {
      configureLIS({ smallArrayThreshold: 0 }); // Force large path

      const seq = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
      const result = longestIncreasingSubsequence(seq);

      // Verify validity
      expect(result.length).toBeGreaterThan(0);
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });
  });

  describe('Special Number Values', () => {
    it('should handle very large numbers', () => {
      const seq = [1e10, 2e10, 3e10];
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 1, 2]);
    });

    it('should handle very small numbers', () => {
      const seq = [-1e10, -2e10, -3e10];
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(1);
    });

    it('should handle mixed positive and negative (excluding -1)', () => {
      const seq = [-100, -50, 0, 50, 100];
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should handle floating point numbers', () => {
      const seq = [1.1, 2.2, 1.5, 3.3];
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(3);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });
  });

  describe('ArrayLike Structures', () => {
    it('should work with typed arrays', () => {
      const seq = new Int32Array([1, 2, 3, 4, 5]);
      expect(longestIncreasingSubsequence(seq)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should work with Float64Array', () => {
      const seq = new Float64Array([1.5, 2.5, 1.2, 3.5]);
      const result = longestIncreasingSubsequence(seq);
      expect(result).toHaveLength(3);
    });

    it('should work with array-like objects', () => {
      const seq = { 0: 1, 1: 2, 2: 3, length: 3 };
      expect(longestIncreasingSubsequence(seq as ArrayLike<number>)).toEqual([0, 1, 2]);
    });
  });

  describe('Branch Coverage - lo = 0 cases', () => {
    it('should handle element that becomes new smallest start (small path)', () => {
      // Sequence where a smaller element appears later
      // [10, 20, 5, 25] 
      // LIS: [10, 20, 25] is length 3, better than [5, 25] which is length 2
      // When we see 5, lo=0, it replaces position 0 (this triggers the lo=0 branch)
      const seq = [10, 20, 5, 25];
      const result = longestIncreasingSubsequence(seq);

      // The longest LIS is [10, 20, 25] at indices [0, 1, 3]
      expect(result).toEqual([0, 1, 3]);

      // Verify strictly increasing
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should trigger lo=0 branch with better example (small path)', () => {
      // Better example: [5, 4, 3, 6, 7]
      // When we see 4, then 3, they trigger lo=0 replacements
      // Final LIS: [3, 6, 7]
      const seq = [5, 4, 3, 6, 7];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([2, 3, 4]);
      expect(seq[result[0]]).toBe(3);
      expect(seq[result[1]]).toBe(6);
      expect(seq[result[2]]).toBe(7);
    });

    it('should handle multiple elements becoming new smallest start (small path)', () => {
      // Sequence: [100, 50, 25, 10, 5, 6, 7]
      // Each decreasing element triggers lo=0 replacement
      const seq = [100, 50, 25, 10, 5, 6, 7];
      const result = longestIncreasingSubsequence(seq);

      // Best LIS: [5, 6, 7]
      expect(result).toHaveLength(3);
      expect(result).toEqual([4, 5, 6]);
    });

    it('should handle element that becomes new smallest start (large path)', () => {
      // Force large path with array >= 64 elements
      // Create pattern where smaller elements appear later
      const seq = Array.from({ length: 70 }, (_, i) => {
        if (i < 65) return 100 + i; // Increasing sequence 100-164
        return i - 65; // Small numbers 0-4 at the end
      });

      const result = longestIncreasingSubsequence(seq);

      // The first 65 elements form the longest LIS (all increasing)
      expect(result).toHaveLength(65);

      // Verify validity
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle decreasing then increasing pattern (large path)', () => {
      // Pattern: Large numbers, then reset with small increasing sequence
      const seq = [
        ...Array.from({ length: 50 }, (_, i) => 100 - i), // 100 down to 51
        ...Array.from({ length: 30 }, (_, i) => i), // 0 up to 29
      ];

      const result = longestIncreasingSubsequence(seq);

      // Best LIS should be the increasing part at the end (30 elements)
      expect(result).toHaveLength(30);
      expect(result[0]).toBe(50); // Starts at index 50 (value 0)
    });

    it('should handle zigzag pattern starting high (small path)', () => {
      // [50, 1, 51, 2, 52, 3]
      // Small elements force lo=0, but the 50+ elements build longer sequence
      const seq = [50, 1, 51, 2, 52, 3];
      const result = longestIncreasingSubsequence(seq);

      // Best LIS: [50, 51, 52] or [1, 2, 3]
      expect(result).toHaveLength(3);

      // Verify validity
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle sequence starting with large value then small values (small path)', () => {
      // [1000, 1, 2, 3, 4, 5]
      // The 1 forces lo=0 replacement, then builds [1,2,3,4,5]
      const seq = [1000, 1, 2, 3, 4, 5];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle sequence starting with large value then small values (large path)', () => {
      configureLIS({ smallArrayThreshold: 0 }); // Force large path

      const seq = [1000, 1, 2, 3, 4, 5];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle alternating high-low pattern (small path)', () => {
      // [100, 1, 101, 2, 102, 3, 103]
      // Best LIS: [100, 101, 102, 103] or [1, 2, 3, 103]
      const seq = [100, 1, 101, 2, 102, 3, 103];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toHaveLength(4);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle alternating high-low pattern (large path)', () => {
      // Create large array with alternating pattern
      const seq = Array.from({ length: 100 }, (_, i) =>
        i % 2 === 0 ? 1000 + i : i / 2
      );

      const result = longestIncreasingSubsequence(seq);

      expect(result.length).toBeGreaterThan(0);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle strictly decreasing sequence (small path)', () => {
      // Each element forces lo=0 replacement
      const seq = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(9); // Last element (smallest value)
    });

    it('should handle strictly decreasing sequence (large path)', () => {
      const seq = Array.from({ length: 100 }, (_, i) => 100 - i);
      const result = longestIncreasingSubsequence(seq);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(99); // Last element (smallest value)
    });

    it('should handle U-shaped pattern (small path)', () => {
      // [10, 8, 6, 4, 2, 0, 2, 4, 6, 8, 10]
      // Decreasing forces lo=0, then increasing builds from lowest point
      const seq = [10, 8, 6, 4, 2, 0, 2, 4, 6, 8, 10];
      const result = longestIncreasingSubsequence(seq);

      // Best LIS: [0, 2, 4, 6, 8, 10] starting from index 5
      expect(result).toHaveLength(6);
      expect(seq[result[0]]).toBe(0);
      expect(result).toEqual([5, 6, 7, 8, 9, 10]);
    });

    it('should handle U-shaped pattern (large path)', () => {
      // Create large U-shaped array
      const halfway = 50;
      const seq = Array.from({ length: 100 }, (_, i) => {
        if (i < halfway) return halfway - i; // 50 down to 1
        return i - halfway; // 0 up to 49
      });

      const result = longestIncreasingSubsequence(seq);

      // Should find the increasing part (50 elements: 0 to 49)
      expect(result).toHaveLength(50);
      expect(result[0]).toBe(halfway); // Starts at index 50 (value 0)
    });

    it('should handle pyramid pattern (small path)', () => {
      // [0, 5, 10, 15, 10, 5, 0]
      const seq = [0, 5, 10, 15, 10, 5, 0];
      const result = longestIncreasingSubsequence(seq);

      // Best LIS: [0, 5, 10, 15]
      expect(result).toEqual([0, 1, 2, 3]);
    });

    it('should handle wave pattern forcing lo=0 multiple times (small path)', () => {
      // Each valley forces a lo=0 replacement
      const seq = [10, 5, 20, 3, 30, 1, 40];
      const result = longestIncreasingSubsequence(seq);

      // Trace: 10 -> [10,20] -> [10,20,30] -> [10,20,30,40]
      // or: 1 -> [1,40]
      // Best: [10, 20, 30, 40] or [5, 20, 30, 40] or [3, 30, 40]
      expect(result.length).toBeGreaterThan(0);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle wave pattern forcing lo=0 multiple times (large path)', () => {
      // Create large wave pattern
      const seq = Array.from({ length: 100 }, (_, i) => {
        const wave = Math.floor(i / 10);
        const pos = i % 10;
        if (pos < 5) return wave * 50 + pos * 10;
        return wave * 50 + (10 - pos) * 10;
      });

      const result = longestIncreasingSubsequence(seq);

      expect(result.length).toBeGreaterThan(0);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle single small value after larger values (small path)', () => {
      // [10, 20, 30, 1]
      // Best LIS is [10, 20, 30] with length 3
      const seq = [10, 20, 30, 1];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([0, 1, 2]);
    });

    it('should handle reconstruction with lo=0 predecessor chain (small path)', () => {
      // Ensure reconstruction works when first element has no predecessor
      const seq = [5, 1, 2, 3, 4];
      const result = longestIncreasingSubsequence(seq);

      // Should be [1, 2, 3, 4]
      expect(result).toEqual([1, 2, 3, 4]);
      expect(seq[result[0]]).toBe(1);
    });

    it('should handle reconstruction with lo=0 predecessor chain (large path)', () => {
      configureLIS({ smallArrayThreshold: 0 });

      const seq = [5, 1, 2, 3, 4];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([1, 2, 3, 4]);
      expect(seq[result[0]]).toBe(1);
    });

    it('should handle mixed pattern with -1 and lo=0 scenarios (small path)', () => {
      // Combine -1 skipping with lo=0 replacements
      const seq = [100, -1, 1, -1, 2, -1, 3];
      const result = longestIncreasingSubsequence(seq);

      // Should find [1, 2, 3] at indices [2, 4, 6]
      expect(result).toEqual([2, 4, 6]);
    });

    it('should handle mixed pattern with -1 and lo=0 scenarios (large path)', () => {
      // Large array with -1 and decreasing-then-increasing pattern
      const seq = Array.from({ length: 100 }, (_, i) => {
        if (i % 5 === 0) return -1;
        if (i < 50) return 100 - i;
        return i - 50;
      });

      const result = longestIncreasingSubsequence(seq);

      // Verify all results are not -1 and strictly increasing
      expect(result.length).toBeGreaterThan(0);
      result.forEach(idx => expect(seq[idx]).not.toBe(-1));

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should explicitly test lo=0 branch in small path', () => {
      // Simple case guaranteed to hit lo=0 branch
      // [3, 2, 1] - each element will trigger lo=0
      const seq = [3, 2, 1];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([2]); // Only element with value 1
    });

    it('should explicitly test lo=0 branch in large path', () => {
      configureLIS({ smallArrayThreshold: 0 });

      // Simple case guaranteed to hit lo=0 branch
      const seq = [3, 2, 1];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([2]); // Only element with value 1
    });
  });

  describe('Explicit Branch Coverage for lo = 0', () => {
    beforeEach(() => {
      configureLIS({ smallArrayThreshold: 64 });
    });

    it('should cover lo=0 branch in lis_small (line 67)', () => {
      // Simplest case: second element is smaller than first
      // This FORCES lo=0 when processing index 1
      const seq = [10, 5];
      const result = longestIncreasingSubsequence(seq);

      // Result is [1] (value 5) because it's the smallest starting point
      expect(result).toEqual([1]);
    });

    it('should cover lo=0 branch with three decreasing elements (small path)', () => {
      // Forces multiple lo=0 executions
      const seq = [30, 20, 10];
      const result = longestIncreasingSubsequence(seq);

      // Each element triggers lo=0, final result is [2] (value 10)
      expect(result).toEqual([2]);
    });

    it('should cover lo=0 branch in lis_large (line 129)', () => {
      // Force large path by making array size >= 64
      // Use decreasing sequence to trigger lo=0
      const seq = Array.from({ length: 65 }, (_, i) => 65 - i);
      const result = longestIncreasingSubsequence(seq);

      // All elements trigger lo=0, final LIS is just the last (smallest) element
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(64);
    });

    it('should cover lo=0 branch with minimal large array', () => {
      // Minimal large array with decreasing pattern
      configureLIS({ smallArrayThreshold: 2 }); // Force large path

      const seq = [10, 5];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([1]);
    });

    it('should cover reconstruction with no predecessor (line 175)', () => {
      // Create a sequence where the LIS starts with an element that has no predecessor
      // [100, 1, 2] -> LIS is [1, 2], and 1 has no predecessor
      const seq = [100, 1, 2];
      const result = longestIncreasingSubsequence(seq);

      expect(result).toEqual([1, 2]);
      expect(seq[result[0]]).toBe(1); // First element of LIS
    });

    it('should cover reconstruction with no predecessor in large path', () => {
      // Force large path
      const seq = Array.from({ length: 65 }, (_, i) => {
        if (i === 0) return 1000; // Large first element
        return i; // Then 1, 2, 3, ...
      });

      const result = longestIncreasingSubsequence(seq);

      // LIS should be [1, 2, 3, ..., 64] starting at index 1
      expect(result).toHaveLength(64);
      expect(result[0]).toBe(1);
      expect(seq[result[0]]).toBe(1); // First element has no predecessor
    });

    it('should cover all three branches with comprehensive test (small path)', () => {
      // Sequence designed to hit all branches:
      // - Element smaller than all previous (lo=0)
      // - Element with predecessor (lo>0)
      // - Reconstruction from element with no predecessor
      const seq = [50, 10, 20, 5, 30];
      const result = longestIncreasingSubsequence(seq);

      // When we hit 10: lo=0 (line 67 branch)
      // When we hit 20: lo=1 (normal branch)
      // When we hit 5: lo=0 again (line 67 branch)
      // When we hit 30: lo=2 (normal branch)
      // Reconstruction starts from element with no predecessor (line 175)

      expect(result.length).toBeGreaterThan(0);

      // Verify it's valid
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should cover all three branches with comprehensive test (large path)', () => {
      // Same pattern but forced to large path
      configureLIS({ smallArrayThreshold: 0 });

      const seq = [50, 10, 20, 5, 30];
      const result = longestIncreasingSubsequence(seq);

      expect(result.length).toBeGreaterThan(0);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should trigger lo=0 with interleaved pattern (small path)', () => {
      // Pattern that ensures lo=0 is hit multiple times
      // [5, 10, 3, 15, 1, 20]
      const seq = [5, 10, 3, 15, 1, 20];
      const result = longestIncreasingSubsequence(seq);

      // Element 3 triggers lo=0
      // Element 1 triggers lo=0
      // Reconstruction works from element with no predecessor

      expect(result.length).toBeGreaterThan(0);
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should trigger lo=0 with interleaved pattern (large path)', () => {
      // Create large version of interleaved pattern
      const basePattern = [5, 10, 3, 15, 1, 20];
      const seq = Array.from({ length: 70 }, (_, i) => {
        const patternIndex = i % basePattern.length;
        const offset = Math.floor(i / basePattern.length) * 100;
        return basePattern[patternIndex] + offset;
      });

      const result = longestIncreasingSubsequence(seq);

      expect(result.length).toBeGreaterThan(0);
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should handle edge case: two elements, second smaller (small path)', () => {
      const seq = [100, 1];
      const result = longestIncreasingSubsequence(seq);
      expect(result).toEqual([1]);
    });

    it('should handle edge case: two elements, second smaller (large path)', () => {
      configureLIS({ smallArrayThreshold: 0 });
      const seq = [100, 1];
      const result = longestIncreasingSubsequence(seq);
      expect(result).toEqual([1]);
    });
  });

  describe('Complete Branch Coverage', () => {
    it('should explicitly cover lo=0 and lo>0 branches in small path', () => {
      // This sequence guarantees both branches:
      // - First element: lo=0 (empty tails)
      // - Second element (larger): lo=1 (has predecessor)
      // - Third element (smaller): lo=0 (no predecessor)
      const seq = [5, 10, 3];
      const result = longestIncreasingSubsequence(seq);

      // Result should be [3, 10] or just [10] depending on final state
      expect(result.length).toBeGreaterThan(0);

      // Verify strictly increasing
      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should explicitly cover reconstruction with SENTINEL in large path', () => {
      configureLIS({ smallArrayThreshold: 0 }); // Force large path

      // Sequence where first LIS element has no predecessor
      const seq = [100, 1, 2, 3];
      const result = longestIncreasingSubsequence(seq);

      // Should reconstruct [1, 2, 3] where 1 has SENTINEL predecessor
      expect(result).toEqual([1, 2, 3]);
    });

    it('should cover all reconstruction paths with mixed predecessors', () => {
      configureLIS({ smallArrayThreshold: 0 });

      // Complex sequence: [10, 5, 20, 3, 30, 1, 40]
      // Forces multiple lo=0 and lo>0 scenarios
      const seq = [10, 5, 20, 3, 30, 1, 40];
      const result = longestIncreasingSubsequence(seq);

      expect(result.length).toBeGreaterThanOrEqual(3);

      for (let i = 1; i < result.length; i++) {
        expect(seq[result[i]]).toBeGreaterThan(seq[result[i - 1]]);
      }
    });

    it('should cover if seq.length == 0', () => {
      const seq: number[] = [];
      const result = longestIncreasingSubsequence(seq);

      expect(result.length).toBe(0);
    });
  });
});
