// utils/timeFormatter.ts
export function formatToBDTime(timestamp: number): string {
  const date = new Date(timestamp);
  
  const options: Intl.DateTimeFormatOptions = {
    // year: 'numeric', // Using year can make it a bit long for a table cell
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dhaka' // Specify Bangladesh Time Zone
  };

  try {
    let formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    // Add " (BD)" suffix, ensuring it's not confused with AM/PM
    if (formattedDate.includes(' AM') || formattedDate.includes(' PM')) {
        formattedDate = formattedDate.replace(/ (AM|PM)$/, '$1 (BD)');
    } else {
        // Fallback for locales that might not use AM/PM with these options (less likely)
        formattedDate += " (BD)";
    }
    return formattedDate;

  } catch (e) {
    console.warn("Intl.DateTimeFormat with Asia/Dhaka timezone might not be fully supported. Using fallback.", e);
    // Simplified fallback to UTC+6, less accurate for DST if applicable, but better than nothing.
    // However, Bangladesh does not currently observe DST.
    const fallbackDate = new Date(timestamp); 
    const fallbackOptions: Intl.DateTimeFormatOptions = {
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC' // Format as UTC first
    };
    // Manual offset for BD
    fallbackDate.setHours(fallbackDate.getUTCHours() + 6);


    let formattedFallback = new Intl.DateTimeFormat('en-US', fallbackOptions).format(fallbackDate).replace(' UTC', '');
    if (formattedFallback.includes(' AM') || formattedFallback.includes(' PM')) {
        formattedFallback = formattedFallback.replace(/ (AM|PM)$/, '$1 (BD)');
    } else {
        formattedFallback += " (BD)";
    }
    return formattedFallback;
  }
}
