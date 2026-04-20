import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

function VivaSearchPage() {
  const location = useLocation();
  const [vivas, setVivas] = useState([]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = params.get('q') || '';
  const branch = params.get('branch') || '';
  const semester = params.get('semester') || '';

  useEffect(() => {
    const fetchVivas = async () => {
      try {
        const { data } = await api.get('/vivas');
        setVivas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load viva questions:', error.message);
      }
    };

    fetchVivas();
  }, []);

  const filteredVivas = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    return vivas.filter((viva) => {
      const currentSemester = String(viva.semester || '');
      const searchableText = [
        viva.subject || '',
        viva.question || '',
        viva.answer || '',
        viva.branch || '',
        `${currentSemester} sem`,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!searchValue || searchableText.includes(searchValue)) &&
        (!branch || viva.branch === branch) &&
        (!semester || currentSemester === semester)
      );
    });
  }, [vivas, query, branch, semester]);

  return (
    <section className="section" id="viva-search-page">
      <div className="container">
        <span className="tag">Viva Search</span>
        <h2 style={{ marginTop: '12px' }}>Search Results</h2>
        <p className="lead">
          {query ? `Showing results for "${query}"` : 'Showing filtered viva question results.'}
        </p>

        <div className="note-actions" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          <Link className="btn secondary" to="/#viva">Back to Viva Library</Link>
        </div>

        <div className="search-status">
          <span><strong>{filteredVivas.length}</strong> viva question{filteredVivas.length === 1 ? '' : 's'} found</span>
          <span className="muted">
            {[branch && `Branch: ${branch}`, semester && `Semester: ${semester}`]
              .filter(Boolean)
              .join(' - ') || 'Review the viva question cards below.'}
          </span>
        </div>

        <div className="note-list">
          {filteredVivas.length ? (
            filteredVivas.map((viva, index) => (
              <div key={viva._id || `${viva.subject}-${index}`} className="card viva-card">
                <div className="note-card-tags">
                  <span className="tag">{viva.branch} - {viva.semester} Sem</span>
                  <span className="tag tag-accent">Viva</span>
                </div>
                <h3 style={{ marginTop: '10px' }}>{viva.subject}</h3>
                <p className="viva-question"><strong>Q.</strong> {viva.question}</p>
                <p className="muted"><strong>A.</strong> {viva.answer}</p>
              </div>
            ))
          ) : (
            <div className="card">
              <h3>Viva question not found.</h3>
              <p className="muted">Try a different search term or change the branch or semester filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default VivaSearchPage;
