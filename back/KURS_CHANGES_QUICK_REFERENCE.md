# Quick Reference: Kurs Field Changes

## 🚨 Breaking Change Summary

**Field Changed:** `kurs` in FacultySubject  
**From:** `Integer` (single value)  
**To:** `List<Integer>` (array of values)

---

## Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Type** | `Integer` | `List<Integer>` |
| **JSON Example** | `"kurs": 2` | `"kurs": [1, 2, 3]` |
| **TypeScript** | `kurs: number` | `kurs: number[]` |
| **Single Value** | `"kurs": 1` | `"kurs": [1]` |

---

## API Endpoints Summary

| Endpoint | Method | Request Body Change | Response Change |
|----------|--------|---------------------|-----------------|
| `/api/v1/faculty-subject` | POST | `kurs` is now `array` | Returns `kurs` as `array` |
| `/api/v1/faculty-subject/{id}` | PUT | `kurs` is now `array` | Returns `kurs` as `array` |
| `/api/v1/faculty-subject/{id}` | GET | N/A | Returns `kurs` as `array` |
| `/api/v1/faculty-subject/by-faculty/{facultyId}` | GET | N/A | Returns `kurs` as `array` for each item |
| `/api/v1/faculty-subject/by-faculty/{facultyId}/kurs-list` | GET | N/A | Returns flattened array of all kurs values |

---

## Frontend Code Changes

### 1. Interface Update
```typescript
// ❌ OLD
interface FacultySubjectDTO {
  kurs: number;
}

// ✅ NEW
interface FacultySubjectDTO {
  kurs: number[];
}
```

### 2. Request Body
```javascript
// ❌ OLD
{ facultyId: 1, subjectId: 5, kurs: 2 }

// ✅ NEW
{ facultyId: 1, subjectId: 5, kurs: [1, 2, 3] }
```

### 3. Display
```jsx
// ❌ OLD
<span>Kurs: {data.kurs}</span>

// ✅ NEW
<span>Kurs: {data.kurs.join(', ')}</span>
```

### 4. Filtering
```javascript
// ❌ OLD
subjects.filter(s => s.kurs === selectedKurs)

// ✅ NEW
subjects.filter(s => s.kurs.includes(selectedKurs))
```

### 5. Form Input
```jsx
// ❌ OLD
<select name="kurs" value={kurs}>
  <option value="1">1</option>
</select>

// ✅ NEW (Multi-select)
<select name="kurs" value={kurs} multiple>
  <option value="1">1</option>
</select>

// ✅ NEW (Checkboxes - Recommended)
{[1,2,3,4].map(k => (
  <input 
    type="checkbox" 
    checked={kurs.includes(k)}
    onChange={handleKursChange}
  />
))}
```

---

## Common Patterns

### Initialize Empty State
```javascript
// ✅ NEW
const [formData, setFormData] = useState({
  facultyId: null,
  subjectId: null,
  kurs: []  // Empty array, not null
});
```

### Add/Remove Kurs
```javascript
// Add
setFormData({
  ...formData, 
  kurs: [...formData.kurs, newKurs]
});

// Remove
setFormData({
  ...formData,
  kurs: formData.kurs.filter(k => k !== kursToRemove)
});

// Toggle
setFormData({
  ...formData,
  kurs: formData.kurs.includes(kursValue)
    ? formData.kurs.filter(k => k !== kursValue)
    : [...formData.kurs, kursValue]
});
```

### Validation
```javascript
// Check not empty
if (formData.kurs.length === 0) {
  alert('Please select at least one kurs');
  return;
}

// Check valid range
if (!formData.kurs.every(k => k >= 1 && k <= 4)) {
  alert('Invalid kurs value');
  return;
}
```

---

## Query Parameter Behavior

### Filter by Kurs (Still Single Value)
```
GET /api/v1/faculty-subject/by-faculty/1?kurs=2
```
- Query parameter `kurs` is still a **single integer**
- Backend checks if the `kurs` **array contains** this value
- Returns all FacultySubjects where `kurs.includes(2)`

**Example:**
- Subject A: `kurs: [1, 2, 3]` ✅ Returned (contains 2)
- Subject B: `kurs: [2, 4]` ✅ Returned (contains 2)  
- Subject C: `kurs: [3, 4]` ❌ Not returned (doesn't contain 2)

---

## Important Notes

1. **Always use arrays** even for single values: `[1]` not `1`
2. **No empty arrays** in production (validate on frontend)
3. **BookDTO still uses single kurs** (Integer, not array)
4. **Backend handles array operations** (contains, flatten, etc.)
5. **Update ALL forms** that create/edit FacultySubject

---

## Testing Checklist

- [ ] POST with `kurs: [1]` - works
- [ ] POST with `kurs: [1,2,3]` - works
- [ ] POST with `kurs: 1` - fails (validation error)
- [ ] GET returns `kurs` as array
- [ ] PUT updates array correctly
- [ ] Filter by kurs still works
- [ ] Display shows all kurs values
- [ ] Can select/deselect multiple kurs in form

---

## Need Help?

See full documentation: `API_DOCUMENTATION_KURS_CHANGES.md`

