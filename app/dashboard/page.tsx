"use client";

import { useState } from "react";
import EventList from "@/components/EventList";
import CreateEventForm from "@/components/CreateEventForm";
export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">My Calendar</h1>

      {/* Date Picker */}
      <input
  type="date"
  value={selectedDate}
  onChange={(e) => {
    setSelectedDate(e.target.value);
    setView("day"); // ✅ FORCE DAY VIEW
  }}
  className="border p-2 rounded mb-4"
/>


      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        {["day", "week", "month"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            className={`px-4 py-2 rounded ${
              view === v
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      <CreateEventForm
        selectedDate={selectedDate}
        onEventCreated={() => setRefreshKey((k) => k + 1)}
      />

      <EventList
        selectedDate={selectedDate}
        view={view}
        refreshKey={refreshKey}
      />
    </main>
  );
}
