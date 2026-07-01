import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import UploadFile from '../Images/Upload Small.svg';
import Pen from '../Images/Pen.svg';
import CloseIcon from '../Images/Close F.svg';
import DeleteConfirmModal from '../PurchaseOrder/DeleteConfirmModal';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';
import {
  PAYMENT_MODE_OPTIONS,
  getPersonName,
  getPurposeName,
  isStaffAdvanceRecordLocked,
  loadStaffAdvanceData,
  parseNumber,
  resolveActiveBranchId,
} from './staffAdvanceHelpers';
import { STAFF_ADVANCE_MODULE_NAME } from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';
import {
  clearStaffAdvanceRecordsOnDelete,
} from '../../utils/staffAdvanceWeeklyPaymentBill';
import { formatWeeklyBillDeleteMessage } from '../../utils/advancePortalWeeklyPaymentBill';

const TYPE_FILTER_OPTIONS = ['Advance', 'Refund', 'Transfer'];
const STAFF_ADVANCE_ADMIN_USERNAMES = ['Mahalingam M', 'Admin'];

const History = ({ onPersonClick, user } = {}) => {
  const [activeBranchId] = useState(() => resolveActiveBranchId(user));
  const [staffData, setStaffData] = useState([]);
  const [peopleOptions, setPeopleOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);

  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    const resolvedUserRoles =
      user?.userRoles ||
      (() => {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          return stored?.userRoles || [];
        } catch {
          return [];
        }
      })();

    fetchUserModulePermissions(resolvedUserRoles, STAFF_ADVANCE_MODULE_NAME)
      .then(setModulePermissions)
      .catch(() => setModulePermissions([]));
  }, [user?.userRoles]);

  const canEdit = modulePermissions.includes('Edit');
  const canDelete = modulePermissions.includes('Delete');

  const resolveUsername = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      return (user?.username || user?.name || stored?.username || stored?.name || '').trim();
    } catch {
      return (user?.username || user?.name || '').trim();
    }
  };

  const isAdmin = STAFF_ADVANCE_ADMIN_USERNAMES.some(
    (name) => name.toLowerCase() === resolveUsername().toLowerCase()
  );

  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [personFilter, setPersonFilter] = useState('');
  const [entryNoFilter, setEntryNoFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showEntryNoModal, setShowEntryNoModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  const defaultPaymentModeOptions = PAYMENT_MODE_OPTIONS;
  const paymentModeOptions = usePaymentModeSelectOptionsForModule(
    STAFF_ADVANCE_MODULE_NAME,
    defaultPaymentModeOptions
  );
  const paymentModeFilterOptions = useMemo(
    () => paymentModeOptions.map((opt) => opt.label),
    [paymentModeOptions]
  );

  const [swipeStates, setSwipeStates] = useState({});
  const [uploadExpandedId, setUploadExpandedId] = useState(null);
  const [editDeleteExpandedId, setEditDeleteExpandedId] = useState(null);
  const [uploadingForId, setUploadingForId] = useState(null);
  const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [itemToUploadFor, setItemToUploadFor] = useState(null);
  const cardRefs = useRef({});
  const fileInputRef = useRef(null);
  const uploadExpandedIdRef = useRef(uploadExpandedId);
  const editDeleteExpandedIdRef = useRef(editDeleteExpandedId);

  useEffect(() => {
    uploadExpandedIdRef.current = uploadExpandedId;
  }, [uploadExpandedId]);
  useEffect(() => {
    editDeleteExpandedIdRef.current = editDeleteExpandedId;
  }, [editDeleteExpandedId]);

  const loadStaffData = useCallback(async () => {
    try {
      const data = await loadStaffAdvanceData(activeBranchId, { applyBranchFilter: false });
      setStaffData(data.records || []);
      setPeopleOptions(data.peopleOptions || []);
      setPurposeOptions(data.purposes || []);
    } catch (error) {
      console.error('Error loading staff advance history:', error);
      setStaffData([]);
    }
  }, [activeBranchId]);

  useEffect(() => {
    loadStaffData();
    const handleUpdate = () => loadStaffData();
    window.addEventListener('staffAdvanceUpdated', handleUpdate);
    return () => window.removeEventListener('staffAdvanceUpdated', handleUpdate);
  }, [loadStaffData]);

  const formatRelativeDateLabel = (input) => {
    if (!input) return '';
    try {
      const d = new Date(input);
      if (Number.isNaN(d.getTime())) return '';
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (dateOnly.getTime() === today.getTime()) return 'Today';
      if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return '';
    }
  };

  const formatDateTimeParts = (timestamp) => {
    if (!timestamp) return { date: '', time: '', dateTime: '' };
    try {
      const d = new Date(timestamp);
      if (Number.isNaN(d.getTime())) return { date: '', time: '', dateTime: '' };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      return { date: formattedDate, time: formattedTime, dateTime: `${formattedDate} • ${formattedTime}` };
    } catch {
      return { date: '', time: '', dateTime: '' };
    }
  };

  const transformEntries = useCallback(() => {
    return staffData
      .map((entry) => {
        const personName = getPersonName(entry, peopleOptions);
        const purposeName = getPurposeName(entry.from_purpose_id, purposeOptions);
        const transferPurposeName =
          entry.type === 'Transfer' && entry.to_purpose_id
            ? getPurposeName(entry.to_purpose_id, purposeOptions)
            : '';
        let amount = 0;
        if (entry.type === 'Refund') {
          amount = -(parseNumber(entry.staff_refund_amount) || 0);
        } else {
          amount = parseNumber(entry.amount) || 0;
        }
        const recordDate = entry.date || '';
        const recordTimestamp = entry.timestamp || entry.created_at || entry.date || '';
        const entryNo = entry.entry_no || 0;
        const year = recordDate
          ? new Date(recordDate).getFullYear()
          : recordTimestamp
            ? new Date(recordTimestamp).getFullYear()
            : new Date().getFullYear();
        let prefix = 'AD';
        if (entry.type === 'Refund') prefix = 'RF';
        else if (entry.type === 'Transfer') prefix = 'TF';
        const ref = `${prefix} - ${year} - ${entryNo}`;

        return {
          id: entry.staffAdvancePortalId || entry.id || `${entryNo}-${recordTimestamp}`,
          ref,
          personName,
          purposeName,
          transferPurposeName,
          recordDate,
          recordTimestamp,
          timestamp: recordTimestamp,
          type: entry.type || 'Advance',
          paymentMode: entry.staff_payment_mode || '',
          amount,
          entry,
        };
      })
      .sort((a, b) => Number(b.entry.entry_no || 0) - Number(a.entry.entry_no || 0));
  }, [staffData, peopleOptions, purposeOptions]);

  const transformed = transformEntries();

  const filtered = useMemo(() => {
    let result = transformed;
    if (typeFilter) {
      result = result.filter((item) => (item.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (personFilter) {
      result = result.filter(
        (item) => (item.personName || '').toLowerCase() === personFilter.toLowerCase()
      );
    }
    if (entryNoFilter) {
      result = result.filter((item) => String(item.entry.entry_no || '') === entryNoFilter);
    }
    if (purposeFilter) {
      result = result.filter(
        (item) => (item.purposeName || '').toLowerCase() === purposeFilter.toLowerCase()
      );
    }
    if (paymentModeFilter) {
      result = result.filter(
        (item) => (item.paymentMode || '').toLowerCase() === paymentModeFilter.toLowerCase()
      );
    }
    return result;
  }, [transformed, typeFilter, personFilter, entryNoFilter, purposeFilter, paymentModeFilter]);

  const getPaymentModeBadgeClass = (mode) => {
    if (!mode || mode === '') return 'bg-gray-100 text-gray-600';
    const m = String(mode).toLowerCase();
    if (m === 'cash') return 'bg-[#E7F4FD] text-[#336EA8]';
    return 'bg-[#FFEFFF] text-[#815182]';
  };

  const buildPersonClickPayload = (item) => {
    const entry = item.entry || {};
    const employeeId = entry.employee_id;
    const labourId = entry.labour_id;
    let selectedPerson = null;
    if (employeeId) {
      const match = peopleOptions.find(
        (opt) => opt.type === 'Employee' && String(opt.id) === String(employeeId)
      );
      if (match) selectedPerson = match;
    }
    if (!selectedPerson && labourId) {
      const match = peopleOptions.find(
        (opt) => opt.type === 'Labour' && String(opt.id) === String(labourId)
      );
      if (match) selectedPerson = match;
    }
    if (!selectedPerson && (entry.employee_name || entry.emp_name)) {
      selectedPerson = {
        value: entry.employee_name || entry.emp_name,
        label: entry.employee_name || entry.emp_name,
        id: employeeId,
        type: 'Employee',
      };
    }
    if (!selectedPerson && entry.labour_name) {
      selectedPerson = {
        value: entry.labour_name,
        label: entry.labour_name,
        id: labourId,
        type: 'Labour',
      };
    }
    const purposeId = entry.from_purpose_id;
    let selectedPurpose = purposeOptions.find((opt) => String(opt.id) === String(purposeId)) || null;
    if (!selectedPurpose && entry.purpose) {
      selectedPurpose = {
        value: entry.purpose,
        label: entry.purpose,
        id: purposeId,
      };
    }

    return {
      selectedPerson,
      selectedPurpose,
      billDetails: {
        ref: item.ref,
        amount: item.amount,
        paymentMode: item.paymentMode,
        timestamp: item.timestamp,
        type: item.type,
        entryNo: entry.entry_no,
        date: entry.date || entry.timestamp,
      },
    };
  };

  const buildEditClickPayload = (item) => {
    const entry = item.entry || {};
    const selectedType = item.type || entry.type || 'Advance';
    const dateValue = entry.date ? String(entry.date).split('T')[0] : '';
    let amountGivenInput = '';
    let transferAmount = '';
    if (selectedType === 'Refund') {
      amountGivenInput =
        entry.staff_refund_amount != null && entry.staff_refund_amount !== ''
          ? String(entry.staff_refund_amount)
          : '';
    } else if (selectedType === 'Transfer') {
      transferAmount =
        entry.amount != null && entry.amount !== '' ? String(entry.amount) : '';
    } else {
      amountGivenInput =
        entry.amount != null && entry.amount !== '' ? String(entry.amount) : '';
    }
    const selectedTransferPurpose = entry.to_purpose_id
      ? purposeOptions.find((opt) => String(opt.id) === String(entry.to_purpose_id)) ||
        (entry.to_purpose_name
          ? {
              value: entry.to_purpose_name,
              label: entry.to_purpose_name,
              id: entry.to_purpose_id,
            }
          : null)
      : null;

    return {
      ...buildPersonClickPayload(item),
      isEditMode: true,
      editingId: entry.staffAdvancePortalId || entry.id,
      editEntry: entry,
      selectedType,
      date: dateValue,
      amountGivenInput,
      transferAmount,
      paymentMode: entry.staff_payment_mode || '',
      description: entry.description || '',
      selectedTransferPurpose,
      entryNo: entry.entry_no,
    };
  };

  const sendEditRequest = async (entry) => {
    try {
      const requestData = {
        module_name: 'Staff Portal',
        module_name_id: entry.staffAdvancePortalId || entry.id,
        module_name_eno: entry.entry_no,
        request_send_by: resolveUsername(),
        request_approval: false,
        request_completed: false,
      };
      const response = await fetch('https://backendaab.in/aabuildersDash/api/edit_requests/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create edit request');
      }
      alert('Edit request sent successfully. Waiting for admin approval.');
      window.dispatchEvent(new Event('editRequestCreated'));
    } catch (error) {
      console.error('Error creating edit request:', error);
      alert('Failed to send edit request. Please try again.');
    }
  };

  const handleUploadClick = (item) => {
    if (!canEdit) {
      alert("You don't have permission to edit.");
      return;
    }
    if (isStaffAdvanceRecordLocked(item.entry)) {
      return;
    }
    setItemToUploadFor(item);
    setShowUploadConfirmModal(true);
  };

  const handleUploadConfirm = () => {
    if (!canEdit || !itemToUploadFor) return;
    setShowUploadConfirmModal(false);
    setUploadingForId(itemToUploadFor.id);
    setItemToUploadFor(null);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleFileChange = async (e) => {
    const file = e.target?.files?.[0];
    e.target.value = '';
    if (!file || !uploadingForId) {
      setUploadingForId(null);
      return;
    }
    const item = filtered.find((i) => i.id === uploadingForId);
    if (!item) {
      setUploadingForId(null);
      return;
    }
    setUploadStatus('uploading');
    const entryId = item.entry?.staffAdvancePortalId || item.entry?.id || uploadingForId;
    const username = resolveUsername();
    try {
      const formData = new FormData();
      const now = new Date();
      const timestamp = now
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        .replace(',', '')
        .replace(/\s/g, '-');
      formData.append('file', file);
      formData.append('file_name', `${timestamp} ${item.personName || 'Staff Advance'}`);
      const uploadRes = await fetch(
        'https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive',
        { method: 'POST', body: formData }
      );
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadResult = await uploadRes.json();
      const payload = { ...item.entry, file_url: uploadResult.url };
      const editRes = await fetch(
        `https://backendaab.in/aabuildersDash/api/staff-advance/${entryId}?editedBy=${encodeURIComponent(username)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      if (!editRes.ok) throw new Error('Failed to update record');
      setUploadExpandedId(null);
      await loadStaffData();
      window.dispatchEvent(new Event('staffAdvanceUpdated'));
      setUploadStatus('completed');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStatus(null);
      alert(err?.message || 'Failed to upload file.');
    } finally {
      setUploadingForId(null);
    }
  };

  const handleEdit = async (item) => {
    if (!canEdit) {
      alert("You don't have permission to edit.");
      return;
    }
    if (isStaffAdvanceRecordLocked(item.entry)) {
      return;
    }
    const entry = item.entry || {};
    if (!isAdmin && entry.allow_to_edit === false) {
      const wantsRequest = window.confirm(
        'Editing is not allowed for this record. Send an edit request to admin for approval?'
      );
      if (wantsRequest) {
        await sendEditRequest(entry);
      }
      return;
    }
    setUploadExpandedId(null);
    setEditDeleteExpandedId(null);
    setSwipeStates({});
    onPersonClick?.(buildEditClickPayload(item));
  };

  const requestDelete = (item) => {
    if (!canDelete) {
      alert("You don't have permission to delete.");
      return;
    }
    if (isStaffAdvanceRecordLocked(item.entry)) {
      return;
    }
    setEntryToDelete(item);
    setShowDeleteConfirmModal(true);
    setUploadExpandedId(null);
    setEditDeleteExpandedId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setEntryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!canDelete || !entryToDelete) return;
    const entry = entryToDelete.entry || {};
    const idToDelete = entry.staffAdvancePortalId || entry.id || entryToDelete.id;
    const username = resolveUsername();
    try {
      const { weeklyBillDelete } = await clearStaffAdvanceRecordsOnDelete(
        idToDelete,
        entry,
        staffData,
        username
      );
      await loadStaffData();
      window.dispatchEvent(new Event('staffAdvanceUpdated'));
      const billDeleteMessage = formatWeeklyBillDeleteMessage(
        weeklyBillDelete.deletedCount,
        weeklyBillDelete.failedCount
      );
      alert(`Record deleted successfully.${billDeleteMessage}`);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err?.message || 'Failed to delete record.');
    } finally {
      cancelDelete();
    }
  };

  const minSwipeDistance = 50;

  useEffect(() => {
    const cleanups = [];
    const globalMouseMoveHandler = (e) => {
      setSwipeStates((prev) => {
        let hasChanges = false;
        const newState = { ...prev };
        filtered.forEach((item) => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          if (deltaX !== 0) {
            newState[item.id] = { ...state, currentX: e.clientX, isSwiping: true };
            hasChanges = true;
          }
        });
        return hasChanges ? newState : prev;
      });
    };
    const globalMouseUpHandler = () => {
      setSwipeStates((prev) => {
        const newState = { ...prev };
        filtered.forEach((item) => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const wasUploadExpanded = state.wasUploadExpanded || false;
          const wasEditDeleteExpanded = state.wasEditDeleteExpanded || false;
          if (absDeltaX >= minSwipeDistance && !isStaffAdvanceRecordLocked(item.entry)) {
            if (deltaX > 0) {
              if (wasEditDeleteExpanded) {
                setEditDeleteExpandedId(null);
                setUploadExpandedId(null);
              } else if (!wasUploadExpanded) {
                setUploadExpandedId(item.id);
                setEditDeleteExpandedId(null);
              }
            } else if (wasUploadExpanded) {
              setUploadExpandedId(null);
            } else if (!wasEditDeleteExpanded) {
              setEditDeleteExpandedId(item.id);
              setUploadExpandedId(null);
            }
          }
          delete newState[item.id];
        });
        return newState;
      });
    };
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    cleanups.push(() => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    });

    filtered.forEach((item) => {
      const el = cardRefs.current[item.id];
      if (!el) return;
      const touchStartHandler = (e) => {
        const touch = e.touches[0];
        setSwipeStates((prev) => ({
          ...prev,
          [item.id]: {
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            isSwiping: false,
            wasUploadExpanded: uploadExpandedIdRef.current === item.id,
            wasEditDeleteExpanded: editDeleteExpandedIdRef.current === item.id,
          },
        }));
      };
      const touchMoveHandler = (e) => {
        const touch = e.touches[0];
        setSwipeStates((prev) => {
          const state = prev[item.id];
          if (!state) return prev;
          const deltaX = touch.clientX - state.startX;
          const deltaY = touch.clientY - state.startY;
          if (Math.abs(deltaX) <= Math.abs(deltaY)) {
            const next = { ...prev };
            delete next[item.id];
            return next;
          }
          if (deltaX !== 0) {
            e.preventDefault();
            return {
              ...prev,
              [item.id]: { ...state, currentX: touch.clientX, currentY: touch.clientY, isSwiping: true },
            };
          }
          return prev;
        });
      };
      const touchEndHandler = () => {
        setSwipeStates((prev) => {
          const state = prev[item.id];
          if (!state) return prev;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX >= minSwipeDistance && !isStaffAdvanceRecordLocked(item.entry)) {
            if (deltaX > 0) {
              if (state.wasEditDeleteExpanded) {
                setEditDeleteExpandedId(null);
                setUploadExpandedId(null);
              } else if (!state.wasUploadExpanded) {
                setUploadExpandedId(item.id);
                setEditDeleteExpandedId(null);
              }
            } else if (state.wasUploadExpanded) {
              setUploadExpandedId(null);
            } else if (!state.wasEditDeleteExpanded) {
              setEditDeleteExpandedId(item.id);
              setUploadExpandedId(null);
            }
          }
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      };
      const mouseDownHandler = (e) => {
        e.preventDefault();
        setSwipeStates((prev) => ({
          ...prev,
          [item.id]: {
            startX: e.clientX,
            currentX: e.clientX,
            isSwiping: false,
            wasUploadExpanded: uploadExpandedIdRef.current === item.id,
            wasEditDeleteExpanded: editDeleteExpandedIdRef.current === item.id,
          },
        }));
      };
      el.addEventListener('touchstart', touchStartHandler, { passive: false });
      el.addEventListener('touchmove', touchMoveHandler, { passive: false });
      el.addEventListener('touchend', touchEndHandler, { passive: false });
      el.addEventListener('mousedown', mouseDownHandler);
      cleanups.push(() => {
        el.removeEventListener('touchstart', touchStartHandler);
        el.removeEventListener('touchmove', touchMoveHandler);
        el.removeEventListener('touchend', touchEndHandler);
        el.removeEventListener('mousedown', mouseDownHandler);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, [filtered, minSwipeDistance]);

  const personFilterOptions = useMemo(
    () => [...new Set(peopleOptions.map((opt) => opt.label))].filter(Boolean),
    [peopleOptions]
  );
  const purposeFilterOptions = useMemo(
    () => [...new Set(purposeOptions.map((opt) => opt.label))].filter(Boolean),
    [purposeOptions]
  );

  const hasActiveFilters = !!(personFilter || entryNoFilter || purposeFilter || paymentModeFilter);

  const renderFilterPicker = (label, value, onOpen, onClear) => (
    <div>
      <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">{label}</p>
      <div className="relative">
        <div
          onClick={onOpen}
          className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
          style={{ boxSizing: 'border-box', color: value ? '#000' : '#9E9E9E' }}
        >
          {value || 'Select'}
          {value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full bg-white max-w-[360px] flex flex-col flex-1 min-h-0 overflow-hidden scrollbar-none"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div>
        <div className="flex-shrink-0 flex mb-[8px] items-center border-b border-[#E0E0E0] justify-between pb-[10px]">
          <div />
          <div className="flex items-center gap-[4px]">
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
            >
              {typeFilter || 'Type'}
            </button>
            {typeFilter && (
              <button
                type="button"
                onClick={() => setTypeFilter('')}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-[20px]">
          <div className="flex items-center gap-[4px] min-w-0">
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0"
            >
              <img src={Filter} alt="Filter" className="w-[11px] h-[11px]" />
              {!(typeFilter || personFilter || entryNoFilter || purposeFilter || paymentModeFilter) && (
                <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">
                  Filter
                </span>
              )}
            </button>
            <div
              className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {personFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Employee</span>
                  <button
                    onClick={() => setPersonFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {entryNoFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Entry. No</span>
                  <button
                    onClick={() => setEntryNoFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {purposeFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Purpose</span>
                  <button
                    onClick={() => setPurposeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {paymentModeFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Mode</span>
                  <button
                    onClick={() => setPaymentModeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setPersonFilter('');
                setEntryNoFilter('');
                setPurposeFilter('');
                setPaymentModeFilter('');
              }}
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          )}
        </div>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide mt-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={() => {
          setUploadExpandedId(null);
          setEditDeleteExpandedId(null);
        }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[48px]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">
              No staff advance records yet
            </p>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            {filtered.map((item) => {
              const swipeState = swipeStates[item.id];
              const isUploadExpanded = uploadExpandedId === item.id;
              const isEditDeleteExpanded = editDeleteExpandedId === item.id;
              const isLocked = isStaffAdvanceRecordLocked(item.entry);
              const swipeActionWidth = 110;
              let swipeOffset = 0;
              if (swipeState?.isSwiping) {
                const dx = swipeState.currentX - swipeState.startX;
                if (dx < 0) {
                  swipeOffset = isUploadExpanded ? Math.max(0, 48 + dx) : Math.max(-swipeActionWidth, dx);
                } else {
                  swipeOffset = isEditDeleteExpanded
                    ? Math.max(-swipeActionWidth, Math.min(0, -swipeActionWidth + dx))
                    : Math.min(48, dx);
                }
              } else if (isEditDeleteExpanded) {
                swipeOffset = -swipeActionWidth;
              } else if (isUploadExpanded) {
                swipeOffset = 48;
              }

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
                  style={{
                    height: '95px',
                    userSelect: swipeState?.isSwiping ? 'none' : 'auto',
                    WebkitUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                  }}
                >
                  <div
                    className="absolute left-0 top-[0px] flex gap-[8px] flex-shrink-0 z-0"
                    style={{
                      opacity: (isUploadExpanded || (swipeState && swipeState.isSwiping && swipeOffset > 20)) ? 1 : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isUploadExpanded ? 'auto' : 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadClick(item);
                      }}
                      disabled={!!uploadingForId || isLocked}
                      className="w-[48px] h-[95px] bg-[#BF9853] rounded-[6px] flex items-center justify-center hover:bg-[#a88645] transition-colors shadow-sm disabled:opacity-60"
                      title="Upload file"
                    >
                      <img src={UploadFile} alt="Upload File" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  <div
                    className="absolute right-0 top-[0px] flex gap-[8px] flex-shrink-0 z-0"
                    style={{
                      opacity: (isEditDeleteExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20)) ? 1 : 0,
                      transform: swipeOffset < 0
                        ? `translateX(${Math.max(0, swipeActionWidth + swipeOffset)}px)`
                        : `translateX(${swipeActionWidth}px)`,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isEditDeleteExpanded ? 'auto' : 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      disabled={!canEdit || isLocked}
                      className={`w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-[6px] hover:bg-[#22a882] transition-colors shadow-sm ${
                        !canEdit || isLocked ? 'opacity-50 cursor-not-allowed hover:bg-[#007233]' : ''
                      }`}
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(item);
                      }}
                      disabled={!canDelete || isLocked}
                      className={`w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-[6px] hover:bg-[#cc4d26] transition-colors shadow-sm ${
                        !canDelete || isLocked ? 'opacity-50 cursor-not-allowed hover:bg-[#E4572E]' : ''
                      }`}
                      title="Delete"
                    >
                      <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  <div
                    ref={(el) => {
                      if (el) cardRefs.current[item.id] = el;
                      else delete cardRefs.current[item.id];
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      WebkitUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      MozUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      msUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transition: swipeState?.isSwiping ? 'none' : 'transform 0.3s ease-out',
                    }}
                    onClick={(e) => {
                      if (!isUploadExpanded) e.stopPropagation();
                    }}
                  >
                    <div className="flex flex-col gap-[2px]">
                      <div className="flex items-center justify-between">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const desc = item.entry?.description || '';
                            if (desc) {
                              setSelectedDescription(desc);
                              setShowDescriptionModal(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              const desc = item.entry?.description || '';
                              if (desc) {
                                setSelectedDescription(desc);
                                setShowDescriptionModal(true);
                              }
                            }
                          }}
                          className={`text-[12px] font-semibold text-black leading-snug ${item.entry?.description ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {item.ref}
                        </span>
                        <span
                          className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-[4px] ${getPaymentModeBadgeClass(
                            item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')
                          )}`}
                        >
                          {item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {onPersonClick ? (
                          <button
                            type="button"
                            onClick={() => onPersonClick(buildPersonClickPayload(item))}
                            className="text-[12px] font-semibold text-black leading-snug break-words text-left cursor-pointer hover:underline focus:outline-none focus:underline"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          >
                            {item.personName || 'N/A'}
                          </button>
                        ) : (
                          <p
                            className="text-[12px] font-semibold text-black leading-snug break-words"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          >
                            {item.personName || 'N/A'}
                          </p>
                        )}
                        <span />
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[11px] font-medium text-[#777777] leading-snug break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {item.purposeName || 'N/A'}
                        </p>
                        {item.entry?.file_url ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.entry.file_url, '_blank', 'noopener,noreferrer');
                            }}
                            className={`text-[12px] font-semibold block leading-snug cursor-pointer hover:underline focus:outline-none focus:underline ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                          >
                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                          </button>
                        ) : (
                          <p
                            className={`text-[12px] font-semibold block leading-snug ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                          >
                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] leading-normal min-w-0 flex-1 flex items-center flex-wrap gap-x-[4px]">
                          <span className="font-bold text-black">
                            {formatRelativeDateLabel(item.recordDate || item.recordTimestamp)}
                          </span>
                          {(() => {
                            const { dateTime } = formatDateTimeParts(item.recordTimestamp);
                            return dateTime ? (
                              <span className="font-semibold text-[#9E9E9E]"> • {dateTime}</span>
                            ) : null;
                          })()}
                        </span>
                        {item.type === 'Transfer' && item.transferPurposeName ? (
                          <p className={`text-[10px] font-semibold leading-snug ${item.amount < 0 ? 'text-[#BF9853]' : 'text-[#007233]'}`}>
                            {item.transferPurposeName}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {showUploadConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-[16px]"
          onClick={() => setShowUploadConfirmModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-[12px] p-[20px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[16px] font-semibold text-black text-center mb-4">
              Upload file for this entry?
            </p>
            <div className="flex gap-[12px]">
              <button
                type="button"
                onClick={() => setShowUploadConfirmModal(false)}
                className="flex-1 py-[10px] text-[14px] font-semibold text-black border border-[rgba(0,0,0,0.2)] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadConfirm}
                className="flex-1 py-[10px] text-[14px] font-semibold text-white bg-[#BF9853] rounded-[8px]"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={showDeleteConfirmModal} onCancel={cancelDelete} onConfirm={confirmDelete} />

      {uploadStatus === 'uploading' && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-[16px]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white rounded-[12px] p-[24px] flex flex-col items-center gap-[16px] min-w-[200px]">
            <div className="w-10 h-10 border-2 border-[#BF9853] border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] font-medium text-black">Uploading and updating...</p>
          </div>
        </div>
      )}

      {uploadStatus === 'completed' && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-[16px] pointer-events-none"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white rounded-[12px] px-[24px] py-[16px] flex items-center gap-[12px] shadow-lg">
            <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-black">Upload file completed</p>
          </div>
        </div>
      )}

      {showTypeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px]"
          onClick={() => {
            setShowTypeModal(false);
            setTypeSearchQuery('');
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] -translate-y-[22px] rounded-b-[20px] shadow-lg flex flex-col transform max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-[24px] pt-[20px]">
              <p className="text-[16px] font-semibold text-black">Select Type</p>
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setTypeSearchQuery('');
                }}
                className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L10 10M10 1L1 10" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="px-[24px] pt-[4px] pb-[6px]">
              <div className="relative">
                <input
                  type="text"
                  value={typeSearchQuery}
                  onChange={(e) => setTypeSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-[40px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="shadow-md rounded-lg overflow-hidden">
                {TYPE_FILTER_OPTIONS.filter((type) =>
                  type.toLowerCase().includes(typeSearchQuery.toLowerCase())
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTypeFilter(type);
                      setShowTypeModal(false);
                      setTypeSearchQuery('');
                    }}
                    className={`w-full px-[16px] flex items-center gap-3 transition-colors ${
                      typeFilter === type ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                    }`}
                    style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                  >
                    <p className="text-[12px] font-medium text-black text-left">{type}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
          onClick={() => setShowFilterModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white rounded-t-2xl w-full p-[16px] h-[220px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-[16px] mb-3">
              {renderFilterPicker('Employee', personFilter, () => setShowPersonModal(true), () => setPersonFilter(''))}
              {renderFilterPicker('Entry. No', entryNoFilter, () => setShowEntryNoModal(true), () => setEntryNoFilter(''))}
              {renderFilterPicker('Purpose', purposeFilter, () => setShowPurposeModal(true), () => setPurposeFilter(''))}
              {renderFilterPicker('Mode', paymentModeFilter, () => setShowPaymentModeModal(true), () => setPaymentModeFilter(''))}
            </div>
          </div>
        </div>
      )}

      <SelectVendorModal isOpen={showPersonModal} onClose={() => setShowPersonModal(false)} onSelect={(value) => { setPersonFilter(value); setShowPersonModal(false); }} selectedValue={personFilter} options={personFilterOptions} fieldName="Employee" showStarIcon={false} zIndex={10000} />
      <SelectVendorModal isOpen={showEntryNoModal} onClose={() => setShowEntryNoModal(false)} onSelect={(value) => { setEntryNoFilter(value); setShowEntryNoModal(false); }} selectedValue={entryNoFilter} options={[...new Set(transformed.map((item) => String(item.entry.entry_no || '')))].filter(Boolean).sort((a, b) => Number(b) - Number(a))} fieldName="Entry. No" showStarIcon={false} zIndex={10000} />
      <SelectVendorModal isOpen={showPurposeModal} onClose={() => setShowPurposeModal(false)} onSelect={(value) => { setPurposeFilter(value); setShowPurposeModal(false); }} selectedValue={purposeFilter} options={purposeFilterOptions} fieldName="Purpose" showStarIcon={false} zIndex={10000} />
      <SelectVendorModal isOpen={showPaymentModeModal} onClose={() => setShowPaymentModeModal(false)} onSelect={(value) => { setPaymentModeFilter(value); setShowPaymentModeModal(false); }} selectedValue={paymentModeFilter} options={paymentModeFilterOptions} fieldName="Mode" showStarIcon={false} zIndex={10000} />

      {showDescriptionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-[16px]"
          onClick={() => setShowDescriptionModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-[12px] p-[20px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <img src={Pen} alt="Pen" className="w-[74px] h-[74px]" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-500 text-center mb-4">Description!</h3>
            <p className="text-[11px] font-medium text-black text-center mb-6 leading-relaxed">
              {selectedDescription}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDescriptionModal(false)}
                className="px-[32px] py-[8px] bg-black text-white text-[14px] font-semibold rounded-[8px] hover:opacity-90 transition-opacity"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
