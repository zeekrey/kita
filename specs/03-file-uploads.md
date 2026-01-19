# Spec: File Uploads

## Overview
Implement photo upload functionality for children and teachers.

---

## Tasks

### 3.1 Create Upload API Endpoint

**File**: `src/routes/api/upload/+server.js`

```javascript
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
    return new Response(JSON.stringify({ error: 'Ungültiger Dateityp' }), {
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
  const ext = path.extname(file.name);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Ensure upload directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return new Response(JSON.stringify({
    path: `/uploads/${filename}`
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Acceptance Criteria**:
- [ ] Endpoint accepts file uploads
- [ ] Validates file type (jpg, png, webp only)
- [ ] Validates file size (max 5MB)
- [ ] Returns file path on success
- [ ] Returns German error messages on failure

---

### 3.2 Create Uploads Directory

**Location**: `static/uploads/`

**Setup**:
1. Create directory
2. Add `.gitkeep` file
3. Add to `.gitignore` (except .gitkeep)

**.gitignore addition**:
```
static/uploads/*
!static/uploads/.gitkeep
```

**Acceptance Criteria**:
- [ ] Directory exists
- [ ] Files in directory served at `/uploads/*`
- [ ] Uploaded files not committed to git

---

### 3.3 Create Reusable Photo Upload Component

**File**: `src/lib/components/PhotoUpload.svelte`

```svelte
<script>
  let { value = $bindable(), onUpload } = $props();

  let uploading = $state(false);
  let error = $state('');

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploading = true;
    error = '';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error;
        return;
      }

      value = result.path;
      onUpload?.(result.path);
    } catch (e) {
      error = 'Upload fehlgeschlagen';
    } finally {
      uploading = false;
    }
  }
</script>

<div class="photo-upload">
  {#if value}
    <img src={value} alt="Vorschau" class="preview" />
  {/if}

  <label class="upload-btn">
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onchange={handleFileSelect}
      disabled={uploading}
    />
    {uploading ? 'Lädt...' : 'Foto auswählen'}
  </label>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>
```

**Props**:
- `value` (bindable): Current photo path
- `onUpload`: Callback when upload completes

**UI Requirements**:
- Show preview if photo exists
- File input styled as button
- Loading state during upload
- Error message display

**German Labels**:
- Button: "Foto auswählen"
- Loading: "Lädt..."
- Preview alt: "Vorschau"

**Acceptance Criteria**:
- [ ] Component renders file input
- [ ] Shows preview when value is set
- [ ] Shows loading state during upload
- [ ] Shows error message on failure
- [ ] Calls onUpload callback on success

---

## Files to Create/Modify
- `src/routes/api/upload/+server.js` (API endpoint)
- `static/uploads/.gitkeep` (directory marker)
- `.gitignore` (exclude uploads)
- `src/lib/components/PhotoUpload.svelte` (upload component)
