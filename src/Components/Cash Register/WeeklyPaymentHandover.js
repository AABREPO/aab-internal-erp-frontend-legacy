import { useEffect, useState } from "react";
import axios from "axios";

const formatHandoverAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatHandoverDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatHandoverWeek = (weekNumber) => {
    if (weekNumber === null || weekNumber === undefined || weekNumber === "") return "-";
    return String(weekNumber).padStart(2, "0");
};

const getPaymentBranchId = (payment) => payment?.branch_id ?? payment?.branchId ?? null;

const buildBranchLabelMap = (branches) => {
    const map = new Map();
    (branches || []).forEach((branch) => {
        if (branch?.id === null || branch?.id === undefined) return;
        map.set(String(branch.id), branch.branch || String(branch.id));
    });
    return map;
};

const getPaymentBranchLabel = (payment, branchLabelMap) => {
    const branchId = getPaymentBranchId(payment);
    if (branchId !== null && branchId !== undefined && branchId !== "") {
        const mapped = branchLabelMap.get(String(branchId));
        if (mapped) return mapped;
    }
    return payment?.branch ?? payment?.branch_name ?? payment?.branchName ?? "-";
};

export const HandoverPaymentsModal = ({ show, onClose }) => {
    const [handoverPayments, setHandoverPayments] = useState([]);
    const [branchLabelMap, setBranchLabelMap] = useState(() => new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!show) return undefined;

        const fetchHandoverPayments = async () => {
            setLoading(true);
            try {
                const [paymentsRes, branchesRes] = await Promise.all([
                    axios.get("https://backendaab.in/demoAabuildersDash/api/payments-received/getAll"),
                    axios.get("https://backendaab.in/demoAabuildersDash/api/branch/getAll", {
                        withCredentials: true,
                    }),
                ]);

                setBranchLabelMap(buildBranchLabelMap(branchesRes.data));

                const filtered = (paymentsRes.data || [])
                    .filter((payment) => payment.type === "Handover")
                    .sort((a, b) => {
                        const weekA = Number(a.weekly_number) || 0;
                        const weekB = Number(b.weekly_number) || 0;
                        if (weekA !== weekB) return weekB - weekA;
                        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
                    });
                setHandoverPayments(filtered);
            } catch (error) {
                console.error("Error fetching handover payments:", error);
                setHandoverPayments([]);
                setBranchLabelMap(new Map());
            } finally {
                setLoading(false);
            }
        };

        fetchHandoverPayments();
        return undefined;
    }, [show]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-[900px] p-6"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">All Handover Payments</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#E4572E] text-2xl font-bold leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : handoverPayments.length === 0 ? (
                    <p className="text-sm text-gray-500">No handover payments found.</p>
                ) : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-[#E0E0E0]">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-[#F2F2F2] sticky top-0 z-[1]">
                                <tr>
                                    <th className="px-4 py-3 border border-[#E0E0E0] text-center font-bold text-sm">Week</th>
                                    <th className="px-4 py-3 border border-[#E0E0E0] text-center font-bold text-sm">Branch</th>
                                    <th className="px-4 py-3 border border-[#E0E0E0] text-center font-bold text-sm">Type</th>
                                    <th className="px-4 py-3 border border-[#E0E0E0] text-center font-bold text-sm">Amount</th>
                                    <th className="px-4 py-3 border border-[#E0E0E0] text-center font-bold text-sm">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {handoverPayments.map((payment) => (
                                    <tr key={payment.id} className="bg-white">
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-center text-sm">
                                            {formatHandoverWeek(payment.weekly_number)}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-center text-sm">
                                            {getPaymentBranchLabel(payment, branchLabelMap)}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-center text-sm">
                                            {payment.type}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-center text-sm">
                                            {formatHandoverAmount(payment.amount)}
                                        </td>
                                        <td className="px-4 py-3 border border-[#E0E0E0] text-center text-sm">
                                            {formatHandoverDate(payment.date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const HandoverPaymentsPage = () => {
    const [showModal, setShowModal] = useState(true);

    return (
        <HandoverPaymentsModal
            show={showModal}
            onClose={() => setShowModal(false)}
        />
    );
};

export default HandoverPaymentsPage;
