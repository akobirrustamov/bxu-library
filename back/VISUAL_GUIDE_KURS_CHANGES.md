# Visual API Changes Guide - Kurs Field Migration

## 📊 Change Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BEFORE (v1.0)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FacultySubject                                             │
│  ┌───────────────────────────────┐                          │
│  │ id: 1                         │                          │
│  │ facultyId: 1                  │                          │
│  │ subjectId: 5                  │                          │
│  │ kurs: 2          ◄────────────┼─── Single Integer       │
│  │ facultyName: "CS"             │                          │
│  │ subjectName: "Programming"    │                          │
│  └───────────────────────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                            ▼ ▼ ▼
                         MIGRATION
                            ▼ ▼ ▼

┌─────────────────────────────────────────────────────────────┐
│                    AFTER (v2.0)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FacultySubject                                             │
│  ┌───────────────────────────────┐                          │
│  │ id: 1                         │                          │
│  │ facultyId: 1                  │                          │
│  │ subjectId: 5                  │                          │
│  │ kurs: [1, 2, 3]  ◄────────────┼─── Array of Integers    │
│  │ facultyName: "CS"             │                          │
│  │ subjectName: "Programming"    │                          │
│  └───────────────────────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 API Request Flow Comparison

### CREATE Request

```
BEFORE:
┌────────────────────────────────────────┐
│ POST /api/v1/faculty-subject          │
├────────────────────────────────────────┤
│ {                                      │
│   "facultyId": 1,                      │
│   "subjectId": 5,                      │
│   "kurs": 2          ❌ Single value   │
│ }                                      │
└────────────────────────────────────────┘
                  │
                  ▼
         ❌ Will Fail Now!


AFTER:
┌────────────────────────────────────────┐
│ POST /api/v1/faculty-subject          │
├────────────────────────────────────────┤
│ {                                      │
│   "facultyId": 1,                      │
│   "subjectId": 5,                      │
│   "kurs": [1, 2, 3]  ✅ Array         │
│ }                                      │
└────────────────────────────────────────┘
                  │
                  ▼
            ✅ Success!
```

---

## 🎯 Filter Logic Changes

### GET with Kurs Filter

```
Endpoint: GET /api/v1/faculty-subject/by-faculty/1?kurs=2

Database State:
┌────────────────────────────────────────────────────────────┐
│ ID │ Faculty │ Subject      │ Kurs Array │ Match kurs=2? │
├────┼─────────┼──────────────┼────────────┼───────────────┤
│ 1  │ CS      │ Programming  │ [1, 2, 3]  │ ✅ YES        │
│ 2  │ CS      │ Data Struct  │ [2]        │ ✅ YES        │
│ 3  │ CS      │ Algorithms   │ [3, 4]     │ ❌ NO         │
│ 4  │ CS      │ Thesis       │ [4]        │ ❌ NO         │
└────────────────────────────────────────────────────────────┘

Response: Returns rows 1 and 2 (where kurs array contains 2)

BEFORE Logic:
  subjects.filter(s => s.kurs === 2)  // Exact match

AFTER Logic:
  subjects.filter(s => s.kurs.includes(2))  // Array contains
```

---

## 📱 Frontend Component Changes

### Form Input Evolution

```
┌──────────────────────────────────────────────────────────────┐
│                    BEFORE: Single Select                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Select Kurs:                                                │
│  ┌────────────────────────────┐                              │
│  │ 2-kurs               [▼]   │  ← Single selection         │
│  └────────────────────────────┘                              │
│                                                              │
│  State: { kurs: 2 }                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                            ▼ ▼ ▼

┌──────────────────────────────────────────────────────────────┐
│                AFTER: Multiple Selection                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Select Kurs:                                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                            │
│  │ ☑ 1 │ │ ☑ 2 │ │ ☑ 3 │ │ ☐ 4 │  ← Multiple checkboxes    │
│  └─────┘ └─────┘ └─────┘ └─────┘                            │
│                                                              │
│  State: { kurs: [1, 2, 3] }                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Display Changes

### List View

```
┌─────────────────────────────────────────────────────────────┐
│                  Faculty Subjects List                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BEFORE:                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Programming              Faculty: CS    Kurs: 2      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  AFTER:                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Programming              Faculty: CS                 │   │
│  │                          Kurs: [1] [2] [3] ← Badges  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

HTML Examples:

BEFORE:
<span class="kurs-badge">2</span>

AFTER:
<div class="kurs-badges">
  <span class="kurs-badge">1</span>
  <span class="kurs-badge">2</span>
  <span class="kurs-badge">3</span>
</div>

OR simply:
<span>Kurs: 1, 2, 3</span>
```

---

## 💾 State Management Patterns

### React State

```javascript
// ❌ BEFORE
const [formData, setFormData] = useState({
  facultyId: null,
  subjectId: null,
  kurs: null  // Single value
});

// ✅ AFTER
const [formData, setFormData] = useState({
  facultyId: null,
  subjectId: null,
  kurs: []  // Array
});
```

### Adding/Removing Kurs

```javascript
// ✅ Add kurs to array
setFormData(prev => ({
  ...prev,
  kurs: [...prev.kurs, newKursValue]
}));

// ✅ Remove kurs from array
setFormData(prev => ({
  ...prev,
  kurs: prev.kurs.filter(k => k !== kursToRemove)
}));

