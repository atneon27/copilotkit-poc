import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6">
      <h1 className="text-2xl font-bold">CopilotKit Demos</h1>
      <div className="flex gap-4">
        <Link
          href="/thinking"
          className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow"
        >
          Agentic Chat
        </Link>
        <Link
          href="/hitl"
          className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md hover:shadow-lg transition-shadow"
        >
          Human in the Loop
        </Link>
      </div>
    </div>
  );
}
