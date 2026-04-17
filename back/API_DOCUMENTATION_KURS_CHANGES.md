# API Documentation - Kurs Field Changes

**Date:** April 17, 2026  
**Breaking Change:** The `kurs` field has been changed from `Integer` to `List<Integer>` (Array of integers)

---

## Summary of Changes

The `kurs` field in the FacultySubject entity has been updated from a single integer to a list of integers. This allows a subject to be associated with multiple course years (kurs) for the same faculty.

### ⚠️ Breaking Changes:
- **Before:** `"kurs": 1`
- **After:** `"kurs": [1, 2, 3]`

---

## Affected Endpoints

### 1. Create FacultySubject
**Endpoint:** `POST /api/v1/faculty-subject`

#### Request Body (NEW):
```json
{
  "facultyId": 1,
  "subjectId": 5,
  "kurs": [1, 2, 3]  // ⚠️ CHANGED: Now accepts array of integers
}
```

#### Response (NEW):
```json
{
  "id": 10,
  "facultyId": 1,
  "subjectId": 5,
  "kurs": [1, 2, 3],  // ⚠️ CHANGED: Now returns array
  "facultyName": "Computer Science",
  "subjectName": "Programming",
  "description": "Introduction to programming",
  "bookCount": 15
}
```

---

### 2. Update FacultySubject
**Endpoint:** `PUT /api/v1/faculty-subject/{id}`

#### Request Body (NEW):
```json
{
  "facultyId": 1,
  "subjectId": 5,
  "kurs": [1, 2, 3, 4]  // ⚠️ CHANGED: Now accepts array of integers
}
```

#### Response (NEW):
```json
{
  "id": 10,
  "facultyId": 1,
  "subjectId": 5,
  "kurs": [1, 2, 3, 4],  // ⚠️ CHANGED: Now returns array
  "facultyName": "Computer Science",
  "subjectName": "Programming",
  "description": "Introduction to programming",
  "bookCount": 15
}
```

---

### 3. Get FacultySubject by ID
**Endpoint:** `GET /api/v1/faculty-subject/{id}`

#### Response (NEW):
```json
{
  "id": 10,
  "facultyId": 1,
  "subjectId": 5,
  "kurs": [1, 2, 3],  // ⚠️ CHANGED: Now returns array
  "facultyName": "Computer Science",
  "subjectName": "Programming",
  "description": "Introduction to programming",
  "bookCount": 0
}
```

---

### 4. Get Subjects by Faculty (with optional kurs filter)
**Endpoint:** `GET /api/v1/faculty-subject/by-faculty/{facultyId}?kurs={kurs}`

#### Query Parameters:
- `facultyId` (path parameter) - Required
- `kurs` (query parameter) - Optional, single integer value

#### Filter Behavior (UPDATED):
- If `kurs` parameter is provided (e.g., `kurs=2`), the API will return only FacultySubjects where the `kurs` array **contains** that value
- If `kurs` is not provided, returns all FacultySubjects for the faculty

#### Examples:

**Request:** `GET /api/v1/faculty-subject/by-faculty/1?kurs=2`

**Response:**
```json
[
  {
    "id": 10,
    "facultyId": 1,
    "subjectId": 5,
    "kurs": [1, 2, 3],  // ⚠️ Contains kurs=2, so included
    "facultyName": "Computer Science",
    "subjectName": "Programming",
    "description": "Introduction to programming",
    "bookCount": 15
  },
  {
    "id": 11,
    "facultyId": 1,
    "subjectId": 7,
    "kurs": [2],  // ⚠️ Contains kurs=2, so included
    "facultyName": "Computer Science",
    "subjectName": "Data Structures",
    "description": "Advanced data structures",
    "bookCount": 8
  }
]
```

**Request:** `GET /api/v1/faculty-subject/by-faculty/1` (no kurs filter)

**Response:**
```json
[
  {
    "id": 10,
    "facultyId": 1,
    "subjectId": 5,
    "kurs": [1, 2, 3],  // ⚠️ All subjects returned
    "facultyName": "Computer Science",
    "subjectName": "Programming",
    "description": "Introduction to programming",
    "bookCount": 15
  },
  {
    "id": 11,
    "facultyId": 1,
    "subjectId": 7,
    "kurs": [2],
    "facultyName": "Computer Science",
    "subjectName": "Data Structures",
    "description": "Advanced data structures",
    "bookCount": 8
  },
  {
    "id": 12,
    "facultyId": 1,
    "subjectId": 9,
    "kurs": [3, 4],
    "facultyName": "Computer Science",
    "subjectName": "Algorithms",
    "description": "Algorithm design and analysis",
    "bookCount": 12
  }
]
```

