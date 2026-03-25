import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"

function MedicinesPage() {
  // ── URL param ──────────────────────────────────────────
  const { patientId } = useParams()   // grabs :patientId from the URL
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────
  const [patient, setPatient]     = useState(null)    // patient info for the header
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")

  // Add form
  const [showForm, setShowForm]   = useState(false)
  const [medName, setMedName]     = useState("")
  const [dosage, setDosage]       = useState("")
  const [instruction, setInstruction] = useState("")

  // Edit state
  const [editingId, setEditingId]         = useState(null)
  const [editName, setEditName]           = useState("")
  const [editDosage, setEditDosage]       = useState("")
  const [editInstruction, setEditInstruction] = useState("")

  // ── Fetch data on load ─────────────────────────────────
  const fetchData = async () => {
    try {
      // Two requests in parallel — like asyncio.gather() in Python
      const [patientRes, medsRes] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/medicines/patient/${patientId}`)
      ])
      setPatient(patientRes.data)
      setMedicines(medsRes.data)
    } catch (err) {
      if (err.response?.status === 401) navigate("/login")
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [patientId])   // re-fetch if patientId in URL ever changes

  // ── Create medicine ────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/medicines/patient/${patientId}`, {
        medicine_name: medName,
        dosage:        dosage      || null,   // send null if empty, not ""
        instruction:   instruction || null,
      })
      setMedName("")
      setDosage("")
      setInstruction("")
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create medicine")
    }
  }

  // ── Update medicine ────────────────────────────────────
  const handleUpdate = async (medicineId) => {
    try {
      const response = await api.put(`/medicines/${medicineId}`, {
        medicine_name: editName,
        dosage:        editDosage      || null,
        instruction:   editInstruction || null,
      })
      setMedicines(medicines.map(m => m.id === medicineId ? response.data : m))
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update medicine")
    }
  }

  // ── Delete medicine ────────────────────────────────────
  const handleDelete = async (medicineId) => {
    if (!window.confirm("Remove this medicine?")) return
    try {
      await api.delete(`/medicines/${medicineId}`)
      setMedicines(medicines.filter(m => m.id !== medicineId))
    } catch (err) {
      setError("Failed to delete medicine")
    }
  }

  // ── Render ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading medicines...</p>
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

        {/* ── Back button + header ── */}
        <button
          onClick={() => navigate("/patients")}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
        >
          ← Back to Patients
        </button>

        {/* Patient context — so user knows whose medicines these are */}
        {patient && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-blue-600 font-medium">Viewing medicines for</p>
            <p className="text-lg font-bold text-blue-900">{patient.patient_name}</p>
            <p className="text-sm text-blue-500">{patient.whatsapp_number}</p>
          </div>
        )}

        {/* ── Header row ── */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Medicines</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? "Hide" : "+ Add Medicine"}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ── Add Medicine Form ── */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4"
          >
            <h3 className="font-semibold text-gray-700">New Medicine</h3>

            <input
              type="text"
              placeholder="Medicine name (e.g. Metformin)"
              value={medName}
              onChange={e => setMedName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 500mg) — optional"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Instructions (e.g. Take after meals) — optional"
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Save Medicine
            </button>
          </form>
        )}

        {/* ── Medicine Cards ── */}
        {medicines.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No medicines yet. Add the first one!
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map(medicine => (
              <div key={medicine.id} className="bg-white rounded-xl shadow-sm p-5">

                {editingId === medicine.id ? (
                  /* ── Edit mode ── */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Dosage — optional"
                      value={editDosage}
                      onChange={e => setEditDosage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Instructions — optional"
                      value={editInstruction}
                      onChange={e => setEditInstruction(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(medicine.id)}
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
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">{medicine.medicine_name}</p>
                      {/* Only render if value exists — optional fields */}
                      {medicine.dosage && (
                        <p className="text-sm text-gray-500">💊 {medicine.dosage}</p>
                      )}
                      {medicine.instruction && (
                        <p className="text-sm text-gray-500">📋 {medicine.instruction}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/medicines/${medicine.id}/schedules`)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
                      >
                        Schedules →
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(medicine.id)
                          setEditName(medicine.medicine_name)
                          setEditDosage(medicine.dosage || "")
                          setEditInstruction(medicine.instruction || "")
                        }}
                        className="text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
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

export default MedicinesPage