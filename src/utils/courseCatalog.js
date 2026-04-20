const courseCatalog = [
  {
    key: 'btech',
    title: 'B.Tech',
    description: 'Year-wise notes, PYQs, syllabus, and quantum material.',
    years: ['1', '2', '3', '4'],
    totalSemesters: 8,
    usesBranches: true,
    branchSelectionYears: ['2', '3', '4'],
    resourceTrack: 'Notes / PYQ / Syllabus',
    yearCardCopy: 'Open year-wise resources, semesters, and study material.',
  },
  {
    key: 'bca',
    title: 'BCA',
    description: 'Semester-wise notes, PYQs, syllabus, and computer application resources.',
    years: ['1', '2', '3'],
    totalSemesters: 6,
    usesBranches: false,
    branchSelectionYears: [],
    resourceTrack: 'Notes / PYQ / Semester',
    yearCardCopy: 'Open semester-wise resources and course material.',
  },
  {
    key: 'bba',
    title: 'BBA',
    description: 'Management study notes, PYQs, syllabus, and exam support material.',
    years: ['1', '2', '3'],
    totalSemesters: 6,
    usesBranches: false,
    branchSelectionYears: [],
    resourceTrack: 'Notes / PYQ / Semester',
    yearCardCopy: 'Open semester-wise resources and study material.',
  },
  {
    key: 'bpharma',
    title: 'B.Pharma',
    description: 'Pharmacy notes, PYQs, syllabus, and revision-ready resources.',
    years: ['1', '2', '3', '4'],
    totalSemesters: 8,
    usesBranches: false,
    branchSelectionYears: [],
    resourceTrack: 'Notes / PYQ / Syllabus',
    yearCardCopy: 'Open semester-wise resources and pharmacy material.',
  },
  {
    key: 'dpharma',
    title: 'D.Pharma',
    description: 'Diploma pharmacy notes, PYQs, syllabus, and quick revision material.',
    years: ['1', '2'],
    totalSemesters: 4,
    usesBranches: false,
    branchSelectionYears: [],
    resourceTrack: 'Notes / PYQ / Semester',
    yearCardCopy: 'Open semester-wise resources and diploma study material.',
  },
  {
    key: 'mba',
    title: 'MBA',
    description: 'MBA notes, PYQs, syllabus, and semester-wise course support.',
    years: ['1', '2'],
    totalSemesters: 4,
    usesBranches: false,
    branchSelectionYears: [],
    resourceTrack: 'Notes / PYQ / Semester',
    yearCardCopy: 'Open semester-wise resources and MBA study material.',
  },
];

const courseMap = new Map(courseCatalog.map((course) => [course.key, course]));

export const defaultCourseKey = 'btech';
export const courseOptions = courseCatalog;

export const normalizeCourseKey = (value = '') => {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return courseMap.has(normalizedValue) ? normalizedValue : '';
};

export const getCourseByKey = (courseKey = '') =>
  courseMap.get(normalizeCourseKey(courseKey)) || null;

export const getCourseDurationLabel = (courseKey = '') => {
  const course = getCourseByKey(courseKey);

  if (!course) {
    return '';
  }

  const yearCount = course.years.length;
  return `${yearCount} Year${yearCount === 1 ? '' : 's'} / ${course.totalSemesters} Semesters`;
};

export const getCourseYearAccessCards = (courseKey = '') => {
  const course = getCourseByKey(courseKey);

  if (!course) {
    return [];
  }

  return course.years.map((yearId) => ({
    key: yearId,
    title: `${yearId}${yearId === '1' ? 'st' : yearId === '2' ? 'nd' : yearId === '3' ? 'rd' : 'th'} Year`,
    description: course.yearCardCopy,
    href: `/year/${yearId}?course=${course.key}`,
  }));
};

export const courseUsesBranches = (courseKey = '', yearId = '') => {
  const course = getCourseByKey(courseKey);

  if (!course) {
    return false;
  }

  return course.usesBranches && course.branchSelectionYears.includes(String(yearId || ''));
};
