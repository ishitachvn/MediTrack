import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeds } from '../context/MedsContext';
import { ArrowLeft, Clock, Plus, Trash2, Calendar, Pill } from 'lucide-react';
import Toast from '../components/Toast';
import './AddMedicine.css';

const AddMedicine = () => {
  const { addMedicine } = useMeds();
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [times, setTimes] = useState(['08:00']);
  const [instructions, setInstructions] = useState('Take with water after food');
  const [shape, setShape] = useState('tablet');
  const [color, setColor] = useState('blue');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Handle adding new time inputs
  const handleAddTimeField = () => {
    setTimes([...times, '12:00']);
  };

  // Handle removing time inputs
  const handleRemoveTimeField = (index) => {
    if (times.length === 1) return;
    const updated = times.filter((_, idx) => idx !== index);
    setTimes(updated);
  };

  // Handle changing time inputs
  const handleTimeChange = (index, value) => {
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Medicine name is required';
    if (!dosage.trim()) newErrors.dosage = 'Dosage (e.g. 1 pill, 10mg) is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    
    // Check if times contain duplicates or invalid
    const emptyTime = times.some(t => !t);
    if (emptyTime) newErrors.times = 'Please select a valid time for all entries';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const medData = {
        name,
        dosage,
        frequency,
        times,
        instructions,
        shape,
        color,
        startDate,
        endDate: endDate || null
      };

      addMedicine(medData);
      setToastType('success');
      setToastMessage('Medicine schedule added successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to add medicine.');
    }
  };

  return (
    <div className="add-med-container animate-fade-in">
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}

      <div className="form-back-nav">
        <Link to="/dashboard" className="btn-back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="add-med-card glass-panel">
        <div className="form-header">
          <div className="form-header-icon-wrapper">
            <Pill size={24} />
          </div>
          <div>
            <h2>Add New Medication</h2>
            <p>Schedule alerts and configure adherence rules for health tracking.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="med-form">
          <div className="form-grid-2">
            {/* Med Name */}
            <div className="form-group-field">
              <label htmlFor="med-name">Medicine Name</label>
              <input
                id="med-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aspirin, Metformin"
                className={errors.name ? 'field-error' : ''}
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            {/* Dosage */}
            <div className="form-group-field">
              <label htmlFor="med-dosage">Dosage strength</label>
              <input
                id="med-dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet, 10ml, 500mg"
                className={errors.dosage ? 'field-error' : ''}
              />
              {errors.dosage && <span className="field-error-text">{errors.dosage}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            {/* Frequency */}
            <div className="form-group-field">
              <label htmlFor="med-frequency">Frequency</label>
              <select
                id="med-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily Schedule</option>
                <option value="weekly">Weekly Schedule</option>
                <option value="as-needed">As Needed (PRN)</option>
              </select>
            </div>

            {/* Instructions */}
            <div className="form-group-field">
              <label htmlFor="med-instructions">Special Instructions</label>
              <select
                id="med-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              >
                <option value="Take with water after food">Take with water after food</option>
                <option value="Take on an empty stomach">Take on an empty stomach</option>
                <option value="Take before going to sleep">Take before going to sleep</option>
                <option value="Take with food/breakfast">Take with food/breakfast</option>
                <option value="Do not chew, swallow whole">Do not chew, swallow whole</option>
              </select>
            </div>
          </div>

          {/* Time Picker Entries */}
          <div className="times-selector-box">
            <div className="times-box-header">
              <label><Clock size={16} /> Scheduled Dosage Hours</label>
              <button type="button" onClick={handleAddTimeField} className="btn-add-time">
                <Plus size={14} /> Add Time
              </button>
            </div>
            {errors.times && <span className="field-error-text block-error">{errors.times}</span>}

            <div className="times-list-inputs">
              {times.map((time, idx) => (
                <div key={idx} className="time-input-row">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeField(idx)}
                    disabled={times.length === 1}
                    className="btn-remove-time"
                    title="Remove time option"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Shape and Color Indicators */}
          <div className="form-grid-2">
            {/* Shape Select */}
            <div className="form-group-field">
              <label>Medicine Shape</label>
              <div className="shape-options-grid">
                {['tablet', 'capsule', 'liquid', 'injection'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn-shape-select ${shape === item ? 'selected' : ''}`}
                    onClick={() => setShape(item)}
                  >
                    <span className="capitalize">{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Select */}
            <div className="form-group-field">
              <label>Color Code Theme</label>
              <div className="color-options-grid">
                {['blue', 'green', 'red', 'yellow'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`btn-color-select ${col} ${color === col ? 'selected' : ''}`}
                    onClick={() => setColor(col)}
                    aria-label={`Select color theme ${col}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            {/* Start Date */}
            <div className="form-group-field">
              <label htmlFor="med-start-date"><Calendar size={14} /> Start Date</label>
              <input
                id="med-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={errors.startDate ? 'field-error' : ''}
              />
              {errors.startDate && <span className="field-error-text">{errors.startDate}</span>}
            </div>

            {/* End Date */}
            <div className="form-group-field">
              <label htmlFor="med-end-date"><Calendar size={14} /> End Date (Optional)</label>
              <input
                id="med-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          <button type="submit" className="btn-med-submit">
            Save Scheduled Medication
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMedicine;
