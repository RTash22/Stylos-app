/**
 * Hook: useResponsive
 *
 * Provides layout breakpoints using useWindowDimensions.
 */
import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isTabletLandscape: boolean;
  isTabletPortrait: boolean;
}

const TABLET_MIN_WIDTH = 600;

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_MIN_WIDTH;
  const isLandscape = width > height;

  return {
    width,
    height,
    isPhone: !isTablet,
    isTablet,
    isTabletLandscape: isTablet && isLandscape,
    isTabletPortrait: isTablet && !isLandscape,
  };
}
