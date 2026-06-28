"use client";
import React, { useState } from "react";
import "@copilotkit/react-core/v2/styles.css";
import {
  useFrontendTool,
  useRenderTool,
  useAgentContext,
  useConfigureSuggestions,
  CopilotChat,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { CopilotKit } from "@copilotkit/react-core";

const AgenticChat: React.FC = () => {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" showDevConsole={false} agent="agentic_chat">
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
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

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Change background",
        message: "Change the background to something new.",
      },
      {
        title: "Generate sonnet",
        message: "Write a short sonnet about AI.",
      },
    ],
    available: "always",
  });

  return (
    <div
      className="flex justify-center items-center h-full w-full"
      data-testid="background-container"
      style={{ background }}
    >
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat agentId="agentic_chat" className="h-full rounded-2xl max-w-6xl mx-auto" />
      </div>
    </div>
  );
};

export default AgenticChat;
