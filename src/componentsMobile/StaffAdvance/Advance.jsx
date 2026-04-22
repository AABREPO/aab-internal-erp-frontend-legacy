import React, { useMemo, useRef, useState } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import Attach from '../Images/Attachfile.svg';
import CloseIcon from '../Images/Close F.svg';
import {
  DIGITAL_PAYMENT_MODES,
  PAYMENT_MODE_OPTIONS,
  TYPE_OPTIONS,
  formatCurrency,
  formatDateDisplay,
  getEntryNumber,
  parseNumber,
  todayIso,
  withBranchUrl
} from './staffAdvanceHelpers';

const uploadAttachment = async (selectedFile, employeeName) => {
  if (!selectedFile) return null;

  const uploadFormData = new FormData();
  const now = new Date();
  const timestamp = now
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    .replace(',', '')
    .replace(/\s/g, '-');

  uploadFormData.append('file', selectedFile);
  uploadFormData.append('file_name', `${timestamp} ${employeeName || 'Staff Advance'}`);

  const response = await fetch(
    'https://backendaab.in/demoAabuilderDash/expenses/googleUploader/uploadToGoogleDrive',
    {
      method: 'POST',
      body: uploadFormData
    }
  );

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  const result = await response.json();
  return result?.url || null;
};

const initialFormState = {
  selectedType: 'Advance',
  date: todayIso(),
  empName: null,
  purpose: null,
  transferPurpose: null,
  amountGivenInput: '',
  transferAmount: '',
  paymentMode: '',
  description: ''
};

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TypePickerModal = ({ isOpen, selectedType, searchQuery, onSearchChange, onClose, onSelect }) => {
  if (!isOpen) return null;

  const filteredTypes = TYPE_OPTIONS.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px]"
      onClick={onClose}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div
        className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] -translate-y-[22px] rounded-b-[20px] shadow-lg flex flex-col transform max-h-[80vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center px-[24px] pt-[20px]">
          <p className="text-[16px] font-semibold text-black">Select Type</p>
          <button
            type="button"
            onClick={onClose}
            className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
          >
            <img src={CloseIcon} alt="Close" className="w-[11px] h-[11px]" />
          </button>
        </div>

        <div className="px-[24px] pt-[4px] pb-[6px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search"
              className="w-full h-[32px] pl-[40px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="shadow-md rounded-lg overflow-hidden">
            {filteredTypes.map((option) => {
              const isSelected = selectedType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelect(option.value)}
                  className={`w-full px-[16px] flex items-center gap-3 transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                    }`}
                  style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                >
                  <p className="text-[12px] font-medium text-black text-left">{option.label}</p>
                </button>
              );
            })}
            {!filteredTypes.length ? (
              <div className="flex items-center justify-center py-[18px] text-[12px] font-medium text-[#9E9E9E]">
                No type found
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const PickerField = ({
  label,
  total,
  required = false,
  value,
  placeholder = 'Select',
  onClick,
  onClear
}) => (
  <div>
    <p className="flex justify-between items-center text-[12px] font-semibold text-black leading-normal mb-0.5">
      <span>
        {label}
        {required ? <span className="text-[#eb2f8e]">*</span> : null}
      </span>
      {total !== undefined ? (
        <span className="text-[12px] font-medium text-[#9E9E9E]">{total}</span>
      ) : null}
    </p>
    <div className="relative">
      <div
        onClick={onClick}
        className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
        style={{
          boxSizing: 'border-box',
          color: value ? '#000' : '#9E9E9E'
        }}
      >
        {value || placeholder}
        {value ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon />
          </div>
        )}
      </div>
    </div>
  </div>
);

const InputField = ({
  label,
  required = false,
  value,
  onChange,
  placeholder = 'Enter Amount',
  inputMode = 'text'
}) => (
  <div className="flex-1">
    <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
      {label}
      {required ? <span className="text-[#eb2f8e]">*</span> : null}
    </p>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
        style={{
          boxSizing: 'border-box',
          color: value ? '#000' : '#9E9E9E'
        }}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const convertDisplayDateToIso = (displayDate, fallbackDate) => {
  const parts = String(displayDate || '').split('/');
  if (parts.length !== 3) return fallbackDate;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const Advance = ({ activeBranchId, peopleOptions, purposeOptions, records, onSaved }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showTransferPurposeModal, setShowTransferPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const entryNo = useMemo(() => {
    if (!records.length) return 1;
    const lastEntryNumber = records.reduce((maxValue, record) => {
      const nextValue = parseNumber(getEntryNumber(record));
      return nextValue > maxValue ? nextValue : maxValue;
    }, 0);
    return lastEntryNumber + 1;
  }, [records]);

  const overallAdvance = useMemo(() => {
    if (!formData.empName) return 0;

    return records.reduce((sum, record) => {
      const matchesEmployee =
        formData.empName.type === 'Employee'
          ? String(record.employee_id ?? '') === String(formData.empName.id) ||
          record.employee_name === formData.empName.value ||
          record.emp_name === formData.empName.value
          : String(record.labour_id ?? '') === String(formData.empName.id) ||
          record.labour_name === formData.empName.value;

      if (!matchesEmployee) return sum;

      if (record.type === 'Advance') return sum + parseNumber(record.amount);
      if (record.type === 'Refund') return sum - parseNumber(record.staff_refund_amount);
      if (record.type === 'Transfer') return sum + parseNumber(record.amount);
      return sum;
    }, 0);
  }, [formData.empName, records]);

  const purposeAdvance = useMemo(() => {
    if (!formData.empName || !formData.purpose) return 0;

    return records.reduce((sum, record) => {
      const matchesEmployee =
        formData.empName.type === 'Employee'
          ? String(record.employee_id ?? '') === String(formData.empName.id) ||
          record.employee_name === formData.empName.value ||
          record.emp_name === formData.empName.value
          : String(record.labour_id ?? '') === String(formData.empName.id) ||
          record.labour_name === formData.empName.value;

      const matchesPurpose =
        String(record.from_purpose_id ?? record.purpose_id ?? '') === String(formData.purpose.id) ||
        record.purpose === formData.purpose.value;

      if (!matchesEmployee || !matchesPurpose) return sum;

      if (record.type === 'Advance') return sum + parseNumber(record.amount);
      if (record.type === 'Refund') return sum - parseNumber(record.staff_refund_amount);
      if (record.type === 'Transfer') return sum + parseNumber(record.amount);
      return sum;
    }, 0);
  }, [formData.empName, formData.purpose, records]);

  const handleInputChange = (field, value) => {
    setFormData((previousState) => ({
      ...previousState,
      [field]: value
    }));
  };

  const handleTypeChange = (selectedType) => {
    setFormData((previousState) => ({
      ...previousState,
      selectedType,
      amountGivenInput: selectedType === 'Transfer' ? '' : previousState.amountGivenInput,
      transferAmount: selectedType === 'Transfer' ? previousState.transferAmount : '',
      paymentMode: selectedType === 'Transfer' ? '' : previousState.paymentMode,
      transferPurpose: selectedType === 'Transfer' ? previousState.transferPurpose : null
    }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      date: todayIso()
    });
    setSelectedFile(null);
    setTypeSearchQuery('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    if (!formData.selectedType || !formData.date || !formData.empName) {
      window.alert('Please fill Type, Date and Employee Name.');
      return false;
    }

    if (!formData.purpose) {
      window.alert('Please select a purpose.');
      return false;
    }

    if (formData.selectedType === 'Transfer') {
      if (!formData.transferPurpose || !formData.transferAmount) {
        window.alert('Please fill transfer purpose and transfer amount.');
        return false;
      }
      return true;
    }

    if (!formData.amountGivenInput) {
      window.alert('Please enter the amount.');
      return false;
    }

    if (formData.selectedType === 'Advance' && !formData.paymentMode) {
      window.alert('Please select payment mode.');
      return false;
    }

    return true;
  };

  const isFormReady = () => {
    if (!formData.selectedType || !formData.date || !formData.empName || !formData.purpose) {
      return false;
    }

    if (formData.selectedType === 'Transfer') {
      return Boolean(formData.transferPurpose && formData.transferAmount);
    }

    if (!formData.amountGivenInput) return false;
    if (formData.selectedType === 'Advance' && !formData.paymentMode) return false;
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fileUrl = await uploadAttachment(selectedFile, formData.empName?.label);
      const payload = {
        type: formData.selectedType,
        date: formData.date,
        employee_id: formData.empName?.type === 'Employee' ? formData.empName.id : null,
        labour_id: formData.empName?.type === 'Labour' ? formData.empName.id : null,
        from_purpose_id: formData.purpose?.id || null,
        to_purpose_id: formData.selectedType === 'Transfer' ? formData.transferPurpose?.id || null : null,
        amount:
          formData.selectedType === 'Transfer'
            ? parseNumber(formData.transferAmount)
            : formData.selectedType === 'Advance'
              ? parseNumber(formData.amountGivenInput)
              : 0,
        staff_refund_amount:
          formData.selectedType === 'Refund' ? parseNumber(formData.amountGivenInput) : 0,
        staff_payment_mode: formData.selectedType === 'Transfer' ? '' : formData.paymentMode,
        description: formData.description,
        file_url: fileUrl,
        entryNo,
        weekNo: 0,
        branch_id: activeBranchId
      };

      const saveResponse = await fetch(
        withBranchUrl('https://backendaab.in/demoAabuildersDash/api/staff-advance/save', activeBranchId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!saveResponse.ok) {
        throw new Error('Failed to save staff advance');
      }

      const savedRecord = await saveResponse.json();

      if (
        (formData.selectedType === 'Advance' || formData.selectedType === 'Refund') &&
        DIGITAL_PAYMENT_MODES.includes(formData.paymentMode)
      ) {
        try {
          await fetch(
            withBranchUrl(
              'https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save',
              activeBranchId
            ),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: formData.date,
                created_at: new Date().toISOString(),
                contractor_id: null,
                vendor_id: null,
                employee_id: formData.empName?.type === 'Employee' ? formData.empName.id : null,
                project_id: null,
                type: 'Staff Advance',
                bill_payment_mode: formData.paymentMode,
                amount: parseNumber(formData.amountGivenInput),
                status: true,
                weekly_number: '',
                weekly_payment_expense_id: null,
                advance_portal_id: null,
                staff_advance_portal_id:
                  savedRecord?.id ||
                  savedRecord?.staffAdvancePortalId ||
                  savedRecord?.staff_advance_portal_id,
                claim_payment_id: null,
                cheque_number: null,
                cheque_date: null,
                transaction_number: null,
                account_number: null,
                branch_id: activeBranchId
              })
            }
          );
        } catch (weeklyPaymentError) {
          console.error('Weekly payment bill save failed:', weeklyPaymentError);
        }
      }

      window.dispatchEvent(new Event('staffAdvanceUpdated'));
      if (typeof onSaved === 'function') {
        await onSaved();
      }
      resetForm();
      window.alert('Staff advance saved successfully.');
    } catch (error) {
      console.error('Error saving staff advance:', error);
      window.alert('Unable to save staff advance right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionLabel =
    formData.selectedType === 'Refund'
      ? 'Submit Refund'
      : formData.selectedType === 'Transfer'
        ? 'Submit Transfer'
        : 'Pay Advance';

  return (
    <div
      className="h-full overflow-y-auto bg-white pb-[24px]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <TypePickerModal
        isOpen={showTypeModal}
        selectedType={formData.selectedType}
        searchQuery={typeSearchQuery}
        onSearchChange={setTypeSearchQuery}
        onClose={() => {
          setShowTypeModal(false);
          setTypeSearchQuery('');
        }}
        onSelect={(value) => {
          handleTypeChange(value);
          setShowTypeModal(false);
          setTypeSearchQuery('');
        }}
      />

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(displayDate) =>
          handleInputChange('date', convertDisplayDateToIso(displayDate, formData.date))
        }
        initialDate={formatDateDisplay(formData.date)}
      />

      <SelectVendorModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSelect={(value) => {
          handleInputChange(
            'empName',
            peopleOptions.find((option) => option.label === value) || null
          );
          setShowEmployeeModal(false);
        }}
        selectedValue={formData.empName?.label || ''}
        options={peopleOptions.map((option) => option.label)}
        fieldName="Employee Name"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          handleInputChange(
            'purpose',
            purposeOptions.find((option) => option.label === value) || null
          );
          setShowPurposeModal(false);
        }}
        selectedValue={formData.purpose?.label || ''}
        options={purposeOptions.map((option) => option.label)}
        fieldName={formData.selectedType === 'Transfer' ? 'Purpose From' : 'Purpose'}
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={showTransferPurposeModal}
        onClose={() => setShowTransferPurposeModal(false)}
        onSelect={(value) => {
          handleInputChange(
            'transferPurpose',
            purposeOptions.find((option) => option.label === value) || null
          );
          setShowTransferPurposeModal(false);
        }}
        selectedValue={formData.transferPurpose?.label || ''}
        options={purposeOptions.map((option) => option.label)}
        fieldName="Purpose To"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          handleInputChange('paymentMode', value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={formData.paymentMode || ''}
        options={PAYMENT_MODE_OPTIONS.map((option) => option.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />

      <form onSubmit={handleSubmit}>
        <div className="mb-[8px] flex items-center justify-between border-b border-gray-200 pb-[6px]">
          <div className="flex items-center gap-[4px]">
            <button
              type="button"
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              # {entryNo}
            </button>

            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {formatDateDisplay(formData.date)}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {formData.selectedType || 'Select Type'}
            </button>
          </div>
        </div>

        <div className="space-y-[6px]">
          <PickerField
            label="Employee Name"
            required
            total={formatCurrency(overallAdvance, 2)}
            value={formData.empName?.label || ''}
            onClick={() => setShowEmployeeModal(true)}
            onClear={() => handleInputChange('empName', null)}
          />

          <PickerField
            label={formData.selectedType === 'Transfer' ? 'Purpose From' : 'Purpose'}
            required
            total={formatCurrency(purposeAdvance, 2)}
            value={formData.purpose?.label || ''}
            onClick={() => setShowPurposeModal(true)}
            onClear={() => handleInputChange('purpose', null)}
          />

          {formData.selectedType === 'Transfer' ? (
            <>
              <PickerField
                label="Purpose To"
                required
                value={formData.transferPurpose?.label || ''}
                onClick={() => setShowTransferPurposeModal(true)}
                onClear={() => handleInputChange('transferPurpose', null)}
              />

              <InputField
                label="Transfer Amount"
                required
                value={formData.transferAmount}
                onChange={(event) => handleInputChange('transferAmount', event.target.value)}
                placeholder="Enter Amount"
                inputMode="decimal"
              />
            </>
          ) : (
            <div className="flex gap-[10px] items-center">
              <InputField
                label={formData.selectedType === 'Refund' ? 'Refund Amount' : 'Amount Given'}
                required
                value={formData.amountGivenInput}
                onChange={(event) => handleInputChange('amountGivenInput', event.target.value)}
                placeholder="Enter Amount"
                inputMode="decimal"
              />

              <div className="flex-1">
                <PickerField
                  label="Payment Mode"
                  required={formData.selectedType === 'Advance'}
                  value={formData.paymentMode || ''}
                  onClick={() => setShowPaymentModeModal(true)}
                  onClear={() => handleInputChange('paymentMode', '')}
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Description</p>
            <textarea
              className="w-full min-h-[62px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] pt-[8px] text-[12px] font-medium bg-white focus:outline-none resize-none"
              placeholder="Type Here"
              value={formData.description}
              onChange={(event) => handleInputChange('description', event.target.value)}
              style={{
                boxSizing: 'border-box',
                color: formData.description ? '#000' : '#9E9E9E'
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-[8px] mb-1 mt-[8px] gap-y-[4px] w-full max-w-[328px]">
          <input
            type="file"
            id="staffAdvanceFileInput"
            ref={fileInputRef}
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            accept="image/*,.pdf,.doc,.docx"
          />
          <label
            htmlFor="staffAdvanceFileInput"
            className="cursor-pointer flex items-center gap-[2px] text-orange-600 hover:text-orange-700 active:opacity-80 flex-shrink-0"
          >
            <img className="w-4 h-3" alt="Attach" src={Attach} />
            <span className="text-[12px] font-medium underline">Attach File</span>
          </label>
          {selectedFile ? (
            <span className="text-[11px] font-medium text-[#666] break-words min-w-0 flex-1">
              {selectedFile.name}
            </span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormReady()}
          className={`w-full h-[40px] font-semibold rounded text-[14px] leading-normal ${isFormReady() && !isSubmitting ? 'bg-black text-white' : 'bg-[#D9D9D9] text-black'
            }`}
        >
          {isSubmitting ? 'Submitting...' : actionLabel}
        </button>
      </form>
    </div>
  );
};

export default Advance;
