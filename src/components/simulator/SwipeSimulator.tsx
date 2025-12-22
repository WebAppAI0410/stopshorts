/**
 * SwipeSimulator Component
 * Main swipe simulation with gesture handling and intervention trigger
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { FakeVideoScreen, TopBar, BottomNavBar } from './FakeVideoScreen';
import { APP_THEMES, FAKE_VIDEOS } from './appThemes';
import type { TargetAppId } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.15;

interface SwipeSimulatorProps {
  /** Selected app to simulate */
  appId: TargetAppId;
  /** Number of swipes before intervention */
  interventionAfterSwipes?: number;
  /** Called when intervention should trigger */
  onIntervention: () => void;
  /** Called when user swipes */
  onSwipe?: (swipeCount: number) => void;
}

export function SwipeSimulator({
  appId,
  interventionAfterSwipes = 3,
  onIntervention,
  onSwipe,
}: SwipeSimulatorProps) {
  const theme = APP_THEMES[appId];
  const insets = useSafeAreaInsets();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);

  const translateY = useSharedValue(0);

  const handleSwipeComplete = useCallback(() => {
    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);
    onSwipe?.(newSwipeCount);

    if (newSwipeCount >= interventionAfterSwipes) {
      // Trigger intervention
      onIntervention();
    } else {
      // Move to next video
      setCurrentVideoIndex((prev) => (prev + 1) % FAKE_VIDEOS.length);
    }
  }, [swipeCount, interventionAfterSwipes, onIntervention, onSwipe]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow upward swipes (negative Y)
      if (event.translationY < 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY < -SWIPE_THRESHOLD) {
        // Swipe detected - animate out and trigger callback
        translateY.value = withSpring(-SCREEN_HEIGHT, {
          damping: 20,
          stiffness: 200,
        });

        runOnJS(handleSwipeComplete)();

        // Reset position after animation
        setTimeout(() => {
          translateY.value = 0;
        }, 300);
      } else {
        // Return to original position
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  // Current video moves up (exits at top)
  const currentVideoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Next video starts below screen and moves up with current video (slides in from bottom)
  const nextVideoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: SCREEN_HEIGHT + translateY.value }],
  }));

  const currentVideo = FAKE_VIDEOS[currentVideoIndex];
  const nextVideo = FAKE_VIDEOS[(currentVideoIndex + 1) % FAKE_VIDEOS.length];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Next video - starts below screen, slides in from bottom */}
      <Animated.View style={[styles.videoContainer, nextVideoStyle]}>
        <FakeVideoScreen
          theme={theme}
          video={nextVideo}
          showSwipeHint={false}
          hideTopBar={true}
          hideBottomNav={true}
          bottomInset={insets.bottom}
        />
      </Animated.View>

      {/* Current video (on top, swipeable) - exits at top */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.videoContainer, currentVideoStyle]}>
          <FakeVideoScreen
            theme={theme}
            video={currentVideo}
            showSwipeHint={swipeCount < interventionAfterSwipes}
            hideTopBar={true}
            hideBottomNav={true}
            bottomInset={insets.bottom}
          />
        </Animated.View>
      </GestureDetector>

      {/* Fixed top bar overlay - on top of videos */}
      <View style={[styles.fixedTopBar, { paddingTop: insets.top }]}>
        <TopBar theme={theme} />
      </View>

      {/* Fixed bottom navigation bar - only for apps that have it */}
      {theme.hasBottomNav && (
        <View style={styles.fixedBottomNav}>
          <BottomNavBar theme={theme} bottomInset={insets.bottom} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  fixedTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  fixedBottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});

export default SwipeSimulator;
