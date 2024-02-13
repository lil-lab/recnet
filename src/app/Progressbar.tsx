"use client";
import React from "react";
import { Next13ProgressBar } from "next13-progressbar";

export const ProgressbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      {children}
      <Next13ProgressBar
        height="4px"
        color="#3591FF"
        options={{ showSpinner: false }}
        showOnShallow
      />
    </>
  );
};
