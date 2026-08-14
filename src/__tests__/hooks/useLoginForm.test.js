import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoginForm } from '@/hooks/useLoginForm';

describe('useLoginForm', () => {
  it('should initialize with empty values', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.name).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should update name value', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setName('John Doe');
    });

    expect(result.current.name).toBe('John Doe');
  });

  it('should update email value', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('john@example.com');
    });

    expect(result.current.email).toBe('john@example.com');
  });

  it('should validate empty fields', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      const isValid = result.current.validate();
      expect(isValid).toBe(false);
      expect(result.current.error).toBe('אנא מלא את כל הפרטים');
    });
  });

  it('should validate with filled fields', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setName('John Doe');
      result.current.setEmail('john@example.com');
      const isValid = result.current.validate();
      expect(isValid).toBe(true);
      expect(result.current.error).toBe('');
    });
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setError('Some error');
      result.current.reset();
    });

    expect(result.current.name).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.error).toBe('');
  });

  it('should check isValid prop', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.setName('John');
      result.current.setEmail('john@example.com');
    });

    expect(result.current.isValid).toBe(true);
  });
});
