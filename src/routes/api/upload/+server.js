import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = 'static/uploads';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST({ request }) {
	const formData = await request.formData();
	const file = formData.get('file');

	if (!file || !(file instanceof File)) {
		return new Response(JSON.stringify({ error: 'Keine Datei hochgeladen' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Validate file type
	if (!ALLOWED_TYPES.includes(file.type)) {
		return new Response(JSON.stringify({ error: 'Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Validate file size
	if (file.size > MAX_SIZE) {
		return new Response(JSON.stringify({ error: 'Datei zu groß (max 5MB)' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Generate unique filename
	const ext = path.extname(file.name) || '.jpg';
	const filename = `${crypto.randomUUID()}${ext}`;
	const filepath = path.join(UPLOAD_DIR, filename);

	// Ensure upload directory exists
	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true });
	}

	// Write file
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(filepath, buffer);

	return new Response(
		JSON.stringify({
			path: `/uploads/${filename}`
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
}
