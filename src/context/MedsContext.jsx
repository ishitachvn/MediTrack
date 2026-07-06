import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const MedsContext = createContext(null);

export const useMeds = () => {
  const context = useContext(MedsContext);
  if (!context) throw new Error('useMeds must be used within a MedsProvider');
  return context;
};

// Initial Mock Medicines for demo/reference (attached to a user when they first log in)
const defaultMeds = [
  {
    id: 'med_1',
    name: 'Atorvastatin',
    dosage: '10mg',
    frequency: 'daily',
    times: ['21:00'],
    instructions: 'Take with or after dinner',
    shape: 'tablet',
    color: 'blue',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    userId: 'demo_user',
    history: {
      '2026-07-04': { '21:00': 'taken' },
      '2026-07-05': { '21:00': 'taken' }
    }
  },
  {
    id: 'med_2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'daily',
    times: ['08:00', '20:00'],
    instructions: 'Take with breakfast and dinner',
    shape: 'capsule',
    color: 'green',
    startDate: '2026-06-15',
    endDate: '2026-12-15',
    userId: 'demo_user',
    history: {
      '2026-07-04': { '08:00': 'taken', '20:00': 'taken' },
      '2026-07-05': { '08:00': 'taken', '20:00': 'pending' }
    }
  },
  {
    id: 'med_3',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'daily',
    times: ['08:00'],
    instructions: 'Take in the morning on an empty stomach',
    shape: 'tablet',
    color: 'red',
    startDate: '2026-07-03',
    endDate: '2026-09-03',
    userId: 'demo_user',
    history: {
      '2026-07-04': { '08:00': 'taken' },
      '2026-07-05': { '08:00': 'missed' }
    }
  }
];

// Initial Health Tracker Stats for Demo
const defaultHealthStats = {
  '2026-07-04': { water: 6, sleep: 7.5, exercise: 45 },
  '2026-07-05': { water: 5, sleep: 6.8, exercise: 20 }
};

