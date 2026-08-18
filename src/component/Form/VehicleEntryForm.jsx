import { useState, useEffect } from "react";
import axios from "axios";
import "./VehicleEntryForm.css";

const API = `${import.meta.env.VITE_API_URL}/api/vehicle-entries`;

// ---- Dropdown source data ----
// Replace these arrays with data from your database later (e.g. via an API call).
const OFFICE_OPTIONS = [
  "Head Office",
  "Kathmandu Branch",
  "Dhangadhi Branch",
  "Chitwan Branch",
];
const STORE_OPTIONS = ["Main Store", "Store A", "Store B", "Store C"];
const SUPPLIER_OPTIONS = [
  "Chand Suppliers",
  "Mama Bhanja Traders",
  "Nepal Auto Parts",
  "Himalayan Logistics",
];
const BLUEBOOK_LANGUAGE_OPTIONS = ["Nepali", "English"];

const EMPTY_FORM = {
  officeName: "",
  storeName: "",
  supplierName: "",
  driverName: "",
  mobileNo: "",
  cardNo: "",
  licenseNo: "",
  bluebookExpiryDate: "",
  bluebookLanguage: "",
  particularName: "",
  arrivalDate: "",
  arrivalTime: "",
  checkInRemarks: "",
};

// Fields that are mandatory (everything except Check In Remarks)
const REQUIRED_FIELDS = Object.keys(EMPTY_FORM).filter(
  (f) => f !== "checkInRemarks",
);

const FIELD_LABELS = {
  officeName: "Office Name",
  storeName: "Store Name",
  supplierName: "Supplier Name",
  driverName: "Driver Name",
  mobileNo: "Mobile No",
  cardNo: "Card No (Visitor Card No)",
  licenseNo: "License No",
  bluebookExpiryDate: "Bluebook Expiry Date",
  bluebookLanguage: "Bluebook Language",
  particularName: "Particular Name (Vehicle Details)",
  arrivalDate: "Arrival Date",
  arrivalTime: "Arrival Time",
  checkInRemarks: "Check In Remarks",
};


