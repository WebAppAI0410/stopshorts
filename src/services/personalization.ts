import {
    UserPurpose,
    WarningLevel,
    CoachingContext,
    SleepProfile,
    AddictionAssessment,
    ImplementationIntentConfig,
} from '../types';
import { t } from '../i18n';

// Time-based message selection
function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' | 'lateNight' {
    if (hour >= 5 && hour < 9) return 'morning';
    if (hour >= 9 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 || hour < 2) return 'night';
    return 'lateNight';
}

// Calculate warning level based on sleep profile
function calculateWarningLevel(
    currentTime: Date,
    sleepProfile: SleepProfile
): WarningLevel {
    const bedtimeHour = parseInt(sleepProfile.bedtime.split(':')[0], 10);
    const bedtimeMinute = parseInt(sleepProfile.bedtime.split(':')[1], 10);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    const currentMinutes = currentHour * 60 + currentMinute;
    const bedtimeMinutes = bedtimeHour * 60 + bedtimeMinute;

    // Adjust for times past midnight
    const adjustedBedtime = bedtimeMinutes < currentMinutes ? bedtimeMinutes + 1440 : bedtimeMinutes;
    const minutesUntilBedtime = adjustedBedtime - currentMinutes;

    // Handle late night (past bedtime)
    if (currentHour >= 0 && currentHour < 5) {
        return 'critical';
    }

    if (minutesUntilBedtime <= 0 || minutesUntilBedtime > 1440 - 60) {
        return 'critical';
    }
    if (minutesUntilBedtime <= 60) {
        return 'high';
    }
    if (minutesUntilBedtime <= 120) {
        return 'medium';
    }
    return 'low';
}

// Purpose types that have message sets
type MessagePurpose = 'sleep' | 'study' | 'work' | 'creative' | 'mental';

// Message library by purpose and context
const MESSAGES: Record<MessagePurpose, Record<string, string[]>> = {
    sleep: {
        default: [
            '質の良い睡眠は、明日の自分への投資です',
            '今日も頑張りました。ゆっくり休みましょう',
            '睡眠は最高のパフォーマンス向上剤です',
        ],
        night: [
            'もうすぐ就寝時間です。スマホを置いて、リラックスしましょう',
            '就寝まであと少し。良質な睡眠の準備を始めましょう',
            '夜の時間を大切に。明日の自分のために',
        ],
        critical: [
            '就寝時間を過ぎています。今すぐ休みましょう',
            '睡眠不足は明日のパフォーマンスを30%下げます',
            'ブルーライトが睡眠ホルモンを抑制しています',
        ],
        recovery: [
            '大丈夫、明日からまた始めましょう',
            '完璧でなくて大丈夫。少しずつ改善していきましょう',
        ],
    },
    study: {
        default: [
            '今の5分が、将来の可能性を広げます',
            '集中力は有限です。賢く使いましょう',
            'この時間を勉強に使えば、目標に1歩近づきます',
        ],
        morning: [
            '脳が最も活性化している時間です',
            '午前中の集中力を活かしましょう',
        ],
        afternoon: [
            '休憩は大切。でも、動画は休憩になりません',
            'あと少しで今日の学習目標を達成できます',
        ],
        recovery: [
            '小さな一歩から。3分だけ本を開いてみませんか？',
            '焦らなくて大丈夫。今できることから始めましょう',
        ],
    },
    work: {
        default: [
            '集中を取り戻して、成果を出しましょう',
            '1つのタスクに集中することで、生産性は倍増します',
            'この5分が、今日の評価を変えるかもしれません',
        ],
        morning: [
            '午前中の集中力は、午後の2倍の価値があります',
            '今日の優先タスクを確認しましょう',
        ],
        afternoon: [
            'あと少しで今日のタスクが完了します',
            '小さな休憩の後、もう一度集中しましょう',
        ],
        recovery: [
            '完璧を求めず、まず1つのタスクに集中しましょう',
            '焦らず、一歩ずつ進みましょう',
        ],
    },
    creative: {
        default: [
            '消費より創造。あなたの才能を世界に',
            '創造性は静かな時間に育ちます',
            'インプットは十分。アウトプットの時間です',
        ],
        evening: [
            '他人のコンテンツを見ても、あなたの作品は生まれません',
            '夜は創造性が高まる時間帯です',
        ],
        recovery: [
            '創作意欲は、まず手を動かすことから生まれます',
            '完璧でなくて大丈夫。まず始めてみましょう',
        ],
    },
    mental: {
        default: [
            '比較をやめて、自分のペースを大切に',
            '自分を大切にする時間を過ごしましょう',
            'SNSの世界は、現実の一部でしかありません',
        ],
        morning: [
            '今日も自分らしく過ごせる日です',
            '朝の静かな時間を大切にしましょう',
        ],
        night: [
            '今日も頑張りました。ゆっくり休みましょう',
            '深呼吸をして、今この瞬間に意識を向けましょう',
        ],
        recovery: [
            '自分を責めないで。少しずつでいいんです',
            'あなたのペースで大丈夫です',
        ],
    },
};

