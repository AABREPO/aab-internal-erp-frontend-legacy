import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import BottomNav from '../PurchaseOrder/BottomNav';
import PendingBillMobile from './PendingBill';
import DatabaseMobile from './Database';
import StatementMobile from './Statement';
import Kebab from '../Images/Kebab.svg';
import { useNavigate } from 'react-router-dom';
import {
  BILL_PAYMENT_TRACKER_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';

const BILL_PAYMENTS_TAB_STORAGE_KEY = 'billPaymentsTrackerActiveTab';

const isValidBillPaymentsMobileTab = (tab) =>
	tab === 'pendingbill' || tab === 'billdatabase' || tab === 'billstatement';

const MobileTabs = ({ activeTab = 'pendingbill', onTabChange }) => {
	const tabsContainerRef = useRef(null);
	const activeTabRef = useRef(null);
	const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
	const dropdownRef = useRef(null);
	const kebabButtonRef = useRef(null);
	const dropdownMenuRef = useRef(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
	const dropdownMenuItems = useMemo(
		() => [
			{ id: 'pendingbill', label: 'Pending Bill' },
			{ id: 'billdatabase', label: 'Database' },
			{ id: 'billstatement', label: 'Statement' }
		],
		[]
	);
	const updateUnderlinePosition = () => {
		if (activeTabRef.current && tabsContainerRef.current) {
			const containerRect = tabsContainerRef.current.getBoundingClientRect();
			const tabRect = activeTabRef.current.getBoundingClientRect();
			const left = tabRect.left - containerRect.left;
			const width = tabRect.width;
			setUnderlineStyle({ left, width });
		}
	};
	useEffect(() => {
		updateUnderlinePosition();
		window.addEventListener('resize', updateUnderlinePosition);
		return () => {
			window.removeEventListener('resize', updateUnderlinePosition);
		};
	}, [activeTab]);
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				dropdownMenuRef.current &&
				!dropdownMenuRef.current.contains(event.target)
			) {
				setIsDropdownOpen(false);
			}
		};
		const updateDropdownPosition = () => {
			if (isDropdownOpen && kebabButtonRef.current) {
				const buttonRect = kebabButtonRef.current.getBoundingClientRect();
				setDropdownPosition({
					top: buttonRect.bottom + 5,
					right: window.innerWidth - buttonRect.right
				});
			}
		};
		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			document.addEventListener('touchstart', handleClickOutside);
			window.addEventListener('resize', updateDropdownPosition);
			window.addEventListener('scroll', updateDropdownPosition, true);
			updateDropdownPosition();
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
			window.removeEventListener('resize', updateDropdownPosition);
			window.removeEventListener('scroll', updateDropdownPosition, true);
		};
	}, [isDropdownOpen]);
	const handleDropdownToggle = (e) => {
		e.stopPropagation();
		if (!isDropdownOpen && kebabButtonRef.current) {
			const buttonRect = kebabButtonRef.current.getBoundingClientRect();
			setDropdownPosition({
				top: buttonRect.bottom + 5,
				right: window.innerWidth - buttonRect.right
			});
		}
		setIsDropdownOpen(!isDropdownOpen);
	};
	const handleMenuItemClick = (tabId) => {
		onTabChange(tabId);
		setIsDropdownOpen(false);
	};
	return (
		<>
			<div
				ref={tabsContainerRef}
				className="fixed top-[50px] left-1/2 transform -translate-x-1/2 w-full max-w-[360px] h-[38px] bg-white z-40"
				style={{ fontFamily: "'Manrope', sans-serif" }}
			>
				<div className="flex items-center justify-between px-[14px] pr-[14px] h-full relative">
					<div className="flex gap-[16px]">
						<button
							ref={activeTab === 'pendingbill' ? activeTabRef : null}
							onClick={() => onTabChange('pendingbill')}
							className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
								activeTab === 'pendingbill' ? 'text-black' : 'text-[#848484]'
							}`}
						>
							Pending Bill
						</button>
						<button
							ref={activeTab === 'billdatabase' ? activeTabRef : null}
							onClick={() => onTabChange('billdatabase')}
							className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
								activeTab === 'billdatabase' ? 'text-black' : 'text-[#848484]'
							}`}
						>
							Database
						</button>
						<button
							ref={activeTab === 'billstatement' ? activeTabRef : null}
							onClick={() => onTabChange('billstatement')}
							className={`font-semibold text-[12px] leading-normal mt-[8px] whitespace-nowrap flex-shrink-0 ${
								activeTab === 'billstatement' ? 'text-black' : 'text-[#848484]'
							}`}
						>
							Statement
						</button>
					</div>
					<div
						ref={dropdownRef}
						className="absolute right-[-4px] top-0 bottom-0 flex items-center justify-center"
						style={{ zIndex: 31 }}
					>
						<button
							ref={kebabButtonRef}
							onClick={handleDropdownToggle}
							className="flex items-center justify-center w-[16px] h-[16px] cursor-pointer hover:opacity-7 "
							style={{ marginTop: '8px', marginLeft: '8px' }}
						>
							<img src={Kebab} alt="Kebab" className="w-[16px] h-[16px]" />
						</button>
					</div>
				</div>
				<div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ backgroundColor: '#D9D9D9' }} />
				<div
					className="absolute bottom-0 h-[1.70px] transition-all duration-300"
					style={{
						backgroundColor: '#BF9853',
						left: `${Math.max(0, underlineStyle.left - 8)}px`,
						width: `${underlineStyle.width + 16}px`
					}}
				/>
			</div>
			{isDropdownOpen && (
				<div
					ref={dropdownMenuRef}
					className="fixed bg-white rounded-lg shadow-lg py-[8px]"
					style={{
						zIndex: 9999,
						top: `${dropdownPosition.top}px`,
						right: `${dropdownPosition.right}px`,
						width: '160px',
						maxWidth: '160px'
					}}
				>
					{dropdownMenuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => handleMenuItemClick(item.id)}
							className={`w-full text-left px-[16px] py-[8px] text-[12px] font-semibold transition-colors ${
								activeTab === item.id ? 'text-black bg-[#E8E8E8]' : 'text-[#333333] hover:bg-[#E8E8E8]'
							}`}
						>
							{item.label}
						</button>
					))}
				</div>
			)}
		</>
	);
};

