import React, { useEffect, useMemo, useRef, useState } from 'react';
import Filter from '../Images/Filter.png';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';
import BackIcon from '../Images/BAck Icon.svg';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Chip = ({ label, tone = 'neutral', onClick }) => {
	const toneStyles =
		tone === 'success'
			? { bg: '#E2F9E1', text: '#1E8E3E', border: '#E2F9E1' }
			: tone === 'warn'
				? { bg: '#FFD39E', text: '#111827', border: '#FFD39E' }
					: { bg: '#FAF6ED', text: '#111827', border: '#D1D5DB' };

	if (typeof onClick === 'function') {
		return (
			<button
				type="button"
				onClick={onClick}
				className="px-[8px] py-[2px] rounded-full text-[10px] font-medium inline-flex items-center gap-[4px] border cursor-pointer"
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
			className="px-[8px] py-[2px] rounded-full text-[10px] font-medium inline-flex items-center gap-[4px] border"
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

const Row = ({ name, amount, billsCount, subLineNode, statusLeft, statusMid, statusRight, onAmountClick }) => (
	<div className="bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] overflow-hidden px-[12px] py-[10px]">
		<div className="flex items-start justify-between">
			<div className="flex flex-col min-w-0">
				<p className="text-left text-[13px] font-semibold text-[#111827] leading-[18px] truncate">{name || '-'}</p>
				<p className="text-[10px] font-semibold text-[#6B7280] leading-[14px] mt-[2px]">
					{subLineNode || ''}
				</p>
			</div>
			<div className="text-right flex-shrink-0 ml-[10px]">
				{typeof onAmountClick === 'function' ? (
					<button
						type="button"
						onClick={onAmountClick}
						className="text-[13px] font-bold text-[#111827] leading-[18px]"
						style={{ textDecoration: 'underline' }}
					>
						₹{amount?.toLocaleString?.('en-IN') || amount || '0'}
					</button>
				) : (
					<p className="text-[13px] font-bold text-[#111827] leading-[18px]">₹{amount?.toLocaleString?.('en-IN') || amount || '0'}</p>
				)}
				<p className="text-[10px] font-semibold text-[#6B7280] leading-[14px] mt-[2px]">No.of bills: {billsCount ?? '-'}</p>
			</div>
		</div>
		<div className="flex items-center gap-[8px] mt-[10px] flex-wrap">
			{statusLeft}
			{statusMid}
			{statusRight}
		</div>
	</div>
);

const DatabaseMobile = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [apiData, setApiData] = useState([]);
	const [vendorMap, setVendorMap] = useState({});
	const [query, setQuery] = useState('');
	const [showFilterSheet, setShowFilterSheet] = useState(false);
	const [filterFromDate, setFilterFromDate] = useState(''); // YYYY-MM-DD
	const [filterToDate, setFilterToDate] = useState(''); // YYYY-MM-DD
	const [expandedRowId, setExpandedRowId] = useState(null);
	const [swipeStates, setSwipeStates] = useState({}); // { [id]: { startX, startY, currentX, currentY, isSwiping } }
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [editTarget, setEditTarget] = useState(null);
	const [editForm, setEditForm] = useState({
		vendorId: '',
		receivedDate: '',
		noOfBills: '',
		totalAmount: ''
	});
	const expandedRowIdRef = useRef(expandedRowId);
	useEffect(() => { expandedRowIdRef.current = expandedRowId; }, [expandedRowId]);

	// Detail screens (Verified / Entered / Paid)
	const [activeFullScreen, setActiveFullScreen] = useState(null); // null | 'verify' | 'entry' | 'bank'
	const [detailRow, setDetailRow] = useState(null);
	const [allBillEntries, setAllBillEntries] = useState([]);
	const [expensesData, setExpensesData] = useState([]);
	const [bankDetails, setBankDetails] = useState([]);
	const [loadingBankDetails, setLoadingBankDetails] = useState(false);
	const [bankDetailsError, setBankDetailsError] = useState(null);
	const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
	const [selectedVendorAccountDetails, setSelectedVendorAccountDetails] = useState(null);
	const [loadingVendorBankDetails, setLoadingVendorBankDetails] = useState(false);
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (isMounted) {
				setLoading(true);
				setError(null);
			}
			try {
				// Backend already filters to only fully paid rows.
				const res = await fetch('https://backendaab.in/aabuildersDash/api/vendor-payments/trackers/enriched/paid', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) {
					const msg = await res.text().catch(() => '');
					throw new Error(msg || `Failed to load (${res.status})`);
				}
				const text = await res.text();
				let data = [];
				try { data = JSON.parse(text); } catch (e) { data = []; }
				if (isMounted) setApiData(Array.isArray(data) ? data : []);
			} catch (e) {
				if (isMounted) {
					setApiData([]);
					setError(e?.message || 'Failed to load');
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		load();
		return () => { isMounted = false; };
	}, []);
	useEffect(() => {
		let isMounted = true;
		const loadVendors = async () => {
			try {
				const res = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!res.ok) return;
				const data = await res.json();
				const map = {};
				(Array.isArray(data) ? data : []).forEach((v) => {
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
		loadVendors();
		return () => { isMounted = false; };
	}, []);

	const getVendorNameById = (vendorId) => {
		if (!vendorId && vendorId !== 0) return '-';
		return vendorMap[vendorId] || vendorMap[String(vendorId)] || '-';
	};

	const formatIndianCurrency = (amount) => {
		const n = Number(amount || 0);
		if (!Number.isFinite(n)) return '₹0';
		return `₹${n.toLocaleString('en-IN')}`;
	};

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

	const openUrl = (url) => {
		if (!url) return;
		const s = String(url || '').trim();
		if (!/^(https?:\/\/)/i.test(s)) return;
		window.open(s, '_blank', 'noopener,noreferrer');
	};

	/** Parse API date fields: ISO string, DD/MM/YYYY, millis, or Jackson LocalDateTime array [y,m,d,h,mi,s]. */
	const parseTrackerDateValue = (input) => {
		if (input == null || input === '') return null;
		if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
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

	const getBillCardDateLineParts = (row) => {
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

	const fetchSelectedVendorAccountDetails = async (vendorId) => {
		try {
			setLoadingVendorBankDetails(true);
			const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
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

	const openBankDetailsModal = () => {
		setShowBankDetailsModal(true);
		const vendorId = detailRow?.vendor_id ?? detailRow?.vendorId ?? null;
		if (vendorId != null) fetchSelectedVendorAccountDetails(vendorId);
	};

	const closeBankDetailsModal = () => setShowBankDetailsModal(false);

	const formatRelativeDateLabel = (input) => {
		if (!input) return '';
		try {
			const d0 = new Date(input);
			if (isNaN(d0.getTime())) return '';
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const dateOnly = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
			if (dateOnly.getTime() === today.getTime()) return 'Today';
			if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
			const dd = String(d0.getDate()).padStart(2, '0');
			const mm = String(d0.getMonth() + 1).padStart(2, '0');
			const yyyy = d0.getFullYear();
			return `${dd}/${mm}/${yyyy}`;
		} catch {
			return '';
		}
	};

	const formatBillArrival = (input) => {
		if (!input) return '';
		const d = new Date(input);
		if (isNaN(d.getTime())) return '';
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const HH = String(d.getHours()).padStart(2, '0');
		const MM = String(d.getMinutes()).padStart(2, '0');
		const SS = String(d.getSeconds()).padStart(2, '0');
		const rel = formatRelativeDateLabel(input) || '';
		return `${rel} • ${dd}/${mm}/${yyyy}, ${HH}:${MM}:${SS}`;
	};

	const getBillVerificationStatus = (item) => {
		// Prefer backend enriched field if present.
		const backend = item?.verification_status;
		if (backend === '✓ Verified' || backend === 'Verified' || backend === 'To Verify') return backend;

		const verifications = item?.billVerifications || item?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return 'Verify';
		const allVerified = verifications.every(v => v?.is_verified === true || v?.status === 'VERIFIED');
		const anyVerified = verifications.some(v => v?.is_verified === true || v?.status === 'VERIFIED');
		if (allVerified) return '✓ Verified';
		if (anyVerified) return 'Verified';
		return 'Verify';
	};

	// Load bill entries + expenses (for Entered details screen)
	useEffect(() => {
		let isMounted = true;
		const loadSupportData = async () => {
			try {
				const [beRes, exRes] = await Promise.all([
					fetch('https://backendaab.in/aabuildersDash/api/bill-entry/getAll', {
						method: 'GET',
						credentials: 'include',
						headers: { 'Content-Type': 'application/json' }
					}),
					fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form', {
						method: 'GET',
						credentials: 'include',
						headers: { 'Content-Type': 'application/json' }
					})
				]);
				if (beRes.ok) {
					const be = await beRes.json().catch(() => []);
					if (isMounted) setAllBillEntries(Array.isArray(be) ? be : []);
				}
				if (exRes.ok) {
					const ex = await exRes.json().catch(() => []);
					if (isMounted) setExpensesData(Array.isArray(ex) ? ex : []);
				}
			} catch {
				// ignore
			}
		};
		loadSupportData();
		return () => { isMounted = false; };
	}, []);

	const getEntryStatusText = (item) => {
		// Prefer backend enriched field if present.
		const backend = item?.entry_status;
		if (backend === '✓ Entered' || backend === 'Entered' || backend === 'Entry') return backend;
		return 'Entry';
	};

	const getPaymentStatusText = (item) => {
		const backend = item?.payment_status;
		if (backend === '✓ Paid' || backend === 'Paid' || backend === 'To Pay') return backend;
		// This screen is paid-only, so default to ✓ Paid.
		return '✓ Paid';
	};

	const fullScreenHeaderSubTitle = useMemo(() => {
		const b = detailRow;
		if (!b) return '';
		const d = b?.bill_arrival_date ?? b?.billArrivalDate;
		// Match PendingBill.jsx: show only date line (no vendor)
		const dateStr = d ? formatBillArrival(d) : '';
		return `${dateStr}`;
	}, [detailRow, vendorMap]);

	const renderTopBar = (title, onBack, rightNode = null) => (
		<div className="">
			<div className="flex items-start justify-between gap-[10px]">
				<div className="flex items-center gap-[10px]">
					<button type="button" onClick={onBack} className="w-[28px] h-[28px] flex items-center justify-center" aria-label="Back">
						<img src={BackIcon} alt="Back" className="w-[18px] h-[18px]" />
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

	const bankSummaryDetails = useMemo(() => {
		const totalPayable = Number(detailRow?.total_amount ?? detailRow?.totalAmount ?? 0) || 0;
		const rows = Array.isArray(bankDetails) ? bankDetails : [];
		const receivedAmount = rows.reduce((sum, p) => sum + (Number(p?.amount || 0) || 0) + (Number(p?.carry_forward_amount || 0) || 0), 0);
		const discountAmount = rows.reduce((sum, p) => sum + (Number(p?.discount_amount || 0) || 0), 0);
		const netPayable = Math.max(0, totalPayable - receivedAmount - discountAmount);
		return { totalPayable, receivedAmount, discountAmount, netPayable };
	}, [detailRow, bankDetails]);

	const hydrateTrackerDetails = async (row) => {
		const id = row?.id;
		if (!id) return row;
		try {
			const res = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${id}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) return row;
			const trackerData = await res.json().catch(() => null);
			if (!trackerData || typeof trackerData !== 'object') return row;
			return { ...row, ...trackerData };
		} catch {
			return row;
		}
	};

	const openVerifyDetails = (row) => {
		(async () => {
			const hydrated = await hydrateTrackerDetails(row);
			setDetailRow(hydrated || null);
			setActiveFullScreen('verify');
		})();
	};
	const openEntryDetails = (row) => {
		(async () => {
			const hydrated = await hydrateTrackerDetails(row);
			setDetailRow(hydrated || null);
			setActiveFullScreen('entry');
		})();
	};
	const openBankDetails = async (row) => {
		const hydrated = await hydrateTrackerDetails(row);
		setDetailRow(hydrated || null);
		setActiveFullScreen('bank');
		setLoadingBankDetails(true);
		setBankDetailsError(null);
		try {
			const res = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${row?.id}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) throw new Error(`Failed to load bank details (${res.status})`);
			const data = await res.json();
			setBankDetails(Array.isArray(data) ? data : []);
		} catch (e) {
			setBankDetails([]);
			setBankDetailsError(e?.message || 'Failed to load bank details');
		} finally {
			setLoadingBankDetails(false);
		}
	};

	const billEntryDetailsRows = useMemo(() => {
		const bill = detailRow;
		if (!bill) return [];
		const trackerId = bill?.id;
		if (!trackerId) return [];
		const rows = (allBillEntries || [])
			.filter((be) => String(be?.vendor_payments_tracker_id ?? be?.vendorPaymentsTrackerId ?? '') === String(trackerId))
			.map((be) => {
				const enteredBy = be?.entered_by ?? be?.enteredBy ?? be?.created_by ?? be?.createdBy ?? '';
				const enteredDate = be?.entered_date ?? be?.enteredDate ?? be?.date ?? be?.created_at ?? be?.createdAt ?? '';
				return { enteredBy: String(enteredBy || '').trim(), date: enteredDate };
			})
			.filter((r) => r.enteredBy || r.date);

		rows.sort((a, b) => {
			const ta = new Date(a.date).getTime();
			const tb = new Date(b.date).getTime();
			if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
			return 0;
		});
		return rows;
	}, [detailRow, allBillEntries]);

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

	const expenseMatchingDetails = useMemo(() => {
		const bill = detailRow;
		if (!bill) return null;
		const trackerId = bill?.id;
		const vendorName = getVendorNameById(bill?.vendor_id ?? bill?.vendorId) || bill?.vendor_name || '';
		const billAmount = Number(bill?.total_amount ?? bill?.totalAmount ?? 0) || 0;
		const adjustmentAmount = Number(bill?.adjustment_amount ?? bill?.adjustmentAmount ?? 0) || 0;
		const adjustedBillAmount = Math.max(0, billAmount - adjustmentAmount);

		const billEntriesForTracker = (allBillEntries || []).filter((be) => String(be?.vendor_payments_tracker_id ?? be?.vendorPaymentsTrackerId ?? '') === String(trackerId));
		const enteredDates = [...new Set(billEntriesForTracker.map(be => be?.entered_date ?? be?.enteredDate).filter(Boolean))];
		const billEnteredDates = enteredDates.map((date) => {
			try { return new Date(date).toISOString().split('T')[0]; } catch { return null; }
		}).filter(Boolean);

		const matchingExpenses = (expensesData || [])
			.filter((expense) => {
				const expenseDate = new Date(expense?.timestamp ?? expense?.date);
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
			difference,
			matchingExpenses,
			vendorName
		};
	}, [detailRow, expensesData, allBillEntries, vendorMap]);

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
		if (!expenseMatchingDetails?.matchingExpenses || expenseMatchingDetails.matchingExpenses.length === 0) {
			alert('No expenses to generate PDF');
			return;
		}
		const vendorName = expenseMatchingDetails.vendorName || '-';
		const matchingExpenses = expenseMatchingDetails.matchingExpenses;
		const doc = new jsPDF({ orientation: 'landscape' });
		const totalAmount = matchingExpenses.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Matching Expenses Report', 14, 15);
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');
		doc.text(`Vendor: ${vendorName}`, 14, 22);
		doc.text(`Total Entries: ${matchingExpenses.length}`, 130, 22);
		doc.text(`Total Amount: ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 225, 22);

		const tableColumn = ['Time Stamp', 'Date', 'E.No', 'Project Name', 'Vendor', 'A/C Type', 'Quantity', 'Amount', 'Comments', 'Category'];
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
			headStyles: { fillColor: [250, 246, 237], textColor: 0, fontStyle: 'bold', halign: 'left', fontSize: 9, lineWidth: 0.3 },
			bodyStyles: { fontSize: 9, textColor: [0, 0, 0], halign: 'left' },
			alternateRowStyles: { fillColor: [255, 255, 255] }
		});

		const fileName = `Matching_Expenses_${String(vendorName).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
		doc.save(fileName);
	};

	const toYyyyMmDd = (input) => {
		if (!input) return '';
		try {
			const d = new Date(input);
			if (isNaN(d.getTime())) return '';
			return d.toISOString().split('T')[0];
		} catch {
			return '';
		}
	};

	const openEditSheet = (row) => {
		if (!row) return;
		setEditTarget(row);
		const vendorId = row?.vendor_id ?? row?.vendorId ?? '';
		const receivedDate = row?.bill_arrival_date ?? row?.billArrivalDate ?? row?.created_at ?? row?.createdAt ?? '';
		setEditForm({
			vendorId: vendorId != null ? String(vendorId) : '',
			receivedDate: toYyyyMmDd(receivedDate),
			noOfBills: String(row?.no_of_bills ?? row?.noOfBills ?? ''),
			totalAmount: String(row?.total_amount ?? row?.totalAmount ?? '')
		});
		setShowEditSheet(true);
	};

	const closeEditSheet = () => {
		setShowEditSheet(false);
		setEditTarget(null);
		setEditLoading(false);
	};

	const submitEdit = async () => {
		if (!editTarget?.id) return;
		const vendorIdNum = Number(editForm.vendorId);
		const bills = Number(editForm.noOfBills);
		const amount = Number(editForm.totalAmount);
		if (!editForm.receivedDate) {
			alert('Please select Received Date');
			return;
		}
		if (!Number.isFinite(vendorIdNum) || vendorIdNum <= 0) {
			alert('Please select Vendor Name');
			return;
		}
		if (!Number.isFinite(bills) || bills <= 0) {
			alert('Please enter valid No. of Bills');
			return;
		}
		if (!Number.isFinite(amount) || amount <= 0) {
			alert('Please enter valid Total Amount');
			return;
		}
		setEditLoading(true);
		try {
			const payload = {
				bill_arrival_date: editForm.receivedDate,
				vendor_id: vendorIdNum,
				no_of_bills: bills,
				total_amount: amount
			};
			const res = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${editTarget.id}/update-details`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(await res.text());

			// Update local list immediately
			setApiData((prev) => (Array.isArray(prev) ? prev.map((r) => {
				if ((r?.id ?? null) !== editTarget.id) return r;
				return {
					...r,
					bill_arrival_date: payload.bill_arrival_date,
					vendor_id: payload.vendor_id,
					no_of_bills: payload.no_of_bills,
					total_amount: payload.total_amount
				};
			}) : prev));

			closeEditSheet();
		} catch (e) {
			alert(e?.message || 'Failed to update tracker details');
		} finally {
			setEditLoading(false);
		}
	};

	// Minimum swipe distance (in pixels) - same as PurchaseOrder History
	const minSwipeDistance = 50;
	const handleTouchStart = (e, rowId) => {
		const touch = e.touches[0];
		setSwipeStates((prev) => ({
			...prev,
			[rowId]: {
				startX: touch.clientX,
				startY: touch.clientY,
				currentX: touch.clientX,
				currentY: touch.clientY,
				isSwiping: false
			}
		}));
	};
	const handleTouchMove = (e, rowId) => {
		const touch = e.touches[0];
		const state = swipeStates[rowId];
		if (!state) return;

		const deltaX = touch.clientX - state.startX;
		const deltaY = touch.clientY - state.startY;
		const absDeltaX = Math.abs(deltaX);
		const absDeltaY = Math.abs(deltaY);

		// Don't block vertical scroll
		if (absDeltaX <= absDeltaY) {
			setSwipeStates((prev) => {
				const next = { ...prev };
				delete next[rowId];
				return next;
			});
			return;
		}

		// Only support swipe-left to reveal Edit/Delete, swipe-right to hide
		if (deltaX < 0 || (expandedRowId === rowId && deltaX > 0)) {
			e.preventDefault();
			setSwipeStates((prev) => ({
				...prev,
				[rowId]: {
					...prev[rowId],
					currentX: touch.clientX,
					currentY: touch.clientY,
					isSwiping: true
				}
			}));
		}
	};
	const handleTouchEnd = (rowId) => {
		const state = swipeStates[rowId];
		if (!state) return;
		const deltaX = state.currentX - state.startX;
		const absDeltaX = Math.abs(deltaX);

		if (absDeltaX >= minSwipeDistance) {
			if (deltaX < 0) {
				// Swiped left => open actions
				setExpandedRowId(rowId);
			} else {
				// Swiped right => close actions
				setExpandedRowId(null);
			}
		}

		setSwipeStates((prev) => {
			const next = { ...prev };
			delete next[rowId];
			return next;
		});
	};

	// Desktop support (mouse drag) - same behavior as swipe
	const handleMouseDown = (e, rowId) => {
		// Only left-click / primary button
		if (e.button !== 0) return;
		// Prevent text selection while initiating a drag swipe
		e.preventDefault();
		setSwipeStates((prev) => ({
			...prev,
			[rowId]: {
				startX: e.clientX,
				startY: e.clientY,
				currentX: e.clientX,
				currentY: e.clientY,
				isSwiping: false
			}
		}));
	};

	useEffect(() => {
		const onMouseMove = (e) => {
			setSwipeStates((prev) => {
				const ids = Object.keys(prev || {});
				if (ids.length === 0) return prev;

				let hasChanges = false;
				const next = { ...prev };
				for (const id of ids) {
					const state = prev[id];
					if (!state) continue;
					const deltaX = e.clientX - state.startX;
					const deltaY = e.clientY - state.startY;
					const absDeltaX = Math.abs(deltaX);
					const absDeltaY = Math.abs(deltaY);

					// If vertical > horizontal, cancel drag so scrolling works
					if (absDeltaX <= absDeltaY) {
						delete next[id];
						hasChanges = true;
						continue;
					}

					// Only allow dragging left to reveal, or right to close when expanded
					if (deltaX < 0 || (expandedRowIdRef.current === id && deltaX > 0)) {
						next[id] = {
							...state,
							currentX: e.clientX,
							currentY: e.clientY,
							isSwiping: true
						};
						hasChanges = true;
					}
				}
				return hasChanges ? next : prev;
			});
		};

		const onMouseUp = () => {
			setSwipeStates((prev) => {
				const ids = Object.keys(prev || {});
				if (ids.length === 0) return prev;

				ids.forEach((id) => {
					const state = prev[id];
					if (!state) return;
					const deltaX = state.currentX - state.startX;
					const absDeltaX = Math.abs(deltaX);
					if (absDeltaX >= minSwipeDistance) {
						if (deltaX < 0) setExpandedRowId(id);
						else setExpandedRowId(null);
					}
				});

				// Clear all mouse swipe states
				return {};
			});
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const filtered = useMemo(() => {
		const toDateOnly = (input) => {
			if (!input) return '';
			try {
				const d = new Date(input);
				if (isNaN(d.getTime())) return '';
				const yyyy = d.getFullYear();
				const mm = String(d.getMonth() + 1).padStart(2, '0');
				const dd = String(d.getDate()).padStart(2, '0');
				return `${yyyy}-${mm}-${dd}`;
			} catch {
				return '';
			}
		};
		const from = String(filterFromDate || '').trim();
		const to = String(filterToDate || '').trim();

		const base = Array.isArray(apiData) ? apiData : [];
		const q = String(query || '').trim().toLowerCase();

		return base.filter((row) => {
			const id = row?.vendor_id ?? row?.vendorId ?? row?.vendor?.id ?? row?.vendor?._id;
			const name =
				row?.vendorName ||
				row?.vendor?.name ||
				row?.vendor_name ||
				getVendorNameById(id) ||
				'';

			// Search (vendor name)
			if (q && !String(name || '').toLowerCase().includes(q)) return false;

			// Date filter (based on bill arrival date)
			if (from || to) {
				const dateOnly = toDateOnly(row?.bill_arrival_date ?? row?.billArrivalDate ?? row?.created_at ?? row?.createdAt ?? '');
				if (!dateOnly) return false;
				if (from && dateOnly < from) return false;
				if (to && dateOnly > to) return false;
			}

			return true;
		});
	}, [apiData, query, vendorMap, filterFromDate, filterToDate]);
	return (
		<div className="w-full h-[calc(100vh-96px-80px)] overflow-hidden flex flex-col">
			<div className="flex-shrink-0">
				<div className=" pt-[8px] pb-[8px] border-b border-[#E5E7EB] flex items-center justify-between">
				<p className="text-[12px] font-semibold text-[#111827]"></p>
				<p className="text-[12px] font-semibold text-[#111827]">Vendor</p>
			</div>
			<div className=" mt-[8px]">
				<div className="w-full h-[36px] rounded-[24px] bg-white border border-[#E5E7EB] flex items-center px-[12px]">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
						<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
						<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search"
						className="ml-[8px] flex-1 outline-none text-[12px] font-semibold text-[#111827] placeholder-[#9CA3AF]"
						style={{ background: 'transparent' }}
					/>
				</div>
			</div>
			{/* Filter Row (match PendingBill.jsx) */}
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
			</div>
			<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none  pb-[10px]">
				<div className="flex flex-col">
					{loading && <p className="text-[12px] text-center text-[#6B7280]">Loading…</p>}
					{!!error && !loading && <p className="text-[12px] text-center text-[#E4572E]">{error}</p>}
					{!loading && !error && filtered.length === 0 && <p className="text-[12px] text-center text-[#6B7280]">No data</p>}
					{filtered.map((row, idx) => {
						const rowId = String(row?.id ?? idx);
						const swipeState = swipeStates[rowId];
						const deltaX = swipeState ? (swipeState.currentX - swipeState.startX) : 0;
						const swipeOffset =
							swipeState && swipeState.isSwiping
								? Math.max(-110, Math.min(0, deltaX))
								: expandedRowId === rowId
									? -110
									: 0;

						return (
							<div
								key={rowId}
								className="relative overflow-hidden"
								onTouchStart={(e) => handleTouchStart(e, rowId)}
								onTouchMove={(e) => handleTouchMove(e, rowId)}
								onTouchEnd={() => handleTouchEnd(rowId)}
								onMouseDown={(e) => handleMouseDown(e, rowId)}
								style={{
									userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
									WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
								}}
							>
								{/* Actions behind card (match PurchaseOrder History) */}
								<div
									className="absolute right-0 top-[0px] flex gap-[8px] flex-shrink-0 z-0"
									style={{
										opacity: expandedRowId === rowId || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
										transform: swipeOffset < 0
											? `translateX(${Math.max(0, 110 + swipeOffset)}px)`
											: 'translateX(110px)',
										transition: 'opacity 0.3s ease-out',
										pointerEvents: expandedRowId === rowId ? 'auto' : 'none'
									}}
								>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											openEditSheet(row);
											setExpandedRowId(null);
										}}
										className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-[6px] hover:bg-[#22a882] transition-colors shadow-sm"
										title="Edit"
									>
										<img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
									</button>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setExpandedRowId(null);
										}}
										className="action-button w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-[6px] hover:bg-[#cc4d26] transition-colors shadow-sm"
										title="Delete"
									>
										<img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
									</button>
								</div>

								{/* Sliding card */}
								<div
									style={{
										transform: `translateX(${swipeOffset}px)`,
										touchAction: 'pan-y',
										userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
										WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
										willChange: 'transform',
										transition: swipeState && swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out'
									}}
								>
									{(() => {
										const vendorName = getVendorNameById(row?.vendor_id ?? row?.vendorId) || row?.vendorName || row?.vendor?.name || row?.vendor_name || 'Vendor';
										const amount = row?.totalAmount || row?.total_amount || row?.amount || 0;
										const billsCount = row?.billsCount ?? row?.noOfBills ?? row?.no_of_bills ?? row?.billCount ?? '-';
										const dateLineParts = getBillCardDateLineParts(row);
										const subLineNode = dateLineParts ? renderBillCardDateLineParts(dateLineParts) : '';

										const overallPdfUrl =
											row?.over_all_payment_pdf_url ||
											row?.overAllPaymentPdfUrl ||
											row?.overall_pdf_url ||
											null;

										const verificationStatus = getBillVerificationStatus(row);
										const entryStatusText = getEntryStatusText(row);
										const paymentStatus = getPaymentStatusText(row);

										const statusLeft =
											verificationStatus === '✓ Verified' ? (
												<Chip label="Verified" tone="success" onClick={() => openVerifyDetails(row)} />
											) : verificationStatus === 'Verified' ? (
												<Chip label="Verified" tone="warn" onClick={() => openVerifyDetails(row)} />
											) : (
												<Chip label="To Verify" tone="neutral" onClick={() => openVerifyDetails(row)} />
											);

										const statusMid = (entryStatusText === 'Entered' || entryStatusText === '✓ Entered') ? (
											<Chip label="Entered" tone={entryStatusText === '✓ Entered' ? 'success' : 'warn'} onClick={() => openEntryDetails(row)} />
										) : (
											<Chip label="To Entry" tone="neutral" onClick={() => openEntryDetails(row)} />
										);

										const statusRight =
											paymentStatus === '✓ Paid' ? (
												<Chip label="Paid" tone="success" onClick={() => openBankDetails(row)} />
											) : paymentStatus === 'Paid' ? (
												<Chip label="Paid" tone="warn" onClick={() => openBankDetails(row)} />
											) : (
												<Chip label="To Pay" tone="neutral" onClick={() => openBankDetails(row)} />
											);

										return (
											<Row
												name={vendorName}
												amount={amount}
												billsCount={billsCount}
												subLineNode={subLineNode}
												statusLeft={statusLeft}
												statusMid={statusMid}
												statusRight={statusRight}
												onAmountClick={overallPdfUrl ? () => openUrl(overallPdfUrl) : null}
											/>
										);
									})()}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Full-screen detail flows */}
			{activeFullScreen === 'verify' && (
				<div className="fixed inset-0 z-[999] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white">
						{renderTopBar(getVendorBillsTitle(detailRow), () => setActiveFullScreen(null))}
						<div className="px-[14px] pt-[10px] pb-[10px]">
							<div className="rounded-[10px] border border-[#E5E7EB] p-[10px]">
								{(() => {
									const noOfBills = Number(detailRow?.no_of_bills ?? detailRow?.noOfBills ?? 0) || 0;
									const extraBills = Number(detailRow?.extra_bills ?? detailRow?.extraBills ?? 0) || 0;
									const totalSlots = Math.max(0, noOfBills + extraBills);

									const verifications = detailRow?.billVerifications || detailRow?.bill_verifications || [];
									const slots = Array.from({ length: totalSlots }).map((_, i) => {
										const v = Array.isArray(verifications) ? verifications[i] : null;
										const raw = v?.bill_number ?? v?.billNumber ?? '';
										const s = String(raw || '').trim();
										if (s === 'NO_PO') return 'NO PO';
										return s;
									});
									return (
										<>
											{/* Match PendingBill.jsx: show all slots (no pagination), grid scrolls if needed */}
											<div className="overflow-y-auto no-scrollbar scrollbar-none" style={{ maxHeight: 'calc(100vh - 160px)' }}>
												<div className="grid grid-cols-4 gap-[10px]">
												{slots.map((n, i) => {
													const hasValue = String(n || '').trim() !== '';
													return (
														<div
															key={`${i}`}
															className="h-[34px] rounded-[4px] border flex items-center justify-center text-[12px] font-semibold"
															style={{
																borderColor: hasValue ? '#22C55E' : '#D1D5DB',
																background: hasValue ? '#E2F9E1' : '#FFFFFF',
																color: '#111827'
															}}
														>
															{hasValue ? n : ''}
														</div>
													);
												})}
												</div>
											</div>
										</>
									);
								})()}
							</div>
						</div>
					</div>
				</div>
			)}

			{activeFullScreen === 'entry' && (
				<div className="fixed inset-0 z-[999] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white">
						{renderTopBar(getVendorBillsTitle(detailRow), () => setActiveFullScreen(null), (
							<button type="button" onClick={downloadMatchingExpensesPDF} className="text-[12px] font-semibold text-black mt-[6px]">
								Download
							</button>
						))}
						<div className="px-[14px] pt-[10px] pb-[10px] flex flex-col" style={{ minHeight: 'calc(100vh - 86px)' }}>
							{billEntryDetailsRows.length > 0 && (
								<div className="rounded-[12px] border border-[#E5E7EB] bg-white p-[12px]">
									<div className="grid grid-cols-2 gap-[12px]">
										<div><p className="text-[12px] font-semibold text-[#111827] mb-[6px]">Entered By</p></div>
										<div><p className="text-[12px] font-semibold text-[#111827] mb-[6px]">Date</p></div>
									</div>
									<div className="mt-[6px] space-y-[10px]">
										{billEntryDetailsRows.map((r, i) => (
											<div key={i} className="grid grid-cols-2 gap-[12px]">
												<div className="h-[36px] rounded-[6px] bg-[#F3F4F6] border border-[#E5E7EB] px-[10px] flex items-center">
													<p className="text-[12px] font-medium text-[#111827] truncate">{r.enteredBy || '-'}</p>
												</div>
												<div className="h-[36px] rounded-[6px] bg-[#F3F4F6] border border-[#E5E7EB] px-[10px] flex items-center">
													<p className="text-[12px] font-medium text-[#111827] truncate">{formatEntryDateDdMmYyyy(r.date) || '-'}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							<div className="flex-1" />

							<div className="mt-auto rounded-[14px] border border-[#E5E7EB] bg-white p-[14px]">
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
									<p className="text-[12px] text-[#666666]">Adjustment Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(expenseMatchingDetails?.adjustmentAmount ?? 0)}</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] font-semibold text-black">Difference</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(expenseMatchingDetails?.difference ?? 0)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeFullScreen === 'bank' && (
				<div className="fixed inset-0 z-[999] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white">
						{renderTopBar(getVendorBillsTitle(detailRow), () => setActiveFullScreen(null))}
						<div className="px-[14px] pt-[10px] pb-[10px] flex flex-col" style={{ minHeight: 'calc(100vh - 86px)' }}>
							<div
								className="flex items-center justify-between"
								role="button"
								tabIndex={0}
								onClick={openBankDetailsModal}
								onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openBankDetailsModal(); }}
							>
								<span className="text-[12px] font-semibold text-black underline underline-offset-4">Bank Details</span>
								<p className="text-[12px] font-semibold text-[#666666]">({Array.isArray(bankDetails) ? bankDetails.length : 0} Nos)</p>
							</div>
							{loadingBankDetails && <p className="text-[12px] text-center text-[#6B7280] mt-[10px]">Loading…</p>}
							{!!bankDetailsError && !loadingBankDetails && (
								<p className="text-[12px] text-center text-red-600 mt-[10px]">{bankDetailsError}</p>
							)}
							<div className="mt-[10px] space-y-[10px]">
								{(Array.isArray(bankDetails) ? bankDetails : []).map((p, i) => {
									const amount = Number(p?.amount || 0) || 0;
									const cf = Number(p?.carry_forward_amount || 0) || 0;
									const mode = p?.mode ?? p?.payment_mode ?? p?.paymentMode ?? (cf > 0 && amount <= 0 ? 'Carry Forward' : '');
									const acc = p?.account_number || p?.accountNumber || '';
									const txn = p?.transaction_number || p?.transactionNumber || '';
									const chequeNo = p?.cheque_no || p?.chequeNo || '';
									const date = p?.date || p?.payment_date || p?.timestamp || '';
									const billUrl =
										p?.bill_url ??
										p?.bill_copy_url ??
										p?.bill_copy ??
										'';
									return (
										<div key={i} className="rounded-[14px] bg-[#FAFAFA] border border-[#EFEFEF] px-[14px] py-[12px] flex items-start justify-between gap-[10px]">
											<div className="min-w-0">
												<p className="text-[12px] font-semibold text-black truncate">{acc ? `A/C - ${acc}` : 'A/C - -'}</p>
												<p className="text-[12px] text-black mt-[2px] truncate">{chequeNo ? `CHQ-${chequeNo}` : (txn || '')}</p>
												<p className="text-[10px] text-[#666666] mt-[4px]">{date ? new Date(date).toLocaleString('en-GB') : ''}</p>
											</div>
											<div className="flex-shrink-0 flex flex-col items-end">
												<span className="inline-flex px-[10px] py-[3px] rounded-full text-[10px] font-semibold bg-[#F3E8FF] text-[#7C3AED]">
													{mode || 'Mode'}
												</span>
												<button
													type="button"
													onClick={() => {
														const url = String(billUrl || '').trim();
														if (!url) return;
														window.open(url, '_blank', 'noopener,noreferrer');
													}}
													disabled={!String(billUrl || '').trim()}
													className={`mt-[6px] text-[13px] font-semibold ${String(billUrl || '').trim() ? 'text-green-700 underline underline-offset-2' : 'text-green-700'}`}
												>
													{formatIndianCurrency(amount + cf)}
												</button>
											</div>
										</div>
									);
								})}
							</div>

							<div className="flex-1" />

							<div className="mt-auto rounded-[14px] border border-[#E5E7EB] bg-white p-[14px]">
								<p className="text-[14px] font-semibold text-black mb-[8px]">Summary Details</p>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Total Payable Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.totalPayable ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Received Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.receivedAmount ?? 0)}</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Total Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.totalPayable ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] underline text-[#C58B2A]">Discount</p>
									<p className="text-[12px] font-semibold" style={{ color: '#C58B2A' }}>
										{formatIndianCurrency(bankSummaryDetails?.discountAmount ?? 0)}
									</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] font-semibold text-black">Net Payable</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.netPayable ?? 0)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Bank Details popup (same UI as PendingBill.jsx) */}
			{showBankDetailsModal && (
				<div
					className="fixed inset-0 bg-black/60 flex items-center justify-center px-[14px]"
					style={{ zIndex: 99999 }}
					onClick={(e) => { if (e.target === e.currentTarget) closeBankDetailsModal(); }}
				>
					<div className="w-full max-w-[360px] bg-white rounded-[14px] border border-[#E5E7EB] overflow-hidden shadow-xl">
						<div className="px-[16px] pt-[16px] pb-[10px] flex items-center justify-between">
							<p className="text-[18px] font-semibold text-black">Bank Details</p>
							<button type="button" onClick={closeBankDetailsModal} className="w-[36px] h-[36px] flex items-center justify-center" aria-label="Close">
								<span className="text-[22px] leading-none font-semibold text-[#E4572E]">×</span>
							</button>
						</div>
						<div className="px-[16px] pb-[16px]">
							{loadingVendorBankDetails && !selectedVendorAccountDetails ? (
								<p className="text-[12px] text-center text-[#6B7280]">Loading…</p>
							) : null}
							{(() => {
								const d = selectedVendorAccountDetails || {};
								const RowX = ({ label, value }) => (
									<div className="flex items-start justify-between gap-[10px] py-[12px] border-b border-[#EEE] last:border-b-0">
										<div className="min-w-0">
											<p className="text-[12px] font-medium text-[#6B7280] leading-tight">{label}</p>
											<p className="text-[14px] font-semibold text-black break-words mt-[2px]">{value || '-'}</p>
										</div>
										<button
											type="button"
											onClick={() => copyText(value)}
											className="w-[32px] h-[32px] rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] flex-shrink-0"
											aria-label={`Copy ${label}`}
										>
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
												<path d="M9 9h10v12H9V9Z" stroke="currentColor" strokeWidth="2" />
												<path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="2" />
											</svg>
										</button>
									</div>
								);
								return (
									<div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden bg-white">
										<div className="px-[14px]">
											<RowX label="Account Holder Name" value={d?.account_holder_name} />
											<RowX label="Bank Name" value={d?.bank_name} />
											<RowX label="Account Number" value={d?.account_number} />
											<RowX label="IFSC Code" value={d?.ifsc_code} />
											<RowX label="Branch Name" value={d?.branch} />
											<RowX label="Contact Number" value={d?.contact_number} />
											<RowX label="Contact Email" value={d?.contact_email} />
										</div>
									</div>
								);
							})()}
						</div>
					</div>
				</div>
			)}

			{/* Edit Bottom Sheet */}
			{showEditSheet && (
				<div className="fixed inset-0 z-[1200] flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<button
						type="button"
						className="absolute inset-0 bg-black/60"
						aria-label="Close"
						onClick={closeEditSheet}
					/>
					<div className="relative w-full  bg-white rounded-t-[18px] px-[16px] pt-[14px] pb-[16px]">
						<div className="flex items-center justify-between">
							<p className="text-[14px] font-semibold text-black">Edit Tracker Details</p>
							<button
								type="button"
								onClick={closeEditSheet}
								className="w-[28px] h-[28px] flex items-center justify-center"
								aria-label="Close"
							>
								<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
							</button>
						</div>

						<div className="mt-[10px] flex flex-col gap-[10px]">
							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Vendor Name</p>
								<select
									value={editForm.vendorId}
									onChange={(e) => setEditForm((p) => ({ ...p, vendorId: e.target.value }))}
									className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
								>
									<option value="">Select Vendor</option>
									{Object.entries(vendorMap || {})
										.filter(([k, v]) => k && v && String(k) === String(Number(k))) // numeric ids only once
										.sort((a, b) => String(a[1]).localeCompare(String(b[1])))
										.map(([id, name]) => (
											<option key={id} value={id}>{name}</option>
										))}
								</select>
							</div>

							<div>
								<p className="text-[12px] font-semibold text-black mb-[6px]">Received Date</p>
								<div className="relative">
									<input
										type="date"
										value={editForm.receivedDate}
										onChange={(e) => setEditForm((p) => ({ ...p, receivedDate: e.target.value }))}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] pr-[36px] text-[12px] font-medium text-[#111827] outline-none"
									/>
									<div className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
										value={editForm.noOfBills}
										onChange={(e) => setEditForm((p) => ({ ...p, noOfBills: e.target.value }))}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">Total Amount</p>
									<input
										type="number"
										value={editForm.totalAmount}
										onChange={(e) => setEditForm((p) => ({ ...p, totalAmount: e.target.value }))}
										className="w-full h-[38px] rounded-[6px] border border-[#D1D5DB] bg-white px-[12px] text-[12px] font-medium text-[#111827] outline-none text-right"
									/>
								</div>
							</div>

							<div className="mt-[4px] grid grid-cols-2 gap-[12px]">
								<button
									type="button"
									onClick={closeEditSheet}
									className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={submitEdit}
									disabled={editLoading}
									className="h-[40px] rounded-[10px] bg-black text-[13px] font-semibold text-white disabled:opacity-70"
								>
									{editLoading ? 'Submitting...' : 'Submit'}
								</button>
							</div>
						</div>
					</div>
			</div>
			)}

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
						<div className="flex-shrink-0 flex items-center justify-between px-[16px] pt-[14px] pb-[10px] border-b border-[#E5E7EB]">
							<p className="text-[14px] font-semibold text-black">Filters</p>
							<button type="button" onClick={() => setShowFilterSheet(false)} className="text-[#E4572E] text-[18px] font-bold leading-none" aria-label="Close">
								×
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-[16px] py-[12px]">
							<div className="grid grid-cols-2 gap-[12px]">
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">From Date</p>
									<input
										type="date"
										value={filterFromDate}
										onChange={(e) => setFilterFromDate(e.target.value)}
										className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
								<div>
									<p className="text-[12px] font-semibold text-black mb-[6px]">To Date</p>
									<input
										type="date"
										value={filterToDate}
										onChange={(e) => setFilterToDate(e.target.value)}
										className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
									/>
								</div>
							</div>
						</div>

						<div className="flex-shrink-0 px-[16px] pb-[16px] pt-[10px] border-t border-[#E5E7EB] grid grid-cols-2 gap-[12px]">
							<button
								type="button"
								onClick={() => {
									setFilterFromDate('');
									setFilterToDate('');
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
		</div>
	);
};

export default DatabaseMobile;

