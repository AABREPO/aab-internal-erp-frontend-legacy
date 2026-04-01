import React, { useEffect, useMemo, useState } from 'react';
import Filter from '../Images/Filter.png';
import CloseIcon from '../Images/Close F.svg'
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Chip = ({ label, tone = 'neutral', onClick }) => {
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

const PendingBillMobile = ({ username, userRoles = [] }) => {
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
	const [expenseMatchStatus, setExpenseMatchStatus] = useState({});
	const [paymentStatuses, setPaymentStatuses] = useState({});
	const [paidTodayBills, setPaidTodayBills] = useState({});
	const [query, setQuery] = useState('');
	const [showVerifyModal, setShowVerifyModal] = useState(false);
	const [selectedVerifyBill, setSelectedVerifyBill] = useState(null);
	const [verifyBoxes, setVerifyBoxes] = useState([]);
	const [activeFullScreen, setActiveFullScreen] = useState(null); // null | 'verify' | 'entry' | 'bank'
	const [bankDetails, setBankDetails] = useState([]);
	const [loadingBankDetails, setLoadingBankDetails] = useState(false);
	const [bankDetailsError, setBankDetailsError] = useState(null);
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

	const paymentModeOptions = useMemo(() => ([
		'Carry Forward',
		'Net Banking',
		'PhonePe',
		'GPay',
		'Cheque',
		'Cash',
		'NEFT/RTGS'
	]), []);

	const filteredPaymentModeOptions = useMemo(() => {
		const q = (paymentModePickerQuery || '').trim().toLowerCase();
		if (!q) return paymentModeOptions;
		return paymentModeOptions.filter((m) => String(m || '').toLowerCase().includes(q));
	}, [paymentModePickerQuery, paymentModeOptions]);

	const paymentAccountOptions = useMemo(() => {
		const rows = Array.isArray(bankDetails) ? bankDetails : [];
		const set = new Set();
		rows.forEach((p) => {
			const acc = p?.account_number ?? p?.accountNumber ?? '';
			const s = String(acc || '').trim();
			if (s) set.add(s);
		});
		return Array.from(set);
	}, [bankDetails]);

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
		const verifications = item?.billVerifications || item?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return 'Verify';
		const allVerified = verifications.every(v => v?.is_verified === true || v?.status === 'VERIFIED');
		const anyVerified = verifications.some(v => v?.is_verified === true || v?.status === 'VERIFIED');
		if (allVerified) return '✓ Verified';
		if (anyVerified) return 'Verified';
		return 'Verify';
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
		// Desktop behavior: Last PO comes from the previous verified entry for this vendor (not max purchase order ENO).
		const vendorId = bill?.vendor_id ?? bill?.vendorId ?? null;
		const lastFromHistory = getLastBillNumberForVendor(vendorId, bill);
		setLastPoNumber(lastFromHistory || null);
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
			const res = await fetchWithBranch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll', {
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
				`https://backendaab.in/aabuildersDash/api/vendor-payments/bill/${billId}/duplicate?duplicate=${checked ? 'true' : 'false'}`,
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

			const billRes = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(billsData)
			});
			if (!billRes.ok) throw new Error('Failed to update bill verifications');

			const res = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/approve-request?requestApproved=true`, {
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
			const res = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=false`, {
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
			const res = await fetchWithBranch('https://backendaab.in/aabuildersDash/api/vendor-payments/trackers', {
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
			setApiData(Array.isArray(data) ? data : []);
		} catch {
			// ignore
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
				const lastFromHistory = getLastBillNumberForVendor(vendorId, selectedVerifyBill);
				return lastFromHistory || null;
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

	const checkPO = async () => {
		if (!selectedVerifyBill) return;
		setCheckingPO(true);
		try {
			const vendorId = selectedVerifyBill?.vendor_id ?? selectedVerifyBill?.vendorId;
			if (!vendorId) {
				alert('Vendor ID not found');
				return;
			}

			// Instant UI feedback like desktop: mark entered bills immediately (before PO fetch).
			// We default to "Not Matched" and then flip to "Matched" after checking against purchase orders.
			{
				const valuesInstant = verifyBoxes.map((v) => String(v || '').trim());
				const trackerIdInstant = selectedVerifyBill?.id;
				const nextInstant = {};
				const nextCheckedInstant = {};
				valuesInstant.forEach((billNumber, index) => {
					const isNoPo = !!noPoSelections?.[index];
					if (isNoPo) {
						nextInstant[index] = { matched: true, message: 'No PO - Verified' };
						nextCheckedInstant[index] = true;
						return;
					}
					if (!billNumber) return;
					let isAlreadyEntered = false;
					for (const tracker of apiData || []) {
						if ((tracker?.id ?? tracker?.bill_id) === trackerIdInstant) continue;
						const trackerVendorId = tracker?.vendor_id ?? tracker?.vendorId ?? null;
						if (String(trackerVendorId ?? '') !== String(vendorId)) continue;
						const verifications = tracker?.billVerifications || tracker?.bill_verifications || [];
						for (const verification of verifications || []) {
							const existingBill = verification?.bill_number ?? verification?.billNumber ?? '';
							if (existingBill && existingBill !== 'NO_PO' && String(existingBill).trim() === billNumber) {
								isAlreadyEntered = true;
								break;
							}
						}
						if (isAlreadyEntered) break;
					}
					nextInstant[index] = isAlreadyEntered
						? { matched: false, message: 'Already Entered' }
						: { matched: false, message: 'Not Matched' };
				});
				setPoValidation(nextInstant);
				setCheckedBills((prev) => ({ ...(prev || {}), ...nextCheckedInstant }));
			}

			// Force a paint so the user sees color changes immediately,
			// then continue with the actual PO lookup.
			await new Promise((r) => setTimeout(r, 0));

			const { orders } = await fetchPurchaseOrdersForVendor(vendorId);
			setPurchaseOrders(orders);

			const vendorENOs = orders
				.map((po) => po?.eno ?? po?.po_number ?? po?.purchase_order_number ?? po?.ENO ?? '')
				.map((v) => String(v || '').replace('#', '').trim())
				.filter(Boolean);

			// Desktop: prevent duplicates within the same entry (use actual indices)
			const values = verifyBoxes.map((v) => String(v || '').trim());
			const dupMap = {};
			values.forEach((v, idx) => {
				if (!v) return;
				if (!dupMap[v]) dupMap[v] = [];
				dupMap[v].push(idx);
			});
			const duplicateNumbers = Object.keys(dupMap).filter((k) => dupMap[k].length > 1);
			if (duplicateNumbers.length > 0) {
				alert(` Duplicate bill found within the same bill number: ${duplicateNumbers.join(', ')}. Please enter unique bill numbers.`);
				return;
			}
			const trackerId = selectedVerifyBill?.id;
			const nextValidation = {};
			const nextChecked = {};

			values.forEach((billNumber, index) => {
				let isMatched = false;
				let message = '';
				const isNoPo = !!noPoSelections?.[index];
				if (isNoPo) {
					isMatched = true;
					message = 'No PO - Verified';
					nextChecked[index] = true;
				} else if (billNumber.trim()) {
					let isAlreadyEntered = false;
					for (const tracker of apiData || []) {
						if ((tracker?.id ?? tracker?.bill_id) === trackerId) continue;
						const trackerVendorId = tracker?.vendor_id ?? tracker?.vendorId ?? null;
						if (String(trackerVendorId ?? '') !== String(vendorId)) continue;
						const verifications = tracker?.billVerifications || tracker?.bill_verifications || [];
						for (const verification of verifications || []) {
							const existingBill = verification?.bill_number ?? verification?.billNumber ?? '';
							if (existingBill && existingBill !== 'NO_PO' && String(existingBill).trim() === billNumber.trim()) {
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
						isMatched = vendorENOs.includes(billNumber.trim());
						message = isMatched ? 'Matched' : 'Not Matched';
					}
				} else {
					// Desktop: don't mark empty boxes as failed.
					return;
				}
				nextValidation[index] = { matched: isMatched, message };
				if (billNumber.trim() && isMatched) nextChecked[index] = true;
			});

			setPoValidation(nextValidation);
			setCheckedBills((prev) => ({ ...(prev || {}), ...nextChecked }));
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
			const billRes = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/bills`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(billsData)
			});
			if (!billRes.ok) throw new Error('Failed to save bills');

			if (sendRequest) {
				const reqRes = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=true`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!reqRes.ok) throw new Error('Failed to send request');
				alert('Saved and request sent successfully!');
			} else {
				// Desktop: submit persists bills and clears request flag.
				await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-payments/tracker/${trackerId}/send-request?sendRequest=false`, {
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

	const billEntryInitialDateForModal = () => {
		const v = billEntryForm?.date;
		if (!v) return '';
		if (String(v).includes('/')) return v; // already DD/MM/YYYY
		if (String(v).includes('-')) return toDdMmYyyySlashes(v); // YYYY-MM-DD
		return '';
	};

	const openPaymentSheet = () => {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const yyyy = today.getFullYear();
		setPaymentForm({
			date: `${dd}/${mm}/${yyyy}`,
			amount: '',
			mode: '',
			transactionNumber: '',
			accountNumber: '',
			file: null
		});
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

	const paymentInitialDateForModal = () => {
		const v = paymentForm?.date;
		if (!v) return '';
		if (String(v).includes('/')) return v; // already DD/MM/YYYY
		if (String(v).includes('-')) return toDdMmYyyySlashes(v); // YYYY-MM-DD
		return '';
	};

	const openBankDetails = async (bill) => {
		setSelectedVerifyBill(bill || null);
		setActiveFullScreen('bank');
		setLoadingBankDetails(true);
		setBankDetailsError(null);
		try {
			const res = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${bill?.id}`, {
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
			const res = await fetchWithBranch('https://backendaab.in/aabuildersDash/api/vendor-payments/tracker', {
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
		const baseStatus = item?.entry_status || item?.entryStatus || 'Entry';
		const matchStatus = expenseMatchStatus[item?.id];
		if (matchStatus === 'complete_match') return '✓ Entered';
		if (matchStatus === 'partial_match') return 'Entered';
		return baseStatus;
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
				const res = await fetchWithBranch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
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

		const fetchTrackerData = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetchWithBranch('https://backendaab.in/aabuildersDash/api/vendor-payments/trackers', {
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
				const res = await fetchWithBranch('https://backendaab.in/aabuildersDash/api/bill-entry/getAll', {
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

		const fetchExpensesData = async () => {
			try {
				const res = await fetchWithBranch('https://backendaab.in/aabuilderDash/expenses_form/get_form', {
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
		fetchExpensesData();
		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeBranchId]);

	useEffect(() => {
		const computeExpenseMatchStatus = () => {
			const matchStatus = {};
			const billMap = {};
			apiData.forEach(bill => {
				const id = bill?.id;
				if (id != null) billMap[id] = bill;
			});

			const groupedBillEntries = {};
			allBillEntries.forEach(be => {
				const trackerId = be?.vendor_payments_tracker_id ?? be?.vendorPaymentsTrackerId;
				if (!trackerId) return;
				if (!groupedBillEntries[trackerId]) groupedBillEntries[trackerId] = [];
				groupedBillEntries[trackerId].push(be);
			});

			Object.keys(groupedBillEntries).forEach(trackerId => {
				const bill = billMap[trackerId];
				if (!bill) return;

				const vendorName = getVendorNameById(bill?.vendor_id ?? bill?.vendorId) || bill?.vendor_name;
				const billAmount = parseFloat(bill?.total_amount ?? bill?.totalAmount) || 0;
				if (!vendorName || billAmount <= 0) {
					matchStatus[trackerId] = 'no_match';
					return;
				}

				const billEntriesForTracker = groupedBillEntries[trackerId] || [];
				const enteredDates = [...new Set(billEntriesForTracker.map(be => be?.entered_date ?? be?.enteredDate).filter(Boolean))];
				if (enteredDates.length === 0) {
					matchStatus[trackerId] = 'no_match';
					return;
				}

				const billEnteredDates = enteredDates.map(date => {
					try {
						return new Date(date).toISOString().split('T')[0];
					} catch {
						return null;
					}
				}).filter(Boolean);

				const dateMatchedExpenses = expensesData.filter(expense => {
					const expenseDate = new Date(expense?.timestamp ?? expense?.date);
					if (isNaN(expenseDate.getTime())) return false;
					const iso = expenseDate.toISOString().split('T')[0];
					return billEnteredDates.includes(iso);
				});

				const vendorMatchedExpenses = dateMatchedExpenses.filter(expense => expense?.vendor === vendorName);
				const matchingExpenses = vendorMatchedExpenses.filter(expense => {
					const at = String(expense?.accountType ?? '').trim();
					return at === 'Bill Payments' || at === 'Bill Refund' || at === 'Bill Payments + Claim';
				});

				const totalExpenseAmount = matchingExpenses.reduce((sum, expense) => sum + (parseFloat(expense?.amount) || 0), 0);
				const adjustmentAmount = parseFloat(bill?.adjustment_amount ?? bill?.adjustmentAmount) || 0;
				const adjustedBillAmount = billAmount - adjustmentAmount;
				if (matchingExpenses.length === 0) {
					matchStatus[trackerId] = 'no_match';
				} else if (Math.abs(totalExpenseAmount - adjustedBillAmount) < 0.01) {
					matchStatus[trackerId] = 'complete_match';
				} else if (totalExpenseAmount > 0) {
					matchStatus[trackerId] = 'partial_match';
				} else {
					matchStatus[trackerId] = 'no_match';
				}
			});

			setExpenseMatchStatus(matchStatus);
		};

		if (apiData.length > 0 && expensesData.length > 0 && allBillEntries.length > 0) {
			computeExpenseMatchStatus();
		}
	}, [apiData, expensesData, allBillEntries, vendorMap]);

	useEffect(() => {
		const getPaymentStatus = async (item) => {
			try {
				const response = await fetchWithBranch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${item?.id}`, {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				if (!response.ok) return { status: 'To Pay', lastPaymentDate: null, paidToday: false };
				const paymentDetails = await response.json();
				if (!paymentDetails || paymentDetails.length === 0) return { status: 'To Pay', lastPaymentDate: null, paidToday: false };

				const totalPaid = paymentDetails.reduce((sum, payment) => {
					const amount = parseFloat(payment?.amount) || 0;
					const carryForwardAmount = parseFloat(payment?.carry_forward_amount) || 0;
					return sum + amount + carryForwardAmount;
				}, 0);

				const totalDiscount = paymentDetails.reduce((sum, payment) => sum + (payment?.discount_amount || 0), 0);
				const actualAmount = parseFloat(item?.total_amount ?? item?.totalAmount) || 0;
				const remainingAmount = Math.max(0, actualAmount - totalPaid - totalDiscount);

				let lastPaymentDate = null;
				if (paymentDetails.length > 0) {
					const dates = paymentDetails
						.map(p => p?.date)
						.filter(Boolean)
						.sort((a, b) => new Date(b) - new Date(a));
					if (dates.length > 0) lastPaymentDate = dates[0];
				}

				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const todayEnd = new Date(today);
				todayEnd.setHours(23, 59, 59, 999);
				let paidToday = false;
				for (const payment of paymentDetails) {
					const ts = payment?.timestamp ?? payment?.created_at;
					if (ts) {
						const paymentTimestamp = new Date(ts);
						if (paymentTimestamp >= today && paymentTimestamp <= todayEnd) {
							paidToday = true;
							break;
						}
					}
					const dp = payment?.date;
					if (dp) {
						const paymentDate = new Date(dp);
						paymentDate.setHours(0, 0, 0, 0);
						if (paymentDate.getTime() === today.getTime()) {
							paidToday = true;
							break;
						}
					}
				}

				if (remainingAmount === 0) return { status: '✓ Paid', lastPaymentDate, paidToday };
				if (totalPaid > 0) return { status: 'Paid', lastPaymentDate, paidToday };
				return { status: 'To Pay', lastPaymentDate, paidToday };
			} catch {
				return { status: 'To Pay', lastPaymentDate: null, paidToday: false };
			}
		};

		const fetchPaymentStatuses = async () => {
			if (apiData.length === 0) return;
			const statuses = await Promise.all(apiData.map(async item => {
				const result = await getPaymentStatus(item);
				return { id: item?.id, status: result?.status, paidToday: result?.paidToday };
			}));
			const map = {};
			const paidTodayMap = {};
			statuses.forEach(s => {
				if (s?.id != null) {
					map[s.id] = s.status;
					paidTodayMap[s.id] = !!s.paidToday;
				}
			});
			setPaymentStatuses(map);
			setPaidTodayBills(paidTodayMap);
		};

		fetchPaymentStatuses();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiData, activeBranchId]);

	// Desktop behavior: hide fully paid rows unless paid today; keep To Pay + Paid
	const visibleRows = useMemo(() => {
		return apiData.filter((item) => {
			const status = paymentStatuses[item?.id] || 'To Pay';
			const hasPaidToday = paidTodayBills[item?.id] || false;
			if (status === 'To Pay') return true;
			if (status === 'Paid') return true;
			if (hasPaidToday) return true;
			return false; // hide only fully paid bills
		});
	}, [apiData, paymentStatuses, paidTodayBills]);

	const filtered = useMemo(() => {
		if (!query) return visibleRows;
		const q = query.toLowerCase();
		return visibleRows.filter((row) => {
			const id = row?.vendor_id ?? row?.vendorId;
			const name = getVendorNameById(id);
			return (name || '').toLowerCase().includes(q);
		});
	}, [visibleRows, query, vendorMap]);

	const fullScreenHeaderSubTitle = useMemo(() => {
		const b = selectedVerifyBill;
		if (!b) return '';
		const d = b?.bill_arrival_date ?? b?.billArrivalDate;
		const vendorName = getVendorNameById(b?.vendor_id ?? b?.vendorId) || '';
		const dateStr = d ? new Date(d).toLocaleDateString('en-GB') : '';
		return `${dateStr}${vendorName ? ` - ${vendorName}` : ''}`;
	}, [selectedVerifyBill, vendorMap]);

	const closeFullScreen = () => {
		setActiveFullScreen(null);
		setShowVerifyModal(false);
		setSelectedVerifyBill(null);
	};

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
			difference
		};
	}, [selectedVerifyBill, expensesData, allBillEntries, vendorMap]);

	// Summary details for Bank (To Pay) screen
	const bankSummaryDetails = useMemo(() => {
		const totalPayable = Number(selectedVerifyBill?.total_amount ?? selectedVerifyBill?.totalAmount ?? 0) || 0;
		const rows = Array.isArray(bankDetails) ? bankDetails : [];
		const receivedAmount = rows.reduce((sum, p) => sum + (Number(p?.amount || 0) || 0) + (Number(p?.carry_forward_amount || 0) || 0), 0);
		const carryForwardAmount = rows.reduce((sum, p) => sum + (Number(p?.carry_forward_amount || 0) || 0), 0);
		const discountAmount = rows.reduce((sum, p) => sum + (Number(p?.discount_amount || 0) || 0), 0);
		const netPayable = Math.max(0, totalPayable - receivedAmount - discountAmount);
		return {
			totalPayable,
			receivedAmount,
			carryForwardAmount,
			discountAmount,
			netPayable
		};
	}, [bankDetails, selectedVerifyBill]);

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
		const cf = Number(p?.carry_forward_amount || 0) || 0;
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
		<div className="pt-[16px] px-[14px]">
			<div className="flex items-start justify-between gap-[10px]">
				<div className="flex items-center gap-[10px]">
					<button type="button" onClick={onBack} className="w-[28px] h-[28px] flex items-center justify-center" aria-label="Back">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path d="M15 18L9 12L15 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
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
	return (
		<div className="w-full flex flex-col" style={{ height: 'calc(100vh - 182px)', overflow: 'hidden' }}>
			{/* Full-screen flows (Verified / Entry / Paid) */}
			{activeFullScreen === 'entry' && (
				<div className="fixed inset-0 z-[999] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
					<div className="w-full max-w-[360px] mx-auto min-h-screen bg-white">
						{renderTopBar('Bill Entry Details', () => setActiveFullScreen(null), (
							<button
								type="button"
								onClick={downloadMatchingExpensesPDF}
								className="text-[12px] font-semibold text-black mt-[6px]"
							>
								Download
							</button>
						))}
						<div className="px-[14px] pt-[10px] pb-[10px] flex flex-col" style={{ minHeight: 'calc(100vh - 86px)' }}>
							{/* Previously entered rows */}
							{billEntryDetailsRows.length > 0 && (
								<div className="rounded-[12px] border border-[#E5E7EB] bg-white p-[12px]">
									<div className="grid grid-cols-2 gap-[12px]">
										<div>
											<p className="text-[12px] font-semibold text-[#111827] mb-[6px]">Entered By</p>
										</div>
										<div>
											<p className="text-[12px] font-semibold text-[#111827] mb-[6px]">Date</p>
										</div>
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

							<button
								type="button"
								onClick={openBillEntrySheet}
								className={`w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black ${billEntryDetailsRows.length > 0 ? 'mt-[12px]' : ''}`}
							>
								+ Add on
							</button>

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
										onClick={closeBillEntrySheet}
										className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
									>
										Submit
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
										onClick={closeAdjustmentAmountSheet}
										className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
									>
										Submit
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
						{renderTopBar('Enter PO Number', () => setActiveFullScreen(null), (
							<button type="button" className="text-[12px] font-semibold text-black mt-[6px]">Submit</button>
						))}
						<div className="px-[14px] pt-[10px] pb-[10px] flex flex-col" style={{ minHeight: 'calc(100vh - 86px)' }}>
							<div className="flex items-center justify-between">
								<p className="text-[12px] font-semibold text-black underline underline-offset-4">Bank Details</p>
								<p className="text-[12px] font-semibold text-[#666666]">
									({Array.isArray(bankDetails) ? bankDetails.length : 0} Nos)
								</p>
							</div>

							{loadingBankDetails && <p className="text-[12px] text-center text-[#6B7280] mt-[10px]">Loading…</p>}
							{!!bankDetailsError && !loadingBankDetails && (
								<p className="text-[12px] text-center text-red-600 mt-[10px]">{bankDetailsError}</p>
							)}

							<div className="mt-[10px] space-y-[10px]">
								{(Array.isArray(bankDetails) ? bankDetails : []).map((p, i) => {
									const mode = resolveBankPaymentMode(p);
									const amount = Number(p?.amount || 0) || 0;
									const acc = p?.account_number || p?.accountNumber || '';
									const txn = p?.transaction_number || p?.transactionNumber || '';
									const chequeNo = p?.cheque_no || p?.chequeNo || '';
									const date = p?.date || p?.payment_date || '';
									return (
										<div key={i} className="rounded-[14px] bg-[#FAFAFA] border border-[#EFEFEF] px-[14px] py-[12px] flex items-start justify-between gap-[10px]">
											<div className="min-w-0">
												<p className="text-[12px] font-semibold text-black truncate">{acc ? `A/C - ${acc}` : 'A/C - -'}</p>
												<p className="text-[12px] text-black mt-[2px] truncate">
													{chequeNo ? `CHQ-${chequeNo}` : (txn || '')}
												</p>
												<p className="text-[10px] text-[#666666] mt-[4px]">{date ? new Date(date).toLocaleString('en-GB') : ''}</p>
											</div>
											<div className="flex-shrink-0 text-right">
												<span className="inline-flex px-[10px] py-[3px] rounded-full text-[10px] font-semibold bg-[#F3E8FF] text-[#7C3AED]">
													{mode || 'Mode'}
												</span>
												<p className="text-[13px] font-semibold text-green-700 mt-[6px]">{formatIndianCurrency(amount)}</p>
											</div>
										</div>
									);
								})}
							</div>

							{/* Previous/Last Payment Details (match desktop "Previous Payment Details") */}
							{lastBankPayment && (
								<div className="mt-[12px] rounded-[14px] border border-[#E5E7EB] bg-white p-[14px]">
									<p className="text-[12px] font-semibold text-[#111827] text-center mb-[10px]">
										Previous Payment Details:
									</p>
									<div className="flex items-start justify-between gap-[10px]">
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-[#111827] mb-[6px]">Date</p>
											<div className="h-[34px] rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] flex items-center">
												<p className="text-[12px] font-medium text-[#111827] truncate">
													{formatEntryDateDdMmYyyy(
														lastBankPayment?.date ??
														lastBankPayment?.payment_date ??
														lastBankPayment?.paymentDate ??
														lastBankPayment?.timestamp ??
														lastBankPayment?.created_at ??
														lastBankPayment?.createdAt ??
														''
													) || '-'}
												</p>
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-[#111827] mb-[6px]">Amount</p>
											<div className="h-[34px] rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] flex items-center justify-end">
												<p className="text-[12px] font-medium text-[#111827] truncate">
													{formatIndianCurrency(
														(Number(lastBankPayment?.amount || 0) || 0) +
														(Number(lastBankPayment?.carry_forward_amount || 0) || 0)
													)}
												</p>
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-[#111827] mb-[6px]">Mode</p>
											<div className="h-[34px] rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] flex items-center">
												<p className="text-[12px] font-medium text-[#111827] truncate">
													{resolveBankPaymentMode(lastBankPayment) || '-'}
												</p>
											</div>
										</div>
									</div>
									{lastBankPaymentViewUrl ? (
										<button
											type="button"
											onClick={() => window.open(lastBankPaymentViewUrl, '_blank', 'noopener,noreferrer')}
											className="mt-[10px] text-[12px] font-semibold underline"
											style={{ color: '#C58B2A' }}
										>
											View
										</button>
									) : null}
								</div>
							)}

							<button
								type="button"
								onClick={openPaymentSheet}
								className="mt-[12px] w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
							>
								+ Add on
							</button>

							<div className="flex-1" />

							<div className="mt-auto rounded-[14px] border border-[#E5E7EB] bg-white p-[14px]">
								<div className="flex items-center justify-between mb-[8px]">
									<p className="text-[14px] font-semibold text-black">Summary Details</p>
									<button type="button" className="text-[12px] font-semibold" style={{ color: '#C58B2A' }}>
										Attach File
									</button>
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
											className="w-[14px] h-[14px] accent-green-600"
											aria-label="Use Carry Forward"
										/>
									</div>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.carryForwardAmount ?? 0)}</p>
								</div>
								<div className="h-[1px] bg-[#E5E7EB] my-[8px]" />
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] text-[#666666]">Total Amount</p>
									<p className="text-[12px] font-semibold text-black">{formatIndianCurrency(bankSummaryDetails?.totalPayable ?? 0)}</p>
								</div>
								<div className="flex items-center justify-between py-[6px]">
									<p className="text-[12px] underline text-[#C58B2A]">Discount</p>
									<p className="text-[12px] font-semibold" style={{ color: '#C58B2A' }}>{formatIndianCurrency(bankSummaryDetails?.discountAmount ?? 0)}</p>
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
											onWheel={(e) => {
												e.preventDefault();
												e.currentTarget.blur();
											}}
											className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] outline-none bg-white text-right bpt-payment-amount-input"
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
												setPaymentModePickerQuery('');
												setShowPaymentModePicker(true);
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													setPaymentModePickerQuery('');
													setShowPaymentModePicker(true);
												}
											}}
											className="w-full h-[40px] border border-[#D1D5DB] rounded-[6px] text-[13px] font-medium px-[12px] pr-[34px] outline-none bg-white flex items-center cursor-pointer"
											style={{ color: paymentForm.mode ? '#111827' : '#9E9E9E' }}
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

								{(paymentForm.mode === 'Net Banking' || paymentForm.mode === 'NEFT/RTGS') && (
									<>
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
										onClick={closePaymentSheet}
										className="h-[44px] rounded-[10px] bg-black text-white text-[14px] font-semibold"
									>
										Save
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
			<div className="flex items-center justify-between mt-[2px] border-b border-[#E0E0E0] pb-[8px]">
				<p className="text-[12px] font-semibold text-[#111827]">Date</p>
				<p className="text-[12px] font-semibold text-[#111827]">Vendor</p>
			</div>
			{/* Search */}
			<div className=" mt-[10px]">
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
			{/* Filter and Download Row (match ToolsTracker History layout) */}
			<div className="flex justify-between items-center gap-[4px] px-0 mt-[6px] flex-shrink-0">
				<div className="flex items-center gap-[4px] min-w-0">
					<button type="button" className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
						<img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
						<span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
					</button>
				</div>
			</div>
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
					const subLine = formatBillArrival(row?.bill_arrival_date ?? row?.billArrivalDate);

					const verificationStatus = getBillVerificationStatus(row);
					const entryStatusText = getEntryStatusText(row);
					const paymentStatus = paymentStatuses[row?.id] || 'To Pay';

					const statusLeft =
						verificationStatus === '✓ Verified' ? (
							<Chip label="Verified" tone="success" onClick={() => openVerifyModal(row)} />
						) : verificationStatus === 'Verified' ? (
							<Chip label="Verified" tone="warn" onClick={() => openVerifyModal(row)} />
						) : (
							<Chip label="To Verify" tone="neutral" onClick={() => openVerifyModal(row)} />
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
						<div
							key={idx}
							className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] w-full"
						>
							{/* Inner card (matches PO History card) */}
							<div className="bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out flex flex-col">
								<div className="flex items-start justify-between gap-[8px]">
									<div className="min-w-0">
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
											{subLine || ''}
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
						{renderTopBar('Enter PO Number', closeFullScreen, (
							<div className="text-right flex-shrink-0">
								<p className="text-[11px] font-semibold text-black leading-tight">
									Last PO:{' '}
									{lastPoNumber != null ? String(lastPoNumber) : '-'}
								</p>
								<p className="text-[10px] font-medium text-[#777777] leading-tight mt-[2px]">
									({Object.values(poValidation || {}).every(v => v?.matched === true) && Object.keys(poValidation || {}).length > 0 ? 'All Bills Verified' : 'Bills'})
								</p>
							</div>
						))}

						{/* Content (grid scrolls; buttons pinned) */}
						<div className="px-[14px] pt-[10px] pb-[16px] flex-shrink-0">
							<div className="flex items-center justify-between">
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
										className="w-[28px] h-[28px] flex items-center justify-center"
										aria-label="Edit"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
											<path d="M14 4l6 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
											<path d="M16 2l6 6L8 22H2v-6L16 2z" stroke="#111827" strokeWidth="2" strokeLinejoin="round" />
										</svg>
									</button>
								</div>
							</div>
						</div>

						{/* Scroll area: PO boxes */}
						<div
							className="px-[14px] overflow-y-auto no-scrollbar scrollbar-none flex-shrink-0"
							style={{ maxHeight: 'calc(100vh - 310px)' }}
						>
							<div className="mt-[10px] rounded-[10px] border border-[#E5E7EB] p-[10px]">
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

										let borderColor = C.neutral;
										if ((isDup && (persistedIsVerified || vState?.matched === true || isNoPo))) {
											borderColor = C.purple;
										} else if (persistedIsPaid) {
											borderColor = C.yellow;
										} else if (isNoPo) {
											borderColor = C.green;
										} else if (vState) {
											if (vState.matched === true) borderColor = C.green;
											else if (vState.message === 'Already Entered') borderColor = C.orange;
											else borderColor = C.red;
										} else if (persisted) {
											borderColor = persistedIsVerified ? C.green : C.red;
										}

										// Background should match the same "status color" (tinted fills).
										const hasAnyValue = isNoPo || !!displayValue || !!persisted;
										const BG = {
											neutral: '#FFFFFF',
											green: '#E2F9E1',
											red: '#FEE2E2',
											yellow: '#FEF9C3',
											purple: '#F3E8FF',
											orange: '#FFEDD5'
										};
										const bgColor = !hasAnyValue
											? '#FFFFFF'
											: (borderColor === C.green
												? BG.green
												: borderColor === C.red
													? BG.red
													: borderColor === C.yellow
														? BG.yellow
														: borderColor === C.purple
															? BG.purple
															: borderColor === C.orange
																? BG.orange
																: BG.neutral);

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
						<div className="px-[14px] pb-[16px] flex-shrink-0 bg-white">
							<div className="mt-[10px] grid grid-cols-2 gap-[10px]">
								<button
									type="button"
									onClick={checkPO}
									disabled={checkingPO}
									className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black disabled:opacity-50"
								>
									{checkingPO ? 'Checking...' : 'Check PO'}
								</button>
								<button
									type="button"
									onClick={makeDuplicate}
									className="h-[40px] rounded-[10px] border border-[#D1D5DB] bg-white text-[13px] font-semibold text-black"
								>
									{isDuplicateMode ? 'Duplicate Mode' : 'Make Duplicate'}
								</button>
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
								<span className="text-[20px] leading-none font-semibold text-[#E4572E]">×</span>
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

							<div className="mt-[4px] grid grid-cols-2 gap-[12px]">
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