// ✅ Toggle kurs (checkbox behavior)
const handleKursToggle = (kursValue) => {
  setFormData(prev => ({
    ...prev,
    kurs: prev.kurs.includes(kursValue)
      ? prev.kurs.filter(k => k !== kursValue)  // Remove
      : [...prev.kurs, kursValue]                // Add
  }));
};
```

---

## 🔍 Filtering Data

### Client-Side Filtering

```javascript
// ❌ BEFORE: Exact match
const filteredSubjects = subjects.filter(
  subject => subject.kurs === selectedKurs
);

// ✅ AFTER: Array contains check
const filteredSubjects = subjects.filter(
  subject => subject.kurs.includes(selectedKurs)
);
```

### Example Data

```javascript
const subjects = [
  { id: 1, name: "Programming", kurs: [1, 2, 3] },
  { id: 2, name: "Data Structures", kurs: [2] },
  { id: 3, name: "Algorithms", kurs: [3, 4] },
];

const selectedKurs = 2;

// Result will include:
// - Programming (because [1, 2, 3] contains 2)
// - Data Structures (because [2] contains 2)
// - NOT Algorithms (because [3, 4] doesn't contain 2)
```

---

## ⚠️ Common Pitfalls

### 1. Sending Single Value

```javascript
// ❌ WRONG - Will fail
fetch('/api/v1/faculty-subject', {
  method: 'POST',
  body: JSON.stringify({
    facultyId: 1,
    subjectId: 5,
    kurs: 2  // ← ERROR: Should be array
  })
});

// ✅ CORRECT
fetch('/api/v1/faculty-subject', {
  method: 'POST',
  body: JSON.stringify({
    facultyId: 1,
    subjectId: 5,
    kurs: [2]  // ← Even single value must be in array
  })
});
```

### 2. Empty Array

```javascript
// ❌ WRONG - Empty array not allowed
{
  facultyId: 1,
  subjectId: 5,
  kurs: []  // ← ERROR: Must have at least one value
}

// ✅ CORRECT
{
  facultyId: 1,
  subjectId: 5,
  kurs: [1]  // ← At least one value
}
```

### 3. Displaying Array Directly

```jsx
// ❌ WRONG - Will show "[1,2,3]" or "[object Object]"
<span>Kurs: {subject.kurs}</span>

// ✅ CORRECT - Join array elements
<span>Kurs: {subject.kurs.join(', ')}</span>
// Output: "Kurs: 1, 2, 3"
```

### 4. Using === for Filtering

```javascript
// ❌ WRONG - Won't work with arrays
if (subject.kurs === 2) { ... }

// ✅ CORRECT - Use includes()
if (subject.kurs.includes(2)) { ... }
```

---

## 🧪 Testing Scenarios

### Test Cases

```
┌────────────────────────────────────────────────────────────┐
│ Test Case              │ Input         │ Expected Result   │
├────────────────────────┼───────────────┼───────────────────┤
│ Single kurs            │ kurs: [1]     │ ✅ Success        │
│ Multiple kurs          │ kurs: [1,2,3] │ ✅ Success        │
│ All kurs               │ kurs: [1,2,3,4]│ ✅ Success       │
│ Empty array            │ kurs: []      │ ❌ Validation Err │
│ Single value (not arr) │ kurs: 1       │ ❌ Type Error     │
│ String value           │ kurs: "1"     │ ❌ Type Error     │
│ Invalid range          │ kurs: [0,5]   │ ❌ Validation Err │
│ Duplicates             │ kurs: [1,1,2] │ ❌ Validation Err │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 Migration Checklist

### Frontend Developer Checklist

- [ ] Update TypeScript/JavaScript interfaces (kurs: number → kurs: number[])
- [ ] Update all form inputs (single select → multi-select/checkboxes)
- [ ] Update display components (show array values as badges/list)
- [ ] Update filtering logic (=== → includes())
- [ ] Update create/edit forms (send array instead of single value)
- [ ] Update state initialization (null/0 → [])
- [ ] Add validation (non-empty array, valid range, no duplicates)
- [ ] Test all CRUD operations
- [ ] Test filtering by kurs
- [ ] Update unit tests
- [ ] Update E2E tests
- [ ] Review API integration points

---

## 🚀 Quick Start Guide

### Step 1: Update Types
```typescript
// In your types/models file
interface FacultySubjectDTO {
  kurs: number[];  // Changed from: kurs: number;
}
```

### Step 2: Update Forms
```jsx
// Replace single select with checkboxes
{[1, 2, 3, 4].map(k => (
  <input 
    type="checkbox" 
    checked={formData.kurs.includes(k)}
    onChange={() => handleKursToggle(k)}
  />
))}
```

### Step 3: Update API Calls
```javascript
// Ensure kurs is always an array
const payload = {
  facultyId: 1,
  subjectId: 5,
  kurs: selectedKursValues  // Array of numbers
};
```

### Step 4: Update Display
```jsx
// Show array values
<span>{subject.kurs.join(', ')}</span>
```

### Step 5: Test
```javascript
// Test with Postman collection or automated tests
```

---

## 📞 Support

**Questions?** Contact backend team  
**Documentation:** See API_DOCUMENTATION_KURS_CHANGES.md  
**Postman Collection:** Import BXU_Library_FacultySubject_Kurs_Changes.postman_collection.json

---

**Last Updated:** April 17, 2026  
**Version:** 2.0.0

