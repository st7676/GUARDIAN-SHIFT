import { describe, it, expect, beforeEach, vi } from 'vitest';
import API_CONFIG, { getAuthHeaders, debugLog, handleApiError } from '@/lib/api-config';

describe('API Config', () => {
  describe('API_CONFIG', () => {
    it('should have required properties', () => {
      expect(API_CONFIG).toHaveProperty('baseURL');
      expect(API_CONFIG).toHaveProperty('timeout');
      expect(API_CONFIG).toHaveProperty('useMockData');
      expect(API_CONFIG).toHaveProperty('endpoints');
    });

    it('should have default baseURL', () => {
      expect(API_CONFIG.baseURL).toBeDefined();
    });

    it('should have timeout set', () => {
      expect(API_CONFIG.timeout).toBeGreaterThan(0);
    });
  });

  describe('getAuthHeaders', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
    });

    it('should return empty object when no token', () => {
      localStorage.getItem.mockReturnValue(null);
      const headers = getAuthHeaders();
      expect(headers).toEqual({});
    });

    it('should return auth header when token exists', () => {
      localStorage.getItem.mockReturnValue('test-token');
      const headers = getAuthHeaders();
      expect(headers).toEqual({
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      });
    });
  });

  describe('debugLog', () => {
    it('should be a function', () => {
      expect(typeof debugLog).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => debugLog('test message')).not.toThrow();
    });
  });

  describe('handleApiError', () => {
    it('should handle response errors', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };

      const result = handleApiError(error);
      expect(result.status).toBe(404);
      expect(result.message).toBe('Not found');
    });

    it('should handle network errors', () => {
      const error = {
        request: {}
      };

      const result = handleApiError(error);
      expect(result.status).toBe(0);
      expect(result.message).toContain('Network error');
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');

      const result = handleApiError(error);
      expect(result.status).toBe(0);
      expect(result.message).toBe('Unknown error');
    });
  });
});
