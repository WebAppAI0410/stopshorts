import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { useStatisticsStore } from '../../src/stores/useStatisticsStore';
import { t } from '../../src/i18n';
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

export default function ProfileScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { purpose, subscriptionPlan, userName, userAvatar, setUserName, setUserAvatar } = useAppStore();
    const { lifetime } = useStatisticsStore();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editingName, setEditingName] = useState(userName || '');

    // Use consolidated statistics from useStatisticsStore
    const totalInterventions = lifetime.totalInterventions;
    const totalMinutesSaved = Math.round(lifetime.totalSavedHours * 60);

    const purposeLabels: Record<string, string> = {
        sleep: t('profile.goals.sleep'),
        study: t('profile.goals.study'),
        work: t('profile.goals.work'),
        creative: t('profile.goals.creative'),
        mental: t('profile.goals.mental'),
    };

    const handleSaveName = () => {
        if (editingName.trim().length > 0) {
            setUserName(editingName.trim());
        }
    };

    const handleSelectAvatar = (avatar: AvatarIcon) => {
        setUserAvatar(avatar);
    };

    const toggleEditProfile = () => {
        if (isEditingProfile) {
            // Save when closing
            handleSaveName();
        } else {
            // Reset editing name when opening
            setEditingName(userName || '');
        }
        setIsEditingProfile(!isEditingProfile);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingTop: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                        <Text style={[typography.h2, { color: colors.textSecondary }]}>
                            {t('profile.title')}
                        </Text>
                    </Animated.View>

                    {/* Avatar Section */}
                    <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.avatarSection}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={toggleEditProfile}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                                <Ionicons
                                    name={avatarIconMap[userAvatar]}
                                    size={48}
                                    color={colors.textInverse}
                                />
                            </View>
                            <View style={[styles.editBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Ionicons
                                    name={isEditingProfile ? 'checkmark' : 'pencil'}
                                    size={12}
                                    color={isEditingProfile ? colors.accent : colors.textSecondary}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Name - editable or display */}
                        {isEditingProfile ? (
                            <TextInput
                                style={[
                                    styles.nameInput,
                                    {
                                        backgroundColor: colors.backgroundCard,
                                        borderColor: colors.border,
                                        color: colors.textPrimary,
                                        borderRadius: borderRadius.lg,
                                        marginTop: spacing.md,
                                    },
                                ]}
                                value={editingName}
                                onChangeText={setEditingName}
                                placeholder={t('profile.enterNickname')}
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="done"
                                onSubmitEditing={handleSaveName}
                                textAlign="center"
                                autoFocus
                            />
                        ) : (
                            <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>
                                {userName || t('profile.user')}
                            </Text>
                        )}

                        <View style={[styles.badge, { backgroundColor: colors.surface, borderRadius: borderRadius.full }]}>
                            <Text style={[typography.caption, { color: colors.accent }]}>
                                {subscriptionPlan === 'free' ? t('profile.freePlan') : t('profile.premium')}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Avatar Selection (when editing) */}
                    {isEditingProfile && (
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            style={[
                                styles.avatarGrid,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderRadius: borderRadius.xl,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    marginBottom: spacing.lg,
                                },
                            ]}
                        >
                            <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                                {t('profile.selectIcon')}
                            </Text>
                            <View style={styles.avatarOptions}>
                                {avatarOptions.map((avatar) => (
                                    <TouchableOpacity
                                        key={avatar}
                                        style={[
                                            styles.avatarOption,
                                            {
                                                backgroundColor:
                                                    userAvatar === avatar ? colors.accentMuted : colors.surface,
                                                borderRadius: borderRadius.lg,
                                                borderWidth: userAvatar === avatar ? 2 : 0,
                                                borderColor: colors.accent,
                                            },
                                        ]}
                                        onPress={() => handleSelectAvatar(avatar)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={avatarIconMap[avatar]}
                                            size={28}
                                            color={userAvatar === avatar ? colors.accent : colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    {/* Stats Summary */}
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(200)}
                        style={[
                            styles.statsCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }
                        ]}
                    >
                        <View style={styles.statItem}>
                            <Text style={[typography.statLarge, { color: colors.textPrimary }]}>
                                {totalInterventions}
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                {t('profile.totalInterventions')}
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[typography.statLarge, { color: colors.textPrimary }]}>
                                {Math.floor(totalMinutesSaved / 60)}h
                            </Text>
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                                {t('profile.timeSaved')}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Goal */}
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(300)}
                        style={[
                            styles.goalCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.border,
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <View style={styles.goalHeader}>
                            <Ionicons name="flag-outline" size={20} color={colors.accent} />
                            <Text style={[typography.label, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
                                {t('profile.yourGoal')}
                            </Text>
                        </View>
                        <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.sm }]}>
                            {purposeLabels[purpose || 'sleep'] || t('profile.setYourGoal')}
                        </Text>
                    </Animated.View>

                    {/* Achievements Preview */}
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(400)}
                        style={[
                            styles.achievementsCard,
                            {
                                backgroundColor: colors.backgroundCard,
                                borderRadius: borderRadius.xl,
                                borderWidth: 1,
                                borderColor: colors.border,
                                marginTop: spacing.lg,
                            }
                        ]}
                    >
                        <View style={styles.achievementsHeader}>
                            <View style={styles.titleRow}>
                                <Ionicons name="trophy-outline" size={20} color={colors.warning} />
                                <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                                    {t('profile.achievements')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </View>
                        <View style={styles.badgesRow}>
                            {['🛡️', '🔥', '⭐'].map((emoji, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.achievementBadge,
                                        { backgroundColor: colors.surface, borderRadius: borderRadius.lg }
                                    ]}
                                >
                                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                                </View>
                            ))}
                            <View
                                style={[
                                    styles.achievementBadge,
                                    { backgroundColor: colors.surface, borderRadius: borderRadius.lg }
                                ]}
                            >
                                <Text style={[typography.body, { color: colors.textMuted }]}>+3</Text>
                            </View>
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
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginTop: 8,
    },
    nameInput: {
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 18,
        fontWeight: '600',
        minWidth: 200,
    },
    avatarGrid: {
        padding: 16,
    },
    avatarOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    avatarOption: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsCard: {
        flexDirection: 'row',
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: '100%',
    },
    goalCard: {
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementsCard: {
        padding: 16,
    },
    achievementsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    achievementBadge: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
