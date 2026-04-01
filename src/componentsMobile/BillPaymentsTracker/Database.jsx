import React, { useEffect, useMemo, useState } from 'react';

const Chip = ({ label }) => (
	<div className="h-[28px] px-[12px] rounded-[22px] flex items-center gap-[6px]" style={{ background: '#EAF9EE' }}>
		<span className="text-[12px] font-semibold" style={{ color: '#1E8E3E' }}>✓</span>
		<span className="text-[12px] font-semibold" style={{ color: '#1E8E3E' }}>{label}</span>
	</div>
);

const Row = ({ name, amount, billsCount, subLine }) => (
	<div className="w-full bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] p-[14px] box-border">
		<div className="flex items-start justify-between">
			<div className="flex flex-col">
				<p className="text-[14px] font-semibold text-[#111827] leading-[20px]">{name || '-'}</p>
				<p className="text-[11px] font-semibold text-[#6B7280] leading-[16px] mt-[2px]">{subLine}</p>
			</div>
			<div className="text-right">
				<p className="text-[14px] font-bold text-[#111827] leading-[20px]">₹{amount?.toLocaleString?.('en-IN') || amount || '0'}</p>
				<p className="text-[11px] font-semibold text-[#6B7280] leading-[16px] mt-[2px]">No. of bills: {billsCount ?? '-'}</p>
			</div>
		</div>
		<div className="flex items-center gap-[10px] mt-[12px] flex-wrap">
			<Chip label="Verified" />
			<Chip label="Entered" />
			<Chip label="Paid" />
		</div>
	</div>
);

const DatabaseMobile = () => {
	const [apiData, setApiData] = useState([]);
	const [query, setQuery] = useState('');
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			try {
				const res = await fetch('https://backendaab.in/aabuildersDash/api/vendor-payments/trackers', {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});
				const text = await res.text();
				let data = [];
				try { data = JSON.parse(text); } catch (e) { data = []; }
				if (isMounted) setApiData(Array.isArray(data) ? data : []);
			} catch (e) {
				if (isMounted) setApiData([]);
			}
		};
		load();
		return () => { isMounted = false; };
	}, []);
	const filtered = useMemo(() => {
		if (!query) return apiData;
		const q = query.toLowerCase();
		return apiData.filter((row) => (row?.vendorName || '').toLowerCase().includes(q));
	}, [apiData, query]);
	return (
		<div className="w-full">
			<div className="px-[6px] mt-[2px]">
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
			<div className="mt-[10px] px-[6px] flex flex-col gap-[10px] pb-[80px]">
				{filtered.map((row, idx) => (
					<Row
						key={idx}
						name={row?.vendorName || row?.vendor?.name || 'Vendor'}
						amount={row?.totalAmount || row?.amount || 0}
						billsCount={row?.billsCount ?? row?.noOfBills ?? row?.billCount ?? '-'}
						subLine={row?.updatedAt ? new Date(row.updatedAt).toLocaleString('en-GB') : ''}
					/>
				))}
			</div>
		</div>
	);
};

export default DatabaseMobile;

