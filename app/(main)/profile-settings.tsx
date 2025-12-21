import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { useSettingsBack } from '../../src/hooks/useSettingsBack';
import type { AvatarIcon } from '../../src/types';

// Map avatar icon types to Ionicons names
const avatarIconMap: Record<AvatarIcon, keyof typeof Ionicons.glyphMap> = {
    person: 'person',
    happy: 'happy',
    heart: 'heart',
    star: 'star',
    rocket: 'rocket',
    leaf: 'leaf',
    flame: 'flame',
    diamond: 'diamond',
    shield: 'shield',
    sparkles: 'sparkles',
};

const avatarOptions: AvatarIcon[] = [
    'person',
    'happy',
    'heart',
    'star',
    'rocket',
    'leaf',
    'flame',
    'diamond',
    'shield',
    'sparkles',
];

export default function ProfileSettingsScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { userName, userAvatar, setUserName, setUserAvatar } = useAppStore();
    const handleBack = useSettingsBack();

    const [editingName, setEditingName] = useState(userName || '');
    const [selectedAvatar, setSelectedAvatar] = useState<AvatarIcon>(userAvatar);

    const handleSaveName = () => {
        if (editingName.trim().length > 0) {
            setUserName(editingName.trim());
        }
    };

    const handleSelectAvatar = (avatar: AvatarIcon) => {
        setSelectedAvatar(avatar);
        setUserAvatar(avatar);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="プロフィール設定" showBack onBack={handleBack} />
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.05} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Current Avatar Preview */}
                    <Animated.View entering={FadeIn.duration(600)} style={styles.avatarPreview}>
                        <View style={[styles.avatarLarge, { backgroundColor: colors.accent }]}>
                            <Ionicons
                                name={avatarIconMap[selectedAvatar]}
                                size={64}
                                color={colors.textInverse}
                            />
                        </View>
                    </Animated.View>

                    {/* Username Section */}
                    <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.section}>
                        <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                            ニックネーム
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.backgroundCard,
                                        borderColor: colors.border,
                                        color: colors.textPrimary,
                                        borderRadius: borderRadius.lg,
                                    },
                                ]}
                                value={editingName}
                                onChangeText={setEditingName}
                                placeholder="ニックネームを入力"
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="done"
                                onSubmitEditing={handleSaveName}
                                onBlur={handleSaveName}
                            />
                        </View>
                    </Animated.View>

                    {/* Avatar Selection */}
                    <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.section}>
                        <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                            アイコン
                        </Text>
                        <View
                            style={[
                                styles.avatarGrid,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderRadius: borderRadius.xl,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            {avatarOptions.map((avatar, index) => (
                                <TouchableOpacity
                                    key={avatar}
                                    style={[
                                        styles.avatarOption,
                                        {
                                            backgroundColor:
                                                selectedAvatar === avatar ? colors.accentMuted : colors.surface,
                                            borderRadius: borderRadius.lg,
                                            borderWidth: selectedAvatar === avatar ? 2 : 0,
                                            borderColor: colors.accent,
                                        },
                                    ]}
                                    onPress={() => handleSelectAvatar(avatar)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={avatarIconMap[avatar]}
                                        size={28}
                                        color={selectedAvatar === avatar ? colors.accent : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 40,
    },
    avatarPreview: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: 32,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        padding: 16,
        fontSize: 16,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    avatarOption: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
