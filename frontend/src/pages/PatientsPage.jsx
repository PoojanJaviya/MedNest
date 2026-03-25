import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

function PatientsPage() {
  // ── State ──────────────────────────────────────────────
  const [patients, setPatients]   = useState([])     // list, starts empty
  const [loading, setLoading]     = useState(true)   // show spinner while fetching
  const [error, setError]         = useState("")

  // Form state — for the "Add Patient" form
  const [name, setName]           = useState("")
  const [phone, setPhone]         = useState("")
  const [language, setLanguage]   = useState("en")
  const [showForm, setShowForm]   = useState(false)  // toggle form visibility

  const [editingId, setEditingId]     = useState(null)   // which patient is being edited
  const [editName, setEditName]       = useState("")
  const [editPhone, setEditPhone]     = useState("")
  const [editLanguage, setEditLanguage] = useState("en")

  const navigate = useNavigate()

  // ── Fetch patients on page load ────────────────────────
  // Python parallel: the function that runs on GET /patients
  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients/")
      setPatients(response.data)   // response.data = the JSON list your FastAPI returns
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or missing — send back to login
        navigate("/login")
      }
      setError("Failed to load patients")
    } finally {
      setLoading(false)   // whether success or fail, stop showing spinner
    }
  }

  // Runs once when the component mounts (page loads)
  useEffect(() => {
    fetchPatients()
  }, [])

  // ── Create patient ─────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post("/patients/", {
        patient_name: name,
        whatsapp_number: phone,
        language: language,
      })
      // Reset form fields
      setName("")
      setPhone("")
      setLanguage("en")
      setShowForm(false)
      fetchPatients()   // refresh the list
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create patient")
    }
  }

  // ── Delete patient ─────────────────────────────────────
  const handleDelete = async (patientId) => {
    // window.confirm = browser's built-in "Are you sure?" popup
    if (!window.confirm("Remove this patient?")) return
    try {
      await api.delete(`/patients/${patientId}`)
      // Instead of re-fetching, just filter them out of state locally
      // Python equivalent: patients = [p for p in patients if p.id != patientId]
      setPatients(patients.filter(p => p.id !== patientId))
    } catch (err) {
      setError("Failed to delete patient")
    }
  }

  const handleUpdate = async (patientId) => {
    try {
      const response = await api.put(`/patients/${patientId}`, {
        patient_name: editName,
        whatsapp_number: editPhone,
        language: editLanguage,
      })
      // Replace the old patient object in state with the updated one
      // Python: patients = [response.data if p.id == patientId else p for p in patients]
      setPatients(patients.map(p => p.id === patientId ? response.data : p))
      setEditingId(null)   // exit edit mode
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update patient")
    }
  }
  // ── Render ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading patients...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Navbar ── */}
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

        {/* ── Header row ── */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Patients</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {/* Ternary — Python: "Hide" if showForm else "+ Add Patient" */}
            {showForm ? "Hide" : "+ Add Patient"}
          </button>
        </div>

        {/* ── Error message ── */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ── Add Patient Form (only shows when showForm is true) ── */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4"
          >
            <h3 className="font-semibold text-gray-700">New Patient</h3>

            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="WhatsApp number (e.g. +919876543210)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Select dropdown — like an HTML <select> */}
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
              <option value="mr">Marathi</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Save Patient
            </button>
          </form>
        )}

        {/* ── Patient Cards ── */}
        {/* Python: if len(patients) == 0 */}
        {patients.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No patients yet. Add your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {/* .map() = list comprehension — renders one card per patient */}
            {patients.map(patient => (
              <div
                key={patient.id}
                className="bg-white rounded-xl shadow-sm p-5"
              >
                {/* ── Edit mode — shows when this patient's id is being edited ── */}
                {editingId === patient.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editLanguage}
                      onChange={e => setEditLanguage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="gu">Gujarati</option>
                      <option value="mr">Marathi</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(patient.id)}
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
                  /* ── View mode — normal card ── */
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{patient.patient_name}</p>
                      <p className="text-sm text-gray-500">{patient.whatsapp_number}</p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {patient.language.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/patients/${patient.id}/medicines`)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
                      >
                        Medicines →
                      </button>
                      <button
                        onClick={() => {
                          // Pre-fill edit fields with current values before entering edit mode
                          setEditingId(patient.id)
                          setEditName(patient.patient_name)
                          setEditPhone(patient.whatsapp_number)
                          setEditLanguage(patient.language)
                        }}
                        className="text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
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

export default PatientsPage