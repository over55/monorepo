// File Path: web/frontend/src/constants/Event.js

// Event Sector Constants
export const EVENT_SECTOR_EDUCATIONAL = 1;
export const EVENT_SECTOR_CORPORATE = 2;
export const EVENT_SECTOR_NONPROFIT = 3;
export const EVENT_SECTOR_GOVERNMENT = 4;

// Event Type Constants
export const EVENT_TYPE_CONFERENCE = 1;
export const EVENT_TYPE_ONSITE = 2;
export const EVENT_TYPE_OFFSITE = 3;
export const EVENT_TYPE_VIRTUAL = 4;

// Event Status Constants
export const EVENT_STATUS_ACTIVE = 1;
export const EVENT_STATUS_ARCHIVED = 2;
export const EVENT_STATUS_CLOSED = 3;

// Event Status Map (ID to Label mapping)
export const EVENT_STATUS_MAP = {
  [EVENT_STATUS_ACTIVE]: "Active",
  [EVENT_STATUS_ARCHIVED]: "Archived",
  [EVENT_STATUS_CLOSED]: "Closed",
};

// SHSM (Specialist High Skills Major) Constants
// IMPORTANT: Backend now uses boolean for isSHSM field
// Form values: Use boolean (true/false)
export const EVENT_SHSM_YES = true;
export const EVENT_SHSM_NO = false;

// Filter values: Still use int8 for API filtering (backend filter struct)
export const EVENT_SHSM_FILTER_ALL = 0;
export const EVENT_SHSM_FILTER_YES = 1;
export const EVENT_SHSM_FILTER_NO = 2;

// Legacy constants (deprecated - kept for backward compatibility)
export const EVENT_SHSM_UNSET = 0; // Deprecated - use null or undefined for unset

// Event Sector Options for select elements
export const EVENT_SECTOR_OPTIONS = [
  { value: String(EVENT_SECTOR_EDUCATIONAL), label: "Educational" }, // "1"
  { value: String(EVENT_SECTOR_CORPORATE), label: "Corporate" }, // "2"
  { value: String(EVENT_SECTOR_NONPROFIT), label: "Non-Profit" }, // "3"
  { value: String(EVENT_SECTOR_GOVERNMENT), label: "Government" }, // "4"
];

// Event Type Options for select elements
export const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: String(EVENT_TYPE_CONFERENCE), label: "Conference" }, // "1"
  { value: String(EVENT_TYPE_ONSITE), label: "Onsite" }, // "2"
  { value: String(EVENT_TYPE_OFFSITE), label: "Offsite" }, // "3"
  { value: String(EVENT_TYPE_VIRTUAL), label: "Virtual" }, // "4"
];

// Event Status Options for select elements
export const EVENT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: String(EVENT_STATUS_ACTIVE), label: "Active" }, // "1"
  { value: String(EVENT_STATUS_ARCHIVED), label: "Archived" }, // "2"
  { value: String(EVENT_STATUS_CLOSED), label: "Closed" }, // "3"
];

// SHSM Options for select elements (for filtering)
export const EVENT_SHSM_OPTIONS = [
  { value: "", label: "All" },
  { value: String(EVENT_SHSM_FILTER_YES), label: "Yes" }, // "1"
  { value: String(EVENT_SHSM_FILTER_NO), label: "No" }, // "2"
];

// Day of Week Options
export const DAY_OF_WEEK_OPTIONS = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

// Facilitator Time Slot Options
export const FACILITATOR_TIME_OPTIONS = [
  { value: "am", label: "Morning (AM)" },
  { value: "pm", label: "Afternoon (PM)" },
  { value: "both", label: "Both (AM & PM)" },
  { value: "none", label: "None Required" },
];

// Default values for new events
export const EVENT_DEFAULTS = {
  type: EVENT_TYPE_ONSITE,
  status: EVENT_STATUS_ACTIVE,
  isSHSM: null, // null means unset (user must select true or false)
  numberOfAttendees: 0,
  facilitatorAM: false,
  facilitatorPM: false,
};

// Event field labels for forms
export const EVENT_FIELD_LABELS = {
  eventName: "Event Name",
  description: "Description",
  partners: "Partners",
  listingURL: "Listing URL",
  startDate: "Start Date",
  attendeeCount: "Attendee Count",
  attendeeCapacity: "Attendee Capacity",
  dayOfWeek: "Day of Week",
  startTime: "Start Time",
  endTime: "End Time",
  isSHSM: "SHSM Related",
  type: "Event Type",
  facilitatorAM: "Facilitator AM",
  facilitatorPM: "Facilitator PM",
  skillSetIDs: "Skill Sets",
  tagIDs: "Tags",
};

// Constants for filtering and sorting (for search results pages)
export const EVENT_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  { value: String(EVENT_TYPE_CONFERENCE), label: "Conference" }, // "1"
  { value: String(EVENT_TYPE_ONSITE), label: "Onsite" }, // "2"
  { value: String(EVENT_TYPE_OFFSITE), label: "Offsite" }, // "3"
  { value: String(EVENT_TYPE_VIRTUAL), label: "Virtual" }, // "4"
];

export const EVENT_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: String(EVENT_STATUS_ACTIVE), label: "Active" }, // "1"
  { value: String(EVENT_STATUS_ARCHIVED), label: "Archived" }, // "2"
  { value: String(EVENT_STATUS_CLOSED), label: "Closed" }, // "3"
];

export const EVENT_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "start_date,DESC", label: "Start Date (Newest → Oldest)" },
  { value: "start_date,ASC", label: "Start Date (Oldest → Newest)" },
  { value: "created_at,DESC", label: "Created Date (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest → Newest)" },
];

// Event Type ID constants for specific event types (aliases for backward compatibility)
export const EVENT_TYPE_OF_ID_CONFERENCE = EVENT_TYPE_CONFERENCE; // 1
export const EVENT_TYPE_OF_ID_VIRTUAL = EVENT_TYPE_VIRTUAL; // 4
export const EVENT_TYPE_OF_ID_IN_SCHOOL = EVENT_TYPE_ONSITE; // 2 (InSchool events are a type of onsite)
export const EVENT_TYPE_OF_ID_FIELD_TRIP = EVENT_TYPE_OFFSITE; // 3 (FieldTrip events are a type of offsite)
