import React, { useEffect, useMemo, useState } from 'react';
import Filter from '../Images/Filter.png';
import Download from '../Images/Download.svg';
import Star from '../Images/Star.svg';
import Search from '../Images/Search.png';
import Close from '../Images/close.png';

const ModeTag = ({ label }) => (
	<div className="px-[10px] h-[22px] rounded-full text-[11px] font-semibold flex items-center" style={{ background: '#F5E8FB', color: '#7C3AED' }}>
		{label}
	</div>
);

const StatementRow = ({
	title,
	vendor,
	mode,
	paidAmount,
	overallAmount,
	onOpenPaidBill,
	onOpenOverallPdf,
	dateLineNode,
	vDate,
	eDate,
	pDate
}) => (
	<div className="w-full bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] overflow-hidden px-[12px] py-[10px] box-border">
		{/* Row 1: Bills (left) + Mode (right) */}
		<div className="flex items-start justify-between gap-[12px]">
			<p className="flex-1 min-w-0 text-left text-[12px] font-bold text-[#6B7280] leading-[18px] truncate">
				{title}
			</p>
			<div className="flex-shrink-0">
				<ModeTag label={mode} />
			</div>
		</div>

		{/* Row 2: Vendor (left) + Paid amount (right) */}
		<div className="flex items-start justify-between gap-[12px] mt-[2px]">
			<p className="flex-1 min-w-0 text-left text-[12px] font-semibold text-[#111827] leading-[18px] truncate">
				{vendor}
			</p>
			<button
				type="button"
				onClick={onOpenPaidBill}
				disabled={!onOpenPaidBill}
				className="flex-shrink-0 text-[14px] font-bold text-[#0F766E] leading-[20px] disabled:opacity-60"
				style={{ textDecoration: 'underline' }}
			>
				₹{paidAmount}
			</button>
		</div>

		{/* Row 3: Date/time (left) + Bill amount (right) */}
		<div className="flex items-start justify-between gap-[12px] mt-[6px]">
			<p className="flex-1 min-w-0 text-left text-[11px] font-medium text-[#6B7280] leading-[16px] break-words">
				{dateLineNode || '-'}
			</p>
			<button
				type="button"
				onClick={onOpenOverallPdf}
				disabled={!onOpenOverallPdf}
				className="flex-shrink-0 text-[12px] font-bold text-[#111827] leading-[18px] disabled:opacity-60"
				style={{ textDecoration: 'underline' }}
			>
				₹{overallAmount}
			</button>
		</div>

		{/* Row 4: V/E/P */}
		<p className="text-left text-[11px] font-semibold text-[#6B7280] leading-[16px] mt-[6px]">
			V - {vDate} &nbsp;&nbsp; E - {eDate} &nbsp;&nbsp; P - {pDate}
		</p>
	</div>
);

