import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

// 🔹 Separate FacultyForm component imported here
import FacultyForm from './components/FacultyForm';

export default function Faculty() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const handleOpenAddForm = () => {
    setEditingFaculty(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFaculty(null);
  };

  const handleSaveFaculty = async (formData) => {
    try {
      if (editingFaculty) {
        // API call to update faculty member
        // await API.put(`/faculty/${editingFaculty._id}`, formData);
      } else {
        // API call to create new faculty member
        // await API.post('/faculty', formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  return (
    <div className="p-6 relative min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Faculty Management</h1>
          <p className="text-sm text-slate-400">Manage departmental faculty members and profiles.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Modal View */}
      <AnimatePresence>
        {isFormOpen && (
          <FacultyForm
            isOpen={isFormOpen}
            initialData={editingFaculty}
            onCancel={handleCloseForm}
            onSubmit={handleSaveFaculty}
          />
        )}
      </AnimatePresence>
    </div>
  );
}