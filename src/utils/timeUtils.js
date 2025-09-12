export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const calculateWorkedHours = (punchIn, punchOut, breaks = []) => {
  const totalTime = punchOut - punchIn;
  const breakTime = breaks.reduce((total, breakItem) => {
    return total + (breakItem.end - breakItem.start);
  }, 0);
  
  return (totalTime - breakTime) / (1000 * 60 * 60); // Convert to hours
};

export const formatDuration = (hours) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  }
  
  return minutes === 0 ? `${wholeHours}h` : `${wholeHours}h ${minutes}m`;
};

export const calculatePayroll = (hours, hourlyRate = 15) => {
  return hours * hourlyRate;
};