import { LogLevel } from "@nestjs/common";

export const getLogLevels = (logLevel: LogLevel): LogLevel[] => {
  switch (logLevel) {
    case "error":
      return ["log", "error"];
    case "warn":
      return ["log", "error", "warn"];
    case "debug":
      return ["log", "error", "warn", "debug"];
    default:
      return ["log", "error", "warn", "debug", "verbose"];
  }
};
