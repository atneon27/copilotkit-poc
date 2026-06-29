"use client";
import { useState } from "react";
import { useTheme } from "next-themes";

const PanelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </svg>
);

const NewChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
    <circle cx="12" cy="12" r="4" />
    <path
      strokeLinecap="round"
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
    />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar = ({ onNewChat }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <aside
      className={`flex h-full flex-col border-r border-gray-200 bg-gray-50 transition-[width] duration-200 dark:border-gray-800 dark:bg-gray-950 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-200">CopilotKit Demo</span>}
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <PanelIcon />
        </button>
      </div>

      <div className="px-2">
        <button
          type="button"
          onClick={onNewChat}
          className={`flex w-full items-center gap-2 rounded-md border border-gray-200 px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <NewChatIcon />
          {!collapsed && "New chat"}
        </button>
      </div>

      <div className="flex-1" />

      <div className="border-t border-gray-200 px-2 py-2 dark:border-gray-800">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="dark:hidden">
            <MoonIcon />
          </span>
          <span className="hidden dark:inline">
            <SunIcon />
          </span>
          {!collapsed && (
            <>
              <span className="dark:hidden">Dark mode</span>
              <span className="hidden dark:inline">Light mode</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
