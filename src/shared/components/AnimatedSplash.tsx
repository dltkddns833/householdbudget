import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SPLASH_BG = '#0D9488';

interface AnimatedSplashProps {
  isReady: boolean;
  onAnimationComplete: () => void;
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({
  isReady,
  onAnimationComplete,
}) => {
  const logoScale = useSharedValue(0.2);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const bgOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Entry: 로고 spring 등장 (0~500ms)
    logoScale.value = withSpring(1.0, { damping: 12, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 500 });

    // Entry: 앱 이름 슬라이드업 (300~700ms)
    titleOpacity.value = withTiming(1, { duration: 400 });
    titleTranslateY.value = withTiming(0, { duration: 400 });

    // Loop: gentle pulse (700ms 이후 시작)
    const pulseTimeout = setTimeout(() => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1000 }),
          withTiming(1.0, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }, 700);

    return () => clearTimeout(pulseTimeout);
  }, []);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !minTimeElapsed) return;

    // Exit: 200ms fade out
    logoScale.value = withTiming(1.2, { duration: 200 });
    logoOpacity.value = withTiming(0, { duration: 200 });
    titleOpacity.value = withTiming(0, { duration: 200 });
    bgOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, [isReady, minTimeElapsed]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * pulseScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, bgAnimatedStyle]}>
      <View style={styles.center}>
        <Animated.View style={logoAnimatedStyle}>
          <Image
            source={require('../../assets/splash_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          우리집 가계부
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BG,
    zIndex: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
