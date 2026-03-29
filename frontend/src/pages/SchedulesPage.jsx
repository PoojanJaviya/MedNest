import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"

// Days config — defined outside component so it's not recreated on every render
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function SchedulesPage() {
  // ── URL params ─────────────────────────────────────────
  const { medicineId } = useParams()
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────
  const [medicine, setMedicine]   = useState(null)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [showForm, setShowForm]   = useState(false)

  // Form state
  const [times, setTimes]         = useState([""])       // list of time strings ["08:00"]
  const [days, setDays]           = useState([])         // [] = every day, or ["Mon","Wed"]
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate]     = useState("")

  // Edit state
  const [editingId, setEditingId]       = useState(null)
  const [editTimes, setEditTimes]       = useState([""])
  const [editDays, setEditDays]         = useState([])
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate]   = useState("")
  const [editIsActive, setEditIsActive] = useState(true)

  // ── Fetch ──────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const [medRes, schedRes] = await Promise.all([
        api.get(`/medicines/${medicineId}`),         // get medicine info for header
        api.get(`/schedules/medicine/${medicineId}`)
      ])
      setMedicine(medRes.data)
      setSchedules(schedRes.data)
    } catch (err) {
      if (err.response?.status === 401) navigate("/login")
      // Medicine endpoint returns the medicine directly — if 404, go back
      if (err.response?.status === 404) navigate(-1)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [medicineId])

  // ── Time input helpers ─────────────────────────────────
  // times is an array — ["08:00", "14:00", "20:00"]
  // This updates one specific time in that array by index
  const updateTime = (index, value, setter) => {
    setter(prev => {
      const updated = [...prev]   // spread = copy the array (don't mutate state directly)
      updated[index] = value
      return updated
    })
  }

  const addTime = (setter) => setter(prev => [...prev, ""])        // append empty slot
  const removeTime = (index, setter) => setter(prev =>
    prev.filter((_, i) => i !== index)   // remove by index
  )

  // ── Day checkbox helper ────────────────────────────────
  // Toggles a day in/out of the selected days array
  const toggleDay = (day, current, setter) => {
    if (current.includes(day)) {
      setter(current.filter(d => d !== day))   // remove if already selected
    } else {
      setter([...current, day])                // add if not selected
    }
  }

  // ── Create schedule ────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/schedules/medicine/${medicineId}`, {
        times_of_day: times.filter(t => t !== ""),   // remove any empty slots
        days_of_week: days.length > 0 ? days : null, // null = every day
        start_date:   startDate,
        end_date:     endDate || null,
        is_active:    true,
      })
      // Reset form
      setTimes([""])
      setDays([])
      setStartDate("")
      setEndDate("")
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create schedule")
    }
  }

  // ── Update schedule ────────────────────────────────────
  const handleUpdate = async (scheduleId) => {
    try {
      const response = await api.put(`/schedules/${scheduleId}`, {
        times_of_day: editTimes.filter(t => t !== ""),
        days_of_week: editDays.length > 0 ? editDays : null,
        start_date:   editStartDate,
        end_date:     editEndDate || null,
        is_active:    editIsActive,
      })
      setSchedules(schedules.map(s => s.id === scheduleId ? response.data : s))
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update schedule")
    }
  }

  // ── Delete schedule ────────────────────────────────────
  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Remove this schedule?")) return
    try {
      await api.delete(`/schedules/${scheduleId}`)
      setSchedules(schedules.filter(s => s.id !== scheduleId))
    } catch (err) {
      setError("Failed to delete schedule")
    }
  }

  // ── Reusable sub-components ────────────────────────────
  // These are just functions that return JSX — small components
  // Defined inside the page since they're only used here

  // Renders time input slots with + / - buttons
  const TimeInputs = ({ timeList, setter }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Times of day</label>
      {timeList.map((t, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="time"
            value={t}
            onChange={e => updateTime(i, e.target.value, setter)}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Only show remove button if more than one time slot */}
          {timeList.length > 1 && (
            <button
              type="button"   // important — prevents form submit
              onClick={() => removeTime(i, setter)}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addTime(setter)}
        className="text-sm text-blue-600 hover:underline"
      >
        + Add time
      </button>
    </div>
  )

  // Renders day checkboxes
  const DayPicker = ({ selected, setter }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">
        Days of week{" "}
        <span className="text-gray-400 font-normal">(leave all unchecked = every day)</span>
      </label>
      <div className="flex gap-2 flex-wrap">
        {ALL_DAYS.map(day => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day, selected, setter)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition
              ${selected.includes(day)
                ? "bg-blue-600 text-white border-blue-600"   // selected style
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"  // unselected
              }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )

  // ── Render ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading schedules...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🪺 MedNest</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token")
            navigate("/login")
          }}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Back + header ── */}
        <button
          onClick={() => navigate(-1)}   // -1 = browser back, like history.back()
          className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
        >
          ← Back to Medicines
        </button>

        {medicine && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-blue-600 font-medium">Schedules for</p>
            <p className="text-lg font-bold text-blue-900">{medicine.medicine_name}</p>
            {medicine.dosage && (
              <p className="text-sm text-blue-500">💊 {medicine.dosage}</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Schedules</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? "Hide" : "+ Add Schedule"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ── Add Schedule Form ── */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-5"
          >
            <h3 className="font-semibold text-gray-700">New Schedule</h3>

            <TimeInputs timeList={times} setter={setTimes} />
            <DayPicker selected={days} setter={setDays} />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  End date <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Save Schedule
            </button>
          </form>
        )}

        {/* ── Schedule Cards ── */}
        {schedules.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No schedules yet. Add the first one!
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-xl shadow-sm p-5">

                {editingId === schedule.id ? (
                  /* ── Edit mode ── */
                  <div className="space-y-5">
                    <TimeInputs timeList={editTimes} setter={setEditTimes} />
                    <DayPicker selected={editDays} setter={setEditDays} />

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          Start date
                        </label>
                        <input
                          type="date"
                          value={editStartDate}
                          onChange={e => setEditStartDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          End date
                        </label>
                        <input
                          type="date"
                          value={editEndDate}
                          onChange={e => setEditEndDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={e => setEditIsActive(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(schedule.id)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                ) : (
                  /* ── View mode ── */
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">

                      {/* Times */}
                      <div className="flex gap-2 flex-wrap">
                        {schedule.times_of_day.map((t, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium"
                          >
                            ⏰ {t}
                          </span>
                        ))}
                      </div>

                      {/* Days */}
                      <p className="text-sm text-gray-500">
                        {schedule.days_of_week?.length > 0
                          ? schedule.days_of_week.join(", ")
                          : "Every day"}
                      </p>

                      {/* Dates */}
                      <p className="text-sm text-gray-400">
                        {schedule.start_date}
                        {schedule.end_date ? ` → ${schedule.end_date}` : " → ongoing"}
                      </p>

                      {/* Active badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${schedule.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {schedule.is_active ? "Active" : "Inactive"}
                      </span>

                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(schedule.id)
                          setEditTimes(schedule.times_of_day)
                          setEditDays(schedule.days_of_week || [])
                          setEditStartDate(schedule.start_date)
                          setEditEndDate(schedule.end_date || "")
                          setEditIsActive(schedule.is_active)
                        }}
                        className="text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default SchedulesPage