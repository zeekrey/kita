import { db } from '$lib/server/db';
import {
	kinder,
	gruppen,
	erzieher,
	dienstplan,
	mahlzeiten,
	ankuendigungen
} from '$lib/server/db/schema.js';
import { eq, and, lte, gte, desc } from 'drizzle-orm';
import { formatDate } from '$lib/utils/date.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const today = formatDate(new Date());
	const todayMonthDay = today.slice(5); // MM-DD format

	// Get current time in HH:MM format
	const now = new Date();
	const currentTime = now.toTimeString().slice(0, 5);

	// Get birthday children (today's birthdays)
	const allChildren = await db
		.select({
			id: kinder.id,
			vorname: kinder.vorname,
			nachname: kinder.nachname,
			geburtstag: kinder.geburtstag,
			fotoPath: kinder.fotoPath,
			gruppeId: kinder.gruppeId,
			gruppeName: gruppen.name,
			gruppeFarbe: gruppen.farbe
		})
		.from(kinder)
		.leftJoin(gruppen, eq(kinder.gruppeId, gruppen.id));

	const birthdayChildren = allChildren.filter((child) => {
		if (!child.geburtstag) return false;
		const childMonthDay = child.geburtstag.slice(5);
		return childMonthDay === todayMonthDay;
	});

	// Get teachers currently on duty
	const allSchedules = await db
		.select({
			id: dienstplan.id,
			startZeit: dienstplan.startZeit,
			endZeit: dienstplan.endZeit,
			erzieherId: dienstplan.erzieherId,
			erzieherVorname: erzieher.vorname,
			erzieherNachname: erzieher.nachname,
			erzieherFotoPath: erzieher.fotoPath
		})
		.from(dienstplan)
		.innerJoin(erzieher, eq(dienstplan.erzieherId, erzieher.id))
		.where(eq(dienstplan.datum, today));

	const teachersOnDuty = allSchedules.filter((schedule) => {
		return schedule.startZeit <= currentTime && schedule.endZeit >= currentTime;
	});

	// Get today's meals
	const meals = await db.select().from(mahlzeiten).where(eq(mahlzeiten.datum, today));

	// Get active announcements (sorted by priority, only wichtig for kiosk)
	const announcements = await db
		.select()
		.from(ankuendigungen)
		.where(and(lte(ankuendigungen.gueltigVon, today), gte(ankuendigungen.gueltigBis, today)))
		.orderBy(desc(ankuendigungen.prioritaet), desc(ankuendigungen.createdAt));

	return {
		birthdayChildren,
		teachersOnDuty,
		meals,
		announcements
	};
}
