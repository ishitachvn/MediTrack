import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { medicinesAPI, healthAPI, aiAPI } from '../services/api';

const MedsContext = createContext(null);

export const useMeds = () => {
  const context = useContext(MedsContext);
  if (!context) throw new Error('useMeds must be used within a MedsProvider');
  return context;
};

// Standard glass to ml conversion ratio (1 glass = 250ml)
const GLASS_TO_ML = 250;



// Mapping Helpers: Frontend <--> Backend data models
const mapBackendToFrontend = (med) => ({
  id: med._id,
  name: med.medicineName,
  dosage: med.dosage,
  frequency: med.frequency,
  times: med.time ? med.time.split(',') : [],
  instructions: med.instructions || '',
  shape: med.shape || 'tablet',
  color: med.color || 'blue',
  startDate: med.startDate ? med.startDate.split('T')[0] : '',
  endDate: med.endDate ? med.endDate.split('T')[0] : '',
  userId: med.userId,
  history: med.history || {},
});

const mapFrontendToBackend = (med) => ({
  medicineName: med.name,
  dosage: med.dosage,
  frequency: med.frequency,
  time: med.times ? med.times.join(',') : '',
  instructions: med.instructions || '',
  shape: med.shape || 'tablet',
  color: med.color || 'blue',
  startDate: med.startDate,
  endDate: med.endDate,
  history: med.history || {},
});