---

### 5. Get Kurs List by Faculty
**Endpoint:** `GET /api/v1/faculty-subject/by-faculty/{facultyId}/kurs-list`

#### Behavior (UPDATED):
This endpoint now **flattens** all kurs values from all FacultySubjects for the given faculty and returns a unique, sorted list.

#### Example:

**Request:** `GET /api/v1/faculty-subject/by-faculty/1/kurs-list`

**Scenario:**
- Subject A has `kurs: [1, 2, 3]`
- Subject B has `kurs: [2]`
- Subject C has `kurs: [3, 4]`

**Response:**
```json
[1, 2, 3, 4]  // ⚠️ Flattened, unique, and sorted
```

---

### 6. Books by Subject (Indirect Impact)
**Endpoint:** `GET /api/v1/books/by-subject/{subjectId}?facultyId={facultyId}&kurs={kurs}`

#### Query Parameters:
- `subjectId` (path parameter) - Required
- `facultyId` (query parameter) - Optional
- `kurs` (query parameter) - Optional

#### Behavior (UPDATED):
When `facultyId` is provided, the API resolves the kurs value from FacultySubject:
- If `kurs` parameter is provided AND exists in the FacultySubject's kurs array, it uses that value
- Otherwise, it uses the first element from the kurs array
- The resolved kurs is included in each BookDTO response

#### Response:
```json
[
  {
    "id": 1,
    "name": "Introduction to Programming",
    "description": "Basic programming concepts",
    "author": "John Doe",
    "publisher": "Tech Books",
    "genre": "Education",
    "path": "/files/dasturlash/book1.pdf",
    "subjectId": 5,
    "subjectName": "Programming",
    "kurs": 1,  // ℹ️ Note: BookDTO still uses single integer (resolved from FacultySubject's kurs array)
    "bookType": 1,
    "shelfId": 3,
    "shelf": "A-12",
    "imageId": "uuid-here",
    "pdfId": "uuid-here",
    "isHaveLibrary": true,
    "libraryCount": 5,
    "createdAt": "2026-04-15T10:30:00"
  }
]
```

**Note:** BookDTO still uses a single `kurs` value (Integer), which is resolved from the FacultySubject's kurs array.

---

## Frontend Migration Guide

### 1. **Update TypeScript/JavaScript Interfaces**

**Before:**
```typescript
interface FacultySubjectDTO {
  id: number;
  facultyId: number;
  subjectId: number;
  kurs: number;  // ❌ OLD
  facultyName?: string;
  subjectName?: string;
  description?: string;
  bookCount?: number;
}
```

**After:**
```typescript
interface FacultySubjectDTO {
  id: number;
  facultyId: number;
  subjectId: number;
  kurs: number[];  // ✅ NEW: Array of numbers
  facultyName?: string;
  subjectName?: string;
  description?: string;
  bookCount?: number;
}
```

### 2. **Update Form Handling**

**Before (Single Select):**
```jsx
<select name="kurs" value={formData.kurs}>
  <option value="1">1-kurs</option>
  <option value="2">2-kurs</option>
  <option value="3">3-kurs</option>
  <option value="4">4-kurs</option>
</select>
```

**After (Multi-Select):**
```jsx
<select 
  name="kurs" 
  value={formData.kurs} 
  multiple  // ✅ Enable multiple selection
  onChange={(e) => {
    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData({...formData, kurs: selected});
  }}
>
  <option value="1">1-kurs</option>
  <option value="2">2-kurs</option>
  <option value="3">3-kurs</option>
  <option value="4">4-kurs</option>
</select>
```

**Or using checkboxes:**
```jsx
{[1, 2, 3, 4].map(kursValue => (
  <label key={kursValue}>
    <input
      type="checkbox"
      checked={formData.kurs.includes(kursValue)}
      onChange={(e) => {
        if (e.target.checked) {
          setFormData({...formData, kurs: [...formData.kurs, kursValue]});
        } else {
          setFormData({...formData, kurs: formData.kurs.filter(k => k !== kursValue)});
        }
      }}
    />
    {kursValue}-kurs
  </label>
))}
```

### 3. **Update Display Logic**

