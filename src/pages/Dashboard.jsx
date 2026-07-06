import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeds } from '../context/MedsContext';
import { 
  Check, X, Pill, Clock, Plus, GlassWater, Moon, Flame, 
  ChevronRight, Calendar, AlertCircle, Trash2, Edit 
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import './Dashboard.css';

// Register ChartJS elements
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    medicines, 
    healthStats, 
    logAdherence, 
    updateWater, 
    adherenceRate,
    deleteMedicine 
  } = useMeds();

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(null);

  // Today's Date representation
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get current user's stats for today
  const todayStats = healthStats[dateStr] || { water: 0, sleep: 0, exercise: 0 };

  // Calculate schedule for today's medications
  const todaySchedule = [];
  medicines.forEach((med) => {
    // Check if today falls in range
    const isAfterStart = !med.startDate || med.startDate <= dateStr;
    const isBeforeEnd = !med.endDate || med.endDate >= dateStr;
    
    if (isAfterStart && isBeforeEnd) {
      med.times.forEach((time) => {
        const logStatus = med.history?.[dateStr]?.[time] || 'pending';
        todaySchedule.push({
          medId: med.id,
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          color: med.color,
          shape: med.shape,
          time,
          status: logStatus
        });
      });
    }
  });

  // Sort schedule chronologically
  todaySchedule.sort((a, b) => a.time.localeCompare(b.time));

  // Count pending, taken, missed
  const statsCount = todaySchedule.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, { taken: 0, missed: 0, pending: 0 });

  const totalTodayMeds = todaySchedule.length;
  const takenPercentage = totalTodayMeds === 0 ? 100 : Math.round((statsCount.taken / totalTodayMeds) * 100);

  // Quick Action Handler for pill taking
  const handlePillAction = (medId, time, status) => {
    logAdherence(medId, dateStr, time, status);
    setToastType(status === 'taken' ? 'success' : 'warning');
    setToastMessage(`Medicine marked as ${status === 'taken' ? 'Taken' : 'Missed'}`);
  };

  // Water Tracker Actions
  const handleWaterIncrement = () => {
    updateWater(dateStr, 1);
    setToastType('success');
    setToastMessage('Water intake recorded (+1 glass)');
  };

  const handleWaterDecrement = () => {
    updateWater(dateStr, -1);
    setToastType('info');
    setToastMessage('Water intake decreased (-1 glass)');
  };

  // Delete Action Trigger
  const triggerDeleteConfirm = (id) => {
    setSelectedMedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMedId) {
      deleteMedicine(selectedMedId);
      setToastType('error');
      setToastMessage('Medicine deleted successfully.');
      setDeleteModalOpen(false);
      setSelectedMedId(null);
    }
  };

  // 1. Chart Data: Water Intake Log (Last 7 Days)
  const getWaterChartData = () => {
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(healthStats[dStr]?.water || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Glasses of Water',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverRadius: 6
        }
      ]
    };
  };

  // 2. Chart Data: Medication Log adherence by day (Last 7 Days)
  const getAdherenceChartData = () => {
    const labels = [];
    const dataTaken = [];
    const dataMissed = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      
      let taken = 0;
      let missed = 0;
      medicines.forEach((m) => {
        if (m.history?.[dStr]) {
          Object.keys(m.history[dStr]).forEach((t) => {
            if (m.history[dStr][t] === 'taken') taken++;
            if (m.history[dStr][t] === 'missed') missed++;
          });
        }
      });
      dataTaken.push(taken);
      dataMissed.push(missed);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Taken Doses',
          data: dataTaken,
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderRadius: 4
        },
        {
          label: 'Missed Doses',
          data: dataMissed,
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderRadius: 4
        }
      ]
    };
  };

  const waterChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { boxPadding: 6 }
    },
    scales: {
      y: { min: 0, max: 12, ticks: { stepSize: 2 } }
    }
  };

  const adherenceChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, min: 0, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action will remove all history logs associated with it."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Top Greeting Welcome Banner */}
      <section className="welcome-banner glass-panel">
        <div className="welcome-info">
          <span className="current-day">{dayName}, {formattedDate}</span>
          <h2>Welcome Back, {user?.name || 'User'}!</h2>
          <p className="user-health-goal">
            Current Health Objective: <strong>"{user?.dailyGoal || 'Stay fit and active'}"</strong>
          </p>
        </div>
        <div className="adherence-dial-wrapper">
          <div className="adherence-radial-progress" style={{ '--adherence-rate': adherenceRate }}>
            <div className="radial-inner">
              <span className="radial-num">{adherenceRate}%</span>
              <span className="radial-lbl">Adherence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Summary Cards */}
      <section className="stats-row">
        <div className="summary-card glass-panel flex-row">
          <div className="icon-box-dash text-success bg-success-light">
            <Check size={20} />
          </div>
          <div>
            <h3>{statsCount.taken} Taken</h3>
            <p>Doses ticked today</p>
          </div>
        </div>

        <div className="summary-card glass-panel flex-row">
          <div className="icon-box-dash text-danger bg-danger-light">
            <X size={20} />
          </div>
          <div>
            <h3>{statsCount.missed} Missed</h3>
            <p>Doses skipped today</p>
          </div>
        </div>

        <div className="summary-card glass-panel flex-row">
          <div className="icon-box-dash text-warning bg-warning-light">
            <Clock size={20} />
          </div>
          <div>
            <h3>{statsCount.pending} Pending</h3>
            <p>Remaining scheduled doses</p>
          </div>
        </div>
      </section>

      {/* Two Columns: Main Schedule & Habit Tracking widgets */}
      <div className="dashboard-grid">
        {/* Left: Schedule Card */}
        <div className="schedule-panel glass-panel">
          <div className="panel-header">
            <div className="header-title">
              <Calendar size={20} className="header-icon" />
              <h3>Today's Medication Schedule</h3>
            </div>
            <Link to="/add-medicine" className="btn-add-shortcut">
              <Plus size={16} /> Add Med
            </Link>
          </div>

          <div className="schedule-list">
            {todaySchedule.length === 0 ? (
              <div className="empty-schedule">
                <Pill size={40} className="empty-icon text-muted" />
                <p>No medications scheduled for today.</p>
                <Link to="/add-medicine" className="btn-primary-link">Schedule your first dose</Link>
              </div>
            ) : (
              todaySchedule.map((item, idx) => (
                <div key={`${item.medId}-${item.time}-${idx}`} className={`schedule-item ${item.status}`}>
                  <div className={`status-indicator ${item.color}`}></div>
                  <div className="item-details">
                    <div className="time-badge">
                      <Clock size={12} /> {item.time}
                    </div>
                    <h4>{item.name}</h4>
                    <p className="med-dosage-info">{item.dosage} &bull; {item.instructions}</p>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="schedule-actions">
                    {item.status === 'pending' ? (
                      <>
                        <button 
                          className="btn-pill-tick taken" 
                          onClick={() => handlePillAction(item.medId, item.time, 'taken')}
                          title="Mark as Taken"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          className="btn-pill-cross missed" 
                          onClick={() => handlePillAction(item.medId, item.time, 'missed')}
                          title="Mark as Missed"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <span className={`adherence-badge-status ${item.status}`}>
                        {item.status === 'taken' ? 'Taken' : 'Missed'}
                        <button 
                          className="btn-status-undo"
                          onClick={() => logAdherence(item.medId, dateStr, item.time, 'pending')}
                          title="Undo choice"
                        >
                          Undo
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Habit Trackers */}
        <div className="habits-panel">
          {/* Water Intake Tracker Card */}
          <div className="habit-quick-card glass-panel">
            <div className="habit-header">
              <div className="habit-title">
                <GlassWater className="text-primary" size={22} />
                <div>
                  <h4>Water Intake Tracker</h4>
                  <p>Daily Goal: 8 Glasses</p>
                </div>
              </div>
              <span className="habit-progress-text">{todayStats.water} / 8 Glasses</span>
            </div>
            
            <div className="water-increment-bar">
              <div className="water-progress-track">
                <div className="water-fill" style={{ width: `${Math.min(100, (todayStats.water / 8) * 100)}%` }}></div>
              </div>
              <div className="water-buttons">
                <button onClick={handleWaterDecrement} disabled={todayStats.water <= 0} className="btn-water-minus">-</button>
                <button onClick={handleWaterIncrement} className="btn-water-plus">+</button>
              </div>
            </div>
          </div>

          {/* Sleep and Exercise Summary Cards */}
          <div className="small-habits-row">
            <div className="habit-mini-card glass-panel">
              <Moon size={20} className="text-accent" />
              <div>
                <h5>Sleep Logs</h5>
                <p><strong>{todayStats.sleep || 0} hrs</strong> logged today</p>
              </div>
              <Link to="/health-tracker" className="btn-mini-arrow"><ChevronRight size={16} /></Link>
            </div>

            <div className="habit-mini-card glass-panel">
              <Flame size={20} className="text-warning" />
              <div>
                <h5>Exercise Logs</h5>
                <p><strong>{todayStats.exercise || 0} min</strong> active today</p>
              </div>
              <Link to="/health-tracker" className="btn-mini-arrow"><ChevronRight size={16} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <section className="charts-row">
        <div className="chart-card-wrapper glass-panel">
          <div className="chart-header">
            <h4>Daily Water Hydration Chart</h4>
            <p>Water log (glasses) for the last 7 days</p>
          </div>
          <div className="chart-container">
            <Line data={getWaterChartData()} options={waterChartOptions} />
          </div>
        </div>

        <div className="chart-card-wrapper glass-panel">
          <div className="chart-header">
            <h4>Medication Adherence Overview</h4>
            <p>Taken vs Missed dosages count (weekly)</p>
          </div>
          <div className="chart-container">
            <Bar data={getAdherenceChartData()} options={adherenceChartOptions} />
          </div>
        </div>
      </section>

      {/* Medicines Inventory Directory (Manage existing meds) */}
      <section className="inventory-section glass-panel">
        <div className="inventory-header">
          <h3>Your Medication Inventory</h3>
          <p>Edit or remove active scheduling configurations</p>
        </div>

        <div className="inventory-grid">
          {medicines.length === 0 ? (
            <div className="empty-inventory">
              <p>No medications configured. Click 'Add Medicine' to create schedules.</p>
            </div>
          ) : (
            medicines.map((med) => (
              <div key={med.id} className="inventory-card">
                <div className="inventory-card-top">
                  <div className="inventory-title-area">
                    <span className={`shape-dot ${med.color}`}></span>
                    <div>
                      <h5>{med.name}</h5>
                      <p>{med.dosage} &bull; {med.frequency}</p>
                    </div>
                  </div>
                  <div className="inventory-actions">
                    <Link to={`/edit-medicine/${med.id}`} className="btn-inv-edit" title="Edit schedule">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => triggerDeleteConfirm(med.id)} className="btn-inv-delete" title="Delete medicine">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="inventory-card-bottom">
                  <span className="inv-times">Scheduled Times: {med.times.join(', ')}</span>
                  {med.endDate && <span className="inv-duration">Ends on: {med.endDate}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