export default function VehicleEntryForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [entries, setEntries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ---- LOAD entries from DB on mount ----
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(API);
        setEntries(data);
      } catch (err) {
        setApiError("Could not load entries. Is the server running?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field]).trim()) {
        newErrors[field] = `${FIELD_LABELS[field]} is required.`;
      }
    });

    // Mobile No: digits only, 7-10 digits
    if (form.mobileNo && !/^\d{7,10}$/.test(form.mobileNo.trim())) {
      newErrors.mobileNo =
        "Enter a valid mobile number (7-10 digits, numbers only).";
    }

    // Bluebook Expiry Date shouldn't be in the past
    if (form.bluebookExpiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(form.bluebookExpiryDate);
      if (expiry < today) {
        newErrors.bluebookExpiryDate = "Bluebook has already expired.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSelectedId(null);
    setApiError("");
  };

  // ---- INSERT ----
  const handleInsert = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatusMessage("Please fix the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post(API, form);
      setEntries((prev) => [data, ...prev]);
      setStatusMessage(`✅ Entry saved for ${form.driverName}.`);
      resetForm();
    } catch (err) {
      setApiError("Failed to save entry. Check the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- UPDATE ----
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (selectedId === null) {
      setStatusMessage("Select an entry from the table below to update.");
      return;
    }
    if (!validate()) {
      setStatusMessage("Please fix the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.put(`${API}/${selectedId}`, form);
      setEntries((prev) =>
        prev.map((entry) => (entry._id === selectedId ? data : entry)),
      );
      setStatusMessage(`✅ Entry updated for ${form.driverName}.`);
      resetForm();
    } catch (err) {
      setApiError("Failed to update entry. Check the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- DELETE ----
  const handleDelete = async () => {
    if (selectedId === null) {
      setStatusMessage("Select an entry from the table below to delete.");
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${API}/${selectedId}`);
      setEntries((prev) => prev.filter((entry) => entry._id !== selectedId));
      setStatusMessage("🗑️ Entry deleted.");
      resetForm();
    } catch (err) {
      setApiError("Failed to delete entry. Check the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (entry) => {
    const { _id, __v, createdAt, updatedAt, ...rest } = entry;
    setForm(rest);
    setSelectedId(_id);
    setErrors({});
    setStatusMessage(
      `Editing entry for "${entry.driverName}". Change fields and click Update, or click Delete.`,
    );
  };

  const handleClear = () => {
    resetForm();
    setStatusMessage("");
  };

  return (
    <div className="vef-page">
      <div className="vef-card">
        <h1 className="vef-title">Vehicle Entry Form</h1>
        <p className="vef-subtitle">Register vehicle check-in details</p>

        <form className="vef-form" onSubmit={handleInsert} noValidate>
          <div className="vef-grid">
            <Field label="Office Name" required error={errors.officeName}>
              <select
                name="officeName"
                value={form.officeName}
                onChange={handleChange}
              >
                <option value="">Select Office</option>
                {OFFICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Store Name" required error={errors.storeName}>
              <select
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
              >
                <option value="">Select Store</option>
                {STORE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Supplier Name" required error={errors.supplierName}>
              <select
                name="supplierName"
                value={form.supplierName}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {SUPPLIER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Driver Name" required error={errors.driverName}>
              <input
                type="text"
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
                placeholder="Enter driver name"
              />
            </Field>

            <Field label="Mobile No" required error={errors.mobileNo}>
              <input
                type="text"
                name="mobileNo"
                value={form.mobileNo}
                onChange={handleChange}
                placeholder="+977"
                inputMode="numeric"
              />
            </Field>

            <Field
              label="Card No (Visitor Card No)"
              required
              error={errors.cardNo}
            >
              <input
                type="text"
                name="cardNo"
                value={form.cardNo}
                onChange={handleChange}
                placeholder="Enter visitor card no"
              />
            </Field>

            <Field label="License No" required error={errors.licenseNo}>
              <input
                type="text"
                name="licenseNo"
                value={form.licenseNo}
                onChange={handleChange}
                placeholder="Enter license no"
              />
            </Field>

            <Field
              label="Bluebook Expiry Date"
              required
              error={errors.bluebookExpiryDate}
            >
              <input
                type="date"
                name="bluebookExpiryDate"
                value={form.bluebookExpiryDate}
                onChange={handleChange}
              />
            </Field>

            <Field
              label="Bluebook Language"
              required
              error={errors.bluebookLanguage}
            >
              <select
                name="bluebookLanguage"
                value={form.bluebookLanguage}
                onChange={handleChange}
              >
                <option value="">Select Language</option>
                {BLUEBOOK_LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Particular Name (Vehicle Details)"
              required
              error={errors.particularName}
            >
              <input
                type="text"
                name="particularName"
                value={form.particularName}
                onChange={handleChange}
                placeholder="e.g. Ba 2 Kha 4589"
              />
            </Field>

            <Field label="Arrival Date" required error={errors.arrivalDate}>
              <input
                type="date"
                name="arrivalDate"
                value={form.arrivalDate}
                onChange={handleChange}
              />
            </Field>

            <Field label="Arrival Time" required error={errors.arrivalTime}>
              <input
                type="time"
                name="arrivalTime"
                value={form.arrivalTime}
                onChange={handleChange}
              />
            </Field>

            <Field label="Check In Remarks" className="vef-span-2">
              <textarea
                name="checkInRemarks"
                value={form.checkInRemarks}
                onChange={handleChange}
                placeholder="Optional remarks"
                rows={3}
              />
            </Field>
          </div>

          {statusMessage && <p className="vef-status">{statusMessage}</p>}
          {apiError && <p className="vef-api-error">{apiError}</p>}

          <div className="vef-actions">
            <button type="submit" className="vef-btn vef-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Insert"}
            </button>
            <button
              type="button"
              className="vef-btn vef-btn-secondary"
              onClick={handleUpdate}
              disabled={loading}
            >
              Update
            </button>
            <button
              type="button"
              className="vef-btn vef-btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
            <button
              type="button"
              className="vef-btn vef-btn-ghost"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="vef-card">
        <h2 className="vef-table-title">Entries ({entries.length})</h2>
        {loading && entries.length === 0 ? (
          <p className="vef-empty">Loading entries from database...</p>
        ) : entries.length === 0 ? (
          <p className="vef-empty">
            No entries yet. Fill the form above and click Insert.
          </p>
        ) : (
          <div className="vef-table-wrap">
            <table className="vef-table">
              <thead>
                <tr>
                  <th>Office</th>
                  <th>Store</th>
                  <th>Driver</th>
                  <th>Mobile No</th>
                  <th>Vehicle Details</th>
                  <th>Arrival</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleSelectRow(entry)}
                    className={
                      entry.id === selectedId ? "vef-row-selected" : ""
                    }
                  >
                    <td>{entry.officeName}</td>
                    <td>{entry.storeName}</td>
                    <td>{entry.driverName}</td>
                    <td>{entry.mobileNo}</td>
                    <td>{entry.particularName}</td>
                    <td>
                      {entry.arrivalDate} {entry.arrivalTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children, className = "" }) {
  return (
    <label className={`vef-field ${className}`}>
      <span className="vef-label">{label}</span>
      {children}
      {error && <span className="vef-error">{error}</span>}
    </label>
  );
}