**Before:**
```jsx
<span>Kurs: {facultySubject.kurs}</span>
```

**After:**
```jsx
<span>Kurs: {facultySubject.kurs.join(', ')}</span>
// Example output: "Kurs: 1, 2, 3"

// Or with badges:
<div>
  {facultySubject.kurs.map(k => (
    <span key={k} className="badge">{k}-kurs</span>
  ))}
</div>
```

### 4. **Update API Requests**

**Create/Update - Before:**
```javascript
const data = {
  facultyId: 1,
  subjectId: 5,
  kurs: 2  // ❌ OLD: single value
};

fetch('/api/v1/faculty-subject', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
});
```

**Create/Update - After:**
```javascript
const data = {
  facultyId: 1,
  subjectId: 5,
  kurs: [1, 2, 3]  // ✅ NEW: array of values
};

fetch('/api/v1/faculty-subject', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
});
```

### 5. **Update Filtering Logic**

**Before:**
```javascript
// Filter subjects by exact kurs match
const filtered = subjects.filter(s => s.kurs === selectedKurs);
```

**After:**
```javascript
// Filter subjects that include the selected kurs
const filtered = subjects.filter(s => s.kurs.includes(selectedKurs));
```

---

## Data Validation

### Frontend Validation Rules:
1. **Minimum:** At least 1 kurs value should be selected (array must not be empty)
2. **Maximum:** No more than 4 kurs values (assuming 4 years of study)
3. **Valid Values:** Only integers from 1 to 4
4. **No Duplicates:** Each kurs value should appear only once in the array

### Example Validation:
```javascript
function validateKurs(kurs) {
  // Check if array
  if (!Array.isArray(kurs)) {
    return { valid: false, error: 'Kurs must be an array' };
  }
  
  // Check if not empty
  if (kurs.length === 0) {
    return { valid: false, error: 'At least one kurs must be selected' };
  }
  
  // Check valid values
  const validKurs = kurs.every(k => k >= 1 && k <= 4);
  if (!validKurs) {
    return { valid: false, error: 'Kurs values must be between 1 and 4' };
  }
  
  // Check for duplicates
  const unique = new Set(kurs);
  if (unique.size !== kurs.length) {
    return { valid: false, error: 'Duplicate kurs values not allowed' };
  }
  
  return { valid: true };
}
```

---

## Example Use Cases

### Use Case 1: Subject for Multiple Years
A foundational subject like "Programming Basics" might be taught in years 1, 2, and 3:
```json
{
  "facultyId": 1,
  "subjectId": 5,
  "kurs": [1, 2, 3]
}
```

### Use Case 2: Subject for Single Year
An advanced subject like "Thesis Writing" might only be for year 4:
```json
{
  "facultyId": 1,
  "subjectId": 20,
  "kurs": [4]
}
```

### Use Case 3: Filtering by Year
Student in year 2 wants to see all subjects for their year:
```
GET /api/v1/faculty-subject/by-faculty/1?kurs=2
```
This returns all subjects where `kurs` array contains `2`.

---

## Testing Checklist for Frontend

- [ ] Create FacultySubject with single kurs value `[1]`
- [ ] Create FacultySubject with multiple kurs values `[1, 2, 3]`
- [ ] Update existing FacultySubject to add/remove kurs values
- [ ] Display kurs as comma-separated list or badges
- [ ] Filter subjects by kurs (check if array contains value)
- [ ] Get kurs list and verify it returns flattened unique values
- [ ] Handle empty kurs array gracefully
- [ ] Validate kurs input before submission
- [ ] Test multi-select or checkbox UI for kurs selection
- [ ] Verify BookDTO still receives single kurs value (not array)

---

## Migration Notes

### Database Migration
The database schema has been updated:
- The `kurs` column in `faculty_subject` table now uses an `@ElementCollection` mapping
- JPA will create a separate join table (e.g., `faculty_subject_kurs`) to store the list values
- Existing data may need migration script to convert single values to arrays

### Backward Compatibility
⚠️ **This is a breaking change.** The API is NOT backward compatible:
- Old clients sending `"kurs": 1` will receive validation errors
- Old clients expecting `"kurs": 1` will fail when parsing `"kurs": [1]`
- Frontend must be updated simultaneously with backend deployment

---

## Support

For questions or issues related to this API change, please contact:
- Backend Team: backend@bxu-library.uz
- API Documentation: [Internal Wiki Link]

**Last Updated:** April 17, 2026

