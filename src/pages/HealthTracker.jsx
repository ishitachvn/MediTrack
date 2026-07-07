import React, { useState } from 'react';

import { useMeds } from '../context/MedsContext';

import { GlassWater, Moon, Flame, Calendar, Award, CheckCircle, AlertCircle } from 'lucide-react';

import { Bar, Line } from 'react-chartjs-2';

import Toast from '../components/Toast';

import './HealthTracker.css';



const HealthTracker = () => {

  const { healthStats, updateWater, updateSleep, updateExercise } = useMeds();

  

  // Active Date selector

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  

  // Custom inputs state

  const [sleepInput, setSleepInput] = useState('');

  const [exerciseInput, setExerciseInput] = useState('');



  // Toast notifications

  const [toastMessage, setToastMessage] = useState('');

  const [toastType, setToastType] = useState('success');



  // Stats for selected date

  const statsForDate = healthStats[selectedDate] || { water: 0, sleep: 0, exercise: 0 };



  const handleWaterClick = (amt) => {

    updateWater(selectedDate, amt);

    setToastType(amt > 0 ? 'success' : 'info');

    setToastMessage(`Water intake updated for ${selectedDate}`);

  };



  const handleSleepSubmit = (e) => {

    e.preventDefault();

    const hours = parseFloat(sleepInput);

    if (isNaN(hours) || hours < 0 || hours > 24) {

      setToastType('error');

      setToastMessage('Please enter a valid sleep duration (0-24 hours).');

      return;

    }

    updateSleep(selectedDate, hours);

    setSleepInput('');

    setToastType('success');

    setToastMessage(`Sleep hours updated to ${hours} hrs for ${selectedDate}`);

  };



  const handleExerciseSubmit = (e) => {

    e.preventDefault();

    const mins = parseInt(exerciseInput, 10);

    if (isNaN(mins) || mins < 0 || mins > 1440) {

      setToastType('error');

      setToastMessage('Please enter valid exercise minutes.');

      return;

    }

    updateExercise(selectedDate, mins);

    setExerciseInput('');

    setToastType('success');

    setToastMessage(`Exercise duration updated to ${mins} mins for ${selectedDate}`);

  };



  // Generate chart data for last 7 days

  const getWeeklyHabitChartData = () => {

    const labels = [];

    const sleepData = [];

    const exerciseData = [];

    

    for (let i = 6; i >= 0; i--) {

      const d = new Date();

      d.setDate(new Date().getDate() - i);

      const dStr = d.toISOString().split('T')[0];

      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

      

      const dayStats = healthStats[dStr] || { water: 0, sleep: 0, exercise: 0 };

      sleepData.push(dayStats.sleep || 0);

      exerciseData.push(dayStats.exercise || 0);

    }



    return {

      labels,

      datasets: [

        {

          label: 'Sleep Duration (hrs)',

          data: sleepData,

          backgroundColor: 'rgba(139, 92, 246, 0.75)',

          borderColor: 'rgb(139, 92, 246)',

          borderWidth: 1.5,

          yAxisID: 'y'

        },

        {

          label: 'Exercise (mins)',

          data: exerciseData,

          backgroundColor: 'rgba(245, 158, 11, 0.75)',

          borderColor: 'rgb(245, 158, 11)',

          borderWidth: 1.5,

          yAxisID: 'y1'

        }

      ]

    };

  };



  const chartOptions = {

    responsive: true,

    interaction: {

      mode: 'index',

      intersect: false

    },

    scales: {

      y: {

        type: 'linear',

        display: true,

        position: 'left',

        title: { display: true, text: 'Sleep (hours)' },

        min: 0,

        max: 12

      },

      y1: {

        type: 'linear',

        display: true,

        position: 'right',

        title: { display: true, text: 'Exercise (minutes)' },

        grid: { drawOnChartArea: false },

        min: 0

      }

    }

  };



  // Adherence Achievement Calculations

  const getDailyScore = () => {

    let score = 0;

    if (statsForDate.water >= 8) score += 33;

    else score += Math.round((statsForDate.water / 8) * 33);

    

    if (statsForDate.sleep >= 7 && statsForDate.sleep <= 9) score += 33;

    else if (statsForDate.sleep > 0) score += 15;



    if (statsForDate.exercise >= 30) score += 34;

    else score += Math.round((statsForDate.exercise / 30) * 34);



    return Math.min(100, score);

  };



  const score = getDailyScore();



  return (

    <div className="tracker-container animate-fade-in">

      {toastMessage && (

        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      )}



      {/* Header Panel */}

      <section className="tracker-header-card glass-panel">

        <div className="tracker-meta">

          <h2>Health Habit Tracker</h2>

          <p>Analyze and record water hydration, sleep parameters, and fitness goals.</p>

        </div>

        

        {/* Date Selector input */}

        <div className="date-picker-group">

          <label htmlFor="tracker-active-date"><Calendar size={16} /> Selected Date:</label>

          <input

            id="tracker-active-date"

            type="date"

            value={selectedDate}

            onChange={(e) => setSelectedDate(e.target.value)}

            max={new Date().toISOString().split('T')[0]}

          />

        </div>

      </section>



      {/* Progress score */}

      <section className="score-summary-bar glass-panel">

        <div className="score-label-area">

          <Award size={24} className="score-award-icon" />

          <div>

            <h4>Daily Wellness Score: {score}%</h4>

            <p>Calculated based on target guidelines (8 water glasses, 7h sleep, 30m exercise)</p>

          </div>

        </div>

        <div className="score-track">

          <div className="score-fill" style={{ width: `${score}%` }}></div>

        </div>

      </section>



      {/* Daily Empty State Wellness Logs Reminder */}

      {statsForDate.water === 0 && statsForDate.sleep === 0 && statsForDate.exercise === 0 && (

        <div className="glass-panel animate-fade-in" style={{

          padding: '1.25rem 1.5rem',

          marginBottom: '1.5rem',

          display: 'flex',

          alignItems: 'center',

          gap: '1rem',

          borderLeft: '4px solid var(--warning)',

          borderRadius: 'var(--radius-md)'

        }}>

          <AlertCircle size={20} className="text-warning" style={{ flexShrink: 0 }} />

          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>

            You haven't logged any health information today.<br />

            Start tracking your water intake, sleep, and exercise to unlock AI insights.

          </p>

        </div>

      )}



      {/* Cards columns */}

      <div className="trackers-grid">

        {/* 1. Water Intake glass filler */}

        <div className="tracker-card glass-panel water">

          <div className="tracker-card-head">

            <GlassWater size={32} className="card-icon text-primary" />

            <div>

              <h3>Water Hydration</h3>

              <p>Target: 8 glasses daily</p>

            </div>

          </div>



          <div className="water-visualizer">

            {/* Styled interactive glass visual */}

            <div className="cup-container">

              <div className="cup-water-fill" style={{ height: `${Math.min(100, (statsForDate.water / 8) * 100)}%` }}></div>

              <span className="cup-text">{statsForDate.water} gl</span>

            </div>

          </div>



          <div className="tracker-card-actions">

            <button onClick={() => handleWaterClick(-1)} disabled={statsForDate.water <= 0} className="btn-decrease-counter">- 1 Glass</button>

            <button onClick={() => handleWaterClick(1)} className="btn-increase-counter">+ 1 Glass</button>

          </div>

        </div>



        {/* 2. Sleep Card */}

        <div className="tracker-card glass-panel sleep">

          <div className="tracker-card-head">

            <Moon size={32} className="card-icon text-accent" />

            <div>

              <h3>Sleep Log</h3>

              <p>Target: 7 - 9 hours daily</p>

            </div>

          </div>



          <div className="tracker-card-middle">

            <div className="mini-stats-circle purple">

              <span>{statsForDate.sleep || 0}</span>

              <small>Hours</small>

            </div>

          </div>



          <form onSubmit={handleSleepSubmit} className="habit-update-form">

            <label htmlFor="sleep-log-input">Log sleep hours:</label>

            <div className="habit-input-group">

              <input

                id="sleep-log-input"

                type="number"

                step="0.5"

                placeholder="e.g. 7.5"

                value={sleepInput}

                onChange={(e) => setSleepInput(e.target.value)}

              />

              <button type="submit">Log</button>

            </div>

          </form>

        </div>



        {/* 3. Exercise Card */}

        <div className="tracker-card glass-panel exercise">

          <div className="tracker-card-head">

            <Flame size={32} className="card-icon text-warning" />

            <div>

              <h3>Exercise Tracker</h3>

              <p>Target: 30 minutes daily</p>

            </div>

          </div>



          <div className="tracker-card-middle">

            <div className="mini-stats-circle orange">

              <span>{statsForDate.exercise || 0}</span>

              <small>Minutes</small>

            </div>

          </div>



          <form onSubmit={handleExerciseSubmit} className="habit-update-form">

            <label htmlFor="exercise-log-input">Log active minutes:</label>

            <div className="habit-input-group">

              <input

                id="exercise-log-input"

                type="number"

                placeholder="e.g. 45"

                value={exerciseInput}

                onChange={(e) => setExerciseInput(e.target.value)}

              />

              <button type="submit">Log</button>

            </div>

          </form>

        </div>

      </div>



      {/* Habit performance charts */}

      <section className="habits-chart-panel glass-panel">

        <div className="panel-chart-header">

          <h4>Weekly Sleep vs Exercise Trend</h4>

          <p>Double axis chart representing logged durations across the last 7 days</p>

        </div>

        <div className="tracker-chart-container">

          <Bar data={getWeeklyHabitChartData()} options={chartOptions} />

        </div>

      </section>

    </div>

  );

};



export default HealthTracker;

