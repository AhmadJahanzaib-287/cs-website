import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Hammer } from 'lucide-react';
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
      <AnimatePresence mode="wait">
        {!activeWorkload ? (
          <motion.div
            key="workload-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WorkloadListPage onOpenWorkload={handleOpenWorkload} />
          </motion.div>
        ) : (
          <motion.div
            key="workload-wizard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mx-auto"
          >
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Workloads
            </button>

            {activeWorkload.currentStep === 1 ? (
              <RegisterClassesStep
                workload={activeWorkload}
                onNext={(updatedWorkload) => setActiveWorkload(updatedWorkload)}
              />
            ) : activeWorkload.currentStep === 2 ? (
              <AddTeachersStep
                workload={activeWorkload}
                onNext={(updatedWorkload) => setActiveWorkload(updatedWorkload)}
                onBack={() => setActiveWorkload({ ...activeWorkload, currentStep: 1 })}
              />
           ) : activeWorkload.currentStep === 3 ? (
              <AssignWorkloadStep
                workload={activeWorkload}
                onFinish={(updatedWorkload) => setActiveWorkload(updatedWorkload)}
                onBack={() => setActiveWorkload({ ...activeWorkload, currentStep: 2 })}
              />
            ) : (
              <DownloadStep
                workload={activeWorkload}
                onBack={() => setActiveWorkload({ ...activeWorkload, currentStep: 3 })}
              />
            
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}