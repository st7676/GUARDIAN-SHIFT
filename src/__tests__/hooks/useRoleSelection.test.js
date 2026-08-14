import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoleSelection } from '@/hooks/useRoleSelection';

describe('useRoleSelection', () => {
  it('should initialize with default role', () => {
    const { result } = renderHook(() => useRoleSelection());

    expect(result.current.role).toBe('regular');
    expect(result.current.isHeadNurse).toBe(false);
  });

  it('should initialize with custom default role', () => {
    const { result } = renderHook(() => useRoleSelection('head'));

    expect(result.current.role).toBe('head');
    expect(result.current.isHeadNurse).toBe(true);
  });

  it('should change role to head nurse', () => {
    const { result } = renderHook(() => useRoleSelection());

    act(() => {
      result.current.setRole('head');
    });

    expect(result.current.role).toBe('head');
    expect(result.current.isHeadNurse).toBe(true);
  });

  it('should change role back to regular', () => {
    const { result } = renderHook(() => useRoleSelection('head'));

    act(() => {
      result.current.setRole('regular');
    });

    expect(result.current.role).toBe('regular');
    expect(result.current.isHeadNurse).toBe(false);
  });

  it('should have ROLES constants', () => {
    const { result } = renderHook(() => useRoleSelection());

    expect(result.current.ROLES.REGULAR).toBe('regular');
    expect(result.current.ROLES.HEAD).toBe('head');
  });
});
