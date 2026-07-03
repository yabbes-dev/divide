"use client";

interface StepIndicatorProps {
  currentStep: "upload" | "review" | "people" | "assign" | "summary";
}

const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "review", label: "Review" },
  { id: "people", label: "People" },
  { id: "assign", label: "Assign" },
  { id: "summary", label: "Summary" },
] as const;

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : isComplete
                      ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                      : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  isActive ? "font-medium" : "text-neutral-500"
                }`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="mx-1 hidden h-px w-6 bg-neutral-200 sm:block dark:bg-neutral-700" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
