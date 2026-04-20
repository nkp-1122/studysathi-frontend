import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { resolveAssetUrl } from '../services/api';
import { branchOptions, normalizeBranchValue } from '../utils/academicStructure';

const yearSemesterMap = {
  '1': ['1', '2'],
  '2': ['3', '4'],
  '3': ['5', '6'],
  '4': ['7', '8']
};

const semesterShortcuts = [
  { label: '1st Sem', value: '1' },
  { label: '2nd Sem', value: '2' },
  { label: '3rd Sem', value: '3' },
  { label: '4th Sem', value: '4' },
  { label: '5th Sem', value: '5' },
  { label: '6th Sem', value: '6' },
  { label: '7th Sem', value: '7' },
  { label: '8th Sem', value: '8' }
];

function NotesLibraryPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/notes', {
          params: { section: 'notes' },
        });

        if (isMounted) {
          setNotes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setNotes([]);
        }
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNotes = notes.filter(note => {
    const currentSemester = String(note.semester || '');
    const searchableText = [
      note.title || '',
      note.topic || '',
      note.branch || '',
      `${currentSemester} sem`,
      `semester ${currentSemester}`
    ].join(' ').toLowerCase();

    return (
      (!search || searchableText.includes(search.toLowerCase())) &&
      (!branch || normalizeBranchValue(note.branch) === branch) &&
      (!semester || currentSemester === semester) &&
      (!selectedYear || yearSemesterMap[selectedYear]?.includes(currentSemester))
    );
  });

  const filteredSemesters = selectedYear 
    ? semesterShortcuts.filter(s => yearSemesterMap[selectedYear].includes(s.value))
    : semesterShortcuts;

  const applyYearFilter = (year) => {
    setSelectedYear(selectedYear === year ? '' : year);
    setSemester('');
  };

  const clearFilters = () => {
    setSearch('');
    setBranch('');
    setSemester('');
    setSelectedYear('');
  };

  return (
    <>
      <section className="hero" id="notes-hero">
        <div className="container hero-grid">
          <div>
            <span className="tag">Student Platform</span>
            <h1>Your All-in-One Student Help Platform</h1>
            <p>Get notes, viva questions, assignment help, and exam material in one clean and mobile-friendly website.</p>
            <div className="note-actions hero-actions">
              <Link to="/notes/explore" className="btn">Browse Notes</Link>
              <Link to="/assignments" className="btn secondary">Order Assignment</Link>
            </div>
          </div>

          <div className="hero-card">
            <h3>Quick Highlights</h3>
            <p className="muted">Professional UI + Login + Search + Filters + Admin-style note upload.</p>
            <div className="hero-stats">
              <div className="stat"><strong>{notes.length}</strong>Notes</div>
              <div className="stat"><strong>24/7</strong>Access</div>
              <div className="stat"><strong>Fast</strong>Mobile UI</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="notes">
        <div className="container">
        <h2>Notes</h2>
        <p className="lead">Search notes, filter by branch, year, and semester, then open or download your study material.</p>

        <Link to="/notes/explore" className="main-library-card library-launch-card">
          <div className="note-card-tags">
            <span className="tag tag-accent">Notes</span>
            <span className="tag">{filteredNotes.length} Notes Ready</span>
          </div>
          <div className="main-library-card-copy">
            <h2>Open Notes</h2>
            <p>
              Is note card par click karte hi notes explorer open hoga, jahan branch, year, semester aur subject-wise notes explore kar sakte ho.
            </p>
          </div>
          <span className="main-library-card-action">Explore</span>
        </Link>

        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input 
              type="text" 
              placeholder="Search subject, topic, branch or semester..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={() => {}}>Search</button>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">All Branches</option>
            {branchOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">All Semesters</option>
            <option value="1">1st Sem</option>
            <option value="2">2nd Sem</option>
            <option value="3">3rd Sem</option>
            <option value="4">4th Sem</option>
            <option value="5">5th Sem</option>
            <option value="6">6th Sem</option>
            <option value="7">7th Sem</option>
            <option value="8">8th Sem</option>
          </select>
          <button className="btn secondary" onClick={clearFilters}>Clear Search</button>
        </div>

        <div className="search-status">
          <span><strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'note' : 'notes'} found</span>
          <span className="muted">Use search, year, and semester filters to find notes faster.</span>
        </div>

        <div className="grid grid-3 notes-explorer">
          <div className="panel">
            <h3>Year-wise Notes</h3>
            <p className="muted">Click a year to show only its matching semesters.</p>
            <div className="quick-links">
              <button className={`chip-btn year-btn ${selectedYear === '1' ? 'active' : ''}`} onClick={() => applyYearFilter('1')}>1st Year</button>
              <button className={`chip-btn year-btn ${selectedYear === '2' ? 'active' : ''}`} onClick={() => applyYearFilter('2')}>2nd Year</button>
              <button className={`chip-btn year-btn ${selectedYear === '3' ? 'active' : ''}`} onClick={() => applyYearFilter('3')}>3rd Year</button>
              <button className={`chip-btn year-btn ${selectedYear === '4' ? 'active' : ''}`} onClick={() => applyYearFilter('4')}>4th Year</button>
            </div>
          </div>
          <div className="panel">
            <h3>Semester-wise Notes</h3>
            <p className="muted">{selectedYear ? `Showing semesters for ${['1st','2nd','3rd','4th'][selectedYear-1]} Year.` : 'Select a year to see its related semesters, or browse all 8 semesters.'}</p>
            <div className="quick-links">
              {filteredSemesters.map(s => (
                <button 
                  key={s.value}
                  className={`chip-btn ${semester === s.value ? 'active' : ''}`} 
                  onClick={() => setSemester(s.value)}
                >
                  {s.label}
                </button>
              ))}
              {selectedYear && (
                <button className="chip-btn" onClick={() => {setSelectedYear(''); setSemester('');}}>
                  Show All Semesters
                </button>
              )}
            </div>
          </div>
          <div className="panel">
            <h3>Previous Years' Questions</h3>
            <p className="muted">Open the separate PYQ page and browse year-wise papers from 2015 to 2025.</p>
            <div className="quick-links">
              <Link className="chip-btn" to="/pyq">PYQ 2015 - 2025</Link>
            </div>
          </div>
        </div>

        <div className="card" style={{marginBottom: '22px'}}>
          <h3>Previous Years' Questions</h3>
          <p className="muted">A separate page is available with simple year-wise PYQ access from 2015 to 2025.</p>
          <div className="note-actions">
            <Link className="btn" to="/pyq">Open PYQ Page</Link>
          </div>
        </div>

        <div className="grid grid-3" id="notesContainer">
          {filteredNotes.length ? filteredNotes.map((note, index) => (
            <div key={index} className="card">
              <span className="tag">{note.branch} • {note.semester} Sem</span>
              <h3 style={{marginTop: '10px'}}>{note.title}</h3>
              <p className="muted">{note.topic}</p>
              <div className="note-actions">
                <a className="btn" href={resolveAssetUrl(note.url) || '#'} target="_blank" rel="noopener noreferrer">Open</a>
                <a className="btn secondary" href={resolveAssetUrl(note.url) || '#'} download>Download</a>
              </div>
            </div>
          )) : (
            <div className="card">
              <h3>No notes found</h3>
              <p className="muted">Try changing search or filters.</p>
            </div>
          )}
        </div>
        </div>
      </section>
    </>
  );
}

export default NotesLibraryPage;

