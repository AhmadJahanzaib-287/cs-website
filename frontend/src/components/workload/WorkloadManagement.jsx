import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import WorkloadListPage from './components/WorkloadListPage';
import RegisterClassesStep from './components/RegisterClassesStep';
import AddTeachersStep from './components/AddTeachersStep';
import AssignWorkloadStep from './components/AssignWorkloadStep';
import DownloadStep from './components/DownloadStep';

export default function WorkloadManagement() {
  // Which Workload session (from the list, or just created) is currently open.
  // null = show the list page. An object = show that workload's wizard.
  const [activeWorkload, setActiveWorkload] = useState(null);

  const handleOpenWorkload = (workload) => {
    setActiveWorkload(workload);
  };

  const handleBackToList = () => {
    setActiveWorkload(null);
  };

  return (
    <div className="w-full min-h-[70vh] py-6 px-2 sm:px-4">
      {!activeWorkload ? (
        <WorkloadListPage onOpenWorkload={handleOpenWorkload} />
      ) : (
        <div className="w-full max-w-5xl mx-auto">
            <button
              onClick={handleBackToList}
              className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#dce5ef] bg-white px-3 py-2 text-xs font-semibold text-[#52647b] transition hover:border-[#b9c9d8] hover:text-[#1e3a8a]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Workloads
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {activeWorkload.currentStep === 1 ? (
                <RegisterClassesStep
                  key="register-classes"
                  workload={activeWorkload}
                  onNext={(updatedWorkload) => setActiveWorkload(updatedWorkload)}
                  onClose={handleBackToList}
                />
              ) : activeWorkload.currentStep === 2 ? (
                <AddTeachersStep
                  key="add-teachers"
                  workload={activeWorkload}
                  onNext={(updatedWorkload) => setActiveWorkload(updatedWorkload)}
                  onBack={() => setActiveWorkload({ ...activeWorkload, currentStep: 1 })}
                  onClose={handleBackToList}
                />
              ) : activeWorkload.currentStep === 3 ? (
                <AssignWorkloadStep
                  key="assign-workload"
                  workload={activeWorkload}
                  onFinish={(updatedWorkload) => setActiveWorkload(updatedWorkload)}
                  onBack={() => setActiveWorkload({ ...activeWorkload, currentStep: 2 })}
                  onClose={handleBackToList}
                />
              ) : (
                <DownloadStep
                  key="download-report"
                  workload={activeWorkload}
                  onBack={() => setActiveWorkload({ ...activeWorkload, currentStep: 3 })}
                  onClose={handleBackToList}
                />
              )}
            </AnimatePresence>
        </div>
      )}
    </div>
  );
}