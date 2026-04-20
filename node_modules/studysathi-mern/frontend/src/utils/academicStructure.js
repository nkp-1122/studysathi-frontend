import {
  courseUsesBranches,
  getCourseByKey,
  normalizeCourseKey,
} from './courseCatalog';

export const yearLabels = {
  '1': '1st Year',
  '2': '2nd Year',
  '3': '3rd Year',
  '4': '4th Year',
};

export const semesterLabels = {
  '1': '1st Semester',
  '2': '2nd Semester',
  '3': '3rd Semester',
  '4': '4th Semester',
  '5': '5th Semester',
  '6': '6th Semester',
  '7': '7th Semester',
  '8': '8th Semester',
};

export const yearSemesterMap = {
  '1': ['1', '2'],
  '2': ['3', '4'],
  '3': ['5', '6'],
  '4': ['7', '8'],
};

export const resourceCatalog = {
  syllabus: {
    title: 'Syllabus',
    description: 'Common For All Branches',
  },
  notes: {
    title: 'Notes',
    description: 'Common For All Branches',
  },
  quantum: {
    title: 'Quantum',
    description: 'Common For All Branches',
  },
  pyq: {
    title: "PYQ's",
    description: 'Common For All Branches',
  },
};

export const resourceCards = Object.entries(resourceCatalog).map(([key, value]) => ({
  key,
  ...value,
}));

export const branchOptions = [
  { value: 'AIML', label: 'AIML' },
  { value: 'CSE', label: 'CSE' },
  { value: 'IT', label: 'IT' },
  { value: 'ECE', label: 'ECE' },
  { value: 'EEE/EN', label: 'EEE/EN' },
  { value: 'CIVIL', label: 'CIVIL' },
  { value: 'MECHANICAL', label: 'MECHANICAL' },
];

const branchAliasMap = {
  AIML: 'AIML',
  AIMI: 'AIML',
  CSE: 'CSE',
  IT: 'IT',
  ECE: 'ECE',
  'EEE/EN': 'EEE/EN',
  CIVIL: 'CIVIL',
  ME: 'MECHANICAL',
  MECHANICAL: 'MECHANICAL',
  'MECHANICALENGINEERING': 'MECHANICAL',
};

export const normalizeBranchValue = (value = '') => {
  const normalizedValue = typeof value === 'string' ? value.trim().toUpperCase().replace(/\s+/g, '') : '';
  return branchAliasMap[normalizedValue] || '';
};

const buildAcademicSearch = ({ course = '', branch = '', year = '', semester = '' } = {}) => {
  const params = new URLSearchParams();
  const normalizedCourse = normalizeCourseKey(course);
  const normalizedBranch = normalizeBranchValue(branch);

  if (normalizedCourse) {
    params.set('course', normalizedCourse);
  }

  if (normalizedBranch) {
    params.set('branch', normalizedBranch);
  }

  if (year) {
    params.set('year', year);
  }

  if (semester) {
    params.set('semester', semester);
  }

  const search = params.toString();
  return search ? `?${search}` : '';
};

const isYearAvailableForCourse = (courseKey = '', year = '') => {
  const course = getCourseByKey(courseKey);

  if (!course) {
    return Boolean(yearLabels[year]);
  }

  return course.years.includes(String(year || ''));
};

export const getResourceBranchesRoute = (yearId, resourceKey, { course = '' } = {}) =>
  `/year/${yearId}/${resourceKey}/branches${buildAcademicSearch({ course })}`;

export const getResourceSemestersRoute = (yearId, resourceKey, { course = '', branch = '' } = {}) => {
  return `/year/${yearId}/${resourceKey}/semesters${buildAcademicSearch({ course, branch })}`;
};

export const getAcademicSelectionFromSearch = (search = '') => {
  const params = new URLSearchParams(search);
  const course = normalizeCourseKey(params.get('course') || '');
  const year = params.get('year') || '';
  const validYear = isYearAvailableForCourse(course, year) ? year : '';
  const allowedSemesters = yearSemesterMap[validYear] || [];
  const semester = params.get('semester') || '';
  const branch = normalizeBranchValue(params.get('branch') || '');

  return {
    course,
    branch,
    year: allowedSemesters.length ? validYear : '',
    semester: allowedSemesters.includes(semester) ? semester : '',
  };
};

export const getResourceDestination = (resourceKey, { course = '', year = '', semester = '', branch = '' } = {}) => {
  const search = buildAcademicSearch({ course, branch, year, semester });

  if (resourceKey === 'syllabus') return `/syllabus${search}`;
  if (resourceKey === 'notes') return `/notes/explore${search}`;
  if (resourceKey === 'quantum') return `/quantum${search}`;
  if (resourceKey === 'pyq') return `/pyq${search}`;

  return '/';
};

export const shouldOpenBranchSelection = (courseKey = '', yearId = '') =>
  courseUsesBranches(courseKey, yearId);
