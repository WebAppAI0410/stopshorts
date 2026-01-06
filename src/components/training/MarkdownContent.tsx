/**
 * MarkdownContent Component
 * Renders markdown content with note.com-style typography and spacing
 */

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import { useTheme } from '../../contexts/ThemeContext';

interface MarkdownContentProps {
  /** Markdown content string */
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const { colors } = useTheme();

  // note.com-style: emphasis on whitespace and typography
  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: colors.textPrimary,
          fontSize: 16,
          lineHeight: 28, // 1.75 ratio for readability
        },
        heading1: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.textPrimary,
          marginTop: 32,
          marginBottom: 16,
        },
        heading2: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.textPrimary,
          marginTop: 32,
          marginBottom: 16,
        },
        heading3: {
          fontSize: 17,
          fontWeight: '600',
          color: colors.textPrimary,
          marginTop: 24,
          marginBottom: 12,
        },
        paragraph: {
          marginBottom: 20, // Paragraph spacing (important for readability)
        },
        bullet_list: {
          marginLeft: 8,
          marginBottom: 16,
        },
        ordered_list: {
          marginLeft: 8,
          marginBottom: 16,
        },
        list_item: {
          marginBottom: 8, // List item spacing
        },
        bullet_list_icon: {
          color: colors.primary,
          marginRight: 8,
        },
        ordered_list_icon: {
          color: colors.primary,
          marginRight: 8,
        },
        blockquote: {
          backgroundColor: colors.accentMuted,
          borderLeftColor: colors.primary,
          borderLeftWidth: 4,
          paddingLeft: 16,
          paddingVertical: 12,
          paddingRight: 12,
          marginVertical: 20, // Quote block spacing
          borderRadius: 4,
        },
        strong: {
          fontWeight: '600',
          color: colors.textPrimary,
        },
        em: {
          fontStyle: 'italic',
        },
        code_inline: {
          backgroundColor: colors.surface,
          color: colors.primary,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          fontSize: 14,
          fontFamily: 'monospace',
        },
        code_block: {
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 8,
          marginVertical: 16,
        },
        fence: {
          backgroundColor: colors.surface,
          padding: 16,
          borderRadius: 8,
          marginVertical: 16,
        },
        hr: {
          backgroundColor: colors.border,
          height: 1,
          marginVertical: 24,
        },
        link: {
          color: colors.primary,
          textDecorationLine: 'underline',
        },
      }),
    [colors]
  );

  return <Markdown style={markdownStyles}>{content}</Markdown>;
}
