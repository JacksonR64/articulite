import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Mock storage event
const mockStorageEvent = (key: string, newValue: string) => {
  window.dispatchEvent(
    new StorageEvent('storage', {
      key,
      newValue,
    })
  );
};

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock console.error to prevent output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should use initial value when localStorage is empty', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', { data: 'initialValue' })
    );
    
    expect(result.current[0]).toEqual({ data: 'initialValue' });
    expect(result.current[2]).toBe(false); // Third value indicates if value came from localStorage
  });

  test('should persist value to localStorage', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', { data: 'initialValue' })
    );
    
    act(() => {
      result.current[1]({ data: 'updatedValue' });
    });
    
    expect(result.current[0]).toEqual({ data: 'updatedValue' });
    expect(window.localStorage.getItem('testKey')).toBe(JSON.stringify({ data: 'updatedValue' }));
    expect(result.current[2]).toBe(true); // Value now exists in localStorage
  });

  test('should update state when storage changes in another tab', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', { data: 'initialValue' })
    );
    
    // Simulate storage event from another tab
    act(() => {
      mockStorageEvent('testKey', JSON.stringify({ data: 'valueFromAnotherTab' }));
    });
    
    expect(result.current[0]).toEqual({ data: 'valueFromAnotherTab' });
  });

  test('should use functional updates', () => {
    const { result } = renderHook(() => 
      useLocalStorage<number>('counterKey', 0)
    );
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem('counterKey')).toBe('1');
  });

  test('should handle JSON parsing errors', () => {
    // Manually set invalid JSON in localStorage
    window.localStorage.setItem('invalidKey', '{invalid:json}');
    
    const { result } = renderHook(() => 
      useLocalStorage('invalidKey', 'fallbackValue')
    );
    
    expect(result.current[0]).toBe('fallbackValue');
    expect(console.error).toHaveBeenCalled();
  });

  test('should handle localStorage.setItem errors', () => {
    // Mock localStorage.setItem to throw error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn().mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    
    const { result } = renderHook(() => 
      useLocalStorage('errorKey', 'initialValue')
    );
    
    act(() => {
      result.current[1]('newValue');
    });
    
    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('newValue');
    expect(console.error).toHaveBeenCalled();
    
    // Restore original implementation
    Storage.prototype.setItem = originalSetItem;
  });
}); 