const MobileBillPaymentsTracker = ({ user, onLogout }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState('billing');
	const navigate = useNavigate();
	const handleMenuClick = () => setSidebarOpen(true);
	const handleSidebarClose = () => setSidebarOpen(false);
	const handleNavigate = (page) => {
		if (page === 'request-for-quotation') {
			setCurrentPage('request-for-quotation');
			navigate('/rfq');
		} else if (page === 'billing') {
			setCurrentPage('billing');
			navigate('/tracker/pendingbill');
		} else if (page === 'purchase-order') {
			setCurrentPage('purchase-order');
			navigate('/purchaseorder');
		} else if (page === 'goods-recieved-notes') {
			setCurrentPage('goods-recieved-notes');
			navigate('/grn/create');
		} else if (page === 'inventory') {
			setCurrentPage('inventory');
			navigate('/inventory');
		} else if (page === 'tools-tracker') {
			setCurrentPage('tools-tracker');
			navigate('/toolsTracker');
		} else if (page === 'project-advance') {
			setCurrentPage('project-advance');
			navigate('/portal');
		} else if (page === 'loan-portal') {
			setCurrentPage('loan-portal');
			navigate('/loan');
		}
	};
	const [activeTab, setActiveTab] = useState(() => {
		let tab = localStorage.getItem(BILL_PAYMENTS_TAB_STORAGE_KEY);
		if (!isValidBillPaymentsMobileTab(tab)) {
			const legacy = localStorage.getItem('activePaintTab');
			if (isValidBillPaymentsMobileTab(legacy)) tab = legacy;
			else tab = 'pendingbill';
		}
		return tab;
	});
	const paymentModeOptions = usePaymentModeSelectOptionsForModule(
		BILL_PAYMENT_TRACKER_MODULE_NAME,
		[]
	);
	const paymentModeLabels = useMemo(
		() => paymentModeOptions.map((opt) => opt.label),
		[paymentModeOptions]
	);

	useEffect(() => {
		localStorage.setItem(BILL_PAYMENTS_TAB_STORAGE_KEY, activeTab);
	}, [activeTab]);
	return (
		<div className="w-full flex justify-center bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
			<div className="relative w-full max-w-[360px] min-h-screen bg-white">
				<Sidebar
					isOpen={sidebarOpen}
					onClose={handleSidebarClose}
					onNavigate={handleNavigate}
					currentPage={currentPage}
					userRoles={user?.userRoles || []}
				/>
				<Header title="Bill Payments Tracker" user={user} onLogout={onLogout} onMenuClick={handleMenuClick} />
				<MobileTabs activeTab={activeTab} onTabChange={setActiveTab} />
				<div className="pt-[87px] pb-[88px]">
					{/* Keep tabs mounted so data/state doesn't reload on tab switch */}
					<div style={{ display: activeTab === 'pendingbill' ? 'block' : 'none' }}>
						<PendingBillMobile
							username={user?.username}
							userRoles={user?.userRoles || []}
							paymentModeLabels={paymentModeLabels}
						/>
					</div>
					<div style={{ display: activeTab === 'billdatabase' ? 'block' : 'none' }}>
						<DatabaseMobile username={user?.username} userRoles={user?.userRoles || []} />
					</div>
					<div style={{ display: activeTab === 'billstatement' ? 'block' : 'none' }}>
						<StatementMobile paymentModeLabels={paymentModeLabels} />
					</div>
				</div>
				<BottomNav activeTab="home" />
			</div>
		</div>
	);
};

export default MobileBillPaymentsTracker;

