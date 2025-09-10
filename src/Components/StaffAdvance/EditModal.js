import React, { memo, useCallback } from 'react';
import Select from 'react-select';

const EditModal = memo(({ 
  isOpen, 
  editFormData, 
  setEditFormData, 
  employees, 
  purposes, 
  onClose, 
  onUpdate, 
  formatWithCommas 
}) => {
  const handleInputChange = useCallback((field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  }, [setEditFormData]);

  const handleAmountChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      if (editFormData.type === "Refund") {
        setEditFormData({ ...editFormData, staff_refund_amount: rawValue, amount: '' });
      } else {
        setEditFormData({ ...editFormData, amount: rawValue, staff_refund_amount: '' });
      }
    }
  }, [editFormData, setEditFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
        <div className='grid grid-cols-2 gap-4 text-left ml-5'>
          <div className='flex items-center gap-3'>
            <label className='font-semibold text-[#E4572E]'>Select Type</label>
            <select 
              value={editFormData.type} 
              onChange={(e) => handleInputChange('type', e.target.value)}
              className='w-[163px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
            >
              <option value=''>Select Type...</option>
              <option value='Advance'>Advance</option>
              <option value='Transfer'>Transfer</option>
              <option value='Refund'>Refund</option>
            </select>
          </div>
          <div className='flex items-center gap-3'>
            <label className='font-semibold text-[#E4572E]'>Date</label>
            <input
              type='date'
              placeholder='dd-mm-yyyy'
              value={editFormData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
            />
          </div>
          <div className=''>
            <div className='flex'>
              <label className='font-semibold block'>Employee</label>
            </div>
            <Select
              options={employees}
              value={employees.find(emp => emp.id === editFormData.employee_id) || null}
              onChange={(selected) => handleInputChange('employee_id', selected?.id || '')}
              className='w-[263px] h-[45px] rounded-lg focus:outline-none'
              isClearable
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderWidth: '2px',
                  borderRadius: '8px',
                  borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                  boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.2)',
                  }
                }),
              }}
            />
          </div>
          <div>
            <label className='font-semibold block'>Purpose</label>
            <Select
              options={purposes}
              value={purposes.find(purp => purp.id === editFormData.from_purpose_id) || null}
              onChange={(selected) => handleInputChange('from_purpose_id', selected?.id || '')}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderWidth: '2px',
                  borderRadius: '8px',
                  borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                  boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.2)',
                  }
                }),
              }}
              isClearable
              className='w-[263px] h-[45px] focus:outline-none' 
            />
          </div>
          <div>
            <label className='font-semibold block'>
              {editFormData.type === 'Refund' ? 'Refund Amount' : 'Amount Given'}
            </label>
            <input
              value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.staff_refund_amount) : formatWithCommas(editFormData.amount)}
              onChange={handleAmountChange}
              className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
            />
          </div>
          <div className=''>
            <label className='font-semibold block'>Payment Mode</label>
            <select
              value={editFormData.staff_payment_mode}
              onChange={(e) => handleInputChange('staff_payment_mode', e.target.value)}
              className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
              <option value=''>Select</option>
              <option value='Cash'>Cash</option>
              <option value='GPay'>GPay</option>
              <option value='Net Banking'>Net Banking</option>
            </select>
          </div>
          <div className='col-span-2'>
            <label className='font-semibold block'>Description</label>
            <textarea
              rows={2}
              value={editFormData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className='w-[590px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
            </textarea>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded">
            Cancel
          </button>
          <button onClick={onUpdate} className="px-4 py-2 bg-[#BF9853] w-[100px] h-[45px] text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
});

EditModal.displayName = 'EditModal';
export default EditModal;