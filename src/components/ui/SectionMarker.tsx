import React, { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

type SectionMarkerProps = {
    width?: number;
    color?: 'accent' | 'primary' | 'muted';
};

export const SectionMarker: React.FC<SectionMarkerProps> = ({
    width = 40,
    color = 'accent',
}) => {
    const { colors } = useTheme();
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(400, withTiming(1, { duration: 800 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        width: width * progress.value,
        opacity: progress.value,
    }));

    const bgColorMap = {
        accent: colors.accent,
        primary: colors.primary,
        muted: colors.textMuted,
    };

    return (
        <Animated.View
            style={[
                {
                    height: 3,
                    backgroundColor: bgColorMap[color],
                    borderRadius: 1.5,
                },
                animatedStyle,
            ]}
        />
    );
};
