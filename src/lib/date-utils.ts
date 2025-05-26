const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const WEEKDAY_NAMES_ES = [
  'domingo', 'lunes', 'martes', 'miércoles',
  'jueves', 'viernes', 'sábado'
];

export function formatDateSpanish(date: Date): string {
  const weekday = WEEKDAY_NAMES_ES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_ES[date.getMonth()];
  return `${weekday}, ${day} de ${month}`;
}

export function getLocalTimezoneName(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert timezone names to more user-friendly format
    const timezoneMap: { [key: string]: string } = {
      'America/Lima': 'Hora de Perú (PE)',
      'America/Bogota': 'Hora de Colombia (CO)',
      'America/Santiago': 'Hora de Chile (CL)',
      'America/Buenos_Aires': 'Hora de Argentina (AR)',
      'America/Caracas': 'Hora de Venezuela (VE)',
      'America/Mexico_City': 'Hora de México (MX)',
      'America/New_York': 'Hora del Este (ET)',
      'America/Chicago': 'Hora Central (CT)',
      'America/Denver': 'Hora de la Montaña (MT)',
      'America/Los_Angeles': 'Hora del Pacífico (PT)',
      'Europe/Madrid': 'Hora de España (ES)',
      'Europe/Paris': 'Hora Central Europea (CET)',
      'Europe/London': 'Hora del Reino Unido (UK)',
    };
    return timezoneMap[timeZone] || timeZone;
  } catch (error) {
    return 'Hora local';
  }
}

export function convertPeruTimeToLocal(timeStr: string): string {
  try {
    // Get current date in Peru timezone (UTC-5)
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Create date in Peru's timezone
    const peruDate = new Date();
    peruDate.setUTCHours(hours + 5); // Convert Peru time to UTC
    peruDate.setUTCMinutes(minutes);
    
    // Convert to local time
    const localHours = peruDate.getHours().toString().padStart(2, '0');
    const localMinutes = peruDate.getMinutes().toString().padStart(2, '0');
    
    return `${localHours}:${localMinutes}`;
  } catch (error) {
    console.error('Error converting time:', error);
    return timeStr; // Return original time if conversion fails
  }
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const peruDate = new Date(today.getTime() - (5 * 60 * 60 * 1000)); // Convert to Peru time (UTC-5)
  const peruDateStr = peruDate.toISOString().split('T')[0];
  return dateStr === peruDateStr;
}
