/**
 * Calendar component for displaying workout history
 * Shows month view with workout days highlighted
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils/cn";

export interface CalendarProps {
  /** Currently displayed year */
  year: number;
  /** Currently displayed month (0-11) */
  month: number;
  /** Array of ISO date strings that have workouts */
  workoutDates: string[];
  /** Callback when a day is pressed */
  onDayPress?: (date: Date) => void;
  /** Optional className for container */
  className?: string;
}

/**
 * Gets the number of days in a month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Gets the day of week for the first day of the month (0 = Sunday, 6 = Saturday)
 */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Format a date as YYYY-MM-DD for comparison
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to YYYY-MM-DD format
 */
function parseISOToDateKey(isoString: string): string {
  const date = new Date(isoString);
  return formatDateKey(date);
}

/**
 * Calendar component displays a monthly calendar grid with workout days highlighted
 */
export function Calendar({
  year,
  month,
  workoutDates,
  onDayPress,
  className,
}: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Create a Set of workout date keys for fast lookup
  const workoutDateSet = new Set(workoutDates.map(parseISOToDateKey));

  // Get today's date for highlighting
  const today = new Date();
  const todayKey = formatDateKey(today);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Day names
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  // Build calendar grid - previous month padding + current month days
  const calendarDays: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];

  // Add padding days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(prevYear, prevMonth, day),
    });
  }

  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }

  return (
    <View className={cn("px-4", className)}>
      {/* Day names header */}
      <View className="flex-row mb-2">
        {dayNames.map((dayName, index) => (
          <View key={index} className="flex-1 items-center py-2">
            <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((calendarDay, index) => {
          const dateKey = formatDateKey(calendarDay.date);
          const hasWorkout = workoutDateSet.has(dateKey);
          const isToday = isCurrentMonth && dateKey === todayKey;

          return (
            <View key={index} className="w-[14.285%] items-center py-1">
              <Pressable
                onPress={() => {
                  if (calendarDay.isCurrentMonth && onDayPress) {
                    onDayPress(calendarDay.date);
                  }
                }}
                disabled={!calendarDay.isCurrentMonth}
                className={cn(
                  "size-9 items-center justify-center rounded-full",
                  // Base styles
                  calendarDay.isCurrentMonth
                    ? "active:opacity-80"
                    : "opacity-30",
                  // Today - highlighted with solid primary background
                  isToday && hasWorkout && "bg-primary shadow-md shadow-primary/20",
                  // Has workout but not today - primary background with lower opacity
                  !isToday && hasWorkout && "bg-primary/20",
                  // Normal day - hover effect
                  !hasWorkout && calendarDay.isCurrentMonth && "active:bg-gray-100 dark:active:bg-white/5"
                )}
                accessibilityRole="button"
                accessibilityLabel={`${calendarDay.day}`}
              >
                <Text
                  className={cn(
                    "text-sm",
                    // Today with workout - dark text on primary background
                    isToday && hasWorkout && "font-bold text-background-dark",
                    // Has workout but not today - primary colored text
                    !isToday && hasWorkout && "font-bold text-primary",
                    // Current month regular day
                    calendarDay.isCurrentMonth && !hasWorkout && "font-medium text-white",
                    // Previous/next month days
                    !calendarDay.isCurrentMonth && "text-gray-300 dark:text-gray-700"
                  )}
                >
                  {calendarDay.day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
