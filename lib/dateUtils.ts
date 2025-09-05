import { isValid, parse, startOfDay } from 'date-fns';

export function parseDate(value: string | Date | undefined): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  // Try parsing the string
  const parsed = new Date(value);
  return isValid(parsed) ? parsed : null;
}

export function safeDateParse(value: string): Date | null {
  if (!value) return null;
  
  try {
    // First try standard date parsing
    const date = new Date(value);
    if (isValid(date)) return startOfDay(date);
    
    // Try alternative formats
    const formats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy/MM/dd',
      'MM-dd-yyyy',
      'dd-MM-yyyy'
    ];
    
    for (const format of formats) {
      try {
        const parsed = parse(value, format, new Date());
        if (isValid(parsed)) return startOfDay(parsed);
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  
  return null;
}

export function validateDateRange(startDate: Date | null, endDate: Date | null): {
  isValid: boolean;
  error?: string;
} {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Both start and end dates are required' };
  }
  
  if (!isValid(startDate) || !isValid(endDate)) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  if (startDate > endDate) {
    return { isValid: false, error: 'Start date must be before end date' };
  }
  
  // Check for reasonable date ranges (e.g., not before 1900 or after 2100)
  const minDate = new Date('1900-01-01');
  const maxDate = new Date('2100-12-31');
  
  if (startDate < minDate || endDate > maxDate) {
    return { isValid: false, error: 'Dates must be between 1900 and 2100' };
  }
  
  return { isValid: true };
}

export function getDefaultDates() {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  return {
    startDate: new Date(currentYear, 0, 1), // January 1st of current year
    endDate: new Date(currentYear, 11, 31)  // December 31st of current year
  };
}

export function formatDateForInput(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}