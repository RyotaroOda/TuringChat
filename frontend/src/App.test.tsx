import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders start matching button", () => {
  render(<App />);
  const buttonElement = screen.getByText(/start matching/i);
  expect(buttonElement).toBeInTheDocument();
});