const StatementMobile = ({ paymentModeLabels: paymentModeLabelsFromProps = [] }) => {
	const API_BASE = 'https://backendaab.in/aabuildersDash/api';

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [rows, setRows] = useState([]); // already-expanded statement rows from backend
	const [showFilterSheet, setShowFilterSheet] = useState(false);
	const [filterFromDate, setFilterFromDate] = useState(''); // YYYY-MM-DD (tracker/bill arrival date)
	const [filterToDate, setFilterToDate] = useState(''); // YYYY-MM-DD (tracker/bill arrival date)
	const [filterPaymentDate, setFilterPaymentDate] = useState(''); // YYYY-MM-DD (payment date)
	const [filterPaymentMode, setFilterPaymentMode] = useState(''); // '' | mode label
	const [vendorMap, setVendorMap] = useState({});
	const [showStatementVendorPopup, setShowStatementVendorPopup] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState('');
	const [vendorSearch, setVendorSearch] = useState('');
	const [showModePopup, setShowModePopup] = useState(false);

	const parseDateAny = (input) => {
		if (input == null || input === '') return null;
		if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
		if (Array.isArray(input)) {
			const y = input[0];
			const mo = input[1];
			const d = input[2];
			const h = input[3] ?? 0;
			const mi = input[4] ?? 0;
			const s = input[5] ?? 0;
			if (y == null || mo == null || d == null) return null;
			const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
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

	const formatDdMmYyyy = (d) => {
		if (!d || isNaN(d.getTime())) return '-';
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	};

	const formatTime12h = (d) => {
		if (!d || isNaN(d.getTime())) return '-';
		let hours = d.getHours();
		const minutes = String(d.getMinutes()).padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? String(hours).padStart(2, '0') : '12';
		return `${hours}:${minutes} ${ampm}`;
	};

	const relativeOrDate = (d) => {
		if (!d || isNaN(d.getTime())) return '-';
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		if (dateOnly.getTime() === today.getTime()) return 'Today';
		if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
		return formatDdMmYyyy(d);
	};

	const formatInr = (amount) => {
		const n = Number(amount);
		if (!Number.isFinite(n)) return '-';
		return parseInt(Math.abs(n), 10).toLocaleString('en-IN');
	};

	const openUrl = (url) => {
		if (!url) return;
		const s = String(url || '').trim();
		if (!/^(https?:\/\/)/i.test(s)) return;
		window.open(s, '_blank', 'noopener,noreferrer');
	};

	useEffect(() => {
		let mounted = true;
		const q = String(query || '').trim();
		const from = String(filterFromDate || '').trim();
		const to = String(filterToDate || '').trim();
		const paymentDate = String(filterPaymentDate || '').trim();
		const paymentMode = String(filterPaymentMode || '').trim();

		const controller = new AbortController();

		const run = async () => {
			setLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams();
				if (q) params.set('query', q);
				if (from) params.set('fromDate', from);
				if (to) params.set('toDate', to);
				if (paymentDate) params.set('paymentDate', paymentDate);
				if (paymentMode) params.set('paymentMode', paymentMode);

				const url = `${API_BASE}/vendor-payments/statement${params.toString() ? `?${params.toString()}` : ''}`;
				const res = await fetch(url, {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					signal: controller.signal
				});
				if (!res.ok) {
					const msg = await res.text().catch(() => '');
					throw new Error(msg || `Request failed (${res.status})`);
				}
				const data = await res.json().catch(() => []);
				if (!mounted) return;
				setRows(Array.isArray(data) ? data : []);
			} catch (e) {
				// Ignore aborts during rapid typing
				if (String(e?.name || '') === 'AbortError') return;
				if (!mounted) return;
				setRows([]);
				setError(e?.message || 'Failed to load statement');
			} finally {
				if (mounted) setLoading(false);
			}
		};

		// Small debounce for search typing, but keep filters responsive.
		const shouldDebounce = Boolean(q);
		const t = window.setTimeout(run, shouldDebounce ? 300 : 0);

		return () => {
			mounted = false;
			window.clearTimeout(t);
			controller.abort();
		};
	}, [query, filterFromDate, filterToDate, filterPaymentDate, filterPaymentMode]);

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

	const vendorList = Object.entries(vendorMap || {}).map(([id, name]) => ({
		id,
		name
	}));

	const modeOptions = paymentModeLabelsFromProps;

	const statementRows = useMemo(() => {
		const list = Array.isArray(rows) ? rows : [];
		return list.map((r, idx) => {
			const paid = r?.paid_amount;
			const overall = r?.overall_amount;

			const arrivalDateObj = parseDateAny(r?.arrival_date);
			const paymentTsObj = parseDateAny(r?.payment_timestamp);
			const paymentDateObj = parseDateAny(r?.payment_date);

			const primaryDate = paymentTsObj || paymentDateObj || arrivalDateObj;
			const seg1 = primaryDate ? relativeOrDate(primaryDate) : '-';
			const seg2 = primaryDate ? formatDdMmYyyy(primaryDate) : '-';
			const seg3 = primaryDate ? formatTime12h(primaryDate) : '-';

			const dateLineNode = (
				<>
					<span className="font-bold text-[#111827]">{seg1}</span>
					<span className="font-medium text-[#777777]"> • </span>
					<span className="font-medium text-[#777777]">{seg2}</span>
					<span className="font-medium text-[#777777]"> • </span>
					<span className="font-medium text-[#777777]">{seg3}</span>
				</>
			);

			return {
				key: `${r?.tracker_id ?? 't'}-${idx}`,
				title: r?.title ?? '-',
				vendorName: r?.vendor_name ?? 'Unknown Vendor',
				mode: r?.mode ?? '-',
				paidAmount: Number.isFinite(Number(paid)) ? formatInr(paid) : (paid == null ? '-' : String(paid)),
				overallAmount: Number.isFinite(Number(overall)) ? formatInr(overall) : (overall == null ? '-' : String(overall)),
				dateLineNode,
				vDate: r?.v_date ?? '-',
				eDate: r?.e_date ?? '-',
				pDate: r?.p_date ?? r?.payment_date ?? '-',
				billUrl: r?.bill_url ?? null,
				overallPdfUrl: r?.overall_pdf_url ?? null
			};
		});
	}, [rows]);

	return (
		<div className="w-full h-[calc(100vh-96px-80px)] overflow-hidden flex flex-col">
			<div className="flex-shrink-0">
				<div className="flex items-center justify-between border-b border-[#E0E0E0] pt-[8px] pb-[8px]">
					<div className="flex items-center gap-2">
						<p
							className="text-[12px] font-semibold text-[#111827] cursor-pointer"
							onClick={() => setShowStatementVendorPopup(true)}
						>
							{selectedVendor || 'Vendor'}
						</p>
						{selectedVendor && (
							<span
								onClick={(e) => {
									e.stopPropagation();
									setSelectedVendor('');
								}}
								className="cursor-pointer"
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" />
								</svg>
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<p
							className="text-[12px] font-semibold text-[#111827] cursor-pointer"
							onClick={() => setShowModePopup(true)}
						>
							{filterPaymentMode || 'Mode'}
						</p>
						{filterPaymentMode && (
							<span
								onClick={(e) => {
									e.stopPropagation();
									setFilterPaymentMode('');
								}}
								className="cursor-pointer"
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" />
								</svg>
							</span>
						)}
					</div>
				</div>
				<div className="mt-[8px]">
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
				<div className="flex justify-between items-center gap-[4px] px-0 flex-shrink-0">
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
					<button type="button" className="w-[34px] h-[34px] bg-white flex items-center justify-center">
						<img src={Download} alt="Download" className="w-4 h-4" />
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

							<div className="mt-[12px]">
								<p className="text-[12px] font-semibold text-black mb-[6px]">Payment Date</p>
								<input
									type="date"
									value={filterPaymentDate}
									onChange={(e) => setFilterPaymentDate(e.target.value)}
									className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
								/>
							</div>

							<div className="mt-[12px]">
								<p className="text-[12px] font-semibold text-black mb-[6px]">Payment Mode</p>
								<select
									value={filterPaymentMode}
									onChange={(e) => setFilterPaymentMode(e.target.value)}
									className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-[10px] text-[12px] font-medium text-[#111827] outline-none"
								>
									<option value="">All</option>
									{modeOptions.map((mode) => (
										<option key={mode} value={mode}>{mode}</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex-shrink-0 px-[16px] pb-[26px] pt-[10px] border-t border-[#E5E7EB] grid grid-cols-2 gap-[12px]">
							<button
								type="button"
								onClick={() => {
									setFilterFromDate('');
									setFilterToDate('');
									setFilterPaymentDate('');
									setFilterPaymentMode('');
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

			<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pb-[10px]">
				<div className="flex flex-col">
					{!loading && statementRows.length === 0 && !error && (
						<p className="text-[12px] text-center text-[#6B7280] mt-[6px]">No data</p>
					)}
					{error && !loading && (
						<p className="text-[12px] text-center text-[#E4572E] mt-[6px]">{error}</p>
					)}
					{statementRows.map((r) => (
						<StatementRow
							key={r.key}
							title={r.title}
							vendor={r.vendorName}
							mode={r.mode}
							paidAmount={r.paidAmount}
							overallAmount={r.overallAmount}
							dateLineNode={r.dateLineNode}
							vDate={r.vDate}
							eDate={r.eDate}
							pDate={r.pDate}
							onOpenPaidBill={r.billUrl ? () => openUrl(r.billUrl) : null}
							onOpenOverallPdf={r.overallPdfUrl ? () => openUrl(r.overallPdfUrl) : null}
						/>
					))}
				</div>
			</div>

			{showStatementVendorPopup && (
				<div
					className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
					onClick={() => setShowStatementVendorPopup(false)}
				>
					<div
						className="bg-white w-[92%] max-w-[360px] h-[80vh] rounded-[20px] p-4 flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-[16px] font-semibold">Select Vendor</h2>
							<span className="cursor-pointer" onClick={() => setShowStatementVendorPopup(false)}>
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
								value={vendorSearch}
								onChange={(e) => setVendorSearch(e.target.value)}
							/>
						</div>

						<div className="rounded-[12px] shadow-sm overflow-y-auto no-scrollbar scrollbar-none flex-1">
							{vendorList.length > 0 ? (
								vendorList
									.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
									.map((vendor) => (
										<div
											key={vendor.id}
											className="flex items-center gap-3 p-3 rounded-[10px] cursor-pointer hover:bg-gray-100"
											onClick={() => {
												setSelectedVendor(vendor.name);
												setShowStatementVendorPopup(false);
											}}
										>
											<img src={Star} alt="Star" className="w-[16px] h-[16px]" />
											<span className="text-[14px] text-gray-800">{vendor.name}</span>
										</div>
									))
							) : (
								<p className="text-sm text-gray-400 text-center py-4">No vendors found</p>
							)}
						</div>
					</div>
				</div>
			)}

			{showModePopup && (
				<div
					className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
					onClick={() => setShowModePopup(false)}
				>
					<div
						className="bg-white w-[92%] max-w-[360px] h-[80vh] rounded-[20px] p-4 flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-[16px] font-semibold">Select Mode</h2>
							<span className="cursor-pointer" onClick={() => setShowModePopup(false)}>
								<img src={Close} alt="Close" className="w-[11px] h-[11px]" />
							</span>
						</div>

						<div className="rounded-[12px] shadow-sm overflow-y-auto no-scrollbar scrollbar-none max-h-[60vh]">
							<div
								className="flex items-center gap-3 p-3 rounded-[10px] cursor-pointer hover:bg-gray-100"
								onClick={() => {
									setFilterPaymentMode('');
									setShowModePopup(false);
								}}
							>
								<img src={Star} alt="Star" className="w-[16px] h-[16px]" />
								<span className="text-[14px] text-gray-800">All</span>
							</div>
							{modeOptions.map((mode) => (
								<div
									key={mode}
									className="flex items-center gap-3 p-3 rounded-[10px] cursor-pointer hover:bg-gray-100"
									onClick={() => {
										setFilterPaymentMode(mode);
										setShowModePopup(false);
									}}
								>
									<img src={Star} alt="Star" className="w-[16px] h-[16px]" />
									<span className="text-[14px] text-gray-800">{mode}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StatementMobile;

