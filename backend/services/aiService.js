const { GoogleGenAI } = require('@google/genai');

// Standard conversion ratio
const GLASS_TO_ML = 250;

/**
 * Deterministic local resolver for quick data lookups that do not require an LLM.
 * Bypasses Gemini API call to reduce latency and quota usage.
 */
const resolveLocally = (question, medicines, healthLogs) => {
  const q = question.toLowerCase().trim();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTimeStr = today.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

  // Helper to fetch today's health stats
  const getTodayLog = () => {
    const log = healthLogs.find(l => {
      const logDateStr = new Date(l.date).toISOString().split('T')[0];
      return logDateStr === todayStr;
    });
    return log || { waterIntake: 0, sleepHours: 0, exerciseMinutes: 0 };
  };

  // Helper to check if a medicine is scheduled today
  const isMedActiveToday = (med) => {
    const start = med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : '';
    const end = med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : '';
    const isAfterStart = !start || start <= todayStr;
    const isBeforeEnd = !end || end >= todayStr;
    return isAfterStart && isBeforeEnd;
  };

  // Helper to construct today's schedule list
  const getTodaySchedule = () => {
    const schedule = [];
    medicines.forEach(m => {
      console.log('DEBUG RESOLVE LOCALLY medicine:', JSON.stringify(m));
      if (isMedActiveToday(m)) {
        const times = m.time ? m.time.split(',') : [];
        times.forEach(t => {
          const status = m.history?.[todayStr]?.[t] || 'pending';
          schedule.push({
            name: m.medicineName,
            dosage: m.dosage,
            time: t,
            status,
            instructions: m.instructions || 'No instructions'
          });
        });
      }
    });
    schedule.sort((a, b) => a.time.localeCompare(b.time));
    return schedule;
  };

  // 1. "What medicines do I have today?"
  if (
    (q.includes('medicine') || q.includes('meds') || q.includes('pill')) && 
    (q.includes('today') || q.includes('have today') || q.includes('what do i have'))
  ) {
    const sched = getTodaySchedule();
    if (sched.length === 0) {
      return `You have no medicines scheduled for today, **${dayName}**.`;
    }
    let res = `Here is your medicine schedule for today, **${dayName}**:\n\n`;
    sched.forEach(item => {
      const statusIcon = item.status === 'taken' ? '✅' : item.status === 'missed' ? '❌' : '⏳';
      res += `- **${item.time}** - ${item.name} (${item.dosage}) - ${item.instructions} [${statusIcon} ${item.status.toUpperCase()}]\n`;
    });
    return res;
  }

  // 2. "What is my next medicine?"
  if (q.includes('next medicine') || q.includes('next dose') || q.includes('what is my next')) {
    const sched = getTodaySchedule();
    const remaining = sched.filter(item => item.time >= currentTimeStr && item.status === 'pending');
    
    if (remaining.length === 0) {
      const takenAll = sched.some(item => item.status === 'taken');
      if (takenAll) {
        return "You have no remaining pending doses today. You are all caught up!";
      }
      return "You have no more medicines scheduled for today.";
    }

    const next = remaining[0];
    return `Your next medicine is **${next.name}** (${next.dosage}) due at **${next.time}**.\nSpecial instructions: *${next.instructions}*.`;
  }

  // 3. "How many medicines are pending?" / "Did I miss any?"
  if (q.includes('pending') || q.includes('how many pending') || q.includes('missed any')) {
    const sched = getTodaySchedule();
    const pending = sched.filter(item => item.status === 'pending').length;
    const missed = sched.filter(item => item.status === 'missed').length;
    const taken = sched.filter(item => item.status === 'taken').length;

    if (sched.length === 0) {
      return "You have no scheduled doses today.";
    }

    if (q.includes('missed')) {
      if (missed === 0) {
        return "Great job! You haven't missed any medicines today.";
      }
      return `You have missed **${missed}** scheduled dose(s) today. Please log them if you take them later.`;
    }

    return `Today's schedule stats:\n- **${pending}** Pending\n- **${taken}** Taken\n- **${missed}** Missed`;
  }

  // 4. "How much water did I drink today?" / "water intake"
  if (q.includes('water') && (q.includes('today') || q.includes('drink') || q.includes('how much') || q.includes('log'))) {
    const log = getTodayLog();
    const glasses = Math.round((log.waterIntake || 0) / GLASS_TO_ML);
    const goalStatus = glasses >= 8 ? "🎉 You've reached your daily hydration goal!" : `You need ${8 - glasses} more glasses to reach your goal.`;
    return `You have logged **${glasses} glasses** of water today (${log.waterIntake} ml).\nTarget: 8 glasses (2000 ml) daily.\n${goalStatus}`;
  }

  // 5. "Show my medicine list" / "my medicines"
  if (q.includes('medicine list') || q.includes('show my medicines') || q.includes('my medicines') || q.includes('all medicines') || q.includes('show medicine list')) {
    if (medicines.length === 0) {
      return "No medicines configured yet. You can schedule them in the Add Medicine section.";
    }
    let res = "Here is your configured medication inventory list:\n\n";
    medicines.forEach(m => {
      const end = m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : 'ongoing';
      res += `- **${m.medicineName}** (${m.dosage}) &bull; Frequency: ${m.frequency} &bull; Times: ${m.time} (Ends: ${end})\n`;
    });
    return res;
  }

  // 6. "How many hours did I sleep?" / "sleep log"
  if (q.includes('sleep') && (q.includes('today') || q.includes('hours') || q.includes('how many') || q.includes('log'))) {
    const log = getTodayLog();
    const sleep = log.sleepHours || 0;
    const comment = sleep >= 7 && sleep <= 9 ? "This is in the optimal range of 7-9 hours." : "Aim for 7-9 hours of restful sleep daily.";
    return `You have logged **${sleep} hours** of sleep today.\nTarget: 7 - 9 hours daily.\n${comment}`;
  }

  // 7. "How much exercise?" / "exercise log"
  if ((q.includes('exercise') || q.includes('active') || q.includes('workout')) && (q.includes('today') || q.includes('how much') || q.includes('minutes') || q.includes('log'))) {
    const log = getTodayLog();
    const exercise = log.exerciseMinutes || 0;
    const comment = exercise >= 30 ? "🔥 Excellent! You reached your daily target of 30 active minutes." : `Keep going, you need ${30 - exercise} more minutes to reach your target.`;
    return `You have logged **${exercise} active minutes** of exercise today.\nTarget: 30 minutes daily.\n${comment}`;
  }

  // Return null if not resolvable locally (forward to Gemini)
  return null;
};

