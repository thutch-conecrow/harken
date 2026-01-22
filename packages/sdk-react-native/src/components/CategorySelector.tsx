import React from "react";
import { View, Pressable } from "react-native";
import type { ViewStyle, StyleProp } from "react-native";
import { useHarkenTheme } from "../hooks";
import { ThemedText } from "./ThemedText";
import type { FeedbackCategory } from "../types";

export interface CategoryOption {
  value: FeedbackCategory;
  label: string;
  emoji?: string;
  /** Custom icon element (replaces emoji) */
  icon?: React.ReactNode;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: "bug", label: "Bug", emoji: "🐛" },
  { value: "idea", label: "Idea", emoji: "💡" },
  { value: "ux", label: "UX", emoji: "✨" },
  { value: "other", label: "Other", emoji: "💬" },
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
  /** Custom renderer for category chips */
  renderCategory?: (
    option: CategoryOption,
    isSelected: boolean,
    onSelect: () => void
  ) => React.ReactNode;
  /** Style for the container */
  style?: StyleProp<ViewStyle>;
  /** Style for unselected chips */
  chipStyle?: StyleProp<ViewStyle>;
  /** Style for selected chips */
  selectedChipStyle?: StyleProp<ViewStyle>;
}

/**
 * Category selector for feedback type.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CategorySelector
 *   value={category}
 *   onChange={setCategory}
 * />
 *
 * // Custom categories without emojis
 * <CategorySelector
 *   value={category}
 *   onChange={setCategory}
 *   categories={[
 *     { value: 'bug', label: 'Report Bug' },
 *     { value: 'idea', label: 'Feature Request' },
 *   ]}
 * />
 *
 * // With custom icons
 * <CategorySelector
 *   value={category}
 *   onChange={setCategory}
 *   categories={[
 *     { value: 'bug', label: 'Bug', icon: <BugIcon /> },
 *     { value: 'idea', label: 'Idea', icon: <LightbulbIcon /> },
 *   ]}
 * />
 *
 * // Fully custom rendering
 * <CategorySelector
 *   value={category}
 *   onChange={setCategory}
 *   renderCategory={(option, isSelected, onSelect) => (
 *     <MyCustomChip
 *       key={option.value}
 *       selected={isSelected}
 *       onPress={onSelect}
 *       label={option.label}
 *     />
 *   )}
 * />
 * ```
 */
export function CategorySelector({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  disabled = false,
  renderCategory,
  style,
  chipStyle,
  selectedChipStyle,
}: CategorySelectorProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { chip } = theme.components;

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: chip.gap,
  };

  return (
    <View style={[containerStyle, style]}>
      {categories.map((category) => {
        const isSelected = value === category.value;
        const onSelect = () => onChange(category.value);

        // Use custom renderer if provided
        if (renderCategory) {
          return (
            <React.Fragment key={category.value}>
              {renderCategory(category, isSelected, onSelect)}
            </React.Fragment>
          );
        }

        const baseChipStyle: ViewStyle = {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: chip.paddingVertical,
          paddingHorizontal: chip.paddingHorizontal,
          borderRadius: chip.radius,
          borderWidth: 1,
          borderColor: isSelected ? chip.borderSelected : chip.border,
          backgroundColor: isSelected ? chip.backgroundSelected : chip.background,
          opacity: disabled ? theme.opacity.disabled : 1,
        };

        const textColor = isSelected ? chip.textSelected : chip.text;

        return (
          <Pressable
            key={category.value}
            onPress={onSelect}
            disabled={disabled}
            style={({ pressed }) => [
              baseChipStyle,
              chipStyle,
              isSelected && selectedChipStyle,
              pressed &&
                !disabled && {
                  opacity: theme.opacity.pressed,
                },
            ]}
          >
            {category.icon ? (
              <View style={{ marginRight: theme.spacing.xs }}>{category.icon}</View>
            ) : category.emoji ? (
              <ThemedText style={{ marginRight: theme.spacing.xs }}>{category.emoji}</ThemedText>
            ) : null}
            <ThemedText variant="label" color={textColor}>
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
