"use client";

import { useEffect, useState } from "react";

type ViewType = "day" | "week" | "month";

type Props = {
  selectedDate: string;
  view: ViewType;
  refreshKey: number;
};

export default function EventList({
  selectedDate,
  view,
  refreshKey
}: Props) {
  const [eventsByDate, setEventsByDate] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- 1. INITIAL FETCH ---
  async function fetchEvents() {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setEventsByDate({});
      return;
    }

    const { start, end } = getDateRange(selectedDate, view);
    const url = `/api/events?start=${encodeURIComponent(start + "Z")}&end=${encodeURIComponent(end + "Z")}`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.events || [];

      const grouped: Record<string, any[]> = {};
      for (const event of list) {
        const date = new Date(event.startUTC).toISOString().slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(event);
      }
      setEventsByDate(grouped);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- 2. DELETE FUNCTION (Optimistic with Rollback) ---
  const handleDelete = async (date: string, eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    // Backup current state in case API fails
    const previousEvents = { ...eventsByDate };

    // Update UI immediately (Optimistic)
    setEventsByDate((prev) => {
      const updatedDay = prev[date]?.filter((e) => e.id !== eventId) || [];
      const newState = { ...prev };
      if (updatedDay.length === 0) {
        delete newState[date];
      } else {
        newState[date] = updatedDay;
      }
      return newState;
    });

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Server failed to delete");
    } catch (err) {
      console.error("Delete sync error:", err);
      alert("Collision prevention: Could not delete from server. Reverting UI...");
      // ROLLBACK: Restore the list so the user knows it wasn't deleted
      setEventsByDate(previousEvents);
    }
  };

  // --- 3. UPDATE FUNCTION (Optimistic) ---
  const handleUpdate = async (date: string, event: any) => {
    const newTitle = prompt("Edit event title:", event.title);
    if (!newTitle || newTitle === event.title) return;

    const previousEvents = { ...eventsByDate };

    // Update UI immediately
    setEventsByDate((prev) => {
      const updatedDay = prev[date].map((e) =>
        e.id === event.id ? { ...e, title: newTitle } : e
      );
      return { ...prev, [date]: updatedDay };
    });

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      console.error("Update sync error:", err);
      alert("Failed to save changes. Reverting...");
      setEventsByDate(previousEvents);
    }
  };

  // --- 4. HYDRATION AND LIFECYCLE ---
  useEffect(() => {
    setMounted(true);
    fetchEvents();
  }, [selectedDate, view, refreshKey]);

  if (!mounted) return null; // Prevents the Hydration Mismatch Error

  if (loading && Object.keys(eventsByDate).length === 0) {
    return <div className="p-4 text-gray-500">Loading events...</div>;
  }

  const activeDates = Object.keys(eventsByDate).sort();

  return (
    <div className="space-y-4">
      {activeDates.length === 0 && (
        <div className="bg-white p-4 rounded shadow text-gray-500">
          No events found for this {view}.
        </div>
      )}

      {activeDates.map((date) => (
        <div key={date} className="bg-white p-4 rounded shadow border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-1">
            {formatDate(date)}
          </h3>
          <div className="space-y-2">
            {eventsByDate[date].map((event) => (
              <div
                key={event.id}
                className="flex justify-between items-center border p-3 rounded group hover:border-blue-300 transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatTime(event.startUTC)} – {formatTime(event.endUTC)}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleUpdate(date, event)}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(date, event.id)}
                    className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 border border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- HELPERS (Remains Constant) ---------------- */

function getDateRange(date: string, view: ViewType) {
  const d = new Date(date + "T00:00");
  if (view === "day") return { start: `${date}T00:00`, end: `${date}T23:59` };
  if (view === "week") {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString("en-CA") + "T00:00",
      end: end.toLocaleDateString("en-CA") + "T23:59",
    };
  }
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: start.toLocaleDateString("en-CA") + "T00:00",
    end: end.toLocaleDateString("en-CA") + "T23:59",
  };
}

function formatDate(date: string) {
  return new Date(date + "T00:00").toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(utc: string) {
  return new Date(utc).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}