"use client";

import { useState } from "react";

type Props = {
  selectedDate: string;
  onEventCreated: () => void;
};

export default function CreateEventForm({
  selectedDate,
  onEventCreated
}: Props) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | null>(null);
  const [loading, setLoading] = useState(false);

  function showMessage(msg: string, type: 'success' | 'error' | 'info' | null = 'info') {
    setMessage(msg);
    setMessageType(type);
    if (type === 'success') {
      setTimeout(() => {
        setMessage("");
        setMessageType(null);
      }, 4000);
    }
  }

  async function handleCreate() {
    setMessage("");
    setMessageType(null);

    if (!title.trim()) {
      showMessage("Please enter a title for the event", 'error');
      return;
    }

    if (!startTime || !endTime) {
      showMessage("Please select start and end time", 'error');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Authentication error. Please login again.", 'error');
      setLoading(false);
      return;
    }

    // Combine selected date + time
    const startDateTime = `${selectedDate}T${startTime}`;
    const endDateTime = `${selectedDate}T${endTime}`;

    // Prevent creating events in the past and ensure end > start
    const startDT = new Date(startDateTime);
    const endDT = new Date(endDateTime);
    const now = new Date();

    if (startDT < now) {
      setMessage("Cannot create events in the past.");
      setLoading(false);
      return;
    }

    if (endDT <= startDT) {
      setMessage("End time must be after start time.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          startTime: startDateTime,
          endTime: endDateTime,
          reminderMinutes: reminderMinutes || undefined
        })
      });

      const data = await res.json();

      // ❌ Time conflict (backend returns 400 with 'Time conflict')
      if (res.status === 400 && data?.error && data.error.toLowerCase().includes("time conflict")) {
        showMessage("Sorry! You already have a task scheduled during this time.", 'error');
        setLoading(false);
        return;
      }

      // ❌ Other errors
      if (!res.ok) {
        showMessage(data?.error || "Something went wrong", 'error');
        setLoading(false);
        return;
      }

      // ✅ Success
      showMessage("Event added successfully", 'success');

      setTitle("");
      setStartTime("");
      setEndTime("");

      // Notify parent to refresh events
      onEventCreated();
      // Broadcast global event for other components
      window.dispatchEvent(new CustomEvent("events:changed"));

    } catch (error) {
      showMessage("Network error. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  }

  // Derived validation state for UI
  const startDT = startTime ? new Date(`${selectedDate}T${startTime}`) : null;
  const endDT = endTime ? new Date(`${selectedDate}T${endTime}`) : null;
  const now = new Date();
  const titleMissing = title.trim() === "";
  const startInPast = startDT ? startDT < now : false;
  const endBeforeStart = startDT && endDT ? endDT <= startDT : false;
  const missingTimes = !startTime || !endTime;
  const canSubmit = !loading && !titleMissing && !missingTimes && !startInPast && !endBeforeStart;

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="font-semibold mb-2">Create Event ({selectedDate})</h2>

      {/* Message */}
      {message && (
        <div className={`mb-2 rounded p-2 text-sm ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : messageType === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-gray-50 border border-gray-200 text-gray-800'
        }`} role={messageType === 'error' ? 'alert' : 'status'}>
          {message}
        </div>
      )}

      {/* Title */}
      <label className="block font-medium mb-1">
        Title <span className="text-red-500">*</span>
      </label>
      <input
        className={`p-2 w-full mb-2 rounded ${titleMissing ? 'border-red-500 border' : 'border-gray-300 border'}`}
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        aria-invalid={titleMissing}
      />
      {titleMissing && <p className="text-sm text-red-600 mb-2">Title is required.</p>}

      {/* Time Inputs */}
      <label className="block font-medium mb-1">Time <span className="text-red-500">*</span></label>
      <div className="flex gap-2 mb-3">
        <input
          type="time"
          className={`p-2 w-full rounded ${startInPast ? 'border-red-500 border' : (startTime ? 'border-gray-300 border' : 'border-gray-200 border')}`}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          disabled={loading}
          aria-invalid={startInPast}
        />
        <input
          type="time"
          className={`p-2 w-full rounded ${endBeforeStart ? 'border-red-500 border' : (endTime ? 'border-gray-300 border' : 'border-gray-200 border')}`}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          disabled={loading}
          aria-invalid={endBeforeStart}
        />
      </div>

      {startInPast && <p className="text-sm text-red-600 mb-2">Start time is in the past.</p>}
      {endBeforeStart && <p className="text-sm text-red-600 mb-2">End time must be after start time.</p>}

      {/* Reminder selector */}
      <label className="block font-medium mb-1">Reminder</label>
      <select
        value={reminderMinutes}
        onChange={(e) => setReminderMinutes(parseInt(e.target.value, 10))}
        className="border p-2 rounded mb-3"
      >
        <option value={0}>No reminder</option>
        <option value={5}>5 minutes before</option>
        <option value={10}>10 minutes before</option>
        <option value={30}>30 minutes before</option>
      </select>

      {/* Button */}
      <button
        onClick={handleCreate}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        className={`px-4 py-2 rounded text-white ${!canSubmit ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        title={!canSubmit ? (titleMissing ? 'Please enter a title' : missingTimes ? 'Please select start and end times' : startInPast ? 'Start time is in the past' : endBeforeStart ? 'End time must be after start time' : '') : ''}
      >
        {loading ? "Adding..." : "Add Event"}
      </button>
    </div>
  );
}

