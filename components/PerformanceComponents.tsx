import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  frameDrops: number;
  loadTime: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = __DEV__,
  onMetrics,
}) => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    frameDrops: 0,
    loadTime: 0,
  });
  const renderStartTime = useRef<number>(performance.now());
  const frameCount = useRef<number>(0);
  const droppedFrames = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    
    const measureRenderTime = () => {
      const endTime = performance.now();
      const renderTime = endTime - renderStartTime.current;
      
      const newMetrics = {
        ...metrics,
        renderTime,
        loadTime: endTime - startTime,
      };
      
      setMetrics(newMetrics);
      onMetrics?.(newMetrics);
    };

    // Measure after first render
    const timeoutId = setTimeout(measureRenderTime, 0);

    return () => clearTimeout(timeoutId);
  }, [enabled, onMetrics]);

  if (!enabled) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Performance Metrics
      </Text>
      <Text style={[styles.metric, { color: theme.colors.textSecondary }]}>
        Render: {metrics.renderTime.toFixed(2)}ms
      </Text>
      <Text style={[styles.metric, { color: theme.colors.textSecondary }]}>
        Load: {metrics.loadTime.toFixed(2)}ms
      </Text>
      <Text style={[styles.metric, { color: theme.colors.textSecondary }]}>
        Dropped frames: {metrics.frameDrops}
      </Text>
    </View>
  );
};

interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  onLoad?: () => void;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder,
  threshold = 100,
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<View>(null);

  useEffect(() => {
    // Simulate intersection observer for React Native
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
        onLoad?.();
      }, threshold);

      return () => clearTimeout(loadTimer);
    }
  }, [isVisible, isLoaded, threshold, onLoad]);

  return (
    <View ref={elementRef} style={styles.lazyContainer}>
      {isLoaded ? children : placeholder}
    </View>
  );
};

interface MemoizedComponentProps<T = any> {
  data: T;
  render: (data: T) => React.ReactNode;
  keyExtractor?: (data: T) => string;
}

export function MemoizedComponent<T>({ 
  data, 
  render, 
  keyExtractor 
}: MemoizedComponentProps<T>) {
  const memoizedRender = React.useMemo(() => {
    return render(data);
  }, [data, render]);

  return (
    <View key={keyExtractor?.(data)}>
      {memoizedRender}
    </View>
  );
}

interface OptimizedScrollViewProps {
  children: React.ReactNode;
  itemHeight?: number;
  windowSize?: number;
  onScroll?: (offset: number) => void;
}

export const OptimizedScrollView: React.FC<OptimizedScrollViewProps> = ({
  children,
  itemHeight = 100,
  windowSize = 10,
  onScroll,
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const childrenArray = React.Children.toArray(children);

  const visibleStartIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - windowSize);
  const visibleEndIndex = Math.min(
    childrenArray.length - 1,
    Math.ceil((scrollOffset + 600) / itemHeight) + windowSize // Assuming 600px viewport height
  );

  const visibleChildren = childrenArray.slice(visibleStartIndex, visibleEndIndex + 1);

  const handleScroll = (event: any) => {
    const newOffset = event.nativeEvent.contentOffset.y;
    setScrollOffset(newOffset);
    onScroll?.(newOffset);
  };

  return (
    <View style={styles.optimizedScrollView}>
      {/* Spacer for items before visible window */}
      <View style={{ height: visibleStartIndex * itemHeight }} />
      
      {visibleChildren.map((child, index) => (
        <View key={visibleStartIndex + index} style={{ height: itemHeight }}>
          {child}
        </View>
      ))}
      
      {/* Spacer for items after visible window */}
      <View style={{ 
        height: (childrenArray.length - visibleEndIndex - 1) * itemHeight 
      }} />
    </View>
  );
};

interface CacheProviderProps {
  children: React.ReactNode;
  maxSize?: number;
}

const CacheContext = React.createContext<{
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  clear: () => void;
} | null>(null);

export const CacheProvider: React.FC<CacheProviderProps> = ({ 
  children, 
  maxSize = 100 
}) => {
  const cache = useRef(new Map<string, any>());

  const get = (key: string) => cache.current.get(key);
  
  const set = (key: string, value: any) => {
    if (cache.current.size >= maxSize) {
      // Remove oldest entry (FIFO)
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }
    cache.current.set(key, value);
  };

  const clear = () => cache.current.clear();

  return (
    <CacheContext.Provider value={{ get, set, clear }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = React.useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 8,
    borderRadius: 4,
    minWidth: 150,
    zIndex: 9999,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metric: {
    fontSize: 10,
    marginBottom: 2,
  },
  lazyContainer: {
    flex: 1,
  },
  optimizedScrollView: {
    flex: 1,
  },
});
