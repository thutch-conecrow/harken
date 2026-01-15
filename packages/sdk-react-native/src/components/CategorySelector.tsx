import React from 'react';
import { View, Pressable } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';
import type { FeedbackCategory } from '../types';

export interface CategoryOption {
  value: FeedbackCategory;
  label: string;
  emoji?: string;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'idea', label: 'Idea', emoji: '💡' },
  { value: 'ux', label: 'UX', emoji: '✨' },
  { value: 'other', label: 'Other', emoji: '💬' },
];

export interface CategorySelectorProps {
  /** Currently selected category */
  value: FeedbackCategory | null;
  /** Callback when category is selected */
  onChange: (category: FeedbackCategory) => void;
  /** Custom categories (defaults to bug, idea, ux, other) */
  categories?: CategoryOption[];
  /** Disable interaction */
  disabled?: boolean;
}

/**
 * Category selector for feedback type.
 */
export function CategorySelector({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  disabled = false,
}: CategorySelectorProps): React.JSX.Element {
  const theme = useHarkenTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  };

  return (
    <View style={containerStyle}>
      {categories.map((category) => {
        const isSelected = value === category.value;

        const chipStyle: ViewStyle = {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.full,
          borderWidth: 1,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          backgroundColor: isSelected
            ? theme.colors.primary
            : theme.colors.backgroundSecondary,
          opacity: disabled ? 0.6 : 1,
        };

        const textColor = isSelected
          ? theme.colors.textOnPrimary
          : theme.colors.text;

        return (
          <Pressable
            key={category.value}
            onPress={() => onChange(category.value)}
            disabled={disabled}
            style={({ pressed }) => [
              chipStyle,
              pressed && !disabled && {
                opacity: 0.8,
              },
            ]}
          >
            {category.emoji && (
              <ThemedText
                style={{ marginRight: theme.spacing.xs }}
              >
                {category.emoji}
              </ThemedText>
            )}
            <ThemedText
              variant="label"
              color={textColor}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
