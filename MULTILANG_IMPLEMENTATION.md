# Multi-Language Course Support Implementation

## Overview

Multi-language support has been successfully added to the Course Management system. Instructors can now create and edit courses in multiple languages (English, Spanish, French, German, Chinese, and Arabic).

## Features Added

### 1. Language Selector

- **Location**: Course creation/edit form
- **Supported Languages**:
  - English (en)
  - Español (es)
  - Français (fr)
  - Deutsch (de)
  - 中文 (zh)
  - العربية (ar)

### 2. Language Tabs

- Tab-based navigation to switch between languages
- Visual indicator (✓) showing which languages have content
- Easy switching during course creation/editing

### 3. Form Data Structure

The form now uses a nested structure for language-specific content:

```javascript
{
  languages: {
    en: {
      courseName: "String",
      pages: [
        {
          title: "String",
          content: "String",
          time: "Number"
        }
      ]
    },
    es: {
      courseName: "String",
      pages: [...]
    }
    // ... other languages
  }
}
```

### 4. API Integration

- **Create Course**: Sends all language variants in the `languages` object
- **Update Course**: Updates all language variants in a single request
- **Display**: Shows course count with language count (e.g., "4 languages")

## Component Updates

### State Management

```javascript
const [currentLanguage, setCurrentLanguage] = useState("en");
const [availableLanguages] = useState([...]);
const [formData, setFormData] = useState({
  languages: {
    en: { courseName: "", pages: [...] }
  }
});
```

### Key Functions Updated

#### `updateCourseName(value)`

- Updates the course name for the currently selected language

#### `addPage()`

- Adds a new page to the current language's pages array

#### `removePage(index)`

- Removes a page from the current language's pages array

#### `updatePage(index, field, value)`

- Updates specific page fields for the current language

#### `ensureLanguageExists(langCode)`

- Initializes language data if it doesn't exist

#### `handleEditCourse(course)`

- Now supports both old format (courseName) and new format (languages)
- Backwards compatible with existing single-language courses

#### `handleSubmitCourse()`

- Validates at least English has content
- Sends all non-empty language variants to the backend
- Gracefully handles both create and update operations

### UI Components Updated

#### Course Card (Mobile View)

- Displays course name from English (or fallback)
- Shows language count when available

#### Table View (Desktop)

- Displays course name from English language variant
- Shows number of languages available
- Updated action buttons

#### Course Viewer

- Displays course name from English variant
- Shows language count badge
- Lists all pages in English

## Backwards Compatibility

The implementation is fully backwards compatible with existing single-language courses:

- Old format with `courseName` and `pages` fields is still supported
- Automatically falls back to English language variant when available
- Can edit old courses and convert them to multi-language format

## Usage

### Creating a Multi-Language Course

1. Click "Create Course" button
2. Fill in English course details (required)
3. Click on other language tabs to add translations
4. Languages with content are marked with a ✓
5. Click "Create Course" to submit

### Editing an Existing Course

1. Click "Edit" on any course
2. Language tabs show which languages have content
3. Switch between languages to edit specific translations
4. Click "Update Course" to save all language variants

### Viewing Courses

- Course lists show the number of available languages
- Course details display English content (can be extended to user-preferred language)

## Future Enhancements

1. User preference for display language
2. Language-specific analytics
3. Language completeness indicators
4. Bulk language translation features
5. Language-specific publish scheduling

## Database Schema (Expected Backend Format)

```javascript
{
  _id: ObjectId,
  languages: {
    en: {
      courseName: String,
      pages: [{
        title: String,
        content: String,
        time: Number
      }]
    },
    // ... other languages
  },
  uploadedBy: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Notes

- At least English content is required for course creation
- Empty language variants are not sent to the backend
- The system automatically initializes missing languages when switching tabs
- Course display defaults to English variant for consistency
