import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  X, 
  ChevronDown, 
  ChevronUp,
} from 'lucide-react';
import { 
  format, 
  parseISO, 
  isAfter, 
  isBefore, 
  isToday, 
  isTomorrow, 
  addHours, 
  differenceInMinutes,
  differenceInSeconds,
  startOfDay
} from 'date-fns';
import { pl } from 'date-fns/locale';

// Data imports
import planData from '../plan.json';
import subjectMapping from '../subjects_mapping.json';

const App = () => {
  const [now, setNow] = useState(new Date());
  const [showPastWeekends, setShowPastWeekends] = useState(false);
  const [showShortcutPrompt, setShowShortcutPrompt] = useState(() => {
    return localStorage.getItem('hideShortcutPrompt') !== 'true';
  });

  // Group selection from URL
  const getGroupFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const group = params.get('group');
    if (group === '2') return 2;
    return 1;
  };
  const [selectedGroup, setSelectedGroup] = useState(getGroupFromUrl());

  // Update URL on group change
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('group', selectedGroup.toString());
    window.history.replaceState({}, '', url);

    // Update manifest and favicon dynamically for group-specific icon
    const iconPath = `/icon${selectedGroup}.svg`;
    
    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = iconPath;
    
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleIcon) appleIcon.href = iconPath;

    // Update manifest link dynamically
    let manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) {
      manifest.href = `/manifest${selectedGroup}.json`;
    }
  }, [selectedGroup]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const subjects = useMemo(() => {
    const mapping = {};
    subjectMapping.subject_mapping.forEach(s => {
      mapping[s.code] = {
        ...s,
        displayName: `${s.code}: ${s.name}`
      };
    });
    return mapping;
  }, []);

  const filteredClasses = useMemo(() => {
    return planData.classes
      .filter(c => c.group === selectedGroup)
      .map(c => ({
        ...c,
        startTime: parseISO(c.start_time),
        endTime: parseISO(c.end_time),
        fullSubject: subjects[c.subject] || { name: c.subject }
      }))
      .sort((a, b) => a.startTime - b.startTime);
  }, [selectedGroup, subjects]);

  // Weekend grouping logic
  const zjazdy = useMemo(() => {
    const groups = [];
    filteredClasses.forEach(c => {
      const lastZjazd = groups[groups.length - 1];
      if (lastZjazd && differenceInMinutes(c.startTime, lastZjazd.endDate) < 48 * 60) {
        lastZjazd.classes.push(c);
        lastZjazd.endDate = c.endTime;
      } else {
        groups.push({
          id: groups.length + 1,
          classes: [c],
          startDate: c.startTime,
          endDate: c.endTime
        });
      }
    });
    return groups;
  }, [filteredClasses]);

  const upcomingClass = filteredClasses.find(c => isAfter(c.endTime, now));
  const currentClass = filteredClasses.find(c => isBefore(c.startTime, now) && isAfter(c.endTime, now));
  
  // Auto-scroll logic
  const nextZjazdRef = useRef(null);
  useEffect(() => {
    if (nextZjazdRef.current && showPastWeekends) {
      nextZjazdRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showPastWeekends]);

  const handleHideShortcut = () => {
    setShowShortcutPrompt(false);
    localStorage.setItem('hideShortcutPrompt', 'true');
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter text-blue-600">Take it ISSI</h1>
        <div className="flex bg-gray-100 rounded-full p-1 border border-gray-200">
          <button 
            onClick={() => setSelectedGroup(1)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedGroup === 1 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            G1
          </button>
          <button 
            onClick={() => setSelectedGroup(2)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedGroup === 2 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            G2
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-8">
        {/* Logistics / Countdown Section */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <LogisticsCard currentClass={currentClass} nextClass={upcomingClass} now={now} />
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold text-gray-800">Plan zajęć</h2>
            <button 
              onClick={() => setShowPastWeekends(!showPastWeekends)}
              className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform border border-blue-100"
            >
              {showPastWeekends ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showPastWeekends ? 'Ukryj minione' : 'Pokaż minione'}
            </button>
          </div>

          <div className="space-y-10">
            {zjazdy.map((zjazd, index) => {
              const isPast = isBefore(zjazd.endDate, now);
              if (isPast && !showPastWeekends) return null;
              
              const isUpcomingZjazd = !isPast && (index === 0 || isBefore(zjazdy[index-1].endDate, now));
              const isCurrent = isBefore(zjazd.startDate, now) && isAfter(zjazd.endDate, now);

              const diffDays = Math.ceil(differenceInSeconds(startOfDay(zjazd.startDate), startOfDay(now)) / (24 * 3600));
              const daysUntilLabel = diffDays === 1 ? 'jutro' : `za ${diffDays} dni`;

              return (
                <div 
                  key={zjazd.id} 
                  ref={isUpcomingZjazd ? nextZjazdRef : null}
                  className={`space-y-4 transition-opacity duration-300 ${isPast ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-blue-600 uppercase tracking-widest">
                        Zjazd {zjazd.id}
                      </span>
                      {isUpcomingZjazd && !isCurrent && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full uppercase">
                          {daysUntilLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-400">
                      {format(zjazd.startDate, 'd.MM')} - {format(zjazd.endDate, 'd.MM.yyyy')}
                    </span>
                  </div>
                  
                  <div className={`rounded-[2rem] bg-gradient-to-br ${isCurrent || isUpcomingZjazd ? 'from-blue-500 to-indigo-600 shadow-xl shadow-blue-100 p-1' : 'bg-gray-200'}`}>
                    <div className={`bg-white rounded-[1.9rem] p-4 sm:p-5 space-y-6`}>
                      {groupClassesByDay(zjazd.classes).map(day => (
                        <div key={day.date} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-gray-900 text-white">
                              {format(parseISO(day.date), 'EEEE', { locale: pl })}
                            </span>
                            <span className="text-sm font-bold text-gray-400">
                              {format(parseISO(day.date), 'd MMMM', { locale: pl })}
                            </span>
                          </div>
                          <div className="grid gap-3">
                            {day.classes.map((c, i) => (
                              <ClassItem key={i} classData={c} now={now} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Add to Home Screen Prompt */}
      {showShortcutPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-gray-900 text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center gap-4 border border-white/5">
            <div className="bg-[#A71930] w-16 h-16 rounded-2xl shadow-lg shadow-red-900/40 flex flex-col items-center justify-center overflow-hidden border-2 border-[#006937] shrink-0">
              <span className="text-white text-[14px] font-black italic tracking-tighter leading-none mb-0.5">ISSI</span>
              <span className="text-white text-[12px] font-black leading-none">G{selectedGroup}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black uppercase tracking-tight truncate">Dodaj skrót na pulpit</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">GRUPA {selectedGroup}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert(`WAŻNE: Upewnij się, że masz wybraną swoją GRUPĘ ${selectedGroup} przed dodaniem skrótu!\n\niOS: Kliknij "Udostępnij" -> "Dodaj do ekranu pocz."\nAndroid: Kliknij trzy kropki -> "Dodaj do ekr. głównego"`)}
                className="bg-white text-gray-900 text-[10px] font-black px-4 py-3 rounded-xl shadow-sm active:scale-95 transition-transform uppercase whitespace-nowrap"
              >
                JAK?
              </button>
              <button onClick={handleHideShortcut} className="p-2 text-gray-500 hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!showShortcutPrompt && (
        <button 
          onClick={() => {
            setShowShortcutPrompt(true);
            localStorage.removeItem('hideShortcutPrompt');
          }}
          className="py-10 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center w-full active:text-blue-500 transition-colors"
        >
          Pokaż instrukcję skrótu
        </button>
      )}
    </div>
  );
};

const LogisticsCard = ({ currentClass, nextClass, now }) => {
  const isClassActive = !!currentClass;
  const target = currentClass || nextClass;

  if (!target) return null;

  const getCountdown = () => {
    const diffSeconds = isClassActive 
      ? differenceInSeconds(target.endTime, now)
      : differenceInSeconds(target.startTime, now);
    
    if (diffSeconds < 0) return '0s';
    
    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (isClassActive) {
      if (hours > 0) return `przerwa za ${hours}h ${minutes % 60}m`;
      return `przerwa za ${minutes} minuty`;
    } else {
      if (days > 7) return `za ${days} dni`;
      if (days > 0) return `za ${days} dni, ${hours % 24}h ${minutes % 60}m`;
      if (hours > 0) return `za ${hours}h ${minutes % 60}m`;
      return `${minutes} minut`;
    }
  };

  const isTodayClass = isToday(target.startTime);
  const isTomorrowClass = isTomorrow(target.startTime);

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] p-6 sm:p-7 text-white shadow-2xl transition-all duration-500 ${isClassActive ? 'bg-emerald-600' : 'bg-blue-600'}`}>
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
            {isClassActive ? 'TRWAJĄ ZAJĘCIA' : isTodayClass ? 'DZISIAJ' : isTomorrowClass ? 'JUTRO' : 'NASTĘPNE ZAJĘCIA'}
          </span>
          <div className="flex items-center gap-2 text-white/90 font-mono text-base font-bold">
            <Clock size={18} />
            <span>{format(now, 'HH:mm:ss')}</span>
          </div>
        </div>

        <div>
          <div className="text-white/70 text-xs font-black uppercase mb-1 flex items-center gap-2 tracking-wide">
            <Calendar size={14} />
            {format(target.startTime, 'd MMMM yyyy', { locale: pl })}
          </div>
          <h2 className="text-3xl font-black leading-tight mb-2">
            <span className="font-black">{target.fullSubject.code} </span>
            <span className="text-xl font-medium block opacity-95">{target.fullSubject.name}</span>
          </h2>
          <div className="flex items-center gap-3 text-white/90 text-base font-bold">
            <User size={18} />
            <span>{target.lecturer}</span>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-lg font-mono border border-white/10">
              {format(target.startTime, 'HH:mm')} - {format(target.endTime, 'HH:mm')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/20">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Miejsce</p>
            <div className="flex items-center gap-2 font-black text-2xl">
              <MapPin size={20} className="text-white/80" />
              <span>{target.room}</span>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
              {isClassActive ? 'Koniec zajęć' : 'Start zajęć'}
            </p>
            <p className="text-2xl font-black tabular-nums lowercase tracking-tight">{getCountdown()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassItem = ({ classData, now }) => {
  const isPast = isBefore(classData.endTime, now);
  const isActive = isBefore(classData.startTime, now) && isAfter(classData.endTime, now);
  const isUpcoming = !isPast && !isActive && isAfter(classData.startTime, now) && isBefore(classData.startTime, addHours(now, 24));

  return (
    <div className={`flex gap-3 p-3 rounded-[1.5rem] border transition-all ${(isActive || isUpcoming) ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100 scale-[1.01] shadow-md z-10' : isPast ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className={`flex flex-col items-center justify-center min-w-[55px] font-mono text-xs font-bold ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
        <span className="text-base font-black">{format(classData.startTime, 'HH:mm')}</span>
        <div className={`w-px h-3 my-1 ${isActive ? 'bg-blue-300' : 'bg-gray-200'}`}></div>
        <span className="text-base font-black">{format(classData.endTime, 'HH:mm')}</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="mb-1 leading-tight">
          <span className="text-lg font-black text-gray-900">{classData.fullSubject.code} </span>
          <span className="text-base font-medium text-gray-600 block sm:inline">{classData.fullSubject.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-gray-800">{classData.room}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            <span className="text-gray-800">{classData.lecturer}</span>
            <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${classData.type === 'lecture' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
              {classData.type === 'lecture' ? 'wykład' : 'lab'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const groupClassesByDay = (classes) => {
  const groups = {};
  classes.forEach(c => {
    const dateStr = format(c.startTime, 'yyyy-MM-dd');
    if (!groups[dateStr]) groups[dateStr] = { date: dateStr, classes: [] };
    groups[dateStr].classes.push(c);
  });
  return Object.values(groups);
};

export default App;