/**
 * Generate AI Response using Gemini with direct user data context
 */
const generateChatResponse = async (question, medicines, healthLogs, userId = 'unknown') => {
  console.log('=== generateChatResponse Diagnostic Log ===');
  console.log('Incoming question:', question);
  console.log('Authenticated User ID:', userId);
  console.log(`Medicines loaded: ${medicines ? medicines.length : 0}`);
  console.log(`Health logs loaded: ${healthLogs ? healthLogs.length : 0}`);

  // If database records are completely empty, return the required placeholder text immediately
  if (medicines.length === 0 && healthLogs.length === 0) {
    console.log('Both medicines and health logs are empty. Returning placeholder.');
    return "I don't have enough information yet to answer that. Once you add medicines or health logs, I'll provide personalized responses.";
  }

  // 1. Try local deterministic resolver first
  console.log('Attempting local deterministic routing...');
  const localResolution = resolveLocally(question, medicines, healthLogs);
  if (localResolution !== null) {
    console.log('Hybrid routing: Resolving query locally without calling Gemini.');
    console.log('Local resolution text:', localResolution);
    return localResolution;
  }

  console.log('Hybrid routing: Query requires natural language analysis, calling Gemini...');
  
  // 2. Fetch API Key and invoke Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY environment variable check:');
  console.log(' - exists:', typeof apiKey !== 'undefined');
  console.log(' - is string:', typeof apiKey === 'string');
  console.log(' - is not empty:', !!apiKey && apiKey.trim().length > 0);
  console.log(' - length:', apiKey ? apiKey.length : 0);
  
  // Construct user data contexts for LLM
  const todayStr = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const medicinesContext = medicines.map(m => ({
    name: m.medicineName,
    dosage: m.dosage,
    frequency: m.frequency,
    times: m.time ? m.time.split(',') : [],
    startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '',
    endDate: m.endDate ? new Date(m.endDate).toISOString().split('T')[0] : '',
    instructions: m.instructions || '',
    shape: m.shape || 'tablet',
    color: m.color || 'blue',
    history: m.history || {}
  }));

  const healthLogsContext = healthLogs.map(l => ({
    date: new Date(l.date).toISOString().split('T')[0],
    waterIntakeML: l.waterIntake,
    sleepHours: l.sleepHours,
    exerciseMinutes: l.exerciseMinutes
  }));

  // Build static fallback representation in case Gemini fails
  const buildLocalFallbackText = () => {
    let schedText = '';
    let hasMedsToday = false;
    medicinesContext.forEach(m => {
      const start = m.startDate;
      const end = m.endDate;
      if ((!start || start <= todayStr) && (!end || end >= todayStr)) {
        hasMedsToday = true;
        m.times.forEach(t => {
          const status = m.history?.[todayStr]?.[t] || 'pending';
          schedText += `- **${t}** - ${m.name} (${m.dosage}) - ${m.instructions} [${status.toUpperCase()}]\n`;
        });
      }
    });
    if (!hasMedsToday) schedText = 'No scheduled medications for today.\n';

    const todayLog = healthLogsContext.find(l => l.date === todayStr) || { waterIntakeML: 0, sleepHours: 0, exerciseMinutes: 0 };
    const waterGlasses = Math.round(todayLog.waterIntakeML / GLASS_TO_ML);

    return `I'm currently unable to generate AI insights. However, here is the information available directly from your health records:

**Today's Medicine Schedule:**
${schedText}
**Today's Health Logs:**
- Water Hydration: ${waterGlasses} / 8 glasses
- Sleep Log: ${todayLog.sleepHours} hours
- Exercise Log: ${todayLog.exerciseMinutes} minutes

**General Medicine Inventory:**
${medicinesContext.length === 0 ? 'No medicines configured.' : medicinesContext.map(m => `- ${m.name} (${m.dosage}) - Frequency: ${m.frequency}`).join('\n')}`;
  };

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined. Falling back to local summary.');
    console.log('Fallback response is triggered: YES (API Key Missing)');
    return buildLocalFallbackText();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are MediTrack AI, a personal healthcare assistant.
Your goal is to answer questions using only the user's medicine schedule and health records provided in the context below.

Rules:
1. Only answer using the user's data provided in the context.
2. Never diagnose diseases.
3. Never prescribe medication.
4. Never invent information.
5. If data doesn't exist for the query, clearly state that no data is available.
6. If medical advice is requested, recommend consulting a healthcare professional.
7. Keep responses concise, supportive, and formatted in markdown.

Current Date context:
Today is ${dayName}, date: ${todayStr}

User Data Context:
Medicines Schedule:
${JSON.stringify(medicinesContext, null, 2)}

Daily Health/Wellness Logs (ordered by date):
${JSON.stringify(healthLogsContext, null, 2)}
`;

    console.log('Gemini request payload generated:');
    console.log(' - Model: gemini-2.5-flash');
    console.log(' - System Prompt length:', systemPrompt.length);
    console.log(' - User Query:', question);
    
    console.log('Gemini request started...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: question }] }
      ]
    });

    console.log('Raw Gemini response received:', JSON.stringify(response));
    const parsedText = response.text;
    console.log('Parsed response text length:', parsedText ? parsedText.length : 0);
    console.log('Fallback response is triggered: NO');
    console.log('=== End generateChatResponse Diagnostic Log ===');
    return parsedText;
  } catch (error) {
    console.error('Gemini API execution failed with exception:', error);
    if (error.stack) {
      console.error('Exception stack trace:', error.stack);
    }
    console.log('Fallback response is triggered: YES (Exception Caught)');
    console.log('=== End generateChatResponse Diagnostic Log ===');
    
    // Return error details for remote debugging
    const debugErr = `[DEBUG EXCEPTION ON RENDER: ${error.message}\nStack: ${error.stack}]`;
    return `${debugErr}\n\n${buildLocalFallbackText()}`;
  }
};

module.exports = { generateChatResponse };
