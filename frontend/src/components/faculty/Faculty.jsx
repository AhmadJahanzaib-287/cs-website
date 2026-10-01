import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import API from '../../api/axios';
import FacultyCard from './FacultyCard';
import FacultyProfile from './FacultyProfile';

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await API.get('/faculty');
        if (response.data.success) {
          setFacultyList(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching public faculty records:', err);
        setError('Faculty directory is currently unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  if (selectedFaculty) {
    return (
      <FacultyProfile
        member={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
    );
  }

  return (
    <section className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Users className="w-4 h-4" /> Department Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Our Faculty</h1>
          <p className="text-sm text-slate-400 mt-3 max-w-2xl mx-auto">
            Meet the faculty members guiding our students through computing, research, and innovation.
          </p>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-slate-400 py-16">Loading faculty directory...</p>
        )}

        {!isLoading && error && (
          <p className="text-center text-sm text-red-400 py-16">{error}</p>
        )}

        {!isLoading && !error && facultyList.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-16">No faculty profiles are available yet.</p>
        )}

        {!isLoading && !error && facultyList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {facultyList.map((member) => (
              <FacultyCard
                key={member._id || member.id}
                member={member}
                onViewProfile={() => setSelectedFaculty(member)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}