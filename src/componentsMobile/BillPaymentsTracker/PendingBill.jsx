import React, { useEffect, useMemo, useRef, useState } from 'react';
import Filter from '../Images/Filter.png';
import CloseIcon from '../Images/Close F.svg'
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Edit1 from '../Images/edit1.png'
import Edit from '../Images/edit.png'
import BackArrow from '../Images/BAck Icon.svg'
import Star from '../Images/Star.svg'
import Search from '../Images/Search.png'
import Close from '../Images/close.png'
import {
	postBankRegisterLogSave,
	bankRegisterLogSaveUrlMatchingRequest,
	isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';

const Chip = ({ label, tone = 'neutral', onClick, disabled = false }) => {
	const toneStyles =
		tone === 'success'
			? { bg: '#E2F9E1', text: '#4CAF50', border: '#E2F9E1' }
			: tone === 'warn'
				? { bg: '#FFD39E', text: '#111827', border: '#FFD39E' }
				: { bg: '#FAF6ED', text: '#111827', border: '#D1D5DB' };

	if (typeof onClick === 'function') {
		return (
			<button
				type="button"
				onClick={onClick}
				disabled={disabled}
				className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium inline-flex items-center gap-[4px] border ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
				style={{ background: toneStyles.bg, color: toneStyles.text, borderColor: toneStyles.border }}
			>
				{tone === 'success' && (
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M10.25 2.75L4.75 8.25L1.75 5.25" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
				{label}
			</button>
		);
	}

	return (
		<span
			className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium inline-flex items-center gap-[4px] border`}
			style={{ background: toneStyles.bg, color: toneStyles.text, borderColor: toneStyles.border }}
		>
			{tone === 'success' && (
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10.25 2.75L4.75 8.25L1.75 5.25" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			)}
			{label}
		</span>
	);
};

const PendingBillMobile = ({ username, userRoles = [], paymentModeLabels: paymentModeLabelsFromProps = [] }) => {
	const resolveActiveBranchId = () => {
		try {
			const selectedBranchId = localStorage.getItem("selectedBranchId");
			const user = JSON.parse(localStorage.getItem("user") || "{}");
			const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
			const resolved = Number(selectedBranchId || fallbackBranchId);
			return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
		} catch {
			return null;
		}
	};
	const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());

	const withBranchUrl = (baseUrl) => {
		try {
			const url = new URL(baseUrl);
			if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
				url.searchParams.set("branchId", String(activeBranchId));
			}
			return url.toString();
		} catch {
			return baseUrl;
		}
	};

	const fetchWithBranch = (input, init) => {
		if (typeof input === 'string') {
			return window.fetch(withBranchUrl(input), init);
		}
		return window.fetch(input, init);
	};

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [apiData, setApiData] = useState([]);
	const [vendorMap, setVendorMap] = useState({});
	const [expensesData, setExpensesData] = useState([]);
	const [allBillEntries, setAllBillEntries] = useState([]);
	const [paymentStatuses, setPaymentStatuses] = useState({});
	const [paidTodayBills, setPaidTodayBills] = useState({});
	const [allTrackerDataForChecks, setAllTrackerDataForChecks] = useState([]); // paid/enriched dataset (BillDatabase)
	const [query, setQuery] = useState('');
	const [showFilterSheet, setShowFilterSheet] = useState(false);
	const [filterFromDate, setFilterFromDate] = useState(''); // YYYY-MM-DD
	const [filterToDate, setFilterToDate] = useState(''); // YYYY-MM-DD
	const [filterPaymentStatus, setFilterPaymentStatus] = useState(''); // '' | 'To Pay' | 'Paid' | '✓ Paid'
	const [showVerifyModal, setShowVerifyModal] = useState(false);
	const [selectedVerifyBill, setSelectedVerifyBill] = useState(null);
	const [verifyBoxes, setVerifyBoxes] = useState([]);
	const [activeFullScreen, setActiveFullScreen] = useState(null); // null | 'verify' | 'entry' | 'bank'
	const [bankDetails, setBankDetails] = useState([]);
	const [loadingBankDetails, setLoadingBankDetails] = useState(false);
	const [bankDetailsError, setBankDetailsError] = useState(null);
	const [accountDetails, setAccountDetails] = useState([]);
	const [rangeStart, setRangeStart] = useState('');
	const [rangeEnd, setRangeEnd] = useState('');
	const [showFillRangeSheet, setShowFillRangeSheet] = useState(false);
	const [purchaseOrders, setPurchaseOrders] = useState([]); // vendor-filtered orders for Check PO
	const [purchaseOrdersAll, setPurchaseOrdersAll] = useState([]); // cached for active branch
	const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false);
	const [lastPoNumber, setLastPoNumber] = useState(null); // matches desktop: last verified bill number from previous entry
	const [poValidation, setPoValidation] = useState({}); // { [index]: { matched: boolean, message: string } }
	const [checkedBills, setCheckedBills] = useState({}); // { [index]: true } only when matched/verified after Check PO
	const [isEditMode, setIsEditMode] = useState(false);
	const [noPoSelections, setNoPoSelections] = useState({}); // { [index]: true } => bill_number = "NO_PO"
	const [isDuplicateMode, setIsDuplicateMode] = useState(false);
	const [duplicateSelections, setDuplicateSelections] = useState({}); // { [index]: true }
	const [checkingPO, setCheckingPO] = useState(false);
	const [submittingVerify, setSubmittingVerify] = useState(false);

	const fetchAllTrackerDataForChecks = async () => {
		try {
			// Must match Database.jsx data source exactly (no branchId query param on this endpoint).
			const response = await window.fetch(
				'https://backendaab.in/demoAabuildersDash/api/vendor-payments/trackers/enriched/paid',
				{
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				}
			);
			if (!response.ok) throw new Error('Failed to fetch paid tracker data');
			const text = await response.text();
			let data = [];
			try {
				data = JSON.parse(text);
			} catch {
				data = [];
			}
			const rows = Array.isArray(data) ? data : [];
			setAllTrackerDataForChecks(rows);
			return rows;
		} catch (e) {
			console.error('Error fetching full tracker data for checks:', e);
			setAllTrackerDataForChecks([]);
			return [];
		}
	};

	const parseBillNumberNumeric = (billNumber) => {
		const v = String(billNumber || '').trim();
		if (!v || v === 'NO_PO') return { v: null, n: NaN };
		const m = v.match(/\d+/);
		const n = m ? Number(m[0]) : NaN;
		return { v, n };
	};

	const getTrackersForDuplicateCheck = () => {
		const merged = [
			...(Array.isArray(allTrackerDataForChecks) ? allTrackerDataForChecks : []),
			...(Array.isArray(apiData) ? apiData : [])
		];
		const seen = new Set();
		const unique = [];
		for (const t of merged) {
			const id = t?.id ?? t?.bill_id ?? t?.tracker_id;
			const key = id != null ? String(id) : `idx-${unique.length}`;
			if (seen.has(key)) continue;
			seen.add(key);
			unique.push(t);
		}
		return unique;
	};
	const [showAddSheet, setShowAddSheet] = useState(false);
	const [addForm, setAddForm] = useState({
		vendorId: '',
		receivedDate: '',
		noOfBills: '',
		totalAmount: ''
	});
	const [showVendorPicker, setShowVendorPicker] = useState(false);
	const [vendorPickerQuery, setVendorPickerQuery] = useState('');
	const [showReceivedDatePicker, setShowReceivedDatePicker] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [editRow, setEditRow] = useState(null);
	const [editForm, setEditForm] = useState({
		vendorId: '',
		receivedDate: '',
		noOfBills: '',
		extraBills: '0',
		totalAmount: ''
	});
	const [showEditVendorPicker, setShowEditVendorPicker] = useState(false);
	const [editVendorPickerQuery, setEditVendorPickerQuery] = useState('');
	const [showEditReceivedDatePicker, setShowEditReceivedDatePicker] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [swipedRowId, setSwipedRowId] = useState(null);
	const [touchRowId, setTouchRowId] = useState(null);
	const [touchStartX, setTouchStartX] = useState(null);
	const [touchCurrentX, setTouchCurrentX] = useState(null);
	const [touchIsSwiping, setTouchIsSwiping] = useState(false);
	const touchRowIdRef = useRef(touchRowId);
	const touchStartXRef = useRef(touchStartX);
	const touchCurrentXRef = useRef(touchCurrentX);
	useEffect(() => { touchRowIdRef.current = touchRowId; }, [touchRowId]);
	useEffect(() => { touchStartXRef.current = touchStartX; }, [touchStartX]);
	useEffect(() => { touchCurrentXRef.current = touchCurrentX; }, [touchCurrentX]);
	const [showBillEntrySheet, setShowBillEntrySheet] = useState(false);
	const [showBillEntryDatePicker, setShowBillEntryDatePicker] = useState(false);
	const [billEntryForm, setBillEntryForm] = useState({
		enteredBy: username || '',
		date: ''
	});
	const [showAdjustmentAmountSheet, setShowAdjustmentAmountSheet] = useState(false);
	const [adjustmentAmountForm, setAdjustmentAmountForm] = useState({
		amount: ''
	});
	const [showPaymentSheet, setShowPaymentSheet] = useState(false);
	const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
	const [showPaymentModePicker, setShowPaymentModePicker] = useState(false);
	const [paymentModePickerQuery, setPaymentModePickerQuery] = useState('');
	const [useCarryForward, setUseCarryForward] = useState(false);
	const [carryForwardAmount, setCarryForwardAmount] = useState(0);
	const prevUseCarryForwardRef = useRef(useCarryForward);
	const overlayHistoryPushedRef = useRef(false);
	const overlayOpenRef = useRef(false);

	// Ensures browser/mobile back closes overlays (Verify/Entry/Bank) instead of navigating back to Home.
	const pushOverlayHistoryState = (overlayName) => {
		if (overlayHistoryPushedRef.current) return;
		overlayHistoryPushedRef.current = true;
		try {
			window.history.pushState({ __bptOverlay: overlayName }, '', window.location.pathname + window.location.search);
		} catch {
			// ignore
		}
	};
	const [carryForwardData, setCarryForwardData] = useState([]);
	const [paymentForm, setPaymentForm] = useState({
		date: '',
		amount: '',
		mode: '',
		transactionNumber: '',
		accountNumber: '',
		file: null
	});
	const [showPaymentAccountPicker, setShowPaymentAccountPicker] = useState(false);
	const [paymentAccountPickerQuery, setPaymentAccountPickerQuery] = useState('');
	const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
	const [selectedVendorAccountDetails, setSelectedVendorAccountDetails] = useState(null);
	const [loadingVendorBankDetails, setLoadingVendorBankDetails] = useState(false);
	const [discount, setDiscount] = useState(0);
	const [discountSubmitted, setDiscountSubmitted] = useState(false);
	const [uploadingOverallPdf, setUploadingOverallPdf] = useState(false);
	const [showVendorPopup, setShowVendorPopup] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState("");
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState("");
	const vendorList = Object.entries(vendorMap || {}).map(([id, name]) => ({
		id,
		name
	}));
	const [search, setSearch] = useState("");
	const [showDiscountSheet, setShowDiscountSheet] = useState(false);
	const [discountInputValue, setDiscountInputValue] = useState('');

	const filteredVendors = vendorList.filter(v =>
		v.name.toLowerCase().includes(search.toLowerCase())
	);
	const overallPdfInputRef = useRef(null);

	const paymentModeOptions = paymentModeLabelsFromProps;

	// Mouse drag swipe (desktop testing): mirror touch swipe behavior.
	useEffect(() => {
		const onMouseMove = (e) => {
			const rowId = touchRowIdRef.current;
			const startX = touchStartXRef.current;
			if (rowId == null || startX == null) return;

			const x = e.clientX;
			const dx = x - startX;
			const isSwiped = String(swipedRowId ?? '') === String(rowId ?? '');

			// allow swipe left to open, and swipe right to close when already expanded
			if (dx < 0 || (isSwiped && dx > 0)) {
				e.preventDefault?.();
				setTouchCurrentX(x);
				setTouchIsSwiping(true);
			}
		};

		const onMouseUp = () => {
			const rowId = touchRowIdRef.current;
			const startX = touchStartXRef.current;
			const currentX = touchCurrentXRef.current;
			if (rowId == null || startX == null) return;

			const minSwipeDistance = 50;
			const dx = (currentX != null) ? (currentX - startX) : 0;
			if (Math.abs(dx) >= minSwipeDistance) {
				if (dx < 0) setSwipedRowId(rowId); // open
				else setSwipedRowId(null); // close
			}

			setTouchRowId(null);
			setTouchStartX(null);
			setTouchCurrentX(null);
			setTouchIsSwiping(false);
		};

		if (touchStartX == null || touchRowId == null) return undefined;

		document.addEventListener('mousemove', onMouseMove, { passive: false });
		document.addEventListener('mouseup', onMouseUp);
		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}, [touchStartX, touchRowId, swipedRowId]);

	const filteredPaymentModeOptions = useMemo(() => {
		const q = (paymentModePickerQuery || '').trim().toLowerCase();
		if (!q) return paymentModeOptions;
		return paymentModeOptions.filter((m) => String(m || '').toLowerCase().includes(q));
	}, [paymentModePickerQuery, paymentModeOptions]);

	const paymentAccountOptions = useMemo(() => {
		// Match desktop: options come from /api/account-details/getAll, not from existing payments.
		const rows = Array.isArray(accountDetails) ? accountDetails : [];
		const set = new Set();
		rows.forEach((a) => {
			const acc = a?.account_number ?? a?.accountNumber ?? a?.accountNo ?? '';
			const s = String(acc || '').trim();
			if (s) set.add(s);
		});
		return Array.from(set);
	}, [accountDetails]);

	const filteredPaymentAccountOptions = useMemo(() => {
		const q = (paymentAccountPickerQuery || '').trim().toLowerCase();
		if (!q) return paymentAccountOptions;
		return paymentAccountOptions.filter((a) => String(a || '').toLowerCase().includes(q));
	}, [paymentAccountPickerQuery, paymentAccountOptions]);

	const getVendorNameById = (vendorId) => {
		if (!vendorId && vendorId !== 0) return '-';
		return vendorMap[vendorId] || vendorMap[String(vendorId)] || '-';
	};

	const formatIndianCurrency = (amount) => {
		const n = Number(amount || 0);
		if (!Number.isFinite(n)) return '₹0';
		return `₹${n.toLocaleString('en-IN')}`;
	};

	/** Parse API date fields: ISO string, DD/MM/YYYY, millis, or Jackson LocalDateTime array [y,m,d,h,mi,s]. */
	const parseTrackerDateValue = (input) => {
		if (input == null || input === '') return null;
		if (input instanceof Date) {
			return isNaN(input.getTime()) ? null : input;
		}
		if (Array.isArray(input)) {
			const y = input[0];
			const mo = input[1];
			const day = input[2];
			const h = input[3] ?? 0;
			const mi = input[4] ?? 0;
			const s = input[5] ?? 0;
			if (y == null || mo == null || day == null) return null;
			const dt = new Date(Number(y), Number(mo) - 1, Number(day), Number(h), Number(mi), Number(s));
			return isNaN(dt.getTime()) ? null : dt;
		}
		if (typeof input === 'string') {
			const trimmed = input.trim();
			if (!trimmed) return null;
			const slash = trimmed.match(
				/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*,\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
			);
			if (slash) {
				const [, dd, mm, yyyy, HH, MM, SS] = slash;
				const dt = new Date(
					Number(yyyy),
					Number(mm) - 1,
					Number(dd),
					Number(HH ?? 0),
					Number(MM ?? 0),
					Number(SS ?? 0)
				);
				return isNaN(dt.getTime()) ? null : dt;
			}
			const dt = new Date(trimmed);
			return isNaN(dt.getTime()) ? null : dt;
		}
		if (typeof input === 'number' && Number.isFinite(input)) {
			const dt = new Date(input);
			return isNaN(dt.getTime()) ? null : dt;
		}
		return null;
	};

	// Fallback: derive a "last" PO from the current bill's persisted verifications
	// when history-based lookup is unavailable. Mirrors getLastBillNumberForVendor's
	// rule of skipping 'NO_PO' entries.
	const getLastNonNoPoFromCurrent = (bill) => {
		const verifications = bill?.billVerifications || bill?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return null;
		for (let i = verifications.length - 1; i >= 0; i -= 1) {
			const billNumber = verifications[i]?.bill_number ?? verifications[i]?.billNumber ?? '';
			const s = String(billNumber || '').trim();
			if (s && s !== 'NO_PO') return s;
		}
		return null;
	};

	const formatDdMmYyyyFromDate = (d) => {
		if (!d || isNaN(d.getTime())) return '';
		const day = String(d.getDate()).padStart(2, '0');
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	};

	const formatTime12hFromDate = (d) => {
		if (!d || isNaN(d.getTime())) return '';
		let hours = d.getHours();
		const minutes = String(d.getMinutes()).padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? String(hours).padStart(2, '0') : '12';
		return `${hours}:${minutes} ${ampm}`;
	};

	/** First segment: Today / Yesterday / DD/MM/YYYY (calendar of `d`). */
	const relativeOrDdMmYyyy = (d) => {
		if (!d || isNaN(d.getTime())) return '';
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		if (dateOnly.getTime() === today.getTime()) return 'Today';
		if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
		return formatDdMmYyyyFromDate(d);
	};

	/** Same pattern as BillDatabase.js `formatDate`: DD/MM/YYYY HH:MM AM/PM */
	const formatBillDatabaseDateFromDate = (date) => {
		if (!date || isNaN(date.getTime())) return '-';
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		let hours = date.getHours();
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? String(hours).padStart(2, '0') : '12';
		return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
	};

	/**
	 * List card subtitle parts: `[arrival-relative|date] • [timestamp date] • [time]`
	 * Dates are rendered bold; time stays regular (see renderBillCardDateLineParts).
	 */
	const getPendingBillCardDateLineParts = (row) => {
		const arrivalRaw = row?.bill_arrival_date ?? row?.billArrivalDate;
		const tsRaw = row?.timestamp ?? row?.created_at ?? row?.createdAt;
		const arrivalDate = parseTrackerDateValue(arrivalRaw);
		const tsDate = parseTrackerDateValue(tsRaw);
		if (!arrivalDate && !tsDate) return null;
		const seg1 = arrivalDate ? relativeOrDdMmYyyy(arrivalDate) : relativeOrDdMmYyyy(tsDate);
		const seg2 = tsDate ? formatDdMmYyyyFromDate(tsDate) : formatDdMmYyyyFromDate(arrivalDate);
		const timeSource = tsDate || arrivalDate;
		const seg3 = formatTime12hFromDate(timeSource);
		if (!seg1 || !seg2 || !seg3) {
			const d = tsDate || arrivalDate;
			if (!d) return null;
			const single = formatBillDatabaseDateFromDate(d);
			if (single === '-') return null;
			const m = single.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+)$/);
			if (m) return { kind: 'single', datePart: m[1], timePart: m[2] };
			return { kind: 'plain', text: single };
		}
		return { kind: 'triple', seg1, seg2, seg3 };
	};

	const renderBillCardDateLineParts = (parts) => {
		if (!parts) return null;
		if (parts.kind === 'triple') {
			return (
				<>
					<span className="font-bold text-[#111827]">{parts.seg1}</span>
					<span className="font-medium text-[#777777]"> • </span>
					<span className="font-medium text-[#777777]">{parts.seg2}</span>
					<span className="font-medium text-[#777777]"> • </span>
					<span className="font-medium text-[#777777]">{parts.seg3}</span>
				</>
			);
		}
		if (parts.kind === 'single') {
			return (
				<>
					<span className="font-bold text-[#111827]">{parts.datePart}</span>
					<span className="font-medium text-[#777777]"> {parts.timePart}</span>
				</>
			);
		}
		return <span className="font-medium text-[#777777]">{parts.text}</span>;
	};

	const getBillVerificationStatus = (item) => {
		const verifications = item?.billVerifications || item?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return 'Verify';
		const allVerified = verifications.every(v => v?.is_verified === true || v?.status === 'VERIFIED');
		const anyVerified = verifications.some(v => v?.is_verified === true || v?.status === 'VERIFIED');
		if (allVerified) return '✓ Verified';
		if (anyVerified) return 'Verified';
		return 'Verify';
	};

	// Match desktop gating rules:
	// - Entry allowed only after ALL bills verified
	// - Payment allowed only after Entry completed
	const isAllBillsVerified = (item) => {
		const verifications = item?.billVerifications || item?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return false;
		return verifications.every(v => v?.is_verified === true || v?.status === 'VERIFIED');
	};

	const isEntryCompleted = (item) => {
		const entryStatus = item?.entry_status || item?.entryStatus || 'Entry';
		return entryStatus === 'Entered' || entryStatus === '✓ Entered';
	};

	const fetchPreviousTrackerMaxBillNumber = async (vendorId, vendorPaymentsTrackerId) => {
		if (vendorId == null || vendorPaymentsTrackerId == null) return null;
		try {
			const url = new URL('https://backendaab.in/demoAabuildersDash/api/vendor-payments/trackers/previous/max-bill-number');
			url.searchParams.set('vendorId', String(vendorId));
			url.searchParams.set('vendorPaymentsTrackerId', String(vendorPaymentsTrackerId));
			const res = await window.fetch(url.toString(), {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!res.ok) return null;
			const data = await res.json().catch(() => null);
			const maxBill = data?.max_bill_number ?? data?.maxBillNumber ?? null;
			return maxBill ? String(maxBill).trim() : null;
		} catch {
			return null;
		}
	};

	const fetchVendorTrackersWithBills = async (vendorId) => {
		const vId = String(vendorId ?? '').trim();
		if (!vId) return [];
		try {
			const res = await window.fetch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/vendor/${encodeURIComponent(vId)}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!res.ok) return [];
			const data = await res.json().catch(() => []);
			return Array.isArray(data) ? data : [];
		} catch {
			return [];
		}
	};

	const openVerifyModal = (bill) => {
		setSelectedVerifyBill(bill || null);
		const noOfBills = Number(bill?.no_of_bills ?? bill?.noOfBills ?? 0) || 0;
		const extraBills = Number(bill?.extra_bills ?? bill?.extraBills ?? 0) || 0;
		const total = Math.max(0, noOfBills + extraBills);
		// Prefer already-saved bill numbers from backend.
		const existingVerifications = bill?.billVerifications || bill?.bill_verifications || [];
		const nextNoPo = {};
		const existingNumbers = Array.isArray(existingVerifications)
			? existingVerifications
				.map((v) => v?.bill_number ?? v?.billNumber ?? '')
				.map((v, idx) => {
					const s = String(v || '').trim();
					if (s === 'NO_PO') {
						nextNoPo[idx] = true;
						return '';
					}
					return s;
				})
			: [];
		const padded = [...existingNumbers];
		while (padded.length < total) padded.push('');
		setVerifyBoxes(padded.slice(0, total));
		setNoPoSelections(nextNoPo);
		setIsEditMode(false);
		setIsDuplicateMode(false);
		setDuplicateSelections({});
		setCheckedBills({});
		setPoValidation({});
		setRangeStart('');
		setRangeEnd('');
		// Prefer backend API: previous tracker max bill_number (fallback to history-based logic)
		setLastPoNumber(null);
		const vendorId = bill?.vendor_id ?? bill?.vendorId ?? null;
		const trackerId = bill?.id ?? bill?.bill_id ?? null;
		fetchPreviousTrackerMaxBillNumber(vendorId, trackerId).then((maxBill) => {
			if (maxBill) {
				setLastPoNumber(maxBill);
				return;
			}
			const lastFromHistory = getLastBillNumberForVendor(vendorId, bill);
			setLastPoNumber(lastFromHistory || null);
		});
		pushOverlayHistoryState('verify');
		setShowVerifyModal(true);
		setActiveFullScreen('verify');
	};

	const getLastBillNumberForVendor = (vendorId, currentBill = null) => {
		if (!vendorId || !Array.isArray(apiData) || apiData.length === 0) return null;
		const vId = String(vendorId);
		const vendorBills = apiData.filter((bill) => {
			const id = bill?.vendor_id ?? bill?.vendorId ?? null;
			const verifications = bill?.billVerifications || bill?.bill_verifications || [];
			return String(id ?? '') === vId && Array.isArray(verifications) && verifications.length > 0;
		});
		if (vendorBills.length === 0) return null;

		vendorBills.sort((a, b) => {
			const dateA = a?.bill_arrival_date || a?.billArrivalDate || a?.created_at || a?.createdAt || '';
			const dateB = b?.bill_arrival_date || b?.billArrivalDate || b?.created_at || b?.createdAt || '';
			if (dateA && dateB) {
				const diff = new Date(dateA) - new Date(dateB);
				if (diff !== 0) return diff;
			}
			return Number(a?.id ?? a?.bill_id ?? 0) - Number(b?.id ?? b?.bill_id ?? 0);
		});

		const currentBillId = currentBill ? (currentBill.id ?? currentBill.bill_id ?? null) : null;
		const currentDateRaw = currentBill ? (currentBill.bill_arrival_date || currentBill.billArrivalDate || currentBill.created_at || currentBill.createdAt) : null;
		const currentTime = currentDateRaw ? new Date(currentDateRaw).getTime() : null;

		let previousEntryBill = null;
		const currentIndex = currentBillId != null
			? vendorBills.findIndex((b) => (b?.id ?? b?.bill_id) === currentBillId)
			: -1;

		if (currentIndex > 0) {
			previousEntryBill = vendorBills[currentIndex - 1];
		} else if (currentIndex === -1 && currentTime != null && Number.isFinite(currentTime)) {
			const beforeCurrent = vendorBills.filter((bill) => {
				const d = bill?.bill_arrival_date || bill?.billArrivalDate || bill?.created_at || bill?.createdAt;
				if (!d) return false;
				const t = new Date(d).getTime();
				if (!Number.isFinite(t)) return false;
				return t < currentTime;
			});
			previousEntryBill = beforeCurrent.length > 0 ? beforeCurrent[beforeCurrent.length - 1] : null;
		}

		if (!previousEntryBill) return null;
		const verifications = previousEntryBill?.billVerifications || previousEntryBill?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return null;
		for (let i = verifications.length - 1; i >= 0; i--) {
			const billNumber = verifications[i]?.bill_number ?? verifications[i]?.billNumber ?? '';
			const s = String(billNumber || '').trim();
			if (s && s !== 'NO_PO') return s;
		}
		return null;
	};

	const getNumericEno = (poOrEno) => {
		const raw = poOrEno?.eno ?? poOrEno?.ENO ?? poOrEno?.poNumber ?? poOrEno?.po_number ?? poOrEno;
		const str = String(raw || '').replace('#', '').trim();
		const m = str.match(/\d+/);
		return m ? Number(m[0]) : 0;
	};

	const ensureAllPurchaseOrdersLoaded = async () => {
		if (purchaseOrdersAll.length > 0 || loadingPurchaseOrders) return purchaseOrdersAll;
		setLoadingPurchaseOrders(true);
		try {
			const PURCHASE_ORDERS_URL = 'https://backendaab.in/demoAabuildersDash/api/purchase_orders/getAll';
			// Must match desktop + Database.jsx behavior (no branchId query param on this endpoint).
			const res = await window.fetch(PURCHASE_ORDERS_URL, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) return [];
			const data = await res.json();
			const all = Array.isArray(data) ? data : [];
			setPurchaseOrdersAll(all);
			return all;
		} catch {
			return [];
		} finally {
			setLoadingPurchaseOrders(false);
		}
	};

	const isAdminUser = () => {
		// Match desktop behavior exactly.
		return username === 'Admin' || username === 'Mahalingam M';
	};

	const updateDuplicateStatus = async (index, checked) => {
		try {
			const persisted = (selectedVerifyBill?.billVerifications || selectedVerifyBill?.bill_verifications || [])?.[index];
			const billId = persisted?.id;
			if (!billId) return;
			const res = await fetchWithBranch(
				`https://backendaab.in/demoAabuildersDash/api/vendor-payments/bill/${billId}/duplicate?duplicate=${checked ? 'true' : 'false'}`,
				{ method: 'PUT', headers: { 'Content-Type': 'application/json' } }
			);
			if (!res.ok) throw new Error('Failed to update duplicate');
			await reloadTrackers();
		} catch (e) {
			alert(`Error updating duplicate status: ${e?.message || 'Failed'}`);
			setDuplicateSelections((prev) => ({ ...(prev || {}), [index]: !checked }));
		}
	};

	const canShowSendRequest = () => {
		// Desktop: Send Request hidden for admin users.
		return !isAdminUser();
	};

	const handleApproveRequest = async () => {
		try {
			const trackerId = selectedVerifyBill?.id;
			if (!trackerId) {
				alert('Tracker ID not found');
				return;
			}
			const vendorId = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId ?? null;
			if (!vendorId) {
				alert('Vendor ID not found');
				return;
			}
			// Ensure validations are up-to-date (desktop re-validates on approve)
			await checkPO();

			// After checkPO we have poValidation; block if any entered is unmatched/Already Entered/Not checked
			const values = verifyBoxes.map((v) => String(v || '').trim());
			const unmatched = [];
			for (let i = 0; i < values.length; i++) {
				const billNumber = values[i];
				if (!billNumber) continue;
				const v = poValidation?.[i];
				if (!v || v.matched !== true) unmatched.push(`Bill number ${i + 1} (${billNumber})`);
			}
			if (unmatched.length > 0) {
				alert(`Cannot approve: ${unmatched.join(', ')} is/are not matched. Please change these bill numbers.`);
				return;
			}

			// Payload: keep existing bill numbers, set empty to NO_PO (desktop message)
			const verificationsExisting = selectedVerifyBill?.billVerifications || selectedVerifyBill?.bill_verifications || [];
			const billsData = verifyBoxes.map((billNumberRaw, i) => {
				const existingBill = Array.isArray(verificationsExisting) ? verificationsExisting[i] : null;
				const billNumber = String(billNumberRaw || '').trim();
				const finalBillNumber = billNumber ? billNumber : 'NO_PO';
				const payload = {
					bill_number: finalBillNumber,
					status: 'VERIFIED',
					is_verified: true,
					verified_date: new Date().toISOString(),
					is_duplicate: !!duplicateSelections?.[i]
				};
				if (existingBill?.id) payload.id = existingBill.id;
				return payload;
			});

			const billRes = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(billsData)
			});
			if (!billRes.ok) throw new Error('Failed to update bill verifications');

			const res = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${trackerId}/approve-request?requestApproved=true`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error('Failed to approve request');

			alert('Request approved successfully! Empty bill numbers have been set to NO_PO, existing bill numbers preserved.');
			await reloadTrackers();
			setShowVerifyModal(false);
			setActiveFullScreen(null);
		} catch (e) {
			alert(`Error approving request: ${e?.message || 'Failed'}`);
		}
	};

	const handleRejectRequest = async () => {
		try {
			const trackerId = selectedVerifyBill?.id;
			if (!trackerId) {
				alert('Tracker ID not found');
				return;
			}
			const res = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=false`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error('Failed to reject request');
			alert('Request rejected successfully!');
			await reloadTrackers();
			setShowVerifyModal(false);
			setActiveFullScreen(null);
		} catch (e) {
			alert(`Error rejecting request: ${e?.message || 'Failed'}`);
		}
	};

	const reloadTrackers = async () => {
		try {
			const res = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/vendor-payments/trackers/pending', {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			const text = await res.text();
			let data = [];
			try {
				data = JSON.parse(text);
			} catch {
				data = [];
			}
			const arr = Array.isArray(data) ? data : [];
			setApiData(arr);
			return arr;
		} catch {
			// ignore
			return null;
		}
	};

	const fetchPurchaseOrdersForVendor = async (vendorId) => {
		try {
			const all = purchaseOrdersAll.length > 0 ? purchaseOrdersAll : await ensureAllPurchaseOrdersLoaded();
			const vId = vendorId != null ? String(vendorId) : '';
			const vendorOrders = vId
				? all.filter((o) => String(o?.vendor_id ?? o?.vendorId ?? '') === vId)
				: all;
			return { orders: vendorOrders, lastEno: null };
		} catch {
			return { orders: [], lastEno: null };
		}
	};

	const hasUnverifiedBillNumbers = () => {
		const values = verifyBoxes.map((v) => String(v || '').trim());
		for (let i = 0; i < values.length; i++) {
			if (noPoSelections?.[i]) continue;
			const billNumber = values[i];
			if (!billNumber) continue;
			const validation = poValidation?.[i];
			if (!validation || validation.matched !== true) return true;
			if (!checkedBills?.[i]) return true;
		}
		return false;
	};

	useEffect(() => {
		let mounted = true;
		const vendorId = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId ?? null;
		if (!showVerifyModal || !vendorId) return undefined;
		(async () => {
			// Prime purchase orders cache for fast "Check PO"
			const { orders } = await fetchPurchaseOrdersForVendor(vendorId);
			if (!mounted) return;
			setPurchaseOrders(orders);
			// If Last PO wasn't available during openVerifyModal (apiData not loaded yet), compute now.
			setLastPoNumber((prev) => {
				if (prev != null && String(prev).trim() !== '') return prev;
				const trackerId = selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id ?? null;
				fetchPreviousTrackerMaxBillNumber(vendorId, trackerId).then((maxBill) => {
					if (!mounted) return;
					if (maxBill) {
						setLastPoNumber(maxBill);
						return;
					}
					setLastPoNumber((p2) => {
						if (p2 != null && String(p2).trim() !== '') return p2;
						const lastFromHistory = getLastBillNumberForVendor(vendorId, selectedVerifyBill);
						return lastFromHistory || null;
					});
				});
				return prev;
			});
		})();
		return () => { mounted = false; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showVerifyModal, selectedVerifyBill?.vendor_id, selectedVerifyBill?.vendorId, activeBranchId, apiData.length]);

	const fillRange = () => {
		const start = Number(rangeStart || 0);
		const end = Number(rangeEnd || 0);
		if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0) {
			alert('Please enter valid range');
			return;
		}
		const [a, b] = start <= end ? [start, end] : [end, start];
		const totalSlots = verifyBoxes.length;
		if (totalSlots === 0) return;
		const numbers = [];
		for (let n = a; n <= b && numbers.length < totalSlots; n++) numbers.push(String(n));
		const merged = [...verifyBoxes];
		for (let i = 0; i < merged.length && i < numbers.length; i++) merged[i] = numbers[i];
		setVerifyBoxes(merged);
		setPoValidation({});
	};

	// Mirrors desktop PendingBill.js handleCheckPO (same rules; mobile uses one array for regular + extra slots).
	const checkPO = async () => {
		if (!selectedVerifyBill) return;
		setCheckingPO(true);
		try {
			const normalizeValue = (value) => String(value ?? '').trim();
			const normalizeBillKey = (value) => {
				const { n } = parseBillNumberNumeric(value);
				return Number.isFinite(n) ? String(n) : '';
			};
			const vendorId = normalizeValue(selectedVerifyBill?.vendorId ?? selectedVerifyBill?.vendor_id);
			if (!vendorId) {
				alert('Vendor ID not found');
				return;
			}

			// Use vendor-scoped backend endpoint so we don't rely on multiple datasets.
			const trackersForDuplicateCheck = await fetchVendorTrackersWithBills(vendorId);

			// Match desktop PendingBill.js: validate against the FULL purchase orders list.
			// (Using a vendor-filtered cache can be stale / mismatched on mobile timing.)
			const purchaseOrdersSource =
				Array.isArray(purchaseOrdersAll) && purchaseOrdersAll.length > 0
					? purchaseOrdersAll
					: await ensureAllPurchaseOrdersLoaded();
			const vendorPurchaseOrders = (purchaseOrdersSource || []).filter((po) =>
				normalizeValue(po?.vendor_id ?? po?.vendorId) === vendorId
			);
			const vendorENOs = vendorPurchaseOrders
				.map((po) => normalizeValue(po?.eno ?? po?.po_number ?? po?.purchase_order_number))
				.filter(Boolean);
			const vendorENOsKeySet = new Set(vendorENOs.map((v) => normalizeBillKey(v)).filter(Boolean));

			const noOfBills = Number(selectedVerifyBill?.no_of_bills ?? selectedVerifyBill?.noOfBills ?? 0) || 0;
			const extraBillsCount = Number(selectedVerifyBill?.extra_bills ?? selectedVerifyBill?.extraBills ?? 0) || 0;
			const poNumbers = verifyBoxes.slice(0, noOfBills).map((v) => String(v ?? ''));
			const extraPoNumbers = verifyBoxes.slice(noOfBills, noOfBills + extraBillsCount).map((v) => String(v ?? ''));

			const newValidationResults = {};
			const duplicateNumbers = [];
			const duplicateMap = {};
			const currentBillNumbers = poNumbers.map((num) => normalizeBillKey(num)).filter(Boolean);
			currentBillNumbers.forEach((billNumber, index) => {
				if (duplicateMap[billNumber]) duplicateMap[billNumber].push(index);
				else duplicateMap[billNumber] = [index];
			});
			const currentExtraBillNumbers = extraPoNumbers.map((num) => normalizeBillKey(num)).filter(Boolean);
			currentExtraBillNumbers.forEach((billNumber, index) => {
				if (duplicateMap[billNumber]) duplicateMap[billNumber].push(`extra-${index}`);
				else duplicateMap[billNumber] = [`extra-${index}`];
			});
			Object.keys(duplicateMap).forEach((billNumber) => {
				if (duplicateMap[billNumber].length > 1) duplicateNumbers.push(billNumber);
			});
			if (duplicateNumbers.length > 0) {
				alert(
					` Duplicate bill found within the same bill number: ${duplicateNumbers.join(', ')}. Please enter unique bill numbers.`
				);
				setCheckingPO(false);
				return;
			}

			const currentTrackerId = selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id;

			const runValidationForBill = (billNumber, index) => {
				const isNoPo = !!noPoSelections?.[index];
				let isMatched = false;
				let message = '';
				if (isNoPo) {
					isMatched = true;
					message = 'No PO - Verified';
				} else if (normalizeValue(billNumber)) {
					let isAlreadyEntered = false;
					const trimmedBillNumber = normalizeValue(billNumber);
					const trimmedBillKey = normalizeBillKey(trimmedBillNumber);
					for (const tracker of trackersForDuplicateCheck) {
						const tid = tracker?.id ?? tracker?.bill_id ?? tracker?.tracker_id;
						if (String(tid ?? '') === String(currentTrackerId ?? '')) continue;
						const verifications =
							tracker?.billVerifications ||
							tracker?.bill_verifications ||
							tracker?.billVerification ||
							tracker?.bill_verification ||
							[];
						for (const verification of verifications || []) {
							const existingBill = normalizeValue(verification?.bill_number ?? verification?.billNumber);
							const existingBillKey = normalizeBillKey(existingBill);
							if (existingBill && existingBill !== 'NO_PO' && existingBillKey && trimmedBillKey && existingBillKey === trimmedBillKey) {
								isAlreadyEntered = true;
								break;
							}
						}
						if (isAlreadyEntered) break;
					}
					if (isAlreadyEntered) {
						isMatched = false;
						message = 'Already Entered';
					} else {
						isMatched = !!trimmedBillKey && vendorENOsKeySet.has(trimmedBillKey);
						message = isMatched ? 'Matched' : 'Not Matched';
					}
				} else {
					message = 'No PO Entered';
				}
				newValidationResults[index] = { matched: isMatched, message };
			};

			poNumbers.forEach((billNumber, index) => {
				runValidationForBill(billNumber, index);
			});
			if (extraBillsCount > 0) {
				extraPoNumbers.forEach((billNumber, index) => {
					runValidationForBill(billNumber, noOfBills + index);
				});
			}

			setPoValidation(newValidationResults);

			const newCheckedBills = {};
			poNumbers.forEach((billNumber, index) => {
				const isNoPo = !!noPoSelections?.[index];
				const validation = newValidationResults[index];
				if ((isNoPo && isAdminUser()) || (billNumber.trim() && validation && validation.matched)) {
					newCheckedBills[index] = true;
				}
			});
			if (extraBillsCount > 0) {
				extraPoNumbers.forEach((billNumber, index) => {
					const globalIndex = noOfBills + index;
					const isNoPo = !!noPoSelections?.[globalIndex];
					const validation = newValidationResults[globalIndex];
					if ((isNoPo && isAdminUser()) || (billNumber.trim() && validation && validation.matched)) {
						newCheckedBills[globalIndex] = true;
					}
				});
			}
			setCheckedBills((prev) => ({ ...(prev || {}), ...newCheckedBills }));
		} catch {
			alert('Error checking PO numbers');
		} finally {
			setCheckingPO(false);
		}
	};

	const makeDuplicate = () => {
		// Desktop behavior: "Duplicate" toggles duplicate mode; user selects which bills are duplicates.
		setIsDuplicateMode((prev) => {
			const next = !prev;
			if (!next) setDuplicateSelections({});
			return next;
		});
	};

	const saveBills = async ({ sendRequest = false } = {}) => {
		if (!selectedVerifyBill?.id) {
			alert('Tracker ID not found');
			return;
		}
		const trackerId = selectedVerifyBill.id;
		const verificationsExisting = selectedVerifyBill?.billVerifications || selectedVerifyBill?.bill_verifications || [];
		const maxBills = Number(selectedVerifyBill?.no_of_bills ?? selectedVerifyBill?.noOfBills ?? 0) || 0;
		const extraBillsCount = Number(selectedVerifyBill?.extra_bills ?? selectedVerifyBill?.extraBills ?? 0) || 0;
		const totalSlots = Math.max(0, maxBills + extraBillsCount);
		const values = verifyBoxes.slice(0, totalSlots).map((v) => String(v || '').trim());

		if (sendRequest) {
			// Desktop rule: must verify/check everything before sending request.
			const anyEntered = values.some((v) => String(v || '').trim() !== '');
			if (!anyEntered) {
				alert('Please enter at least one bill number before sending request');
				return;
			}
			if (hasUnverifiedBillNumbers()) {
				alert('Cannot send request: Some entered bill numbers are not verified or not checked. Please use "Check PO" button to verify all entered bill numbers first.');
				return;
			}
		}

		const billsData = values.map((billNumber, i) => {
			const existingBill = Array.isArray(verificationsExisting) ? verificationsExisting[i] : null;
			const validation = poValidation?.[i];
			const isNoPo = !!noPoSelections?.[i];
			const isVerified = isNoPo ? true : !!(validation && validation.matched);
			const isDuplicate = !!duplicateSelections?.[i];
			const payload = {
				bill_number: isNoPo ? 'NO_PO' : (billNumber || ''),
				status: isVerified ? 'VERIFIED' : 'NOT_VERIFIED',
				is_verified: isVerified,
				verified_date: isVerified ? new Date().toISOString() : null,
				is_duplicate: isDuplicate
			};
			if (existingBill?.id) payload.id = existingBill.id;
			return payload;
		});

		setSubmittingVerify(true);
		try {
			const billRes = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(billsData)
			});
			if (!billRes.ok) throw new Error('Failed to save bills');

			if (sendRequest) {
				const reqRes = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=true`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!reqRes.ok) throw new Error('Failed to send request');
				alert('Saved and request sent successfully!');
			} else {
				// Desktop: submit persists bills and clears request flag.
				await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=false`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' }
				});
				alert('Saved successfully!');
			}
			await reloadTrackers();
			setShowVerifyModal(false);
			setActiveFullScreen(null);
			setIsDuplicateMode(false);
			setDuplicateSelections({});
			setCheckedBills({});
			setPoValidation({});
		} catch (e) {
			alert(e?.message || 'Failed to save');
		} finally {
			setSubmittingVerify(false);
		}
	};

	const openEntryDetails = (bill) => {
		setSelectedVerifyBill(bill || null);
		pushOverlayHistoryState('entry');
		setActiveFullScreen('entry');
	};

	const openBillEntrySheet = () => {
		setBillEntryForm({
			enteredBy: username || '',
			date: ''
		});
		setShowBillEntrySheet(true);
	};

	const closeBillEntrySheet = () => {
		setShowBillEntrySheet(false);
		setShowBillEntryDatePicker(false);
	};

	// Match desktop PendingBill.js handleEntrySubmit (POST /api/bill-entry/save)
	const submitBillEntryDetails = async () => {
		const trackerId = selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id;
		if (!trackerId) {
			alert('Tracker ID not found');
			return;
		}
		if (!billEntryForm?.date) {
			alert('Please fill all required fields');
			return;
		}
		setSubmittingVerify(true);
		try {
			// Desktop sends YYYY-MM-DD (date input). Mobile picker gives DD/MM/YYYY — convert for backend.
			const toYyyyMmDd = (ddMmYyyy) => {
				const s = String(ddMmYyyy || '').trim();
				if (!s) return '';
				if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already ISO date
				const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
				if (!m) return s;
				const dd = String(m[1]).padStart(2, '0');
				const mm = String(m[2]).padStart(2, '0');
				const yyyy = m[3];
				return `${yyyy}-${mm}-${dd}`;
			};

			const payload = {
				vendor_payments_tracker_id: trackerId,
				entered_by: username,
				entered_date: toYyyyMmDd(billEntryForm.date),
				branch_id: activeBranchId
			};
			const res = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/bill-entry/save', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`Failed to save bill entry (${res.status})`);
			await res.json().catch(() => ({}));

			alert('Bill entry details saved successfully!');

			// Refresh entry details + expense matching (same idea as desktop)
			await reloadTrackers();
			try {
				const r = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/bill-entry/getAll', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (r.ok) {
					const data = await r.json();
					setAllBillEntries(Array.isArray(data) ? data : []);
				}
			} catch {
				// ignore
			}
			closeBillEntrySheet();
		} catch (e) {
			alert(`Error saving bill entry: ${e?.message || 'Failed'}`);
		} finally {
			setSubmittingVerify(false);
		}
	};

	const openAdjustmentAmountSheet = () => {
		const raw =
			selectedVerifyBill?.adjustment_amount ??
			selectedVerifyBill?.adjustmentAmount ??
			0;
		const n = Number(raw || 0);
		const str = Number.isFinite(n) ? String(n) : '';
		setAdjustmentAmountForm({
			amount: str === '0' ? '' : str
		});
		setShowAdjustmentAmountSheet(true);
	};

	const closeAdjustmentAmountSheet = () => {
		setShowAdjustmentAmountSheet(false);
	};

	// Match desktop PendingBill.js handleAdjustmentAmountUpdate
	const submitAdjustmentAmountUpdate = async () => {
		const billId = selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id;
		if (!billId) {
			alert('No bill selected');
			return;
		}
		const raw = adjustmentAmountForm?.amount;
		if (raw === undefined || raw === null) {
			alert('Please enter an adjustment amount');
			return;
		}
		const adjustmentAmount = String(raw).trim() === '' ? 0 : parseFloat(String(raw));
		if (String(raw).trim() !== '' && Number.isNaN(adjustmentAmount)) {
			alert('Please enter a valid number for adjustment amount');
			return;
		}

		setSubmittingVerify(true);
		try {
			const res = await fetchWithBranch(
				`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${billId}/adjustment-amount?adjustmentAmount=${adjustmentAmount}`,
				{
					method: 'PUT',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				}
			);
			if (!res.ok) {
				let msg = `Failed to update adjustment amount (${res.status})`;
				try {
					const data = await res.json();
					if (data?.message) msg = `Error updating adjustment amount: ${data.message}`;
				} catch {
					// ignore
				}
				throw new Error(msg);
			}

			// Update selected bill + list (same keys as desktop)
			setSelectedVerifyBill((prev) => prev ? ({
				...prev,
				adjustment_amount: adjustmentAmount,
				adjustmentAmount: adjustmentAmount
			}) : prev);
			setApiData((prev) => (Array.isArray(prev) ? prev.map((item) => {
				const id = item?.id ?? item?.bill_id;
				if (String(id ?? '') !== String(billId ?? '')) return item;
				return { ...item, adjustment_amount: adjustmentAmount, adjustmentAmount: adjustmentAmount };
			}) : prev));

			alert('Adjustment amount updated successfully');
			closeAdjustmentAmountSheet();
		} catch (e) {
			alert(e?.message || 'Error updating adjustment amount');
		} finally {
			setSubmittingVerify(false);
		}
	};

	const billEntryInitialDateForModal = () => {
		const v = billEntryForm?.date;
		if (!v) return '';
		if (String(v).includes('/')) return v; // already DD/MM/YYYY
		if (String(v).includes('-')) return toDdMmYyyySlashes(v); // YYYY-MM-DD
		return '';
	};

	const fetchSelectedVendorAccountDetails = async (vendorId) => {
		try {
			setLoadingVendorBankDetails(true);
			const res = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
				method: "GET",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			});
			if (!res.ok) {
				setSelectedVendorAccountDetails(null);
				return null;
			}
			const data = await res.json().catch(() => []);
			const vendor = (Array.isArray(data) ? data : []).find((v) => String(v?.id ?? '') === String(vendorId ?? ''));
			setSelectedVendorAccountDetails(vendor || null);
			return vendor || null;
		} catch {
			setSelectedVendorAccountDetails(null);
			return null;
		} finally {
			setLoadingVendorBankDetails(false);
		}
	};

	const openBankDetailsModal = async () => {
		// Open immediately; fetch runs in background (better UX on slow network)
		setShowBankDetailsModal(true);
		const vendorId = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId ?? null;
		if (vendorId != null) {
			fetchSelectedVendorAccountDetails(vendorId);
		} else {
			setSelectedVendorAccountDetails(null);
		}
	};

	const closeBankDetailsModal = () => setShowBankDetailsModal(false);

	const copyText = async (text) => {
		const t = String(text ?? '').trim();
		if (!t) return;
		try {
			if (navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(t);
			} else {
				const el = document.createElement('textarea');
				el.value = t;
				el.setAttribute('readonly', '');
				el.style.position = 'absolute';
				el.style.left = '-9999px';
				document.body.appendChild(el);
				el.select();
				document.execCommand('copy');
				document.body.removeChild(el);
			}
		} catch {
			// ignore
		}
	};

	// Match desktop PendingBill.js fetchCarryForwardData: show AVAILABLE carry forward balance
	const fetchCarryForwardData = async (vendorId) => {
		try {
			const res = await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/vendor_carry_forward/getAll", {
				method: "GET",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			});
			if (res.ok) {
				const data = await res.json().catch(() => []);
				const vendorCarryForward = (Array.isArray(data) ? data : []).filter(item => String(item?.vendor_id ?? '') === String(vendorId ?? ''));
				setCarryForwardData(vendorCarryForward);
				const totalCarryForward = vendorCarryForward.reduce((sum, item) => {
					const amount = parseFloat(item?.amount) || 0;
					const billAmount = parseFloat(item?.bill_amount) || 0;
					const refundAmount = parseFloat(item?.refund_amount) || 0;
					return sum + amount - billAmount - refundAmount;
				}, 0);
				setCarryForwardAmount(Math.max(0, totalCarryForward));
			} else {
				setCarryForwardData([]);
				setCarryForwardAmount(0);
			}
		} catch {
			setCarryForwardData([]);
			setCarryForwardAmount(0);
		}
	};

	const handleOverallPaymentPdfChange = async (e) => {
		const file = e?.target?.files?.[0];
		if (!file) return;
		const trackerId = selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id;
		if (!trackerId) {
			alert('Tracker ID not found');
			return;
		}
		setUploadingOverallPdf(true);
		try {
			// Upload file to Google Drive (same uploader as payment bill copy)
			const formData = new FormData();
			const vendorName = getVendorNameById(selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId) || 'Overall Payment';
			const now = new Date();
			const timestamp = now.toLocaleString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: true
			}).replace(",", "").replace(/\s/g, "-");
			const fileName = `${timestamp} ${vendorName} - summary bill.pdf`;
			formData.append('files', file);
			formData.append('folderName', 'FileUpload / Bill_Payments_Tracker ');
			formData.append('file_name', fileName);
			const uploadRes = await window.fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
				method: "POST",
				body: formData
			});
			if (!uploadRes.ok) throw new Error('File upload failed');
			const uploadResult = await uploadRes.json().catch(() => ({}));
			const pdfUrl = uploadResult.urls[0] || '';
			if (!pdfUrl) throw new Error('Upload did not return a URL');

			// Update tracker overall pdf url (desktop behavior)
			const res = await fetchWithBranch(
				`https://backendaab.in/demoAabuildersDash/api/vendor-payments/bills/${trackerId}/pdf-url?pdfUrl=${encodeURIComponent(pdfUrl)}`,
				{
					method: "PUT",
					credentials: "include",
					headers: { "Content-Type": "application/json" }
				}
			);
			if (!res.ok) throw new Error(`Failed to update PDF URL (${res.status})`);

			setSelectedVerifyBill((prev) => prev ? ({
				...prev,
				over_all_payment_pdf_url: pdfUrl,
				overAllPaymentPdfUrl: pdfUrl
			}) : prev);
			setApiData((prev) => Array.isArray(prev) ? prev.map((t) => {
				const id = t?.id ?? t?.bill_id;
				if (String(id ?? '') !== String(trackerId ?? '')) return t;
				return { ...t, over_all_payment_pdf_url: pdfUrl, overAllPaymentPdfUrl: pdfUrl };
			}) : prev);
			alert('PDF uploaded successfully!');
		} catch (err) {
			alert(err?.message || 'Error uploading PDF');
		} finally {
			setUploadingOverallPdf(false);
			// reset input so same file can be picked again
			if (overallPdfInputRef.current) overallPdfInputRef.current.value = '';
		}
	};

	const openPaymentSheet = () => {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const yyyy = today.getFullYear();
		const cfToUse = Number(bankSummaryDetails?.carryForwardToUse ?? 0) || 0;
		const shouldPrefillCf = useCarryForward && cfToUse > 0;
		setPaymentForm({
			date: `${dd}/${mm}/${yyyy}`,
			amount: shouldPrefillCf ? String(cfToUse) : '',
			mode: shouldPrefillCf ? 'Carry Forward' : '',
			transactionNumber: '',
			accountNumber: '',
			chequeNo: '',
			chequeDate: '',
			file: null
		});
		const vendorIdForCf = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId ?? null;
		if (vendorIdForCf != null) fetchCarryForwardData(vendorIdForCf);
		setShowPaymentSheet(true);
	};

	const closePaymentSheet = () => {
		setShowPaymentSheet(false);
		setShowPaymentDatePicker(false);
		setShowPaymentModePicker(false);
		setPaymentModePickerQuery('');
		setShowPaymentAccountPicker(false);
		setPaymentAccountPickerQuery('');
	};

	// Match desktop PendingBill.js handlePaymentSubmit (single entry variant)
	const submitPaymentDetails = async () => {
		const trackerId = selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id;
		if (!trackerId) {
			alert('Tracker ID not found');
			return;
		}
		if (!paymentForm?.date || !paymentForm?.amount || !paymentForm?.mode) {
			alert('Please fill all required fields in payment details');
			return;
		}
		// Mode-specific required fields (match desktop intent)
		// - For Cheque: require cheque no + cheque date
		// - For all non-Cash, non-Carry Forward modes: require account number
		// - Transaction number is required only for Net Banking / NEFT/RTGS
		if (paymentForm.mode === 'Cheque') {
			if (!paymentForm.chequeNo || !paymentForm.chequeDate) {
				alert('Please fill Cheque No and Cheque Date');
				return;
			}
		}
		if (paymentForm.mode !== 'Cash' && paymentForm.mode !== 'Carry Forward') {
			if (!paymentForm.accountNumber) {
				alert('Please select Account Number');
				return;
			}
		}
		if (paymentForm.mode === 'Net Banking' || paymentForm.mode === 'NEFT/RTGS') {
			if (!paymentForm.transactionNumber) {
				alert('Please fill Transaction Number');
				return;
			}
		}

		setSubmittingVerify(true);
		try {
			const toYyyyMmDd = (ddMmYyyy) => {
				const s = String(ddMmYyyy || '').trim();
				if (!s) return '';
				if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
				const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
				if (!m) return s;
				const dd = String(m[1]).padStart(2, '0');
				const mm = String(m[2]).padStart(2, '0');
				const yyyy = m[3];
				return `${yyyy}-${mm}-${dd}`;
			};

			// Upload attachment (desktop uses googleUploader and stores returned url as bill_url)
			let billUrl = '';
			if (paymentForm.file) {
				const formData = new FormData();
				const now = new Date();
				const timestamp = now.toLocaleString("en-GB", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: true
				})
					.replace(",", "")
					.replace(/\s/g, "-");
				const vendorName = getVendorNameById(selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId) || 'Payment';
				const finalName = `${timestamp} ${vendorName} ${paymentForm.mode}`;
				formData.append('files', paymentForm.file);
				formData.append('folderName', 'FileUpload / Bill_Payments_Tracker ');
				formData.append('file_name', finalName);
				const uploadRes = await window.fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
					method: "POST",
					body: formData
				});
				if (!uploadRes.ok) throw new Error('File upload failed');
				const uploadResult = await uploadRes.json().catch(() => ({}));
				billUrl = uploadResult?.urls?.[0] || '';
			}

			const actualAmount = Number(selectedVerifyBill?.total_amount ?? selectedVerifyBill?.totalAmount ?? 0) || 0;
			const discountToSend = !discountSubmitted ? (Number(discount) || 0) : 0;
			const amountNum = parseFloat(paymentForm.amount) || 0;
			const isCarryForwardMode = paymentForm.mode === 'Carry Forward';
			const vendorId = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId ?? null;
			const isoDate = toYyyyMmDd(paymentForm.date);
			// Match desktop PendingBill.js obligation / excess / carry-forward calculations
			const existingRows = Array.isArray(bankDetails) ? bankDetails : [];
			const currentReceivedAmount = existingRows.reduce(
				(sum, p) => sum + (Number(p?.amount || 0) || 0) + (Number(p?.carry_forward_amount || 0) || 0),
				0
			);
			const discountFromRows = existingRows.reduce((sum, p) => sum + (Number(p?.discount_amount || 0) || 0), 0);
			const billDiscount = discountFromRows > 0 ? discountFromRows : discountToSend;
			const totalRequiredToSettle = Math.max(0, actualAmount - billDiscount);
			const obligationBeforeSession = Math.max(0, totalRequiredToSettle - currentReceivedAmount);
			const totalPaymentAmount = isCarryForwardMode ? 0 : amountNum;
			const totalCfRequested = isCarryForwardMode
				? amountNum
				: (useCarryForward
					? Math.min(Number(carryForwardAmount || 0), Math.max(0, obligationBeforeSession - totalPaymentAmount))
					: 0);
			const carryForwardToUse = Math.min(
				totalCfRequested,
				Math.max(0, obligationBeforeSession - totalPaymentAmount)
			);
			const totalContributionThisSession = totalPaymentAmount + totalCfRequested;
			const excessAmount = Math.max(0, totalContributionThisSession - obligationBeforeSession);
			const paymentData = {
				vendor_payments_tracker_id: trackerId,
				date: toYyyyMmDd(paymentForm.date),
				actual_amount: actualAmount,
				// Match backend compute rules and list rendering:
				// - for Carry Forward mode, store as carry_forward_amount (amount becomes 0)
				amount: isCarryForwardMode ? 0 : amountNum,
				discount_amount: discountToSend,
				carry_forward_amount: isCarryForwardMode ? amountNum : 0,
				vendor_bill_payment_mode: paymentForm.mode,
				cheque_number: paymentForm.chequeNo || '',
				cheque_date: paymentForm.chequeDate || '',
				transaction_number: paymentForm.transactionNumber || '',
				account_number: paymentForm.accountNumber || '',
				bill_url: billUrl,
				branch_id: activeBranchId
			};
			const trackerSaveUrl = withBranchUrl("https://backendaab.in/demoAabuildersDash/api/vendor-bill-tracker/save");
			if (isPaymentModeRequiringBankRegisterLog(paymentForm.mode)) {
				await postBankRegisterLogSave(
					bankRegisterLogSaveUrlMatchingRequest(trackerSaveUrl),
					"Bill Payments Tracker (Mobile)",
					{
						bill_payment_mode: paymentForm.mode,
						amount: amountNum,
						entered_by: username,
					}
				);
			}
			const res = await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/vendor-bill-tracker/save", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(paymentData)
			});
			if (!res.ok) throw new Error(`Failed to save payment details: ${res.statusText}`);
			const savedPaymentDetail = await res.json().catch(() => ({}));
			// Also send to respective APIs based on mode (same as desktop PendingBill.js)
			if (paymentForm.mode !== 'Cash' && paymentForm.mode !== 'Carry Forward') {
				const weeklyPaymentBillPayload = {
					date: isoDate,
					created_at: new Date().toISOString(),
					contractor_id: null,
					vendor_id: vendorId,
					employee_id: null,
					project_id: 10,
					type: "Vendor Bill Payment",
					bill_payment_mode: paymentForm.mode,
					amount: amountNum,
					status: true,
					weekly_number: "",
					weekly_payment_expense_id: null,
					advance_portal_id: null,
					staff_advance_portal_id: null,
					claim_payment_id: null,
					cheque_number: paymentForm.chequeNo || null,
					cheque_date: paymentForm.chequeDate || null,
					transaction_number: paymentForm.transactionNumber || null,
					account_number: paymentForm.accountNumber || null,
					vendor_payment_tracker_id: trackerId,
					tenant_id: null,
					tenant_complex_name: null,
					branch_id: activeBranchId
				};
				try {
					await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(weeklyPaymentBillPayload)
					});
				} catch {
					// ignore (desktop logs only)
				}
			}
			if (paymentForm.mode === 'Cash') {
				const weeklyExpensePayload = {
					date: isoDate,
					created_at: new Date().toISOString(),
					contractor_id: null,
					vendor_id: vendorId,
					employee_id: null,
					project_id: 10,
					type: "Vendor Bill Payment",
					amount: amountNum,
					status: false,
					weekly_number: "",
					period_start_date: null,
					period_end_date: null,
					advance_portal_id: null,
					staff_advance_portal_id: null,
					loan_portal_id: null,
					rent_management_id: null,
					expenses_entry_id: null,
					vendor_payment_tracker_id: trackerId,
					send_to_expenses_entry: false,
					bill_copy_url: savedPaymentDetail?.bill_url || billUrl || '',
					branch_id: activeBranchId
				};
				try {
					await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(weeklyExpensePayload)
					});
				} catch {
					// ignore (desktop logs only)
				}
			}
			// Bill Payment carry forward: consume only the amount applied toward this bill
			if (carryForwardToUse > 0 && vendorId != null) {
				try {
					const carryForwardPayload = {
						type: "Bill Payment",
						date: isoDate,
						vendor_id: vendorId,
						payment_mode: "Carry Forward",
						amount: 0,
						bill_amount: carryForwardToUse,
						refund_amount: 0,
						branch_id: activeBranchId
					};
					await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/vendor_carry_forward/save", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(carryForwardPayload)
					});
				} catch {
					// ignore; main payment is already saved
				}
			}
			// Handle excess amount: if payment total exceeds actual amount needed
			if (excessAmount > 0 && vendorId != null) {
				try {
					const excessAmountPayload = {
						type: "Extra amount",
						date: isoDate,
						vendor_id: vendorId,
						payment_mode: "",
						amount: excessAmount,
						bill_amount: 0,
						refund_amount: 0,
						branch_id: activeBranchId
					};
					await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/vendor_carry_forward/save", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(excessAmountPayload)
					});
				} catch {
					// ignore; main payment is already saved
				}
			}
			// Refresh carry forward availability (desktop fetchCarryForwardData)
			try {
				const vendorIdForCf = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId ?? null;
				if (vendorIdForCf != null) {
					const cfRes = await fetchWithBranch("https://backendaab.in/demoAabuildersDash/api/vendor_carry_forward/getAll", {
						method: "GET",
						credentials: "include",
						headers: { "Content-Type": "application/json" }
					});
					if (cfRes.ok) {
						const data = await cfRes.json().catch(() => []);
						const vendorCarryForward = (Array.isArray(data) ? data : []).filter(item => String(item?.vendor_id ?? '') === String(vendorIdForCf));
						setCarryForwardData(vendorCarryForward);
						const totalCarryForward = vendorCarryForward.reduce((sum, item) => {
							const amount = parseFloat(item?.amount) || 0;
							const billAmount = parseFloat(item?.bill_amount) || 0;
							const refundAmount = parseFloat(item?.refund_amount) || 0;
							return sum + amount - billAmount - refundAmount;
						}, 0);
						setCarryForwardAmount(Math.max(0, totalCarryForward));
					} else {
						setCarryForwardData([]);
						setCarryForwardAmount(0);
					}
				}
			} catch {
				// ignore
			}
			// Refresh bank details list after save
			try {
				const bankRes = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-bill-tracker/get/${trackerId}`, {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (bankRes.ok) {
					const data = await bankRes.json();
					setBankDetails(Array.isArray(data) ? data : []);
				}
			} catch {
				// ignore
			}
			// Refresh trackers + keep current bank view in sync (no full reload)
			try {
				const updated = await reloadTrackers();
				if (Array.isArray(updated)) {
					const hit = updated.find((t) => String(t?.id ?? t?.bill_id ?? '') === String(trackerId ?? ''));
					if (hit) setSelectedVerifyBill(hit);
				}
			} catch {
				// ignore
			}
			alert('Payment details saved successfully!');
			closePaymentSheet();
		} catch (e) {
			alert(e?.message || 'Error saving payment details');
		} finally {
			setSubmittingVerify(false);
		}
	};
	const paymentInitialDateForModal = () => {
		const v = paymentForm?.date;
		if (!v) return '';
		if (String(v).includes('/')) return v; // already DD/MM/YYYY
		if (String(v).includes('-')) return toDdMmYyyySlashes(v); // YYYY-MM-DD
		return '';
	};
	const openBankDetails = async (bill) => {
		setSelectedVerifyBill(bill || null);
		pushOverlayHistoryState('bank');
		setActiveFullScreen('bank');
		setLoadingBankDetails(true);
		setBankDetailsError(null);
		setUseCarryForward(false);
		// Load available carry-forward balance for this vendor (used by the checkbox in Summary Details).
		const vendorIdForCf = bill?.vendor_id ?? bill?.vendorId ?? null;
		if (vendorIdForCf != null) fetchCarryForwardData(vendorIdForCf);
		else setCarryForwardAmount(0);
		try {
			const res = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-bill-tracker/get/${bill?.id}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error(`Failed to load bank details (${res.status})`);
			const data = await res.json();
			const rows = Array.isArray(data) ? data : [];
			setBankDetails(rows);
			// Match desktop: discount input is locked if any discount already applied
			const totalDiscount = rows.reduce((sum, p) => sum + (Number(p?.discount_amount || 0) || 0), 0);
			setDiscount(totalDiscount || 0);
			setDiscountSubmitted(totalDiscount > 0);
		} catch (e) {
			setBankDetails([]);
			setBankDetailsError(e?.message || 'Failed to load bank details');
			setDiscount(0);
			setDiscountSubmitted(false);
		} finally {
			setLoadingBankDetails(false);
		}
	};
	const openAddSheet = () => {
		setAddForm({
			vendorId: '',
			receivedDate: '',
			noOfBills: '',
			totalAmount: ''
		});
		setVendorPickerQuery('');
		setShowVendorPicker(false);
		setShowAddSheet(true);
	};
	const openEditTrackerSheet = (row) => {
		setEditRow(row || null);
		setSwipedRowId(null);
		const vendorId = row?.vendor_id ?? row?.vendorId ?? '';
		const billArrival = row?.bill_arrival_date ?? row?.billArrivalDate ?? '';
		const noOfBills = row?.no_of_bills ?? row?.noOfBills ?? '';
		const extraBills = row?.extra_bills ?? row?.extraBills ?? '0';
		const totalAmount = row?.total_amount ?? row?.totalAmount ?? '';
		// Received Date === bill_arrival_date (robust parse for DD/MM/YYYY, YYYY-MM-DD, ISO, arrays)
		const receivedDate = (() => {
			if (!billArrival) return '';
			const d = parseTrackerDateValue(billArrival);
			return d ? formatDdMmYyyyFromDate(d) : '';
		})();
		setEditForm({
			vendorId: vendorId ? String(vendorId) : '',
			receivedDate: receivedDate || '',
			noOfBills: String(noOfBills ?? ''),
			extraBills: String(extraBills ?? '0'),
			totalAmount: String(totalAmount ?? '')
		});
		setShowEditVendorPicker(false);
		setEditVendorPickerQuery('');
		setShowEditReceivedDatePicker(false);
		setShowEditSheet(true);
	};
	const closeEditSheet = () => {
		setShowEditSheet(false);
		setEditRow(null);
		setShowEditVendorPicker(false);
		setEditVendorPickerQuery('');
		setShowEditReceivedDatePicker(false);
	};

	const getEditReceivedDateInitialForModal = () => {
		const v = editForm.receivedDate;
		if (!v) return '';
		if (String(v).includes('/')) return v;
		if (String(v).includes('-')) return toDdMmYyyySlashes(v);
		return '';
	};

	const submitEditTracker = async () => {
		if (!editRow?.id) return;
		if (!editForm.receivedDate) {
			alert('Please select a bill arrival date');
			return;
		}
		if (!editForm.vendorId) {
			alert('Please select a vendor');
			return;
		}
		const bills = Number(editForm.noOfBills);
		if (!Number.isFinite(bills) || bills <= 0) {
			alert('Please enter a valid number of bills');
			return;
		}
		const extraBills = Math.max(0, Number(editForm.extraBills || 0) || 0);
		const amount = Number(editForm.totalAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			alert('Please enter a valid total amount');
			return;
		}
		setEditLoading(true);
		try {
			const payload = {
				bill_arrival_date: String(editForm.receivedDate),
				vendor_id: Number(editForm.vendorId),
				no_of_bills: bills,
				extra_bills: extraBills,
				total_amount: amount,
				branch_id: activeBranchId
			};
			// Desktop endpoint: /tracker/{id}/update-details
			const res = await fetchWithBranch(`https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker/${editRow.id}/update-details`, {
				method: 'PUT',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(await res.text());
			alert('Tracker updated successfully');
			closeEditSheet();
			await reloadTrackers();
		} catch (e) {
			alert(e?.message || 'Error updating tracker');
		} finally {
			setEditLoading(false);
		}
	};

	const closeAddSheet = () => {
		setShowAddSheet(false);
		setShowReceivedDatePicker(false);
		setShowVendorPicker(false);
		setVendorPickerQuery('');
	};

	const submitNewTracker = async () => {
		if (!addForm.receivedDate) {
			alert('Please select a bill arrival date');
			return;
		}
		if (!addForm.vendorId) {
			alert('Please select a vendor');
			return;
		}
		const bills = Number(addForm.noOfBills);
		if (!Number.isFinite(bills) || bills <= 0) {
			alert('Please enter a valid number of bills');
			return;
		}
		const amount = Number(addForm.totalAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			alert('Please enter a valid total amount');
			return;
		}
		try {
			const payload = {
				bill_arrival_date: String(addForm.receivedDate).includes('/')
					? String(addForm.receivedDate).replaceAll('-', '/')
					: toDdMmYyyySlashes(addForm.receivedDate),
				vendor_id: Number(addForm.vendorId),
				no_of_bills: bills,
				total_amount: amount,
				branch_id: activeBranchId
			};
			const res = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/vendor-payments/tracker', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json().catch(() => ({}));
			alert(`Tracker created with ID: ${data?.id ?? ''}`.trim());
			closeAddSheet();
			await reloadTrackers();
		} catch (e) {
			alert(e?.message || 'Error creating tracker');
		}
	};

	const toDdMmYyyySlashes = (yyyyMmDd) => {
		if (!yyyyMmDd) return '';
		const parts = String(yyyyMmDd).split('-');
		if (parts.length !== 3) return '';
		const [yyyy, mm, dd] = parts;
		if (!dd || !mm || !yyyy) return '';
		return `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${String(yyyy)}`;
	};

	const getReceivedDateInitialForModal = () => {
		const v = addForm.receivedDate;
		if (!v) return '';
		if (String(v).includes('/')) return v; // already DD/MM/YYYY
		if (String(v).includes('-')) return toDdMmYyyySlashes(v); // YYYY-MM-DD
		return '';
	};

	const vendorOptionsForSheet = useMemo(() => {
		const seen = new Set();
		const entries = Object.entries(vendorMap || {});
		const unique = [];
		for (const [id, name] of entries) {
			const key = String(id);
			if (!key || key === 'undefined' || key === 'null') continue;
			if (!name) continue;
			if (seen.has(key)) continue;
			seen.add(key);
			unique.push({ id: key, name: String(name) });
		}
		unique.sort((a, b) => a.name.localeCompare(b.name));
		return unique;
	}, [vendorMap]);

	const selectedVendorNameForEditSheet = useMemo(() => {
		if (!editForm.vendorId) return '';
		const hit = vendorOptionsForSheet.find(v => String(v.id) === String(editForm.vendorId));
		return hit?.name || '';
	}, [editForm.vendorId, vendorOptionsForSheet]);

	const filteredVendorOptionsForEditSheet = useMemo(() => {
		const q = (editVendorPickerQuery || '').trim().toLowerCase();
		if (!q) return vendorOptionsForSheet;
		return vendorOptionsForSheet.filter(v => (v.name || '').toLowerCase().includes(q));
	}, [vendorOptionsForSheet, editVendorPickerQuery]);

	const selectedVendorNameForSheet = useMemo(() => {
		if (!addForm.vendorId) return '';
		const hit = vendorOptionsForSheet.find(v => String(v.id) === String(addForm.vendorId));
		return hit?.name || '';
	}, [addForm.vendorId, vendorOptionsForSheet]);

	const filteredVendorOptionsForSheet = useMemo(() => {
		const q = (vendorPickerQuery || '').trim().toLowerCase();
		if (!q) return vendorOptionsForSheet;
		return vendorOptionsForSheet.filter(v => (v.name || '').toLowerCase().includes(q));
	}, [vendorOptionsForSheet, vendorPickerQuery]);

	const getEntryStatusText = (item) => {
		return item?.entry_status || item?.entryStatus || 'Entry';
	};

	useEffect(() => {
		const syncBranch = () => {
			const nextBranchId = resolveActiveBranchId();
			setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
		};
		syncBranch();
		window.addEventListener('branchSelectionChanged', syncBranch);
		return () => window.removeEventListener('branchSelectionChanged', syncBranch);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// Purchase orders are branch-scoped; clear cache on branch change to avoid wrong "Last PO"/Check PO results.
		setPurchaseOrdersAll([]);
		setPurchaseOrders([]);
	}, [activeBranchId]);

	useEffect(() => {
		// Desktop preloads purchase orders; do the same so "Check PO" is instant.
		// Fire-and-forget; `ensureAllPurchaseOrdersLoaded` de-dupes with `loadingPurchaseOrders`.
		ensureAllPurchaseOrdersLoaded();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeBranchId]);

	useEffect(() => {
		let isMounted = true;

		const fetchVendorNames = async () => {
			try {
				const res = await fetchWithBranch('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) return;
				const data = await res.json();
				const map = {};
				(Array.isArray(data) ? data : []).forEach(v => {
					const id = v?.id ?? v?._id;
					const name = v?.vendorName ?? v?.vendor_name ?? v?.label ?? '';
					if (id != null && name) {
						map[id] = name;
						map[String(id)] = name;
					}
				});
				if (isMounted) setVendorMap(map);
			} catch {
				// ignore
			}
		};
		const vendorList = Object.entries(vendorMap || {}).map(([id, name]) => ({
			id,
			name
		}));
		const fetchTrackerData = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/vendor-payments/trackers/pending', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				const text = await res.text();
				let data = [];
				try {
					data = JSON.parse(text);
				} catch (e) {
					data = [];
				}
				if (isMounted) setApiData(Array.isArray(data) ? data : []);
			} catch (e) {
				if (isMounted) setError('Failed to load');
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		const fetchAllBillEntries = async () => {
			try {
				const res = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/bill-entry/getAll', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) return;
				const data = await res.json();
				if (isMounted) setAllBillEntries(Array.isArray(data) ? data : []);
			} catch {
				// ignore
			}
		};

		const fetchAccountDetails = async () => {
			try {
				const res = await fetchWithBranch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) return;
				const data = await res.json().catch(() => []);
				if (isMounted) setAccountDetails(Array.isArray(data) ? data : []);
			} catch {
				// ignore
			}
		};

		const fetchExpensesData = async () => {
			try {
				const res = await fetchWithBranch('https://backendaab.in/demoAabuilderDash/expenses_form/get_form', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) return;
				const data = await res.json();
				if (isMounted) setExpensesData(Array.isArray(data) ? data : []);
			} catch {
				// ignore
			}
		};

		// Clear branch-specific data first to avoid stale display during branch switch (same as desktop)
		if (isMounted) {
			setApiData([]);
			setAllBillEntries([]);
			setPaymentStatuses({});
			setPaidTodayBills({});
		}

		// Kick off all lookups in parallel
		fetchVendorNames();
		fetchTrackerData();
		fetchAllBillEntries();
		fetchAccountDetails();
		fetchExpensesData();
		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeBranchId]);

	// Entry/payment/verification statuses are now computed in backend (`/trackers/pending`).

	useEffect(() => {
		// Backend pending endpoint returns `payment_status` + `paid_today`.
		const nextStatuses = {};
		const nextPaidToday = {};
		(apiData || []).forEach((item) => {
			const id = item?.id;
			if (id == null) return;
			nextStatuses[id] = item?.payment_status || item?.paymentStatus || 'To Pay';
			nextPaidToday[id] = !!(item?.paid_today ?? item?.paidToday);
		});
		setPaymentStatuses(nextStatuses);
		setPaidTodayBills(nextPaidToday);
	}, [apiData]);

	// Backend already returns only the rows required for PendingBill.
	const visibleRows = useMemo(() => (Array.isArray(apiData) ? apiData : []), [apiData]);

	const filtered = useMemo(() => {
		const base = Array.isArray(visibleRows) ? [...visibleRows] : [];
		// Match desktop: latest tracker first (higher id on top)
		base.sort((a, b) => {
			const aId = Number(a?.id ?? a?.bill_id ?? a?.billId ?? 0) || 0;
			const bId = Number(b?.id ?? b?.bill_id ?? b?.billId ?? 0) || 0;
			return bId - aId;
		});
		if (!query) return base;
		const q = query.toLowerCase();
		const toDateOnly = (input) => {
			const d = parseTrackerDateValue(input);
			if (!d) return '';
			const yyyy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		};
		const from = String(filterFromDate || '').trim();
		const to = String(filterToDate || '').trim();
		const payF = String(filterPaymentStatus || '').trim();

		return base.filter((row) => {
			const id = row?.vendor_id ?? row?.vendorId;
			const name = getVendorNameById(id);
			if (!(name || '').toLowerCase().includes(q)) return false;

			if (from || to) {
				const dateOnly = toDateOnly(row?.bill_arrival_date ?? row?.billArrivalDate ?? row?.created_at ?? row?.createdAt ?? row?.timestamp);
				if (!dateOnly) return false;
				if (from && dateOnly < from) return false;
				if (to && dateOnly > to) return false;
			}

			if (payF) {
				const status = paymentStatuses[row?.id] || 'To Pay';
				if (status !== payF) return false;
			}

			return true;
		});
	}, [visibleRows, query, vendorMap, filterFromDate, filterToDate, filterPaymentStatus, paymentStatuses]);

	const fullScreenHeaderSubTitle = useMemo(() => {
		const b = selectedVerifyBill;
		if (!b) return null;
		const parts = getPendingBillCardDateLineParts(b);
		return (
			<>
				{renderBillCardDateLineParts(parts)}
			</>
		);
	}, [selectedVerifyBill, vendorMap]);

	const closeFullScreen = () => {
		overlayHistoryPushedRef.current = false;
		setActiveFullScreen(null);
		setShowVerifyModal(false);
		setSelectedVerifyBill(null);
	};

	// Keep track of whether an overlay is currently open so we can intercept browser back.
	useEffect(() => {
		overlayOpenRef.current = !!showVerifyModal || activeFullScreen !== null;
	}, [showVerifyModal, activeFullScreen]);

	// When the user taps browser back while an overlay is open,
	// close the overlay instead of navigating back to Home.
	useEffect(() => {
		const onPopState = () => {
			if (!overlayOpenRef.current) return;
			overlayHistoryPushedRef.current = false;
			setActiveFullScreen(null);
			setShowVerifyModal(false);
			setSelectedVerifyBill(null);
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, []);

	// Build Expense Matching Details (used by Entry Details screen)
	const expenseMatchingDetails = useMemo(() => {
		const bill = selectedVerifyBill;
		if (!bill) return null;
		const trackerId = bill?.id;
		const vendorName = getVendorNameById(bill?.vendor_id ?? bill?.vendorId) || bill?.vendor_name || '';
		const billAmount = Number(bill?.total_amount ?? bill?.totalAmount ?? 0) || 0;
		const adjustmentAmount = Number(bill?.adjustment_amount ?? bill?.adjustmentAmount ?? 0) || 0;
		const adjustedBillAmount = Math.max(0, billAmount - adjustmentAmount);

		const billEntriesForTracker = allBillEntries.filter((be) => {
			const id = be?.vendor_payments_tracker_id ?? be?.vendorPaymentsTrackerId;
			return String(id) === String(trackerId);
		});
		const enteredDates = [...new Set(billEntriesForTracker.map(be => be?.entered_date ?? be?.enteredDate).filter(Boolean))];
		const billEnteredDates = enteredDates.map(date => {
			try {
				return new Date(date).toISOString().split('T')[0];
			} catch {
				return null;
			}
		}).filter(Boolean);

		const matchingExpenses = expensesData
			.filter((expense) => {
				const ts = expense?.timestamp ?? expense?.timeStamp;
				if (!ts) return false;
				const expenseDate = new Date(ts);
				if (isNaN(expenseDate.getTime())) return false;
				const iso = expenseDate.toISOString().split('T')[0];
				return billEnteredDates.includes(iso);
			})
			.filter((expense) => expense?.vendor === vendorName)
			.filter((expense) => {
				const at = String(expense?.accountType ?? '').trim();
				return at === 'Bill Payments' || at === 'Bill Refund' || at === 'Bill Payments + Claim';
			});

		const expenseAmount = matchingExpenses.reduce((sum, expense) => sum + (Number(expense?.amount) || 0), 0);
		const difference = Math.abs(expenseAmount - adjustedBillAmount);
		return {
			billsInExpensesCount: matchingExpenses.length,
			expenseAmount,
			billAmount,
			adjustedBillAmount,
			adjustmentAmount,
			difference
		};
	}, [selectedVerifyBill, expensesData, allBillEntries, vendorMap]);

	// Summary details for Bank (To Pay) screen
	const bankSummaryDetails = useMemo(() => {
		const totalPayable = Number(selectedVerifyBill?.total_amount ?? selectedVerifyBill?.totalAmount ?? 0) || 0;
		const rows = Array.isArray(bankDetails) ? bankDetails : [];
		const receivedAmount = rows.reduce((sum, p) => sum + (Number(p?.amount || 0) || 0) + (Number(p?.carry_forward_amount || 0) || 0), 0);
		const discountAmount = rows.reduce((sum, p) => sum + (Number(p?.discount_amount || 0) || 0), 0);
		// Match desktop: CF affects totals only when checkbox is ON.
		const cfAvailable = Number(carryForwardAmount || 0) || 0;
		const cfToUse = useCarryForward ? Math.min(cfAvailable, Math.max(0, totalPayable - receivedAmount - discountAmount)) : 0;
		const netPayable = Math.max(0, totalPayable - receivedAmount - discountAmount - cfToUse);
		return {
			totalPayable,
			receivedAmount,
			carryForwardAmount: cfAvailable,
			carryForwardToUse: cfToUse,
			discountAmount,
			netPayable
		};
	}, [bankDetails, selectedVerifyBill, useCarryForward, carryForwardAmount]);

	const lockCarryForwardPayment = useMemo(() => {
		if (!showPaymentSheet) return false;
		if (!useCarryForward) return false;
		if (paymentForm?.mode !== 'Carry Forward') return false;
		const amt = Number(paymentForm?.amount || 0) || 0;
		const cfToUse = Number(bankSummaryDetails?.carryForwardToUse ?? 0) || 0;
		return amt > 0 && cfToUse > 0;
	}, [showPaymentSheet, useCarryForward, paymentForm?.mode, paymentForm?.amount, bankSummaryDetails?.carryForwardToUse]);

	// If user toggles Carry Forward on the Bank screen, prefill the Payment bottom sheet (like desktop).
	useEffect(() => {
		if (!showPaymentSheet) return;
		const cfToUse = Number(bankSummaryDetails?.carryForwardToUse ?? 0) || 0;
		if (useCarryForward && cfToUse > 0) {
			setPaymentForm((p) => ({
				...p,
				mode: p?.mode && p.mode !== 'Carry Forward' ? p.mode : 'Carry Forward',
				amount: p?.amount ? p.amount : String(cfToUse)
			}));
			return;
		}
		// If unchecked and user was in Carry Forward mode, clear the auto-filled values.
		if (!useCarryForward) {
			setPaymentForm((p) => {
				if (p?.mode !== 'Carry Forward') return p;
				return { ...p, mode: '', amount: '' };
			});
		}
	}, [useCarryForward, bankSummaryDetails, showPaymentSheet]);

	// Desktop-like behavior: when Carry Forward is checked, open the payment bottom sheet and prefill it.
	useEffect(() => {
		if (activeFullScreen !== 'bank') return;
		// keep prev ref in sync
		const prev = prevUseCarryForwardRef.current;
		prevUseCarryForwardRef.current = useCarryForward;
		// Open only on the rising edge (unchecked -> checked), so user can still close the sheet.
		if (!prev && useCarryForward) {
			if (showPaymentSheet) return;
			const cfToUse = Number(bankSummaryDetails?.carryForwardToUse ?? 0) || 0;
			if (cfToUse <= 0) return;
			openPaymentSheet();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [useCarryForward, activeFullScreen, showPaymentSheet, bankSummaryDetails?.carryForwardToUse]);

	// Last/previous payment details (to match desktop "Previous Payment Details")
	const lastBankPayment = useMemo(() => {
		const rows = Array.isArray(bankDetails) ? bankDetails : [];
		if (!rows.length) return null;
		const scored = rows
			.map((p) => {
				const ts =
					p?.timestamp ??
					p?.created_at ??
					p?.createdAt ??
					p?.updated_at ??
					p?.updatedAt ??
					p?.date ??
					p?.payment_date ??
					p?.paymentDate ??
					null;
				const t = ts ? new Date(ts).getTime() : NaN;
				return { p, t: Number.isFinite(t) ? t : -Infinity };
			})
			.sort((a, b) => b.t - a.t);
		return scored[0]?.p || null;
	}, [bankDetails]);

	const resolveBankPaymentMode = (p) => {
		if (!p) return '';
		const direct =
			p?.vendor_bill_payment_mode ??
			p?.vendorBillPaymentMode ??
			p?.mode ??
			p?.payment_mode ??
			p?.paymentMode ??
			p?.payment_mode_name ??
			p?.paymentModeName ??
			p?.mode_of_payment ??
			p?.modeOfPayment ??
			'';
		const cleaned = String(direct || '').trim();
		if (cleaned) return cleaned;

		// Heuristics when mode is missing from API:
		const amt = Number(p?.amount || 0) || 0;
		const cf = Number(p?.carry_forward_amount ?? p?.carryForwardAmount ?? 0) || 0;
		if (cf > 0 && amt <= 0) return 'Carry Forward';
		if (String(p?.cheque_no || p?.chequeNo || '').trim()) return 'Cheque';
		if (String(p?.transaction_number || p?.transactionNumber || '').trim()) return 'Net Banking';
		return '';
	};

	const lastBankPaymentViewUrl = useMemo(() => {
		const p = lastBankPayment;
		if (!p) return '';
		const url =
			p?.attachment_url ??
			p?.attachmentUrl ??
			p?.attach_file ??
			p?.attachFile ??
			p?.file_url ??
			p?.fileUrl ??
			p?.payment_pdf ??
			p?.paymentPdf ??
			p?.billCopy ??
			p?.bill_copy ??
			'';
		return typeof url === 'string' ? url : '';
	}, [lastBankPayment]);

	// Build Bill Entry Details rows (Entered By + Date) for Entry Details screen
	const billEntryDetailsRows = useMemo(() => {
		const bill = selectedVerifyBill;
		if (!bill) return [];
		const trackerId = bill?.id;
		if (!trackerId) return [];

		const rows = (allBillEntries || [])
			.filter((be) => String(be?.vendor_payments_tracker_id ?? be?.vendorPaymentsTrackerId ?? '') === String(trackerId))
			.map((be) => {
				const enteredBy = be?.entered_by ?? be?.enteredBy ?? be?.created_by ?? be?.createdBy ?? '';
				const enteredDate = be?.entered_date ?? be?.enteredDate ?? be?.date ?? be?.created_at ?? be?.createdAt ?? '';
				return {
					enteredBy: String(enteredBy || '').trim(),
					date: enteredDate
				};
			})
			.filter((r) => r.enteredBy || r.date);

		// newest first (if date is parseable)
		rows.sort((a, b) => {
			const ta = new Date(a.date).getTime();
			const tb = new Date(b.date).getTime();
			if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
			return 0;
		});

		// collapse duplicates (same enteredBy + same day)
		const seen = new Set();
		const uniq = [];
		for (const r of rows) {
			let dayKey = '';
			try {
				const d = new Date(r.date);
				if (!isNaN(d.getTime())) dayKey = d.toISOString().split('T')[0];
			} catch {
				dayKey = '';
			}
			const k = `${r.enteredBy}__${dayKey || String(r.date || '')}`;
			if (seen.has(k)) continue;
			seen.add(k);
			uniq.push(r);
		}
		return uniq;
	}, [selectedVerifyBill, allBillEntries]);

	const formatEntryDateDdMmYyyy = (input) => {
		if (!input) return '';
		try {
			const d = new Date(input);
			if (isNaN(d.getTime())) return '';
			const dd = String(d.getDate()).padStart(2, '0');
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const yyyy = d.getFullYear();
			return `${dd}/${mm}/${yyyy}`;
		} catch {
			return '';
		}
	};

	const formatDateTimeForPDF = (input) => {
		if (!input) return '-';
		try {
			const d = new Date(input);
			if (isNaN(d.getTime())) return '-';
			return d.toLocaleString('en-GB', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});
		} catch {
			return '-';
		}
	};

	const formatDateOnlyForPDF = (input) => {
		if (!input) return '-';
		try {
			const d = new Date(input);
			if (isNaN(d.getTime())) return '-';
			const dd = String(d.getDate()).padStart(2, '0');
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const yyyy = d.getFullYear();
			return `${dd}/${mm}/${yyyy}`;
		} catch {
			return '-';
		}
	};

	const downloadMatchingExpensesPDF = () => {
		if (!selectedVerifyBill) {
			alert('No bill selected');
			return;
		}

		const trackerId = selectedVerifyBill?.id;
		if (!trackerId) {
			alert('Tracker ID not found');
			return;
		}

		const vendorName =
			getVendorNameById(selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId) ||
			selectedVerifyBill?.vendor_name ||
			selectedVerifyBill?.vendorName ||
			'-';

		// Build entered dates for this tracker
		const billEntriesForTracker = allBillEntries.filter((be) => {
			const id = be?.vendor_payments_tracker_id ?? be?.vendorPaymentsTrackerId;
			return String(id) === String(trackerId);
		});
		const enteredDates = [...new Set(billEntriesForTracker.map(be => be?.entered_date ?? be?.enteredDate).filter(Boolean))];
		const billEnteredDates = enteredDates
			.map((date) => {
				try {
					return new Date(date).toISOString().split('T')[0];
				} catch {
					return null;
				}
			})
			.filter(Boolean);

		const matchingExpenses = expensesData
			.filter((expense) => {
				const ts = expense?.timestamp ?? expense?.timeStamp;
				if (!ts) return false;
				const expenseDate = new Date(ts);
				if (isNaN(expenseDate.getTime())) return false;
				const iso = expenseDate.toISOString().split('T')[0];
				return billEnteredDates.includes(iso);
			})
			.filter((expense) => expense?.vendor === vendorName)
			.filter((expense) => {
				const at = String(expense?.accountType ?? '').trim();
				return at === 'Bill Payments' || at === 'Bill Refund' || at === 'Bill Payments + Claim';
			});

		if (!matchingExpenses || matchingExpenses.length === 0) {
			alert('No expenses to generate PDF');
			return;
		}

		const doc = new jsPDF({
			orientation: 'landscape'
		});

		const totalAmount = matchingExpenses.reduce((sum, item) => sum + Number(item?.amount || 0), 0);

		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Matching Expenses Report', 14, 15);
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');
		doc.text(`Vendor: ${vendorName}`, 14, 22);
		doc.text(`Total Entries: ${matchingExpenses.length}`, 130, 22);
		doc.text(
			`Total Amount: ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			225,
			22
		);

		const tableColumn = [
			'Time Stamp',
			'Date',
			'E.No',
			'Project Name',
			'Vendor',
			'A/C Type',
			'Quantity',
			'Amount',
			'Comments',
			'Category'
		];

		const tableRows = matchingExpenses.map((expense) => ([
			formatDateTimeForPDF(expense?.timestamp || expense?.date),
			formatDateOnlyForPDF(expense?.date),
			expense?.eno || '-',
			expense?.siteName || '-',
			expense?.vendor || '-',
			expense?.accountType || '-',
			expense?.quantity || '-',
			`${Number(expense?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			expense?.comments || '-',
			expense?.category || '-'
		]));

		doc.autoTable({
			head: [tableColumn],
			body: tableRows,
			startY: 30,
			margin: { left: 10, right: 10, top: 30 },
			theme: 'grid',
			headStyles: {
				fillColor: [250, 246, 237],
				textColor: 0,
				fontStyle: 'bold',
				halign: 'left',
				fontSize: 9,
				lineWidth: 0.3
			},
			bodyStyles: {
				fontSize: 9,
				textColor: [0, 0, 0],
				halign: 'left'
			},
			alternateRowStyles: { fillColor: [255, 255, 255] },
			columnStyles: {
				0: { cellWidth: 34 },
				1: { cellWidth: 20 },
				2: { cellWidth: 16 },
				3: { cellWidth: 54 },
				4: { cellWidth: 28 },
				5: { cellWidth: 27 },
				6: { cellWidth: 18 },
				7: { cellWidth: 26, halign: 'right' },
				8: { cellWidth: 20 },
				9: { cellWidth: 30 }
			},
			didDrawPage: function (data) {
				const pageHeight = doc.internal.pageSize.height;
				doc.setFontSize(9);
				doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width / 2, pageHeight - 5, { align: 'center' });
			}
		});

		const fileName = `Matching_Expenses_${String(vendorName).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
		doc.save(fileName);
	};

	const renderTopBar = (title, onBack, rightNode = null) => (
		<div className="pt-[16px] ">
			<div className="flex items-start justify-between gap-[10px]">
				<div className="flex items-center gap-[10px]">
					<button type="button" onClick={onBack} className="w-[28px] h-[28px] flex items-center justify-center" aria-label="Back">
						<img src={BackArrow} alt="Back" className="w-[18px] h-[18px]" />
					</button>
					<div className="min-w-0">
						<p className="text-[14px] font-semibold text-black leading-tight">{title}</p>
						<p className="text-[11px] font-medium text-[#777777] leading-tight mt-[2px] truncate max-w-[240px]">
							{fullScreenHeaderSubTitle}
						</p>
					</div>
				</div>
				{rightNode}
			</div>
		</div>
	);

	const getVendorBillsTitle = (bill) => {
		const b = bill || null;
		const vendorName = b ? (getVendorNameById(b?.vendor_id ?? b?.vendorId) || 'Vendor') : 'Vendor';
		const noOfBills = Number(b?.no_of_bills ?? b?.noOfBills ?? 0) || 0;
		const extraBills = Number(b?.extra_bills ?? b?.extraBills ?? 0) || 0;
		const total = Math.max(0, noOfBills + extraBills);
		return `${vendorName} - ${total} Bills`;
	};
	return (
		<div className="w-full flex flex-col" style={{ height: 'calc(100vh - 182px)', overflow: 'hidden' }}>
			{/* Full-screen flows (Verified / Entry / Paid) */}
			{activeFullScreen === 'entry' && (
				<div className="fixed inset-0 z-[999] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white">
						{renderTopBar(getVendorBillsTitle(selectedVerifyBill), () => setActiveFullScreen(null))}

						{/* Divider just below the header (under date) */}
						<div className="pt-[8px]">
							<div className="h-[2px] bg-[#E5E7EB]" />
						</div>

						<div className="pt-[4px] pb-[4px] flex flex-col" style={{ minHeight: 'calc(100vh - 86px)' }}>
							<div className="flex items-center justify-end pb-[4px]">
								<button
									type="button"
									onClick={downloadMatchingExpensesPDF}
									className="text-[12px] font-semibold text-black mt-[2px]"
								>
									Download
								</button>
							</div>
							{/* Previously entered rows */}
							{billEntryDetailsRows.length > 0 && (
								<div className="mt-[2px] space-y-[10px]">
									{billEntryDetailsRows.map((r, i) => {
										const entryRowId = `entry-${i}`;
										const ACTIONS_WIDTH = 56;
										const isSwiped = String(swipedRowId ?? '') === String(entryRowId ?? '');
										const isActiveTouch = touchStartX != null && String(touchRowId ?? '') === String(entryRowId ?? '');
										const deltaX = (isActiveTouch && touchCurrentX != null) ? (touchCurrentX - touchStartX) : 0;

										const swipeOffset = (() => {
											if (isSwiped) {
												if (isActiveTouch && deltaX > 0) return Math.min(0, -ACTIONS_WIDTH + deltaX);
												return -ACTIONS_WIDTH;
											}
											if (isActiveTouch && deltaX < 0) return Math.max(-ACTIONS_WIDTH, deltaX);
											return 0;
										})();

										const showSwipeActions = isSwiped || (isActiveTouch && touchIsSwiping && swipeOffset < -20);

										return (
											<div
												key={entryRowId}
												className="relative overflow-hidden"
												onMouseDown={(e) => {
													// Only left-click / primary button
													if (e.button !== 0) return;
													e.preventDefault();
													setTouchRowId(entryRowId);
													setTouchStartX(e.clientX);
													setTouchCurrentX(e.clientX);
													setTouchIsSwiping(false);
												}}
												onTouchStart={(e) => {
													if (!e.touches?.[0]) return;
													setTouchRowId(entryRowId);
													setTouchStartX(e.touches[0].clientX);
													setTouchCurrentX(e.touches[0].clientX);
													setTouchIsSwiping(false);
												}}
												onTouchMove={(e) => {
													if (touchStartX == null || !e.touches?.[0]) return;
													const x = e.touches[0].clientX;
													const dx = x - touchStartX;
													// allow swipe left to open, and swipe right to close when already expanded
													if (dx < 0 || (isSwiped && dx > 0)) {
														if (e.preventDefault) e.preventDefault();
														setTouchCurrentX(x);
														setTouchIsSwiping(true);
													}
												}}
												onTouchEnd={() => {
													const minSwipeDistance = 50;
													const dx = (touchCurrentX != null && touchStartX != null) ? (touchCurrentX - touchStartX) : 0;
													if (Math.abs(dx) >= minSwipeDistance) {
														if (dx < 0) setSwipedRowId(entryRowId);
														else setSwipedRowId(null);
													}
													setTouchRowId(null);
													setTouchStartX(null);
													setTouchCurrentX(null);
													setTouchIsSwiping(false);
												}}
											>
												{/* Actions behind row */}
												<div
													className="absolute right-0 top-0 h-full flex items-center justify-end z-0"
													style={{
														width: `${ACTIONS_WIDTH}px`,
														opacity: showSwipeActions ? 1 : 0,
														transition: 'opacity 0.2s ease-out',
														pointerEvents: showSwipeActions ? 'auto' : 'none'
													}}
												>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setBillEntryForm({
																enteredBy: r.enteredBy || username || '',
																date: r.date || ''
															});
															setShowBillEntrySheet(true);
															setSwipedRowId(null);
															setTouchRowId(null);
															setTouchStartX(null);
															setTouchCurrentX(null);
															setTouchIsSwiping(false);
														}}
														className="action-button w-[48px] h-full bg-[#007233] rounded-[6px] flex items-center justify-center hover:bg-[#22a882] transition-colors shadow-sm"
														title="Edit"
														aria-label="Edit"
													>
														<img src={Edit1} alt="Edit" className="w-[18px] h-[18px]" />
													</button>
												</div>

												{/* Sliding row */}
												<div
													style={{
														transform: `translateX(${swipeOffset}px)`,
														touchAction: 'pan-y',
														userSelect: 'none',
														WebkitUserSelect: 'none',
														willChange: 'transform',
														transition: isActiveTouch ? 'none' : 'transform 0.3s ease-out'
													}}
													className="rounded-[10px] border border-[#E5E7EB] bg-white px-[12px] py-[10px]"
												>
													<div className="grid grid-cols-2 gap-[12px]">
														<div>
															<p className="text-[12px] font-semibold text-[#111827] mb-[6px]">Entered By</p>
															<div className="h-[36px] rounded-[6px] bg-[#F3F4F6] border border-[#E5E7EB] px-[10px] flex items-center">
																<p className="text-[12px] font-medium text-[#111827] truncate">{r.enteredBy || '-'}</p>
															</div>
														</div>
														<div>
															<p className="text-[12px] font-semibold text-[#111827] mb-[6px]">Date</p>
															<div className="h-[36px] rounded-[6px] bg-[#F3F4F6] border border-[#E5E7EB] px-[10px] flex items-center">
																<p className="text-[12px] font-medium text-[#111827] truncate">{formatEntryDateDdMmYyyy(r.date) || '-'}</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}

							<button
								type="button"
								onClick={openBillEntrySheet}
								className={`w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black ${billEntryDetailsRows.length > 0 ? 'mt-[12px]' : ''}`}
							>
								+ Add on
							</button>

							<div className="flex-1" />

							<div className="mt-auto rounded-[14px] border border-[#E5E7EB] bg-white p-[14px] mb-[20px]">
								<p className="text-[14px] font-semibold text-black mb-[10px]">Expense Matching Details</p>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Bills in Expenses</p>
									<p className="text-[12px] font-semibold text-black">{expenseMatchingDetails?.billsInExpensesCount ?? 0} Nos</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Expense Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(expenseMatchingDetails?.expenseAmount ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Bill Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(expenseMatchingDetails?.billAmount ?? 0)}</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Adjusted Bill Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(expenseMatchingDetails?.adjustedBillAmount ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p
										className="text-[12px] underline text-[#C58B2A] cursor-pointer"
										onClick={openAdjustmentAmountSheet}
									>
										Adjustment Amount
									</p>
									<p
										className="text-[12px] font-semibold cursor-pointer"
										style={{ color: '#C58B2A' }}
										onClick={openAdjustmentAmountSheet}
									>
										{formatIndianCurrency(expenseMatchingDetails?.adjustmentAmount ?? 0)}
									</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] font-semibold text-black">Difference</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(expenseMatchingDetails?.difference ?? 0).replace('₹', '₹')}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Bill Entry bottom sheet (opens from "+ Add on") */}
					{showBillEntrySheet && (
						<div className="fixed inset-0 z-[1205] flex items-end justify-center">
							<button
								type="button"
								className="absolute inset-0 bg-black/40"
								aria-label="Close"
								onClick={closeBillEntrySheet}
							/>
							<div className="relative w-full bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[16px]">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-[16px] font-semibold text-black">Bill Entry</p>
									</div>
									<button
										type="button"
										onClick={closeBillEntrySheet}
										className="w-[28px] h-[28px] flex items-center justify-center"
										aria-label="Close"
									>
										<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
									</button>
								</div>

								<div className="mt-[12px] flex flex-col gap-[12px]">
									<div>
										<p className="text-[12px] font-semibold text-black mb-[6px]">Entered By</p>
										<input
											value={billEntryForm.enteredBy}
											onChange={(e) => setBillEntryForm((p) => ({ ...p, enteredBy: e.target.value }))}
											className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] outline-none bg-white"
											placeholder="Enter"
										/>
									</div>

									<div>
										<p className="text-[12px] font-semibold text-black mb-[6px]">Date</p>
										<div className="relative">
											<div
												role="button"
												tabIndex={0}
												onClick={() => setShowBillEntryDatePicker(true)}
												onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowBillEntryDatePicker(true); }}
												className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] pr-[40px] outline-none bg-white flex items-center cursor-pointer"
												style={{ color: billEntryForm.date ? '#111827' : '#9E9E9E' }}
											>
												<span className="truncate">
													{billEntryForm.date ? String(billEntryForm.date).replaceAll('/', '-') : 'dd/mm/yyyy'}
												</span>
											</div>
											<div className="absolute right-[12px] top-1/2 -translate-y-1/2">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
													<path d="M7 10h10" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M7 14h7" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M8 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M16 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-[16px] grid grid-cols-2 gap-[12px]">
									<button
										type="button"
										onClick={closeBillEntrySheet}
										className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-semibold text-black"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={submitBillEntryDetails}
										disabled={submittingVerify}
										className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
									>
										{submittingVerify ? 'Submitting...' : 'Submit'}
									</button>
								</div>
							</div>

							{/* Date picker for Bill Entry sheet */}
							<div className="bpt-bill-entry-date-picker">
								<style>{`
									.bpt-bill-entry-date-picker .fixed.inset-0.z-50 { z-index: 1300 !important; }
								`}</style>
								<DatePickerModal
									isOpen={showBillEntryDatePicker}
									onClose={() => setShowBillEntryDatePicker(false)}
									onConfirm={(formattedDate) => {
										setBillEntryForm((p) => ({ ...p, date: formattedDate }));
										setShowBillEntryDatePicker(false);
									}}
									initialDate={billEntryInitialDateForModal()}
								/>
							</div>
						</div>
					)}

					{/* Adjustment Amount bottom sheet (opens from Expense Matching Details) */}
					{showAdjustmentAmountSheet && (
						<div className="fixed inset-0 z-[1206] flex items-end justify-center">
							<button
								type="button"
								className="absolute inset-0 bg-black/40"
								aria-label="Close"
								onClick={closeAdjustmentAmountSheet}
							/>
							<div className="relative w-full bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[16px]">
								<style>{`
									/* Hide number input spinner arrows for Adjustment Amount */
									.bpt-adjustment-amount-input::-webkit-outer-spin-button,
									.bpt-adjustment-amount-input::-webkit-inner-spin-button {
										-webkit-appearance: none;
										margin: 0;
									}
									.bpt-adjustment-amount-input {
										-moz-appearance: textfield;
										appearance: textfield;
									}
								`}</style>
								<div className="flex items-start justify-between">
									<p className="text-[16px] font-semibold text-black">Adjustment Amount</p>
									<button
										type="button"
										onClick={closeAdjustmentAmountSheet}
										className="w-[28px] h-[28px] flex items-center justify-center"
										aria-label="Close"
									>
										<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
									</button>
								</div>

								<div className="mt-[12px]">
									<p className="text-[12px] font-semibold text-black mb-[6px]">Amount</p>
									<input
										type="number"
										value={adjustmentAmountForm.amount}
										onChange={(e) => setAdjustmentAmountForm((p) => ({ ...p, amount: e.target.value }))}
										onWheel={(e) => {
											e.preventDefault();
											e.currentTarget.blur();
										}}
										className="w-full h-[40px] border border-[#D1D5DB] rounded-[8px] text-[13px] font-medium px-[12px] outline-none bg-white text-right bpt-adjustment-amount-input"
									/>
								</div>

								<div className="mt-[16px] grid grid-cols-2 gap-[12px]">
									<button
										type="button"
										onClick={closeAdjustmentAmountSheet}
										className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-semibold text-black"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={submitAdjustmentAmountUpdate}
										disabled={submittingVerify}
										className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
									>
										{submittingVerify ? 'Submitting...' : 'Submit'}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{activeFullScreen === 'bank' && (
				<div className="fixed inset-0 z-[999] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white">
						{renderTopBar(
							getVendorNameById(selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId) || 'Vendor',
							() => setActiveFullScreen(null),
							<p className="text-[11px] font-semibold text-[#666666] leading-tight mt-[20px]">
								(
								{Number(selectedVerifyBill?.no_of_bills ?? selectedVerifyBill?.noOfBills ?? 0) +
									Number(selectedVerifyBill?.extra_bills ?? selectedVerifyBill?.extraBills ?? 0)}
								Nos)
							</p>
						)}

						{/* Divider just below the header (under date and Last PO) */}
						<div className="pt-[8px]">
							<div className="h-[2px] bg-[#E5E7EB]" />
						</div>

						<div className="flex flex-col" style={{ minHeight: 'calc(100vh - 86px)' }}>
							<div
								className="flex mt-[4px] items-center justify-between"
								role="button"
								tabIndex={0}
								onClick={openBankDetailsModal}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') openBankDetailsModal();
								}}
							>
								<span className="text-[12px] font-semibold text-black underline underline-offset-4">
									Bank Details
								</span>
								<button
									type="button"
									className="text-[12px] font-semibold text-black"
									onClick={(e) => e.stopPropagation()}
								>
									Submit
								</button>
							</div>

							{loadingBankDetails && <p className="text-[12px] text-center text-[#6B7280] mt-[10px]">Loading…</p>}
							{!!bankDetailsError && !loadingBankDetails && (
								<p className="text-[12px] text-center text-red-600 mt-[10px]">{bankDetailsError}</p>
							)}

							<div className="space-y-[10px]">
								{(Array.isArray(bankDetails) ? bankDetails : []).map((p, i) => {
									const mode = resolveBankPaymentMode(p);
									const cfAmt = Number(p?.carry_forward_amount ?? p?.carryForwardAmount ?? 0) || 0;
									const amount = mode === 'Carry Forward'
										? cfAmt
										: (Number(p?.amount || 0) || 0);
									const billUrlForAmount =
										p?.bill_url ??
										p?.billUrl ??
										p?.bill_copy_url ??
										p?.billCopyUrl ??
										p?.bill_copy ??
										p?.billCopy ??
										'';
									const acc = p?.account_number || p?.accountNumber || '';
									const txn = p?.transaction_number || p?.transactionNumber || '';
									const chequeNo = p?.cheque_no || p?.chequeNo || '';
									const date = p?.date || p?.payment_date || '';
									const paidRowId = `paid-${i}`;
									const ACTIONS_WIDTH = 56;
									const isSwiped = String(swipedRowId ?? '') === String(paidRowId ?? '');
									const isActiveTouch = touchStartX != null && String(touchRowId ?? '') === String(paidRowId ?? '');
									const deltaX = (isActiveTouch && touchCurrentX != null) ? (touchCurrentX - touchStartX) : 0;

									const swipeOffset = (() => {
										if (isSwiped) {
											if (isActiveTouch && deltaX > 0) return Math.min(0, -ACTIONS_WIDTH + deltaX);
											return -ACTIONS_WIDTH;
										}
										if (isActiveTouch && deltaX < 0) return Math.max(-ACTIONS_WIDTH, deltaX);
										return 0;
									})();

									const showSwipeActions = isSwiped || (isActiveTouch && touchIsSwiping && swipeOffset < -20);

									const isoDate = (() => {
										try {
											if (!date) return '';
											return new Date(date).toISOString().split('T')[0];
										} catch {
											return '';
										}
									})();

									return (
										<div
											key={i}
											className="relative overflow-hidden"
											onMouseDown={(e) => {
												if (e.button !== 0) return;
												e.preventDefault();
												setTouchRowId(paidRowId);
												setTouchStartX(e.clientX);
												setTouchCurrentX(e.clientX);
												setTouchIsSwiping(false);
											}}
											onTouchStart={(e) => {
												if (!e.touches?.[0]) return;
												setTouchRowId(paidRowId);
												setTouchStartX(e.touches[0].clientX);
												setTouchCurrentX(e.touches[0].clientX);
												setTouchIsSwiping(false);
											}}
											onTouchMove={(e) => {
												if (touchStartX == null || !e.touches?.[0]) return;
												const x = e.touches[0].clientX;
												const dx = x - touchStartX;
												if (dx < 0 || (isSwiped && dx > 0)) {
													if (e.preventDefault) e.preventDefault();
													setTouchCurrentX(x);
													setTouchIsSwiping(true);
												}
											}}
											onTouchEnd={() => {
												const minSwipeDistance = 50;
												const dx = (touchCurrentX != null && touchStartX != null) ? (touchCurrentX - touchStartX) : 0;
												if (Math.abs(dx) >= minSwipeDistance) {
													if (dx < 0) setSwipedRowId(paidRowId);
													else setSwipedRowId(null);
												}
												setTouchRowId(null);
												setTouchStartX(null);
												setTouchCurrentX(null);
												setTouchIsSwiping(false);
											}}
										>
											{/* Actions behind row */}
											<div
												className="absolute right-0 top-0 h-full flex items-center justify-end z-0"
												style={{
													width: `${ACTIONS_WIDTH}px`,
													opacity: showSwipeActions ? 1 : 0,
													transition: 'opacity 0.2s ease-out',
													pointerEvents: showSwipeActions ? 'auto' : 'none'
												}}
											>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setPaymentForm({
															date: isoDate || '',
															amount: String(amount || ''),
															mode: mode || '',
															transactionNumber: txn || '',
															accountNumber: acc || '',
															chequeNo: chequeNo || '',
															chequeDate: isoDate || '',
															file: null
														});
														setShowPaymentSheet(true);
														setSwipedRowId(null);
														setTouchRowId(null);
														setTouchStartX(null);
														setTouchCurrentX(null);
														setTouchIsSwiping(false);
													}}
													className="action-button w-[56px] h-full bg-[#007233] rounded-[10px] flex items-center justify-center hover:bg-[#22a882] transition-colors shadow-sm"
													title="Edit"
													aria-label="Edit"
												>
													<img src={Edit1} alt="Edit" className="w-[18px] h-[18px]" />
												</button>
											</div>

											{/* Sliding card */}
											<div
												style={{
													transform: `translateX(${swipeOffset}px)`,
													touchAction: 'pan-y',
													userSelect: 'none',
													WebkitUserSelect: 'none',
													willChange: 'transform',
													transition: isActiveTouch ? 'none' : 'transform 0.3s ease-out'
												}}
											>
												<div className="rounded-[14px] bg-[#FAFAFA] border border-[#EFEFEF] px-[14px] py-[12px] flex items-start justify-between gap-[10px]">
													<div className="min-w-0 text-left">
														<p className="text-[12px] font-semibold text-black truncate">{acc ? `A/C - ${acc}` : 'A/C - -'}</p>
														<p className="text-[12px] text-black mt-[2px] truncate">
															{chequeNo ? `CHQ-${chequeNo}` : (txn || '')}
														</p>
														<p className="text-[10px] text-[#666666] mt-[4px]">{date ? new Date(date).toLocaleString('en-GB') : ''}</p>
													</div>
													<div className="flex-shrink-0 flex flex-col items-end">
														<span className="inline-flex px-[10px] py-[3px] rounded-full text-[10px] font-semibold bg-[#F3E8FF] text-[#7C3AED]">
															{mode || 'Mode'}
														</span>
														<button
															type="button"
															onClick={() => {
																const url = String(billUrlForAmount || '').trim();
																if (!url) return;
																window.open(url, '_blank', 'noopener,noreferrer');
															}}
															disabled={!String(billUrlForAmount || '').trim()}
															className={`mt-[6px] text-[13px] font-semibold ${String(billUrlForAmount || '').trim() ? 'text-green-700 underline underline-offset-2' : 'text-green-700'}`}
															title={String(billUrlForAmount || '').trim() ? 'Open bill copy' : 'No bill copy'}
														>
															{formatIndianCurrency(amount)}
														</button>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<button
								type="button"
								onClick={openPaymentSheet}
								disabled={
									!(selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id) ||
									(paymentStatuses[(selectedVerifyBill?.id ?? selectedVerifyBill?.bill_id)] === '✓ Paid' && (Number(bankSummaryDetails?.netPayable ?? 0) || 0) <= 0)
								}
								className="mt-[12px] w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
							>
								+ Add on
							</button>

							<div className="flex-1" />

							<div className="mt-auto rounded-[14px] border border-[#E5E7EB] bg-white p-[14px] mb-[20px]">
								<div className="flex items-center justify-between mb-[8px]">
									<p className="text-[14px] font-semibold text-black">Summary Details</p>
									<div className="flex items-center gap-[10px]">
										<input
											ref={overallPdfInputRef}
											type="file"
											accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,image/*"
											onChange={handleOverallPaymentPdfChange}
											style={{ display: 'none' }}
										/>
										<button
											type="button"
											onClick={() => overallPdfInputRef.current?.click()}
											disabled={uploadingOverallPdf}
											className={`text-[12px] font-semibold ${uploadingOverallPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
											style={{ color: '#C58B2A' }}
										>
											{uploadingOverallPdf ? 'Uploading...' : 'Attach File'}
										</button>
										{(selectedVerifyBill?.over_all_payment_pdf_url || selectedVerifyBill?.overAllPaymentPdfUrl) ? (
											<button
												type="button"
												onClick={() => {
													const url = selectedVerifyBill?.over_all_payment_pdf_url || selectedVerifyBill?.overAllPaymentPdfUrl;
													if (url) window.open(url, '_blank', 'noopener,noreferrer');
												}}
												className="text-[12px] font-semibold"
												style={{ color: '#111827' }}
											>
												View
											</button>
										) : null}
									</div>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Total Payable Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.totalPayable ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Received Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.receivedAmount ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<div className="flex items-center gap-[8px]">
										<p className="text-[12px] text-[#666666]">Carry Forward</p>
										<input
											type="checkbox"
											checked={useCarryForward}
											onChange={(e) => setUseCarryForward(e.target.checked)}
											disabled={(bankSummaryDetails?.carryForwardAmount ?? 0) <= 0 || (paymentStatuses[selectedVerifyBill?.id] === '✓ Paid')}
											className="w-[14px] h-[14px] accent-green-600"
											aria-label="Use Carry Forward"
										/>
									</div>
									<p className={`text-[12px] font-semibold ${useCarryForward ? 'text-green-700' : 'text-black'}`}>
										{formatIndianCurrency(bankSummaryDetails?.carryForwardAmount ?? 0)}
									</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Total Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.totalPayable ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<button
										type="button"
										onClick={() => {
											if (discountSubmitted) return;
											setDiscountInputValue(discount ? String(discount) : '');
											setShowDiscountSheet(true);
										}}
										className="text-[12px] underline text-[#C58B2A]"
										disabled={discountSubmitted}
									>
										Discount
									</button>

									<div
										className={`w-[90px] h-[28px] px-[10px] flex items-center justify-end text-right text-[12px] font-semibold rounded-[6px]
			${discountSubmitted ? 'bg-[#F3F4F6] text-[#6B7280]' : 'bg-white text-[#C58B2A]'}`}
									>
										{discount
											? String(discount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
											: '0'}
									</div>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] font-semibold text-black">Net Payable</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.netPayable ?? 0)}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Payment Details bottom sheet (opens from "+ Add on") */}
					{showPaymentSheet && (
						<div className="fixed inset-0 z-[1205] flex items-end justify-center">
							<button
								type="button"
								className="absolute inset-0 bg-black/40"
								aria-label="Close"
								onClick={closePaymentSheet}
							/>
							<div className="relative w-full bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[16px]">
								<style>{`
										/* Hide number input spinner arrows for Payment Details amount */
										.bpt-payment-amount-input::-webkit-outer-spin-button,
										.bpt-payment-amount-input::-webkit-inner-spin-button {
											-webkit-appearance: none;
											margin: 0;
										}
										.bpt-payment-amount-input {
											-moz-appearance: textfield;
											appearance: textfield;
										}
									`}</style>
								<div className="flex items-start justify-between">
									<p className="text-[16px] font-semibold text-black">Payment Details</p>
									<button
										type="button"
										onClick={closePaymentSheet}
										className="w-[28px] h-[28px] flex items-center justify-center"
										aria-label="Close"
									>
										<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
									</button>
								</div>

								<div className="mt-[12px] grid grid-cols-2 gap-[12px]">
									<div>
										<p className="text-[12px] font-semibold text-black mb-[6px]">Date</p>
										<div className="relative">
											<div
												role="button"
												tabIndex={0}
												onClick={() => setShowPaymentDatePicker(true)}
												onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPaymentDatePicker(true); }}
												className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] pr-[40px] outline-none bg-white flex items-center cursor-pointer"
												style={{ color: paymentForm.date ? '#111827' : '#9E9E9E' }}
											>
												<span className="truncate">
													{paymentForm.date ? String(paymentForm.date).replaceAll('/', '-') : 'dd/mm/yyyy'}
												</span>
											</div>
											<div className="absolute right-[12px] top-1/2 -translate-y-1/2">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
													<path d="M7 10h10" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M7 14h7" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M8 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M16 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
													<path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
												</svg>
											</div>
										</div>
									</div>

									<div>
										<p className="text-[12px] font-semibold text-black mb-[6px]">Amount</p>
										<input
											type="number"
											value={paymentForm.amount}
											onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
											disabled={lockCarryForwardPayment}
											onWheel={(e) => {
												e.preventDefault();
												e.currentTarget.blur();
											}}
											className={`w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] outline-none text-right bpt-payment-amount-input ${lockCarryForwardPayment ? 'bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed' : 'bg-white'}`}
											placeholder="0"
										/>
									</div>
								</div>

								<div className="mt-[12px]">
									<p className="text-[12px] font-semibold text-black mb-[6px]">Mode</p>
									<div className="relative">
										<div
											role="button"
											tabIndex={0}
											onClick={() => {
												if (lockCarryForwardPayment) return;
												setPaymentModePickerQuery('');
												setShowPaymentModePicker(true);
											}}
											onKeyDown={(e) => {
												if (lockCarryForwardPayment) return;
												if (e.key === 'Enter' || e.key === ' ') {
													setPaymentModePickerQuery('');
													setShowPaymentModePicker(true);
												}
											}}
											className={`w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] pr-[34px] outline-none flex items-center ${lockCarryForwardPayment ? 'bg-[#F3F4F6] cursor-not-allowed' : 'bg-white cursor-pointer'}`}
											style={{ color: paymentForm.mode ? (lockCarryForwardPayment ? '#6B7280' : '#111827') : '#9E9E9E' }}
										>
											<span className="truncate">{paymentForm.mode || 'Select Mode'}</span>
										</div>
										<div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
											<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</div>
									</div>
								</div>

								{/* For all modes except Cash & Carry Forward, show Account Number. */}
								{paymentForm.mode && paymentForm.mode !== 'Cash' && paymentForm.mode !== 'Carry Forward' && paymentForm.mode !== 'Direct' && (
									<>
										{(paymentForm.mode === 'Net Banking' || paymentForm.mode === 'NEFT/RTGS') && (
											<div className="mt-[12px]">
												<p className="text-[12px] font-semibold text-black mb-[6px]">Transaction Number</p>
												<input
													type="text"
													inputMode="numeric"
													value={paymentForm.transactionNumber}
													onChange={(e) => setPaymentForm((p) => ({ ...p, transactionNumber: e.target.value.replace(/[^0-9]/g, '') }))}
													className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] outline-none bg-white"
													placeholder="Enter"
												/>
											</div>
										)}

										<div className="mt-[12px]">
											<p className="text-[12px] font-semibold text-black mb-[6px]">Account Number</p>
											<div className="relative">
												<div
													role="button"
													tabIndex={0}
													onClick={() => {
														setPaymentAccountPickerQuery('');
														setShowPaymentAccountPicker(true);
													}}
													onKeyDown={(e) => {
														if (e.key === 'Enter' || e.key === ' ') {
															setPaymentAccountPickerQuery('');
															setShowPaymentAccountPicker(true);
														}
													}}
													className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] pr-[34px] outline-none bg-white flex items-center cursor-pointer"
													style={{ color: paymentForm.accountNumber ? '#111827' : '#9E9E9E' }}
												>
													<span className="truncate">{paymentForm.accountNumber || 'Select Account Number'}</span>
												</div>
												<div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
													<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
													</svg>
												</div>
											</div>
										</div>

										{paymentForm.mode === 'Cheque' && (
											<>
												<div className="mt-[12px]">
													<p className="text-[12px] font-semibold text-black mb-[6px]">Cheque No</p>
													<input
														type="text"
														inputMode="numeric"
														value={paymentForm.chequeNo}
														onChange={(e) => setPaymentForm((p) => ({ ...p, chequeNo: e.target.value.replace(/[^0-9]/g, '') }))}
														className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] outline-none bg-white"
														placeholder="Enter"
													/>
												</div>
												<div className="mt-[12px]">
													<p className="text-[12px] font-semibold text-black mb-[6px]">Cheque Date</p>
													<input
														type="text"
														value={paymentForm.chequeDate}
														onChange={(e) => setPaymentForm((p) => ({ ...p, chequeDate: e.target.value }))}
														className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] outline-none bg-white"
														placeholder="dd/mm/yyyy"
													/>
												</div>
											</>
										)}
									</>
								)}

								<div className="mt-[10px] flex items-center gap-[8px]">
									<input
										id="bpt-payment-attach"
										type="file"
										className="hidden"
										onChange={(e) => setPaymentForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
									/>
									<label htmlFor="bpt-payment-attach" className="text-[12px] font-semibold text-[#C58B2A] underline cursor-pointer">
										Attach File
									</label>
									{paymentForm.file?.name ? (
										<p className="text-[11px] font-medium text-[#666666] truncate">{paymentForm.file.name}</p>
									) : null}
								</div>

								<div className="mt-[14px] grid grid-cols-2 gap-[12px]">
									<button
										type="button"
										onClick={closePaymentSheet}
										className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-semibold text-black"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={submitPaymentDetails}
										disabled={submittingVerify || (paymentStatuses[selectedVerifyBill?.id] === '✓ Paid')}
										className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
									>
										{submittingVerify ? 'Saving...' : 'Save'}
									</button>
								</div>
							</div>

							{/* Date picker for Payment Details sheet */}
							<div className="bpt-payment-date-picker">
								<style>{`
									.bpt-payment-date-picker .fixed.inset-0.z-50 { z-index: 1300 !important; }
								`}</style>
								<DatePickerModal
									isOpen={showPaymentDatePicker}
									onClose={() => setShowPaymentDatePicker(false)}
									onConfirm={(formattedDate) => {
										setPaymentForm((p) => ({ ...p, date: formattedDate }));
										setShowPaymentDatePicker(false);
									}}
									initialDate={paymentInitialDateForModal()}
								/>
							</div>

							{/* Mode picker popup (like ToolsTracker dropdown) */}
							{showPaymentModePicker && (
								<div
									className="fixed inset-0 bg-black bg-opacity-50 z-[1306] flex items-center justify-center p-4"
									onClick={(e) => {
										if (e.target === e.currentTarget) {
											setShowPaymentModePicker(false);
											setPaymentModePickerQuery('');
										}
									}}
								>
									<div
										className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg h-[80vh] flex flex-col"
										onClick={(e) => e.stopPropagation()}
										onMouseDown={(e) => e.stopPropagation()}
									>
										<div className="flex justify-between items-center px-[24px] pt-[20px] pb-[10px]">
											<p className="text-[16px] font-semibold text-black">Select Mode</p>
											<button
												type="button"
												onClick={() => {
													setShowPaymentModePicker(false);
													setPaymentModePickerQuery('');
												}}
												className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
												aria-label="Close"
											>
												<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
											</button>
										</div>
										<div className="px-[24px] pt-[4px] pb-[12px]">
											<div className="relative">
												<input
													type="text"
													value={paymentModePickerQuery}
													onChange={(e) => setPaymentModePickerQuery(e.target.value)}
													placeholder="Search"
													className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
													autoFocus
												/>
												<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
														<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
														<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
													</svg>
												</div>
											</div>
										</div>
										<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-[24px]">
											<div className="shadow-md rounded-lg overflow-hidden">
												{filteredPaymentModeOptions.length > 0 ? (
													filteredPaymentModeOptions.map((m) => {
														const selected = String(paymentForm.mode) === String(m);
														return (
															<button
																key={m}
																type="button"
																onClick={() => {
																	setPaymentForm((p) => ({ ...p, mode: m }));
																	setShowPaymentModePicker(false);
																	setPaymentModePickerQuery('');
																}}
																className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
																style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
															>
																<p className="text-[12px] font-medium text-black text-left truncate">{m}</p>
															</button>
														);
													})
												) : (
													<div className="flex flex-col items-center justify-center py-4">
														<p className="text-[14px] font-medium text-[#9E9E9E] text-center">
															{paymentModePickerQuery ? 'No options found' : 'No options available'}
														</p>
													</div>
												)}
											</div>
										</div>
									</div>

								</div>
							)}

							{/* Account picker popup (like ToolsTracker dropdown) */}
							{showPaymentAccountPicker && (
								<div
									className="fixed inset-0 bg-black bg-opacity-50 z-[1307] flex items-center justify-center p-4"
									onClick={(e) => {
										if (e.target === e.currentTarget) {
											setShowPaymentAccountPicker(false);
											setPaymentAccountPickerQuery('');
										}
									}}
								>
									<div
										className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col"
										onClick={(e) => e.stopPropagation()}
										onMouseDown={(e) => e.stopPropagation()}
									>
										<div className="flex justify-between items-center px-[24px] pt-[20px] pb-[10px]">
											<p className="text-[16px] font-semibold text-black">Select Account Number</p>
											<button
												type="button"
												onClick={() => {
													setShowPaymentAccountPicker(false);
													setPaymentAccountPickerQuery('');
												}}
												className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
												aria-label="Close"
											>
												<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
											</button>
										</div>
										<div className="px-[24px] pt-[4px] pb-[12px]">
											<div className="relative">
												<input
													type="text"
													value={paymentAccountPickerQuery}
													onChange={(e) => setPaymentAccountPickerQuery(e.target.value)}
													placeholder="Search"
													className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
													autoFocus
												/>
												<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
														<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
														<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
													</svg>
												</div>
											</div>
										</div>
										<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-[24px]">
											<div className="shadow-md rounded-lg overflow-hidden">
												{filteredPaymentAccountOptions.length > 0 ? (
													filteredPaymentAccountOptions.map((acc) => {
														const selected = String(paymentForm.accountNumber) === String(acc);
														return (
															<button
																key={acc}
																type="button"
																onClick={() => {
																	setPaymentForm((p) => ({ ...p, accountNumber: acc }));
																	setShowPaymentAccountPicker(false);
																	setPaymentAccountPickerQuery('');
																}}
																className={`w-full px-[16px] flex items-center gap-3 transition-colors ${selected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
																style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
															>
																<p className="text-[12px] font-medium text-black text-left truncate">{acc}</p>
															</button>
														);
													})
												) : (
													<div className="flex flex-col items-center justify-center py-4">
														<p className="text-[14px] font-medium text-[#9E9E9E] text-center">
															{paymentAccountPickerQuery ? 'No options found' : 'No options available'}
														</p>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Date / Vendor row */}
			<div className="flex items-center justify-between border-b border-[#E0E0E0] pt-[8px] pb-[8px]">
				<p
					className="text-[12px] font-semibold text-[#111827] cursor-pointer"
					onClick={() => setShowDatePicker(true)}
				>
					{selectedDate || "Date"}
				</p>
				<div className="flex items-center gap-2">
					<p
						className="text-[12px] font-semibold text-[#111827] cursor-pointer"
						onClick={() => setShowVendorPopup(true)}
					>
						{selectedVendor || "Vendor"}
					</p>

					{/* ✅ SVG Clear Button */}
					{selectedVendor && (
						<span
							className="cursor-pointer flex items-center"
							onClick={(e) => {
								e.stopPropagation(); // prevent popup open
								setSelectedVendor("");
							}}
						>
							<svg
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M9 3L3 9M3 3L9 9"
									stroke="#848484"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					)}
				</div>
			</div>
			{/* Search */}
			<div className=" mt-[8px]">
				<div className="w-full h-[36px] rounded-[24px] bg-white border border-[#E5E7EB] flex items-center px-[12px]">
					<img src={Search} alt="Search" className="w-[12px] h-[12px]" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search"
						className="ml-[8px] flex-1 outline-none text-[12px] font-semibold text-[#111827] placeholder-[#9CA3AF]"
						style={{ background: 'transparent' }}
					/>
				</div>
			</div>
			{/* Filter and Download Row (match ToolsTracker History layout) */}
			<div className="flex justify-between items-center gap-[4px] px-0 mt-[6px] flex-shrink-0">
				<div className="flex items-center gap-[4px] min-w-0">
					<button
						type="button"
						onClick={() => setShowFilterSheet(true)}
						className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0"
					>
						<img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
						<span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
					</button>
				</div>
			</div>

			{/* Filter Bottom Sheet */}
			{showFilterSheet && (
				<div
					className="fixed inset-0 bg-black/60 z-[1201] flex items-end justify-center"
					style={{ fontFamily: "'Manrope', sans-serif" }}
					onClick={() => setShowFilterSheet(false)}
				>
					<div
						className="bg-white w-full rounded-tl-[16px] rounded-tr-[16px] relative z-[1202] overflow-hidden flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex-shrink-0 flex items-center justify-between px-[16px] pt-[14px] pb-[10px]">
							<p className="text-[14px] font-bold text-black">Filters</p>
							<button type="button" onClick={() => setShowFilterSheet(false)} className="text-[#E4572E] text-[18px] font-bold leading-none" aria-label="Close">
								<img src={Close} alt="Close" className="w-[11px] h-[11px]" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-[16px] py-[12px]">
							<div className="grid grid-cols-2 gap-[12px]">
								<div>
									<p className="text-[12px] font-semibold text-black mb-[2px]">From Date</p>
									<input
										type="date"
										value={filterFromDate}
										onChange={(e) => setFilterFromDate(e.target.value)}
										className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
								<div>
									<p className="text-[12px] font-semibold text-black mb-[2px]">To Date</p>
									<input
										type="date"
										value={filterToDate}
										onChange={(e) => setFilterToDate(e.target.value)}
										className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
							</div>

							<div className="mt-[12px]">
								<p className="text-[12px] font-semibold text-black mb-[2px]">Payment Status</p>
								<select
									value={filterPaymentStatus}
									onChange={(e) => setFilterPaymentStatus(e.target.value)}
									className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
								>
									<option value="">All</option>
									<option value="To Pay">To Pay</option>
									<option value="Paid">Paid</option>
									<option value="✓ Paid">✓ Paid</option>
								</select>
							</div>
						</div>

						<div className="flex-shrink-0 px-[16px] pb-[26px] pt-[10px] grid grid-cols-2 gap-[12px]">
							<button
								type="button"
								onClick={() => {
									setFilterFromDate('');
									setFilterToDate('');
									setFilterPaymentStatus('');
								}}
								className="h-[42px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
							>
								Clear
							</button>
							<button
								type="button"
								onClick={() => setShowFilterSheet(false)}
								className="h-[42px] rounded-[10px] bg-black text-[13px] font-semibold text-white"
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}
			{/* List */}
			<div
				className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pb-4"
			>
				{loading && <p className="text-[12px] text-center text-[#6B7280]">Loading…</p>}
				{!loading && filtered.length === 0 && <p className="text-[12px] text-center text-[#6B7280]">No data</p>}
				{filtered.map((row, idx) => {
					const vendorName = getVendorNameById(row?.vendor_id ?? row?.vendorId) || 'Vendor';
					const amount = row?.total_amount ?? row?.totalAmount ?? 0;
					const noOfBills = row?.no_of_bills ?? row?.noOfBills ?? 0;
					const extraBills = row?.extra_bills ?? row?.extraBills ?? 0;
					const billsCount = extraBills > 0 ? `${noOfBills} & ${extraBills}` : (noOfBills || '-');
					const dateLineParts = getPendingBillCardDateLineParts(row);

					const verificationStatus = getBillVerificationStatus(row);
					const entryStatusText = getEntryStatusText(row);
					const paymentStatus = paymentStatuses[row?.id] || 'To Pay';
					const canOpenEntry = isAllBillsVerified(row);
					const canOpenPayment = isEntryCompleted(row);

					const statusLeft =
						verificationStatus === '✓ Verified' ? (
							<Chip label="Verified" tone="success" onClick={() => openVerifyModal(row)} />
						) : verificationStatus === 'Verified' ? (
							<Chip label="Verified" tone="warn" onClick={() => openVerifyModal(row)} />
						) : (
							<Chip label="To Verify" tone="neutral" onClick={() => openVerifyModal(row)} />
						);

					const statusMid = (entryStatusText === 'Entered' || entryStatusText === '✓ Entered') ? (
						<Chip
							label="Entered"
							tone={entryStatusText === '✓ Entered' ? 'success' : 'warn'}
							disabled={!canOpenEntry}
							onClick={() => {
								if (canOpenEntry) openEntryDetails(row);
								else alert('Complete bill verification before entering details');
							}}
						/>
					) : (
						<Chip
							label="To Entry"
							tone="neutral"
							disabled={!canOpenEntry}
							onClick={() => {
								if (canOpenEntry) openEntryDetails(row);
								else alert('Complete bill verification before entering details');
							}}
						/>
					);

					const statusRight =
						paymentStatus === '✓ Paid' ? (
							<Chip
								label="Paid"
								tone="success"
								disabled={!canOpenPayment}
								onClick={() => {
									if (canOpenPayment) openBankDetails(row);
									else alert('Complete entry before proceeding with payment');
								}}
							/>
						) : paymentStatus === 'Paid' ? (
							<Chip
								label="Paid"
								tone="warn"
								disabled={!canOpenPayment}
								onClick={() => {
									if (canOpenPayment) openBankDetails(row);
									else alert('Complete entry before proceeding with payment');
								}}
							/>
						) : (
							<Chip
								label="To Pay"
								tone="neutral"
								disabled={!canOpenPayment}
								onClick={() => {
									if (canOpenPayment) openBankDetails(row);
									else alert('Complete entry before proceeding with payment');
								}}
							/>
						);

					const rowId = row?.id ?? row?.bill_id ?? idx;
					const isSwiped = String(swipedRowId ?? '') === String(rowId ?? '');
					const isActiveTouch = touchStartX != null && String(touchRowId ?? '') === String(rowId ?? '');
					const deltaX = (isActiveTouch && touchCurrentX != null) ? (touchCurrentX - touchStartX) : 0;
					const ACTIONS_WIDTH = 56; // match Database.jsx single action width feel
					const swipeOffset = (() => {
						// If expanded, allow swipe right to close (move towards 0)
						if (isSwiped) {
							if (isActiveTouch && deltaX > 0) return Math.min(0, -ACTIONS_WIDTH + deltaX);
							return -ACTIONS_WIDTH;
						}
						// If not expanded, allow swipe left to reveal (move towards -ACTIONS_WIDTH)
						if (isActiveTouch && deltaX < 0) return Math.max(-ACTIONS_WIDTH, deltaX);
						return 0;
					})();
					const showSwipeActions = isSwiped || (isActiveTouch && touchIsSwiping && swipeOffset < -20);

					return (
						<div
							key={rowId}
							className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] w-full"
							onMouseDown={(e) => {
								// Only left-click / primary button
								if (e.button !== 0) return;
								e.preventDefault();
								setTouchRowId(rowId);
								setTouchStartX(e.clientX);
								setTouchCurrentX(e.clientX);
								setTouchIsSwiping(false);
							}}
							onTouchStart={(e) => {
								if (!e.touches?.[0]) return;
								setTouchRowId(rowId);
								setTouchStartX(e.touches[0].clientX);
								setTouchCurrentX(e.touches[0].clientX);
								setTouchIsSwiping(false);
							}}
							onTouchMove={(e) => {
								if (touchStartX == null || !e.touches?.[0]) return;
								const x = e.touches[0].clientX;
								const dx = x - touchStartX;
								// allow swipe left to open, and swipe right to close when already expanded
								if (dx < 0 || (isSwiped && dx > 0)) {
									if (e.preventDefault) e.preventDefault();
									setTouchCurrentX(x);
									setTouchIsSwiping(true);
								}
							}}
							onTouchEnd={() => {
								const minSwipeDistance = 50;
								const dx = (touchCurrentX != null && touchStartX != null) ? (touchCurrentX - touchStartX) : 0;
								if (Math.abs(dx) >= minSwipeDistance) {
									if (dx < 0) setSwipedRowId(rowId); // open
									else setSwipedRowId(null); // close
								}
								setTouchRowId(null);
								setTouchStartX(null);
								setTouchCurrentX(null);
								setTouchIsSwiping(false);
							}}
						>
							{/* Edit action behind (match Database.jsx style) */}
							<div
								className="absolute right-0 top-0 h-full flex items-center justify-end z-0"
								style={{
									width: `${ACTIONS_WIDTH}px`,
									opacity: showSwipeActions ? 1 : 0,
									transition: 'opacity 0.2s ease-out',
									pointerEvents: showSwipeActions ? 'auto' : 'none'
								}}
							>
								<button
									type="button"
									onTouchStart={(e) => e.stopPropagation()}
									onTouchEnd={(e) => e.stopPropagation()}
									onClick={(e) => {
										e.stopPropagation();
										openEditTrackerSheet(row);
										setSwipedRowId(null);
									}}
									className="action-button w-[48px] h-full min-h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center hover:bg-[#22a882] transition-colors shadow-sm"
									title="Edit"
									aria-label="Edit"
								>
									<img src={Edit1} alt="Edit" className="w-[18px] h-[18px]" />
								</button>
							</div>

							{/* Foreground card */}
							<div
								className="bg-white rounded-[8px] h-full px-[12px] py-[12px] border-b border-[#E5E7EB] transition-transform duration-200 ease-out flex flex-col select-none"
								style={{
									transform: `translateX(${swipeOffset}px)`,
									touchAction: 'pan-y',
									userSelect: 'none',
									WebkitUserSelect: 'none'
								}}
							>
								<div className="flex items-start justify-between gap-[8px]">
									<div className="min-w-0  text-left">
										<p
											className="text-[12px] font-semibold text-black leading-snug break-words mb-0.5"
											style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
										>
											{vendorName || 'N/A'}
										</p>
										<p
											className="text-[11px] font-medium text-[#777777] leading-snug break-words"
											style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
										>
											{renderBillCardDateLineParts(dateLineParts)}
										</p>
									</div>
									<div className="flex-shrink-0 flex flex-col items-end gap-[4px]">
										<p className="text-[12px] font-semibold text-black leading-snug">
											₹{amount?.toLocaleString?.('en-IN') || amount || '0'}
										</p>
										<p className="text-[11px] font-medium text-[#777777] leading-snug">
											No. of bills: {billsCount ?? '-'}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-[8px] flex-wrap mt-[8px]">
									{statusLeft}
									{statusMid}
									{statusRight}
								</div>
							</div>
						</div>
					);
				})}
			</div>
			{/* Verify Modal (mobile) */}
			{showVerifyModal && (
				<div className="fixed inset-0 z-[999] bg-white">
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white flex flex-col">
						{/* Top bar */}
						{renderTopBar(getVendorBillsTitle(selectedVerifyBill), closeFullScreen, (
							<div className="text-right flex-shrink-0">
								<p className="text-[11px] font-semibold text-black leading-tight">
									Last PO:{' '}
									{lastPoNumber != null ? String(lastPoNumber) : (getLastNonNoPoFromCurrent(selectedVerifyBill) || '')}
								</p>
								<p className="text-[10px] font-medium text-[#777777] leading-tight mt-[2px]">
									{(() => {
										const total =
											Math.max(0, Number(selectedVerifyBill?.no_of_bills ?? selectedVerifyBill?.noOfBills ?? 0) || 0) +
											Math.max(0, Number(selectedVerifyBill?.extra_bills ?? selectedVerifyBill?.extraBills ?? 0) || 0);
										const persisted = (selectedVerifyBill?.billVerifications || selectedVerifyBill?.bill_verifications || []);
										let verified = 0;
										for (let i = 0; i < total; i += 1) {
											const isNoPo = !!(noPoSelections && noPoSelections[i]);
											const pv = poValidation ? poValidation[i] : null;
											const per = Array.isArray(persisted) ? persisted[i] : null;
											const perVerified = per?.is_verified === true || per?.status === 'VERIFIED';
											if (isNoPo || (pv && pv.matched === true) || perVerified) verified += 1;
										}
										if (total > 0 && verified === total) return '(All Bills Verified)';
										if (verified > 0) return `(${verified} Bills Verified)`;
										return '(Bills)';
									})()}
								</p>
							</div>
						))}

						{/* Divider just below the header (under date and Last PO) */}
						<div className=" pt-[8px]">
							<div className="h-[2px] bg-[#E5E7EB]" />
						</div>

						{/* Content (grid scrolls; buttons pinned) */}
						<div className="pt-[4px] flex-shrink-0">
							<div className="flex items-center justify-between ">
								<button
									type="button"
									onClick={() => setShowFillRangeSheet(true)}
									className="text-[12px] font-semibold text-black"
								>
									Fill Range
								</button>
								<div className="flex items-center gap-[10px]">
									{canShowSendRequest() && (
										<button
											type="button"
											onClick={() => saveBills({ sendRequest: true })}
											disabled={submittingVerify}
											className="text-[12px] font-semibold text-black disabled:opacity-50"
										>
											Send Request
										</button>
									)}
									<button
										type="button"
										onClick={() => setIsEditMode((p) => !p)}
										className="w-[26px] h-[26px] bg-white flex items-center justify-center"
										aria-label="Edit"
									>
										<img src={Edit} alt="edit" className="w-[14px] h-[14px]" />
									</button>
								</div>
							</div>
						</div>

						{/* Scroll area: PO boxes */}
						<div
							className=" overflow-y-auto no-scrollbar scrollbar-none flex-shrink-0"
							style={{ maxHeight: 'calc(100vh - 310px)' }}
						>
							<div className=" rounded-[10px] border border-[#E5E7EB] p-[10px]">
								<div className="grid grid-cols-4 gap-[10px]">
									{verifyBoxes.map((v, i) => {
										const isNoPo = !!noPoSelections?.[i];
										const displayValue = isNoPo ? '' : (v || '');
										const vState = poValidation?.[i];
										const isDup = !!duplicateSelections?.[i];
										const persisted = (selectedVerifyBill?.billVerifications || selectedVerifyBill?.bill_verifications || [])?.[i];
										const persistedIsVerified = persisted?.is_verified === true || persisted?.status === 'VERIFIED';
										const persistedIsPaid = persisted?.is_paid === true || persisted?.status === 'PAID';

										// Exact desktop border colors (Tailwind -500 equivalents)
										const C = {
											neutral: '#D1D5DB', // gray-300
											green: '#22C55E',   // green-500
											red: '#EF4444',     // red-500
											yellow: '#EAB308',  // yellow-500
											purple: '#A855F7',  // purple-500
											orange: '#F97316'   // orange-500
										};

										// Match desktop renderInputFields: fresh Check PO (poValidation) must win over
										// persisted row flags — otherwise persistedIsPaid keeps yellow and hides match/red.
										let borderColor = C.neutral;
										if ((isDup && (persistedIsVerified || vState?.matched === true || isNoPo))) {
											borderColor = C.purple;
										} else if (vState) {
											if (vState.matched === true) {
												const billForPaid = String(displayValue || '').trim();
												const paidPreviously =
													!isNoPo && !!billForPaid && persistedIsPaid;
												borderColor = paidPreviously ? C.yellow : C.green;
											} else if (vState.message === 'Already Entered') {
												borderColor = C.orange;
											} else {
												borderColor = C.red;
											}
										} else if (isNoPo) {
											borderColor = C.green;
										} else if (persistedIsPaid) {
											borderColor = C.yellow;
										} else if (persisted) {
											borderColor = persistedIsVerified ? C.green : C.red;
										}

										// Tinted background always matches border status (incl. Check PO on empty slots).
										const BG = {
											white: '#FFFFFF',
											green: '#E2F9E1',
											red: '#FEE2E2',
											yellow: '#FEF9C3',
											purple: '#F3E8FF',
											orange: '#FFEDD5'
										};
										let bgColor = BG.white;
										if (borderColor === C.green) bgColor = BG.green;
										else if (borderColor === C.red) bgColor = BG.red;
										else if (borderColor === C.yellow) bgColor = BG.yellow;
										else if (borderColor === C.purple) bgColor = BG.purple;
										else if (borderColor === C.orange) bgColor = BG.orange;

										return (
											<div key={i} className="flex flex-col gap-[6px]">
												{isEditMode ? (
													<>
														<input
															value={displayValue}
															onChange={(e) => {
																const numericValue = String(e.target.value || '').replace(/[^0-9]/g, '');
																setVerifyBoxes((prev) => {
																	const next = [...(prev || [])];
																	next[i] = numericValue;
																	return next;
																});
																if (numericValue) {
																	setNoPoSelections((prev) => {
																		if (!prev?.[i]) return prev || {};
																		const next = { ...(prev || {}) };
																		delete next[i];
																		return next;
																	});
																}
																setCheckedBills((prev) => {
																	const next = { ...(prev || {}) };
																	delete next[i];
																	return next;
																});
																setPoValidation((prev) => {
																	const next = { ...(prev || {}) };
																	delete next[i];
																	return next;
																});
															}}
															placeholder="Enter"
															className="h-[34px] rounded-[6px] border text-[12px] font-semibold text-center outline-none"
															style={{ borderColor, background: bgColor }}
														/>
														{isAdminUser() && !isDuplicateMode && (
															<label className="flex items-center justify-center gap-[6px] text-[11px] font-medium text-black">
																<input
																	type="checkbox"
																	checked={!!noPoSelections?.[i]}
																	onChange={(e) => {
																		const checked = e.target.checked;
																		setNoPoSelections((prev) => ({ ...(prev || {}), [i]: checked }));
																		if (checked) {
																			setVerifyBoxes((prev) => {
																				const next = [...(prev || [])];
																				next[i] = '';
																				return next;
																			});
																			setCheckedBills((prev) => ({ ...(prev || {}), [i]: true }));
																			setPoValidation((prev) => ({ ...(prev || {}), [i]: { matched: true, message: 'No PO - Verified' } }));
																		} else {
																			setCheckedBills((prev) => {
																				const next = { ...(prev || {}) };
																				delete next[i];
																				return next;
																			});
																			setPoValidation((prev) => {
																				const next = { ...(prev || {}) };
																				delete next[i];
																				return next;
																			});
																		}
																	}}
																/>
																<span>No PO</span>
															</label>
														)}
														{isDuplicateMode && (
															<label className="flex items-center justify-center gap-[6px] text-[11px] font-medium text-black">
																<input
																	type="checkbox"
																	checked={!!duplicateSelections?.[i]}
																	onChange={(e) => {
																		const checked = e.target.checked;
																		setDuplicateSelections((prev) => ({ ...(prev || {}), [i]: checked }));
																		updateDuplicateStatus(i, checked);
																	}}
																/>
																<span>Duplicate</span>
															</label>
														)}
													</>
												) : (
													<div
														className="h-[34px] rounded-[4px] border flex items-center justify-center text-[12px] font-semibold"
														onClick={() => {
															if (!isDuplicateMode) return;
															const nextChecked = !(duplicateSelections?.[i] || false);
															setDuplicateSelections((prev) => ({ ...(prev || {}), [i]: nextChecked }));
															// Desktop behavior: persist duplicate flag immediately when a bill verification exists.
															updateDuplicateStatus(i, nextChecked);
														}}
														style={{
															borderColor,
															background: bgColor,
															color: '#111827',
															cursor: isDuplicateMode ? 'pointer' : 'default'
														}}
													>
														{isNoPo ? 'NO PO' : (displayValue || 'Enter')}
													</div>
												)}

											</div>
										);
									})}
								</div>
							</div>
							<div className="h-[10px]" />
						</div>

						{/* Bottom actions (pinned) */}
						<div className=" pb-[16px] flex-shrink-0 bg-white">
							<div className={` grid ${isEditMode ? 'grid-cols-2' : 'grid-cols-1'} gap-[10px]`}>
								<button
									type="button"
									onClick={checkPO}
									disabled={checkingPO}
									className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black disabled:opacity-50"
								>
									{checkingPO ? 'Checking...' : 'Check PO'}
								</button>
								{isEditMode && (
									<button
										type="button"
										onClick={makeDuplicate}
										className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
									>
										{isDuplicateMode ? 'Duplicate Mode' : 'No Po Mode'}
									</button>
								)}
							</div>

							{isAdminUser() && (selectedVerifyBill?.send_request || selectedVerifyBill?.sendRequest) && !(selectedVerifyBill?.request_approved || selectedVerifyBill?.requestApproved) && (
								<div className="mt-[10px] grid grid-cols-2 gap-[10px]">
									<button
										type="button"
										onClick={handleApproveRequest}
										disabled={submittingVerify}
										className="h-[40px] rounded-[10px] bg-[#16A34A] text-white text-[13px] font-semibold disabled:opacity-70"
									>
										Approve
									</button>
									<button
										type="button"
										onClick={handleRejectRequest}
										disabled={submittingVerify}
										className="h-[40px] rounded-[10px] bg-[#DC2626] text-white text-[13px] font-semibold disabled:opacity-70"
									>
										Reject
									</button>
								</div>
							)}

							<button
								type="button"
								onClick={() => saveBills({ sendRequest: false })}
								disabled={submittingVerify}
								className="mt-[10px] w-full h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold disabled:opacity-70"
							>
								{submittingVerify ? 'Submitting...' : 'Submit'}
							</button>
						</div>

						{/* Fill Range bottom sheet */}
						{showFillRangeSheet && (
							<div className="fixed inset-0 z-[1000]">
								<button
									type="button"
									className="absolute inset-0 bg-black/60"
									onClick={() => setShowFillRangeSheet(false)}
									aria-label="Close"
								/>
								<div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[18px]">
									<div className="flex items-center justify-between">
										<p className="text-[14px] font-semibold text-black">Fill Range</p>
										<button
											type="button"
											onClick={() => setShowFillRangeSheet(false)}
											className="w-[28px] h-[28px] flex items-center justify-center text-[#F97316] text-[18px] font-bold"
											aria-label="Close"
										>
											×
										</button>
									</div>

									<div className="mt-[12px] grid grid-cols-2 gap-[14px]">
										<div>
											<p className="text-[12px] font-semibold text-black mb-[6px]">Start Range</p>
											<input
												value={rangeStart}
												onChange={(e) => setRangeStart(e.target.value.replace(/[^0-9]/g, ''))}
												placeholder="Enter"
												className="w-full h-[40px] border border-[#D1D5DB] rounded-[8px] text-[13px] font-semibold px-[10px] outline-none"
											/>
										</div>
										<div>
											<p className="text-[12px] font-semibold text-black mb-[6px]">End Range</p>
											<input
												value={rangeEnd}
												onChange={(e) => setRangeEnd(e.target.value.replace(/[^0-9]/g, ''))}
												placeholder="Enter"
												className="w-full h-[40px] border border-[#D1D5DB] rounded-[8px] text-[13px] font-semibold px-[10px] outline-none"
											/>
										</div>
									</div>

									<div className="mt-[14px] grid grid-cols-2 gap-[12px]">
										<button
											type="button"
											onClick={() => setShowFillRangeSheet(false)}
											className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-semibold text-black"
										>
											Cancel
										</button>
										<button
											type="button"
											onClick={() => {
												fillRange();
												setShowFillRangeSheet(false);
											}}
											className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
										>
											Fill Range
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
			{/* Floating action button */}
			<button
				type="button"
				onClick={openAddSheet}
				className="fixed right-[20px] bottom-[92px] w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center shadow-lg"
				aria-label="Add"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M12 5V19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
					<path d="M5 12H19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
				</svg>
			</button>

			{/* Add bottom sheet (mobile) */}
			{showAddSheet && (
				<div className={`fixed inset-0 ${showReceivedDatePicker ? 'z-[40]' : 'z-[999]'} flex items-end justify-center`}>
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Close"
						onClick={closeAddSheet}
					/>
					<div className="relative w-full bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[16px]">
						<div className="flex items-center justify-between">
							<p className="text-[14px] font-semibold text-black">Enter Bill Details</p>
							<button
								type="button"
								onClick={closeAddSheet}
								className="w-[28px] h-[28px] flex items-center justify-center"
								aria-label="Close"
							>
								<span className="text-[20px] leading-none font-semibold text-[#E4572E]">
									<img src={Close} alt="Close" className="w-[11px] h-[11px]" />
								</span>
							</button>
						</div>

						<div className="mt-[10px] flex flex-col gap-[10px]">
							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Vendor Name</p>
								<div className="relative">
									<div
										role="button"
										tabIndex={0}
										onClick={() => setShowVendorPicker(true)}
										onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowVendorPicker(true); }}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] pr-[34px] text-[12px] font-medium flex items-center cursor-pointer"
										style={{ color: selectedVendorNameForSheet ? '#111827' : '#9E9E9E' }}
									>
										<span className="truncate">{selectedVendorNameForSheet || 'Select Vendor'}</span>
									</div>
									{selectedVendorNameForSheet ? (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setAddForm((p) => ({ ...p, vendorId: '' }));
											}}
											className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
											aria-label="Clear"
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

							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Received Date</p>
								<div className="relative">
									<div
										role="button"
										tabIndex={0}
										onClick={() => setShowReceivedDatePicker(true)}
										onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowReceivedDatePicker(true); }}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] pr-[34px] text-[12px] font-medium flex items-center cursor-pointer"
										style={{ color: addForm.receivedDate ? '#111827' : '#9E9E9E' }}
									>
										<span className="truncate">
											{addForm.receivedDate ? String(addForm.receivedDate).replaceAll('/', '-') : 'dd-mm-yyyy'}
										</span>
									</div>
									<div className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
											<path d="M7 10h10" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M7 14h7" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M8 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M16 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
										</svg>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-[10px]">
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">No. of Bills</p>
									<input
										type="number"
										value={addForm.noOfBills}
										onChange={(e) => setAddForm((p) => ({ ...p, noOfBills: e.target.value }))}
										onKeyDown={(e) => { if (e.key === 'Enter') submitNewTracker(); }}
										placeholder="Enter Bill Count"
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">Total Amount</p>
									<input
										type="number"
										value={addForm.totalAmount}
										onChange={(e) => setAddForm((p) => ({ ...p, totalAmount: e.target.value }))}
										onKeyDown={(e) => { if (e.key === 'Enter') submitNewTracker(); }}
										placeholder="Enter Amount"
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
							</div>

							<div className="mt-[4px] grid grid-cols-2 gap-[12px] mb-[10px]">
								<button
									type="button"
									onClick={closeAddSheet}
									className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={submitNewTracker}
									className="h-[40px] rounded-[10px] bg-black text-[13px] font-semibold text-white"
								>
									Submit
								</button>
							</div>
						</div>
					</div>

					{/* Vendor picker popup (same behavior style as ToolsTracker dropdown popup) */}
					{showVendorPicker && (
						<div
							className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center p-4"
							onClick={(e) => {
								if (e.target === e.currentTarget) {
									setShowVendorPicker(false);
									setVendorPickerQuery('');
								}
							}}
						>
							<div
								className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col"
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
							>
								<div className="flex justify-between items-center px-6 pt-[24px]">
									<p className="text-[16px] font-semibold text-black">Select Vendor</p>
									<button
										type="button"
										onClick={() => { setShowVendorPicker(false); setVendorPickerQuery(''); }}
										className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
										aria-label="Close"
									>
										<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
									</button>
								</div>
								<div className="px-6 pt-[4px] pb-[6px]">
									<div className="relative">
										<input
											type="text"
											value={vendorPickerQuery}
											onChange={(e) => setVendorPickerQuery(e.target.value)}
											placeholder="Search"
											className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
											autoFocus
										/>
										<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
											<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
												<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
												<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
											</svg>
										</div>
									</div>
								</div>
								<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
									<div className="shadow-md rounded-lg overflow-hidden">
										{filteredVendorOptionsForSheet.length > 0 ? (
											<div className="space-y-0">
												{filteredVendorOptionsForSheet.map((v) => (
													<button
														key={v.id}
														type="button"
														onClick={() => {
															setAddForm((p) => ({ ...p, vendorId: v.id }));
															setShowVendorPicker(false);
															setVendorPickerQuery('');
														}}
														className={`w-full px-[16px] flex items-center gap-3 transition-colors ${String(addForm.vendorId) === String(v.id) ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
														style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
													>
														<p className="text-[12px] font-medium text-black text-left">{v.name}</p>
													</button>
												))}
											</div>
										) : (
											<div className="flex flex-col items-center justify-center py-4">
												<p className="text-[14px] font-medium text-[#9E9E9E] text-center">
													{vendorPickerQuery ? 'No options found' : 'No options available'}
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Received Date picker (same as ToolsTracker wheel modal) */}
			{/* Global Bank Details modal (must float above all screens) */}
			{showBankDetailsModal && (
				<div
					className="fixed inset-0 bg-black/60 flex items-center justify-center px-[14px]"
					style={{ zIndex: 99999 }}
					onClick={(e) => {
						if (e.target === e.currentTarget) closeBankDetailsModal();
					}}
				>
					<div className="w-full max-w-[360px] bg-white rounded-[14px] border border-[#E5E7EB] overflow-hidden shadow-xl">
						<div className="px-[16px] pt-[16px] pb-[10px] flex items-center justify-between">
							<p className="text-[18px] font-semibold text-black">Bank Details</p>
							<button
								type="button"
								onClick={closeBankDetailsModal}
								className="w-[36px] h-[36px] flex items-center justify-center"
								aria-label="Close"
							>
								<span className="text-[22px] leading-none font-semibold text-[#E4572E]">×</span>
							</button>
						</div>
						<div className="px-[16px] pb-[16px]">
							{loadingVendorBankDetails && !selectedVendorAccountDetails ? (
								<p className="text-[12px] text-center text-[#6B7280]">Loading…</p>
							) : null}
							{(() => {
								const d = selectedVendorAccountDetails || {};
								const Icon = ({ kind }) => {
									const cls = "w-[16px] h-[16px] text-[#6B7280]";
									if (kind === 'user') return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
											<path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
										</svg>
									);
									if (kind === 'bank') return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
											<path d="M5 10V20M9 10V20M15 10V20M19 10V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
											<path d="M4 7l8-4 8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
										</svg>
									);
									if (kind === 'card') return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M3 7h18v10H3V7Z" stroke="currentColor" strokeWidth="2" />
											<path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
										</svg>
									);
									if (kind === 'tag') return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M20 13l-7 7-11-11V2h7l11 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
											<path d="M7.5 7.5h0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
										</svg>
									);
									if (kind === 'pin') return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
											<path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
										</svg>
									);
									if (kind === 'phone') return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
										</svg>
									);
									// mail
									return (
										<svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="2" />
											<path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
										</svg>
									);
								};

								const CopyIcon = () => (
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<path d="M9 9h10v12H9V9Z" stroke="currentColor" strokeWidth="2" />
										<path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" />
									</svg>
								);

								const Row = ({ label, value, iconKind }) => (
									<div className="flex items-start justify-between gap-[10px] py-[12px] border-b border-[#EEE] last:border-b-0">
										<div className="flex items-start gap-[10px] min-w-0">
											<div className="mt-[2px]">{Icon({ kind: iconKind })}</div>
											<div className="min-w-0">
												<p className="text-[12px] font-medium text-[#6B7280] leading-tight">{label}</p>
												<p className="text-[14px] font-semibold text-black break-words mt-[2px]">{value || '-'}</p>
											</div>
										</div>
										<button
											type="button"
											onClick={() => copyText(value)}
											className="w-[32px] h-[32px] rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] flex-shrink-0"
											aria-label={`Copy ${label}`}
										>
											<CopyIcon />
										</button>
									</div>
								);
								return (
									<div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden bg-white">
										<div className="px-[14px]">
											<Row label="Account Holder Name" value={d?.account_holder_name} iconKind="user" />
											<Row label="Bank Name" value={d?.bank_name} iconKind="bank" />
											<Row label="Account Number" value={d?.account_number} iconKind="card" />
											<Row label="IFSC Code" value={d?.ifsc_code} iconKind="tag" />
											<Row label="Branch Name" value={d?.branch} iconKind="pin" />
											<Row label="Contact Number" value={d?.contact_number} iconKind="phone" />
											<Row label="Contact Email" value={d?.contact_email} iconKind="mail" />
										</div>
									</div>
								);
							})()}
						</div>
					</div>
				</div>
			)}

			{/* Edit bottom sheet (mobile) */}
			{showEditSheet && (
				<div className={`fixed inset-0 ${showEditReceivedDatePicker ? 'z-[40]' : 'z-[999]'} flex items-end justify-center`}>
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Close"
						onClick={closeEditSheet}
					/>
					<div className="relative w-full bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[16px]">
						<div className="flex items-center justify-between">
							<p className="flex-1 text-left text-[14px] font-semibold text-black">Edit Tracker Details</p>
							<button
								type="button"
								onClick={closeEditSheet}
								className="w-[28px] h-[28px] flex items-center justify-center"
								aria-label="Close"
							>
								<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
							</button>
						</div>

						<div className="mt-[10px] flex flex-col gap-[10px] text-left">
							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Received Date</p>
								<div className="relative">
									<div
										role="button"
										tabIndex={0}
										onClick={() => setShowEditReceivedDatePicker(true)}
										onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowEditReceivedDatePicker(true); }}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] pr-[34px] text-[12px] font-medium flex items-center cursor-pointer"
										style={{ color: editForm.receivedDate ? '#111827' : '#9E9E9E' }}
									>
										<span className="truncate">
											{editForm.receivedDate ? String(editForm.receivedDate).replaceAll('/', '-') : 'dd-mm-yyyy'}
										</span>
									</div>
									<div className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
											<path d="M7 10h10" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M7 14h7" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M8 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M16 3v3" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
										</svg>
									</div>
								</div>
							</div>

							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Vendor Name</p>
								<div className="relative">
									<div
										role="button"
										tabIndex={0}
										onClick={() => setShowEditVendorPicker(true)}
										onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowEditVendorPicker(true); }}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] pr-[34px] text-[12px] font-medium flex items-center cursor-pointer"
										style={{ color: selectedVendorNameForEditSheet ? '#111827' : '#9E9E9E' }}
									>
										<span className="truncate">{selectedVendorNameForEditSheet || 'Select Vendor'}</span>
									</div>
									<div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
										<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-[10px]">
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">Number of bills</p>
									<input
										type="number"
										value={editForm.noOfBills}
										onChange={(e) => setEditForm((p) => ({ ...p, noOfBills: e.target.value }))}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">Extra Bills (PO)</p>
									<input
										type="number"
										value={editForm.extraBills}
										onChange={(e) => setEditForm((p) => ({ ...p, extraBills: e.target.value }))}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
							</div>

							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Total Amount</p>
								<input
									type="number"
									value={editForm.totalAmount}
									onChange={(e) => setEditForm((p) => ({ ...p, totalAmount: e.target.value }))}
									className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
								/>
							</div>

							<div className="mt-[4px] grid grid-cols-2 gap-[12px]">
								<button
									type="button"
									onClick={closeEditSheet}
									disabled={editLoading}
									className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black disabled:opacity-50"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={submitEditTracker}
									disabled={editLoading}
									className="h-[40px] rounded-[10px] bg-black text-white text-[13px] font-semibold disabled:opacity-50"
								>
									{editLoading ? 'Updating...' : 'Update'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit vendor picker popup */}
			{showEditVendorPicker && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-[1307] flex items-center justify-center p-4"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setShowEditVendorPicker(false);
							setEditVendorPickerQuery('');
						}
					}}
				>
					<div
						className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between items-center px-6 pt-[20px] pb-[10px]">
							<p className="text-[16px] font-semibold text-black">Select Vendor</p>
							<button
								type="button"
								onClick={() => {
									setShowEditVendorPicker(false);
									setEditVendorPickerQuery('');
								}}
								className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
								aria-label="Close"
							>
								<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
							</button>
						</div>
						<div className="px-6 pt-[4px] pb-[6px]">
							<div className="relative">
								<input
									type="text"
									value={editVendorPickerQuery}
									onChange={(e) => setEditVendorPickerQuery(e.target.value)}
									placeholder="Search"
									className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
									autoFocus
								/>
								<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
										<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
										<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
									</svg>
								</div>
							</div>
						</div>
						<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
							<div className="shadow-md rounded-lg overflow-hidden">
								{filteredVendorOptionsForEditSheet.length > 0 ? (
									<div className="space-y-0">
										{filteredVendorOptionsForEditSheet.map((v) => (
											<button
												key={v.id}
												type="button"
												onClick={() => {
													setEditForm((p) => ({ ...p, vendorId: v.id }));
													setShowEditVendorPicker(false);
													setEditVendorPickerQuery('');
												}}
												className={`w-full px-[16px] flex items-center gap-3 transition-colors ${String(editForm.vendorId) === String(v.id) ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
												style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
											>
												<p className="text-[12px] font-medium text-black text-left">{v.name}</p>
											</button>
										))}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-4">
										<p className="text-[14px] font-medium text-[#9E9E9E] text-center">
											{editVendorPickerQuery ? 'No options found' : 'No options available'}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
			{showVendorPopup && (
				<div
					className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
					onClick={() => setShowVendorPopup(false)}
				>
					<div
						className="bg-white w-[92%] max-w-[360px] h-[80vh] rounded-[20px] p-4 flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-[16px] font-semibold">Select Vendor</h2>
							<span
								className=" cursor-pointer"
								onClick={() => setShowVendorPopup(false)}
							>
								<img src={Close} alt="Close" className="w-[11px] h-[11px]" />
							</span>
						</div>

						<div className="mb-3 relative">
							<img
								src={Search}
								alt="search"
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[12px] h-[12px] opacity-60"
							/>

							<input
								type="text"
								placeholder="Search"
								className="w-full pl-[30px] pr-3 py-2 border rounded-[10px] text-[13px] outline-none"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{/* Vendor List Card */}
						<div className=" rounded-[12px] shadow-sm overflow-y-auto no-scrollbar scrollbar-none">
							{vendorList.length > 0 ? (
								vendorList
									.filter(v =>
										v.name.toLowerCase().includes(search.toLowerCase())
									)
									.map((vendor) => (
										<div
											key={vendor.id}
											className="flex items-center gap-3 p-3 rounded-[10px] cursor-pointer hover:bg-gray-100"
											onClick={() => {
												setSelectedVendor(vendor.name);
												setShowVendorPopup(false);
											}}
										>
											{/* ⭐ Star Icon */}
											<img src={Star} alt="Star" className="w-[16px] h-[16px]" />

											{/* Vendor Name */}
											<span className="text-[14px] text-gray-800">
												{vendor.name}
											</span>
										</div>
									))
							) : (
								<p className="text-sm text-gray-400 text-center py-4">
									No vendors found
								</p>
							)}
						</div>
					</div>
				</div>
			)}
			{showDiscountSheet && (
				<div className="fixed inset-0 z-[1308] flex items-end justify-center">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						onClick={() => setShowDiscountSheet(false)}
					/>

					<div className="relative w-full bg-white rounded-t-[18px] pt-[16px] pb-[20px] px-[16px]">
						<div className="flex items-center justify-between">
							<p className="text-[16px] font-semibold text-black">Enter Discount</p>

							<button
								type="button"
								onClick={() => setShowDiscountSheet(false)}
								className="text-[20px] font-semibold text-[#E4572E]"
							>
								×
							</button>
						</div>

						<div className="mt-[16px]">
							<p className="text-[12px] font-semibold text-black mb-[6px]">
								Discount Amount
							</p>

							<input
								type="number"
								value={discountInputValue}
								onChange={(e) =>
									setDiscountInputValue(
										String(e.target.value || '').replace(/\D/g, '')
									)
								}
								placeholder="Enter Discount"
								className="w-full h-[42px] border border-[#D1D5DB] rounded-[8px] px-[12px] text-[13px] font-medium outline-none"
							/>
						</div>

						<div className="mt-[18px] grid grid-cols-2 gap-[12px]">
							<button
								type="button"
								onClick={() => setShowDiscountSheet(false)}
								className="h-[44px] rounded-[10px] border border-[#D1D5DB] bg-white text-[14px] font-semibold text-black"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={() => {
									setDiscount(Number(discountInputValue) || 0);
									setShowDiscountSheet(false);
								}}
								className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Edit received date picker */}
			<DatePickerModal
				isOpen={showEditReceivedDatePicker}
				onClose={() => setShowEditReceivedDatePicker(false)}
				onConfirm={(formattedDate) => {
					setEditForm((p) => ({ ...p, receivedDate: formattedDate }));
					setShowEditReceivedDatePicker(false);
				}}
				initialDate={getEditReceivedDateInitialForModal()}
			/>
			<DatePickerModal
				isOpen={showDatePicker}
				onClose={() => setShowDatePicker(false)}
				onConfirm={(formattedDate) => {
					setSelectedDate(formattedDate);
					setShowDatePicker(false);
				}}
				initialDate={selectedDate}
			/>

			<div className="bpt-received-date-picker">
				<style>{`
					/* Keep the date picker overlay above the app header/tabs (don't let header float above it) */
					.bpt-received-date-picker .fixed.inset-0.z-50 { z-index: 1200 !important; }
				`}</style>
				<DatePickerModal
					isOpen={showReceivedDatePicker}
					onClose={() => setShowReceivedDatePicker(false)}
					onConfirm={(formattedDate) => {
						setAddForm((p) => ({ ...p, receivedDate: formattedDate }));
						setShowReceivedDatePicker(false);
					}}
					initialDate={getReceivedDateInitialForModal()}
				/>
			</div>
		</div>
	);
};

export default PendingBillMobile;

