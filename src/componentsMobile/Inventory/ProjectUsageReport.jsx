import React, { useState, useEffect } from 'react';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const ProjectUsageReport = () => {
  // Helper function for date
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const [date, setDate] = useState(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectOptions, setProjectOptions] = useState([]);
  const [category, setCategory] = useState('Electricals'); // Default category as shown in screenshot

  // Fetch project names from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => item.siteName);
        setProjectOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchProjects();
  }, []);

  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* Date and Category Row */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="text-[12px] font-medium text-[#616161] leading-normal underline-offset-2 hover:underline"
          >
            {date}
          </button>
          <div className="text-[12px] font-medium text-black leading-normal">
            {category}
          </div>
        </div>

        {/* Project Name Field */}
        <div className="mb-4 relative">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Project Name
          </p>
          <div className="relative">
            <div
              onClick={() => setShowProjectModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer relative"
              style={{
                boxSizing: 'border-box',
                color: selectedProject ? '#000' : '#9E9E9E'
              }}
            >
              <span className="flex-1">{selectedProject || 'Select Project'}</span>
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {selectedProject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject('');
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
                style={{ right: '32px' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty Content Area - This is where report data would be displayed */}
      <div className="flex-1 bg-white">
        {/* Content will be displayed here when a project is selected */}
      </div>

      {/* Modals */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={date}
      />
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          setSelectedProject(value);
          setShowProjectModal(false);
        }}
        selectedValue={selectedProject}
        options={projectOptions}
        fieldName="Project Name"
      />
    </div>
  );
};

export default ProjectUsageReport;

