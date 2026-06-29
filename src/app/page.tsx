"use client";
import React, { useState } from "react";
import "@copilotkit/react-core/v2/styles.css";
import {
  useFrontendTool,
  useRenderTool,
  useHumanInTheLoop,
  useAgentContext,
  useConfigureSuggestions,
  CopilotChat,
  CopilotChatConfigurationProvider,
  ToolCallStatus,
  type ReactHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { CopilotKit, useLangGraphInterrupt, type LangGraphInterruptRenderProps } from "@copilotkit/react-core";
import { z } from "zod";
import { Sidebar } from "@/components/Sidebar";
import { StepContainer, StepHeader, StepItem, ActionButton, CheckIcon, XIcon, type Step } from "@/components/chat/StepCard";

const AGENT_ID = "chat";

type GenerateStepsArgs = {
  steps: Step[];
};

// LangGraph delivers the interrupt payload as loosely-typed JSON from graph
// state, so individual steps may arrive as plain strings or partial objects.
interface InterruptStepValue {
  steps?: Array<string | { description?: string; status?: Step["status"] }>;
}

const InterruptHumanInTheLoop: React.FC<
  Pick<LangGraphInterruptRenderProps<InterruptStepValue>, "event" | "resolve">
> = ({ event, resolve }) => {
  let initialSteps: Step[] = [];
  if (event.value.steps && Array.isArray(event.value.steps)) {
    initialSteps = event.value.steps.map((step) => ({
      description: typeof step === "string" ? step : step.description ?? "",
      status: typeof step === "object" && step.status ? step.status : "enabled",
    }));
  }

  const [localSteps, setLocalSteps] = useState<Step[]>(initialSteps);
  const enabledCount = localSteps.filter((step) => step.status === "enabled").length;

  const handleStepToggle = (index: number) => {
    setLocalSteps((prevSteps) =>
      prevSteps.map((step, i) =>
        i === index ? { ...step, status: step.status === "enabled" ? "disabled" : "enabled" } : step,
      ),
    );
  };

  const handlePerformSteps = () => {
    const selectedSteps = localSteps.filter((step) => step.status === "enabled").map((step) => step.description);
    resolve("The user selected the following steps: " + selectedSteps.join(", "));
  };

  return (
    <StepContainer>
      <StepHeader enabledCount={enabledCount} totalCount={localSteps.length} />

      <div className="mb-5 space-y-2">
        {localSteps.map((step, index) => (
          <StepItem key={index} step={step} onToggle={() => handleStepToggle(index)} />
        ))}
      </div>

      <div className="flex justify-center">
        <ActionButton variant="primary" onClick={handlePerformSteps}>
          Perform steps
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold">{enabledCount}</span>
        </ActionButton>
      </div>
    </StepContainer>
  );
};

type StepsFeedbackProps = React.ComponentProps<ReactHumanInTheLoop<GenerateStepsArgs>["render"]>;

const StepsFeedback = ({ args, respond, status }: StepsFeedbackProps) => {
  const [localSteps, setLocalSteps] = useState<Step[]>([]);
  const [seededSteps, setSeededSteps] = useState<Step[] | undefined>(undefined);
  const [accepted, setAccepted] = useState<boolean | null>(null);

  // Seed local (editable) steps from the tool call args once, the first time
  // they become available, without overwriting the user's in-progress edits
  // on subsequent renders. See "Adjusting state when a prop changes" at
  // https://react.dev/learn/you-might-not-need-an-effect
  if (
    status === ToolCallStatus.Executing &&
    args.steps !== seededSteps &&
    Array.isArray(args.steps) &&
    args.steps.length > 0
  ) {
    setSeededSteps(args.steps);
    setLocalSteps(args.steps);
  }

  if (!Array.isArray(args.steps) || args.steps.length === 0) {
    return <></>;
  }

  const steps = localSteps.length > 0 ? localSteps : args.steps;
  const enabledCount = steps.filter((step) => step.status === "enabled").length;

  const handleStepToggle = (index: number) => {
    setLocalSteps((prevSteps) =>
      prevSteps.map((step, i) =>
        i === index ? { ...step, status: step.status === "enabled" ? "disabled" : "enabled" } : step,
      ),
    );
  };

  const handleReject = () => {
    if (respond) {
      setAccepted(false);
      respond({ accepted: false });
    }
  };

  const handleConfirm = () => {
    if (respond) {
      const confirmedSteps = localSteps.filter((step) => step.status === "enabled");
      setAccepted(true);
      respond({ accepted: true, steps: confirmedSteps });
    }
  };

  return (
    <StepContainer>
      <StepHeader enabledCount={enabledCount} totalCount={steps.length} status={status} showStatus />

      <div className="mb-5 space-y-2">
        {steps.map((step, index) => (
          <StepItem
            key={index}
            step={step}
            status={status}
            onToggle={() => handleStepToggle(index)}
            disabled={status !== ToolCallStatus.Executing}
          />
        ))}
      </div>

      {accepted === null && (
        <div className="flex justify-center gap-3">
          <ActionButton variant="secondary" disabled={status !== ToolCallStatus.Executing} onClick={handleReject}>
            <XIcon />
            Reject
          </ActionButton>
          <ActionButton variant="success" disabled={status !== ToolCallStatus.Executing} onClick={handleConfirm}>
            <CheckIcon />
            Confirm
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-semibold">{enabledCount}</span>
          </ActionButton>
        </div>
      )}

      {accepted !== null && (
        <div className="flex justify-center">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              accepted
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {accepted ? <CheckIcon /> : <XIcon />}
            {accepted ? "Accepted" : "Rejected"}
          </div>
        </div>
      )}
    </StepContainer>
  );
};

const ChatContent = ({ threadId }: { threadId?: string }) => {
  const [background, setBackground] = useState<string>("--copilot-kit-background-color");

  useAgentContext({
    description: "Name of the user",
    value: "Bob",
  });

  useFrontendTool({
    name: "change_background",
    description:
      "Change the background color of the chat. Can be anything that the CSS background attribute accepts. Regular colors, linear of radial gradients etc.",
    parameters: z.object({
      background: z.string().describe("The background. Prefer gradients. Only use when asked."),
    }),
    handler: async ({ background }: { background: string }) => {
      setBackground(background);
      return {
        status: "success",
        message: `Background changed to ${background}`,
      };
    },
  });

  useRenderTool({
    name: "get_weather",
    parameters: z.object({
      location: z.string(),
    }),
    render: ({ parameters, result, status }) => {
      if (status !== "complete") {
        return <div data-testid="weather-info-loading">Loading weather...</div>;
      }

      // Some integrations (e.g. LangGraph) deliver tool results as a JSON-encoded
      // string in the ToolMessage content rather than a parsed object. Normalize
      // so property access works in either case; otherwise every field reads as
      // undefined and the card renders empty values.
      let parsed: Record<string, unknown> = {};
      if (typeof result === "string") {
        try {
          parsed = JSON.parse(result);
        } catch {
          parsed = {};
        }
      }

      return (
        <div data-testid="weather-info">
          <strong>Weather in {(parsed.city as string) ?? parameters.location}</strong>
          <div>Temperature: {parsed.temperature as React.ReactNode}°C</div>
          <div>Humidity: {parsed.humidity as React.ReactNode}%</div>
          <div>Wind Speed: {(parsed.windSpeed ?? parsed.wind_speed) as React.ReactNode} mph</div>
          <div>Conditions: {parsed.conditions as React.ReactNode}</div>
        </div>
      );
    },
  });

  // LangGraph uses its own hook to handle human-in-the-loop interactions via
  // LangGraph interrupts; this hook is a no-op for other integrations.
  useLangGraphInterrupt<InterruptStepValue>({
    render: ({ event, resolve }) => <InterruptHumanInTheLoop event={event} resolve={resolve} />,
  });

  useHumanInTheLoop({
    agentId: AGENT_ID,
    name: "generate_task_steps",
    description: "Generates a list of steps for the user to perform",
    parameters: z.object({
      steps: z.array(
        z.object({
          description: z.string(),
          status: z.enum(["enabled", "disabled", "executing"]),
        }),
      ),
    }),
    // Note: In v1, `available` was used to disable this for LangGraph integrations.
    // In v2, availability is handled at the agent/backend level.
    render: (props) => <StepsFeedback {...props} />,
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Change background", message: "Change the background to something new." },
      { title: "Generate sonnet", message: "Write a short sonnet about AI." },
      { title: "Simple plan", message: "Please plan a trip to mars in 5 steps." },
      { title: "Complex plan", message: "Please plan a pasta dish in 10 steps." },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full w-full items-center justify-center p-4" style={{ background }}>
      <div className="h-full w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <CopilotChat agentId={AGENT_ID} threadId={threadId} className="h-full max-w-3xl mx-auto" />
      </div>
    </div>
  );
};

export default function Home() {
  const [threadId, setThreadId] = useState<string | undefined>(undefined);

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false} agent={AGENT_ID}>
      <CopilotChatConfigurationProvider agentId={AGENT_ID}>
        <div className="flex h-full w-full">
          <Sidebar onNewChat={() => setThreadId(crypto.randomUUID())} />
          <main className="h-full flex-1 overflow-hidden">
            <ChatContent threadId={threadId} />
          </main>
        </div>
      </CopilotChatConfigurationProvider>
    </CopilotKit>
  );
}