export const MedsProvider = ({ children }) => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [healthStats, setHealthStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, completed
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  // Fetch personalized daily wellness insight
  const fetchInsight = async () => {
    if (!user) return;
    setInsightLoading(true);
    try {
      const res = await aiAPI.chat("Generate a single sentence personalized wellness insight (1-2 sentences max) based on my medicines and health records. Make it sound natural and conversational. Don't just list raw data. For example: 'Great job! You've already logged 1250 ml of water today and slept 6.5 hours. Don't forget your evening medicines.' If no logs exist, return: 'We don't have enough health data yet. Start tracking your medicines and daily health to receive personalized AI insights.' Do not use markdown headers or quotes.");
      setAiInsight(res.response);
    } catch (err) {
      console.error('Failed to load personalized AI insight:', err);
      setAiInsight('Could not retrieve dynamic insight. Keep tracking to stay healthy!');
    } finally {
      setInsightLoading(false);
    }
  };

  // Load user data (medicines and health logs) on login/session recovery
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Load medicines
      const backendMeds = await medicinesAPI.getMedicines();
      const mappedMeds = backendMeds.map(mapBackendToFrontend);
      
      setMedicines(mappedMeds);

      // 2. Load health tracker history
      const logs = await healthAPI.getHealthLogs();
      const stats = {};
      logs.forEach((log) => {
        const dateStr = new Date(log.date).toISOString().split('T')[0];
        stats[dateStr] = {
          water: Math.round(log.waterIntake / GLASS_TO_ML),
          sleep: log.sleepHours,
          exercise: log.exerciseMinutes,
        };
      });
      setHealthStats(stats);
      // Fetch insight after loading data
      fetchInsight();
    } catch (error) {
      console.error('Failed to load user medication or health stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setMedicines([]);
      setHealthStats({});
    }
  }, [user]);

  // 1. Add Medicine
  const addMedicine = async (medData) => {
    setLoading(true);
    try {
      const backendPayload = mapFrontendToBackend(medData);
      const res = await medicinesAPI.addMedicine(backendPayload);
      const newMed = mapBackendToFrontend(res);
      setMedicines((prev) => [newMed, ...prev]);
      fetchInsight();
    } catch (error) {
      console.error('Failed to add medicine schedule:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2. Edit Medicine
  const editMedicine = async (id, updatedData) => {
    setLoading(true);
    try {
      const localMed = medicines.find((m) => m.id === id);
      if (!localMed) throw new Error('Medicine not found in local state');
      
      const mergedMed = { ...localMed, ...updatedData };
      const backendPayload = mapFrontendToBackend(mergedMed);
      
      const res = await medicinesAPI.updateMedicine(id, backendPayload);
      const updatedMed = mapBackendToFrontend(res);
      
      setMedicines((prev) => prev.map((m) => (m.id === id ? updatedMed : m)));
      fetchInsight();
    } catch (error) {
      console.error('Failed to edit medicine schedule:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Medicine
  const deleteMedicine = async (id) => {
    setLoading(true);
    try {
      await medicinesAPI.deleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      fetchInsight();
    } catch (error) {
      console.error('Failed to delete medicine schedule:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Log Adherence Status
  const logAdherence = async (medId, dateStr, timeStr, status) => {
    try {
      const localMed = medicines.find((m) => m.id === medId);
      if (!localMed) throw new Error('Medicine not found');

      const updatedHistory = { ...localMed.history };
      if (!updatedHistory[dateStr]) {
        updatedHistory[dateStr] = {};
      }
      updatedHistory[dateStr][timeStr] = status;

      const backendPayload = mapFrontendToBackend({ ...localMed, history: updatedHistory });
      const res = await medicinesAPI.updateMedicine(medId, backendPayload);
      const updatedMed = mapBackendToFrontend(res);
      
      setMedicines((prev) => prev.map((m) => (m.id === medId ? updatedMed : m)));
    } catch (error) {
      console.error('Failed to log adherence:', error);
      throw error;
    }
  };

  // 5. Update Health Stats - Water
  const updateWater = async (dateStr, increment) => {
    const todayLog = healthStats[dateStr] || { water: 0, sleep: 0, exercise: 0 };
    const newGlasses = Math.max(0, todayLog.water + increment);

    try {
      const res = await healthAPI.addHealthLog({
        date: dateStr,
        waterIntake: newGlasses * GLASS_TO_ML,
        sleepHours: todayLog.sleep,
        exerciseMinutes: todayLog.exercise,
      });

      setHealthStats((prev) => ({
        ...prev,
        [dateStr]: {
          ...todayLog,
          water: Math.round(res.waterIntake / GLASS_TO_ML),
        },
      }));
      fetchInsight();
    } catch (error) {
      console.error('Failed to update water tracker:', error);
    }
  };

  // 6. Update Health Stats - Sleep
  const updateSleep = async (dateStr, hours) => {
    const todayLog = healthStats[dateStr] || { water: 0, sleep: 0, exercise: 0 };
    const newHours = Math.max(0, hours);

    try {
      const res = await healthAPI.addHealthLog({
        date: dateStr,
        waterIntake: todayLog.water * GLASS_TO_ML,
        sleepHours: newHours,
        exerciseMinutes: todayLog.exercise,
      });

      setHealthStats((prev) => ({
        ...prev,
        [dateStr]: {
          ...todayLog,
          sleep: res.sleepHours,
        },
      }));
      fetchInsight();
    } catch (error) {
      console.error('Failed to update sleep log:', error);
    }
  };

  // 7. Update Health Stats - Exercise
  const updateExercise = async (dateStr, minutes) => {
    const todayLog = healthStats[dateStr] || { water: 0, sleep: 0, exercise: 0 };
    const newMinutes = Math.max(0, minutes);

    try {
      const res = await healthAPI.addHealthLog({
        date: dateStr,
        waterIntake: todayLog.water * GLASS_TO_ML,
        sleepHours: todayLog.sleep,
        exerciseMinutes: newMinutes,
      });

      setHealthStats((prev) => ({
        ...prev,
        [dateStr]: {
          ...todayLog,
          exercise: res.exerciseMinutes,
        },
      }));
      fetchInsight();
    } catch (error) {
      console.error('Failed to update exercise minutes:', error);
    }
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

  // Adherence compliance rate calculations
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
    adherenceRate: getAdherenceRate(),
    loading,
    refreshData: loadData,
    aiInsight,
    insightLoading,
    fetchInsight,
  };

  return <MedsContext.Provider value={value}>{children}</MedsContext.Provider>;
};