// Get a random message from an array
function getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Main personalization function
export function getPersonalizedMessage(
    purpose: UserPurpose | null,
    sleepProfile: SleepProfile,
    addictionAssessment: AddictionAssessment | null,
    implementationIntent: ImplementationIntentConfig | null
): { message: string; warningLevel: WarningLevel; implementationIntentText: string | null } {
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = getTimeOfDay(hour);
    const warningLevel = calculateWarningLevel(now, sleepProfile);

    const effectivePurpose = purpose || 'sleep';
    const purposeKey: MessagePurpose = effectivePurpose === 'other' ? 'sleep' : effectivePurpose as MessagePurpose;
    const messageSet = MESSAGES[purposeKey];

    let message: string;

    // Priority: Sleep warnings for critical times (applies to all purposes)
    if (warningLevel === 'critical') {
        message = getRandomMessage(MESSAGES.sleep.critical);
    }
    // Sleep warnings for high level (only if purpose is sleep or it's very late)
    else if (warningLevel === 'high' && (effectivePurpose === 'sleep' || hour >= 22 || hour < 5)) {
        message = getRandomMessage(MESSAGES.sleep.night);
    }
    // Purpose-specific messages based on time of day
    else {
        const timeSpecificMessages = messageSet[timeOfDay] || messageSet.default;
        message = getRandomMessage(timeSpecificMessages);
    }

    // Add purpose reminder for severe addiction levels during critical times
    if (addictionAssessment?.calculatedLevel === 'severe' && effectivePurpose !== 'sleep' && warningLevel === 'critical') {
        const purposeReminder = getPurposeReminder(effectivePurpose);
        if (purposeReminder) {
            message = `${message}\n\n${purposeReminder}`;
        }
    }

    // Get implementation intent text
    let implementationIntentText: string | null = null;
    if (implementationIntent) {
        implementationIntentText = getImplementationIntentDisplay(implementationIntent);
    }

    return {
        message,
        warningLevel,
        implementationIntentText,
    };
}

function getPurposeReminder(purpose: UserPurpose): string | null {
    switch (purpose) {
        case 'study':
            return '目標達成のために、今は勉強に集中しましょう';
        case 'work':
            return '仕事の効率を上げるために、今は休みましょう';
        case 'creative':
            return '創作のために、静かな時間を確保しましょう';
        case 'mental':
            return '自分を大切にするために、画面から離れましょう';
        default:
            return null;
    }
}

function getImplementationIntentDisplay(intent: ImplementationIntentConfig): string {
    switch (intent.type) {
        case 'breathe':
            return '深呼吸をする';
        case 'stretch':
            return 'ストレッチをする';
        case 'water':
            return '水を飲む';
        case 'checklist':
            return 'やることリストを確認する';
        case 'custom':
            return intent.customText || '';
        default:
            return '';
    }
}

// Export coaching context for Shield UI customization
export function getCoachingContext(
    purpose: UserPurpose | null,
    sleepProfile: SleepProfile
): CoachingContext {
    const now = new Date();
    const warningLevel = calculateWarningLevel(now, sleepProfile);
    const { message } = getPersonalizedMessage(purpose, sleepProfile, null, null);

    let suggestedThresholdMinutes = 5;
    if (warningLevel === 'high' || warningLevel === 'critical') {
        suggestedThresholdMinutes = 3;
    }

    return {
        warningLevel,
        message,
        suggestedThresholdMinutes,
        uiHints: {
            useWarmColors: warningLevel === 'high' || warningLevel === 'critical',
            showWarningIcon: warningLevel === 'critical',
            emphasizeSleep: warningLevel !== 'low',
        },
    };
}
