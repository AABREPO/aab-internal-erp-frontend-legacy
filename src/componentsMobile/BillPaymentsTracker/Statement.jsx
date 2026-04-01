import React, { useEffect, useMemo, useState } from 'react';

const ModeTag = ({ label }) => (
	<div className="px-[10px] h-[22px] rounded-full text-[11px] font-semibold flex items-center" style={{ background: '#F5E8FB', color: '#7C3AED' }}>
		{label}
	</div>
);

const StatementRow = ({ title, vendor, mode, bigAmount, smallAmount, vDate, eDate, pDate }) => (
	<div className="w-full bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] p-[14px] box-border">
		<div className="flex items-start justify-between gap-[12px]">
			<div className="flex-1 min-w-0">
				<p className="text-[12px] font-bold text-[#6B7280] leading-[18px] truncate">{title}</p>
				<p className="text-[12px] font-semibold text-[#111827] leading-[18px] mt-[2px] truncate">{vendor}</p>
				<p className="text-[11px] font-semibold text-[#6B7280] leading-[16px] mt-[6px]">
					V - {vDate} &nbsp;&nbsp; E - {eDate} &nbsp;&nbsp; P - {pDate}
				</p>
			</div>
			<div className="text-right">
				<ModeTag label={mode} />
				<p className="text-[14px] font-bold text-[#0F766E] leading-[20px] mt-[8px]">₹{bigAmount}</p>
				<p className="text-[12px] font-bold text-[#0F766E] leading-[18px] mt-[4px]" style={{ textDecoration: 'underline' }}>
					₹{smallAmount}
				</p>
			</div>
		</div>
	</div>
);

const StatementMobile = () => {
	const [items, setItems] = useState([]);
	useEffect(() => {
		// Placeholder; actual source can be wired later similar to desktop statement
		setItems([]);
	}, []);
	const list = useMemo(() => items, [items]);
	return (
		<div className="w-full">
			<div className="px-[6px] mt-[2px]">
				<div className="w-full h-[36px] rounded-[24px] bg-white border border-[#E5E7EB] flex items-center px-[12px]">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
						<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
						<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<input
						placeholder="Search"
						className="ml-[8px] flex-1 outline-none text-[12px] font-semibold text-[#111827] placeholder-[#9CA3AF]"
						style={{ background: 'transparent' }}
					/>
				</div>
			</div>
			<div className="mt-[10px] px-[6px] flex flex-col gap-[10px] pb-[80px]">
				{list.length === 0 && (
					<StatementRow
						title="13 - 2025 - Bills 7"
						vendor="Kaasa Doors"
						mode="Net Banking"
						bigAmount="50,000"
						smallAmount="70,000"
						vDate="07/11/2025"
						eDate="10/11/2025"
						pDate="14/11/2025"
					/>
				)}
			</div>
		</div>
	);
};

export default StatementMobile;

