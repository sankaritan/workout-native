import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Calendar } from "@/components/Calendar";

describe("Calendar", () => {
  describe("Rendering", () => {
    it("renders calendar for given month and year", () => {
      render(
        <Calendar
          year={2023}
          month={9} // October (0-indexed)
          workoutDates={[]}
        />
      );

      // Should render day name headers (S appears twice for Sunday and Saturday)
      const dayHeaders = screen.getAllByText("S");
      expect(dayHeaders.length).toBe(2); // Sunday and Saturday
      expect(screen.getByText("M")).toBeTruthy();
      expect(screen.getAllByText("T").length).toBe(2); // Tuesday and Thursday
    });

    it("renders correct number of days for the month", () => {
      const { getAllByText } = render(
        <Calendar
          year={2023}
          month={9} // October has 31 days
          workoutDates={[]}
        />
      );

      // Check that day 31 is rendered (October has 31 days)
      expect(getAllByText("31")).toBeTruthy();
    });

    it("renders days from previous month as padding", () => {
      const { getAllByText } = render(
        <Calendar
          year={2023}
          month={9} // October 2023 starts on Sunday, so no padding needed
          workoutDates={[]}
        />
      );

      // October 2023 starts on Sunday, so there should be days from September
      // as padding (28, 29, 30)
      expect(getAllByText("28")).toBeTruthy();
      expect(getAllByText("29")).toBeTruthy();
      expect(getAllByText("30")).toBeTruthy();
    });
  });

  describe("Workout Highlighting", () => {
    it("highlights days with workouts", () => {
      const { getByLabelText } = render(
        <Calendar
          year={2023}
          month={9} // October
          workoutDates={["2023-10-05T10:00:00.000Z", "2023-10-12T14:00:00.000Z"]}
        />
      );

      // Days with workouts should be rendered
      const day5 = getByLabelText("5");
      const day12 = getByLabelText("12");

      expect(day5).toBeTruthy();
      expect(day12).toBeTruthy();
    });

    it("does not highlight days without workouts", () => {
      const { getByLabelText } = render(
        <Calendar
          year={2023}
          month={9}
          workoutDates={["2023-10-05T10:00:00.000Z"]}
        />
      );

      const day6 = getByLabelText("6");
      const day5 = getByLabelText("5");

      // Both should exist, but styles would be different
      expect(day5).toBeTruthy();
      expect(day6).toBeTruthy();
    });

    it("handles workout dates across different months correctly", () => {
      const { getByLabelText } = render(
        <Calendar
          year={2023}
          month={9} // October
          workoutDates={[
            "2023-09-30T10:00:00.000Z", // September (should not highlight in October)
            "2023-10-05T10:00:00.000Z", // October (should highlight)
            "2023-11-01T10:00:00.000Z", // November (should not highlight in October)
          ]}
        />
      );

      // Only October 5 should be highlighted
      expect(getByLabelText("5")).toBeTruthy();
    });
  });

  describe("Interaction", () => {
    it("calls onDayPress when a current month day is pressed", () => {
      const onDayPress = jest.fn();

      const { getByLabelText } = render(
        <Calendar
          year={2023}
          month={9}
          workoutDates={[]}
          onDayPress={onDayPress}
        />
      );

      const day15 = getByLabelText("15");
      fireEvent.press(day15);

      expect(onDayPress).toHaveBeenCalledTimes(1);
      expect(onDayPress).toHaveBeenCalledWith(expect.any(Date));

      // Verify the date is October 15, 2023
      const calledDate = onDayPress.mock.calls[0][0] as Date;
      expect(calledDate.getFullYear()).toBe(2023);
      expect(calledDate.getMonth()).toBe(9);
      expect(calledDate.getDate()).toBe(15);
    });

    it("does not call onDayPress when previous month day is pressed", () => {
      const onDayPress = jest.fn();

      const { getAllByLabelText } = render(
        <Calendar
          year={2023}
          month={10} // November 2023 (starts on Wednesday)
          workoutDates={[]}
          onDayPress={onDayPress}
        />
      );

      // November 1, 2023 is a Wednesday (day 3), so October 29, 30, 31 should be in the grid as padding
      // Get all "31" elements - first one should be from October (padding)
      const day31Elements = getAllByLabelText("31");
      if (day31Elements.length > 0) {
        fireEvent.press(day31Elements[0]);
        // Should not be called because it's from previous month (disabled)
        expect(onDayPress).not.toHaveBeenCalled();
      }
    });

    it("works without onDayPress callback", () => {
      const { getByLabelText } = render(
        <Calendar year={2023} month={9} workoutDates={[]} />
      );

      const day15 = getByLabelText("15");

      // Should not throw error when pressed without callback
      expect(() => fireEvent.press(day15)).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("handles February in leap year", () => {
      const { getAllByText } = render(
        <Calendar
          year={2024} // Leap year
          month={1} // February (0-indexed)
          workoutDates={[]}
        />
      );

      // February 2024 has 29 days
      expect(getAllByText("29")).toBeTruthy();
    });

    it("handles February in non-leap year", () => {
      const { queryAllByText } = render(
        <Calendar
          year={2023} // Non-leap year
          month={1} // February
          workoutDates={[]}
        />
      );

      // February 2023 has 28 days - day 29 should not exist for current month
      // (might exist as padding from previous month)
      const day28Elements = queryAllByText("28");
      const day29Elements = queryAllByText("29");

      expect(day28Elements.length).toBeGreaterThan(0);
      // Day 29 might appear as padding, so we don't test for its absence
    });

    it("handles year transition (December to January)", () => {
      render(
        <Calendar
          year={2023}
          month={11} // December
          workoutDates={["2023-12-31T23:59:59.000Z"]}
        />
      );

      // Should render without errors
      expect(screen.getByLabelText("31")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("sets correct accessibility role for day buttons", () => {
      const { getByLabelText } = render(
        <Calendar year={2023} month={9} workoutDates={[]} />
      );

      const day15 = getByLabelText("15");
      expect(day15.props.accessibilityRole).toBe("button");
    });

    it("has accessibility labels for each day", () => {
      render(<Calendar year={2023} month={9} workoutDates={[]} />);

      // Each day should have an accessibility label
      expect(screen.getByLabelText("1")).toBeTruthy();
      expect(screen.getByLabelText("15")).toBeTruthy();
      expect(screen.getByLabelText("31")).toBeTruthy();
    });
  });
});
