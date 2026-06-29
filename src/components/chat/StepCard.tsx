import React from "react";

export interface Step {
  description: string;
  status: "disabled" | "enabled" | "executing";
}

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const StepContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="select-steps" className="flex">
    <div className="w-[min(600px,100%)] rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {children}
    </div>
  </div>
);

export const StepHeader = ({
  enabledCount,
  totalCount,
  status,
  showStatus = false,
}: {
  enabledCount: number;
  totalCount: number;
  status?: string;
  showStatus?: boolean;
}) => (
  <div className="mb-4">
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Plan steps</h2>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {enabledCount}/{totalCount} selected
        </span>
        {showStatus && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "executing"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {status === "executing" ? "Ready" : "Waiting"}
          </span>
        )}
      </div>
    </div>

    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out"
        style={{ width: `${totalCount > 0 ? (enabledCount / totalCount) * 100 : 0}%` }}
      />
    </div>
  </div>
);

export const StepItem = ({
  step,
  status,
  onToggle,
  disabled = false,
}: {
  step: { description: string; status: string };
  status?: string;
  onToggle: () => void;
  disabled?: boolean;
}) => (
  <div
    className={`flex items-center rounded-lg border p-2.5 transition-colors ${
      step.status === "enabled"
        ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/40"
        : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40"
    }`}
  >
    <label data-testid="step-item" className="flex w-full items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={step.status === "enabled"} onChange={onToggle} className="sr-only" disabled={disabled} />
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          step.status === "enabled"
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {step.status === "enabled" && <CheckIcon />}
      </span>
      <span
        data-testid="step-text"
        className={`text-sm font-medium ${
          step.status !== "enabled" && status !== "inProgress"
            ? "text-gray-400 line-through dark:text-gray-500"
            : "text-gray-800 dark:text-gray-100"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {step.description}
      </span>
    </label>
  </div>
);

const VARIANT_CLASSES: Record<"primary" | "secondary" | "success" | "danger", string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary:
    "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export const ActionButton = ({
  variant,
  disabled,
  onClick,
  children,
}: {
  variant: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      disabled ? "cursor-not-allowed opacity-50" : ""
    } ${VARIANT_CLASSES[variant]}`}
  >
    {children}
  </button>
);
