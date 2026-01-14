import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ProgressChart } from "@/components/ProgressChart";

describe("ProgressChart", () => {
  const mockData = [
    { date: "2024-01-01", weight: 135 },
    { date: "2024-01-08", weight: 140 },
    { date: "2024-01-15", weight: 145 },
  ];

  it("renders without crashing", () => {
    render(<ProgressChart data={mockData} />);
    expect(screen.getByTestId("progress-chart")).toBeTruthy();
  });

  it("renders empty state when no data provided", () => {
    render(<ProgressChart data={[]} />);
    expect(screen.getByText(/no data/i)).toBeTruthy();
  });

  it("renders Y-axis label", () => {
    render(<ProgressChart data={mockData} />);
    expect(screen.getByText(/weight/i)).toBeTruthy();
  });

  it("displays min and max weight values", () => {
    render(<ProgressChart data={mockData} />);
    // Chart adds padding to Y-axis, so values are slightly different
    // With data 135-145 (range 10), padding is ±1, resulting in 134-146
    expect(screen.getByText("134")).toBeTruthy(); // min with padding
    expect(screen.getByText("146")).toBeTruthy(); // max with padding
  });

  it("handles single data point", () => {
    const singlePoint = [{ date: "2024-01-01", weight: 135 }];
    render(<ProgressChart data={singlePoint} />);
    expect(screen.getByTestId("progress-chart")).toBeTruthy();
    // Single point with range 0 still gets padding, resulting in 134-136
    expect(screen.getByText("134")).toBeTruthy();
    expect(screen.getByText("136")).toBeTruthy();
  });

  it("formats dates correctly on X-axis", () => {
    render(<ProgressChart data={mockData} />);
    // Should show formatted dates (multiple dates contain "Jan")
    const dateElements = screen.getAllByText(/Jan/i);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