export const MedsProvider = ({ children }) => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [healthStats, setHealthStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, completed

  // Load user data on login/logout
  useEffect(() => {
    if (user) {
      // Load user specific medicines
      const allMeds = JSON.parse(localStorage.getItem('meditrack_medicines')) || [];
      const userMeds = allMeds.filter((m) => m.userId === user.id);
      
      // If a brand new user logged in, give them the template meds for demo purposes
      if (userMeds.length === 0) {
        const demoMedsForUser = defaultMeds.map((m) => ({ ...m, userId: user.id, id: 'med_' + Math.random().toString(36).substring(2, 9) }));
        const updatedAllMeds = [...allMeds, ...demoMedsForUser];
        localStorage.setItem('meditrack_medicines', JSON.stringify(updatedAllMeds));
        setMedicines(demoMedsForUser);
      } else {
        setMedicines(userMeds);
      }

      // Load user health tracker stats
      const allHealthStats = JSON.parse(localStorage.getItem('meditrack_health_stats')) || {};
      const userHealthKey = `stats_${user.id}`;
      const userStats = allHealthStats[userHealthKey] || {};
      
      // Seed demo data if none exists
      if (Object.keys(userStats).length === 0) {
        allHealthStats[userHealthKey] = defaultHealthStats;
        localStorage.setItem('meditrack_health_stats', JSON.stringify(allHealthStats));
        setHealthStats(defaultHealthStats);
      } else {
        setHealthStats(userStats);
      }
    } else {
      setMedicines([]);
      setHealthStats({});
    }
  }, [user]);

  // Sync state to local storage helper
  const syncMedicines = (updatedMeds) => {
    setMedicines(updatedMeds);
    const allMeds = JSON.parse(localStorage.getItem('meditrack_medicines')) || [];
    // Remove user's old meds and add new ones
    const filteredAllMeds = allMeds.filter((m) => m.userId !== user?.id);
    const finalAllMeds = [...filteredAllMeds, ...updatedMeds.map(m => ({ ...m, userId: user.id }))];
    localStorage.setItem('meditrack_medicines', JSON.stringify(finalAllMeds));
  };

  const syncHealthStats = (updatedStats) => {
    setHealthStats(updatedStats);
    const allHealthStats = JSON.parse(localStorage.getItem('meditrack_health_stats')) || {};
    const userHealthKey = `stats_${user?.id}`;
    allHealthStats[userHealthKey] = updatedStats;
    localStorage.setItem('meditrack_health_stats', JSON.stringify(allHealthStats));
  };

  // 1. Add Medicine
  const addMedicine = (medData) => {
    const newMed = {
      id: 'med_' + Math.random().toString(36).substring(2, 9),
      ...medData,
      userId: user.id,
      history: medData.history || {}
    };
    syncMedicines([newMed, ...medicines]);
  };

  // 2. Edit Medicine
  const editMedicine = (id, updatedData) => {
    const updated = medicines.map((m) => (m.id === id ? { ...m, ...updatedData } : m));
    syncMedicines(updated);
  };

  // 3. Delete Medicine
  const deleteMedicine = (id) => {
    const updated = medicines.filter((m) => m.id !== id);
    syncMedicines(updated);
  };

  // 4. Log Adherence Status
  const logAdherence = (medId, dateStr, timeStr, status) => {
    const updated = medicines.map((m) => {
      if (m.id === medId) {
        const history = { ...m.history };
        if (!history[dateStr]) {
          history[dateStr] = {};
        }
        history[dateStr][timeStr] = status; // 'taken', 'missed', or 'pending'
        return { ...m, history };
      }
      return m;
    });
    syncMedicines(updated);
  };

  // 5. Update Health Stats
  const updateWater = (dateStr, increment) => {
    const currentStats = { ...healthStats };
    if (!currentStats[dateStr]) {
      currentStats[dateStr] = { water: 0, sleep: 0, exercise: 0 };
    }
    currentStats[dateStr].water = Math.max(0, (currentStats[dateStr].water || 0) + increment);
    syncHealthStats(currentStats);
  };

  const updateSleep = (dateStr, hours) => {
    const currentStats = { ...healthStats };
    if (!currentStats[dateStr]) {
      currentStats[dateStr] = { water: 0, sleep: 0, exercise: 0 };
    }
    currentStats[dateStr].sleep = Math.max(0, hours);
    syncHealthStats(currentStats);
  };

  const updateExercise = (dateStr, minutes) => {
    const currentStats = { ...healthStats };
    if (!currentStats[dateStr]) {
      currentStats[dateStr] = { water: 0, sleep: 0, exercise: 0 };
    }
    currentStats[dateStr].exercise = Math.max(0, minutes);
    syncHealthStats(currentStats);
  };

  // Filter & Search Logic
  const getFilteredMedicines = () => {
    return medicines.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.instructions.toLowerCase().includes(searchQuery.toLowerCase());

      const today = new Date().toISOString().split('T')[0];
      const isCompleted = m.endDate && m.endDate < today;
      
      if (!matchesSearch) return false;
      if (filterType === 'active') return !isCompleted;
      if (filterType === 'completed') return isCompleted;
      return true;
    });
  };

  // Calculate Overall Adherence rate for dashboard stats
  const getAdherenceRate = () => {
    let totalScheduled = 0;
    let totalTaken = 0;

    medicines.forEach((m) => {
      if (m.history) {
        Object.keys(m.history).forEach((date) => {
          Object.keys(m.history[date]).forEach((time) => {
            const status = m.history[date][time];
            if (status === 'taken' || status === 'missed') {
              totalScheduled++;
              if (status === 'taken') {
                totalTaken++;
              }
            }
          });
        });
      }
    });

    return totalScheduled === 0 ? 100 : Math.round((totalTaken / totalScheduled) * 100);
  };

  const value = {
    medicines: getFilteredMedicines(),
    rawMedicines: medicines,
    healthStats,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    addMedicine,
    editMedicine,
    deleteMedicine,
    logAdherence,
    updateWater,
    updateSleep,
    updateExercise,
    adherenceRate: getAdherenceRate()
  };

  return <MedsContext.Provider value={value}>{children}</MedsContext.Provider>;
};
