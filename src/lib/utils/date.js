/**
 * Get the Monday of the week for a given date
 * @param {Date} date
 * @returns {Date}
 */
export function getMonday(date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * Get the Sunday of the week for a given date
 * @param {Date} date
 * @returns {Date}
 */
export function getSunday(date) {
	const monday = getMonday(date);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	return sunday;
}

/**
 * Get the Friday of the week for a given date
 * @param {Date} date
 * @returns {Date}
 */
export function getFriday(date) {
	const monday = getMonday(date);
	const friday = new Date(monday);
	friday.setDate(monday.getDate() + 4);
	return friday;
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
	return date.toISOString().split('T')[0];
}

/**
 * Format a date for display in German format (e.g., "20. Jan")
 * @param {Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
	return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

/**
 * Format a date for full display in German format
 * @param {Date} date
 * @returns {string}
 */
export function formatDateFull(date) {
	return date.toLocaleDateString('de-DE', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Get the ISO week number for a date
 * @param {Date} date
 * @returns {number}
 */
export function getWeekNumber(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get all weekdays (Mon-Fri) for a given week
 * @param {Date} date - Any date in the week
 * @returns {Date[]}
 */
export function getWeekDays(date) {
	const monday = getMonday(date);
	const days = [];
	for (let i = 0; i < 5; i++) {
		const day = new Date(monday);
		day.setDate(monday.getDate() + i);
		days.push(day);
	}
	return days;
}

/**
 * German day names (short)
 */
export const DAY_NAMES_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

/**
 * German day names (full)
 */
export const DAY_NAMES_FULL = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

/**
 * Parse a date string to a Date object
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Date}
 */
export function parseDate(dateStr) {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
}

/**
 * Add days to a date
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
