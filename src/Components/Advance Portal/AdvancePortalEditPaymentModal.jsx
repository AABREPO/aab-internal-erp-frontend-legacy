import React, { useMemo } from 'react';
import Select from 'react-select';
import CustomDateField from '../ExpensesEntry/CustomDateField';
import { isAdvanceOnlinePaymentModeForModal } from '../../utils/advancePortalWeeklyPaymentBill';
import { isChequePaymentMode } from '../../utils/bankRegisterLogBeforeWeeklyBill';

const PAYMENT_MODAL_SELECT_Z_INDEX = 10001;

const buildAccountOptions = (accountDetails) =>
  (accountDetails || []).map((account) => ({
    value: account.account_number,
    label: account.account_number,
  }));

const resolveSelectedAccountOption = (accountOptions, rawAccountNumber) => {
  const raw = rawAccountNumber;
  if (raw == null || String(raw).trim() === '') return null;
  const match = accountOptions.find((o) => String(o.value) === String(raw));
  return match || { value: String(raw), label: String(raw) };
};

const AdvancePortalEditPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  paymentMode,
  date,
  amount,
  paymentModalData,
  setPaymentModalData,
  accountDetails = [],
  selectStyles,
}) => {
  const paymentSelectStyles = useMemo(() => {
    const baseStyles = selectStyles || {};
    return {
      ...baseStyles,
      menuPortal: (provided, state) => ({
        ...(baseStyles.menuPortal ? baseStyles.menuPortal(provided, state) : provided),
        zIndex: PAYMENT_MODAL_SELECT_Z_INDEX,
      }),
      menu: (provided, state) => ({
        ...(baseStyles.menu ? baseStyles.menu(provided, state) : provided),
        zIndex: PAYMENT_MODAL_SELECT_Z_INDEX,
      }),
    };
  }, [selectStyles]);

  const accountOptions = useMemo(() => buildAccountOptions(accountDetails), [accountDetails]);
  const selectedAccountOption = useMemo(
    () => resolveSelectedAccountOption(accountOptions, paymentModalData?.accountNumber),
    [accountOptions, paymentModalData?.accountNumber]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[10000]">
      <div className="bg-white text-left rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto flex flex-col relative z-[10000]">
        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 mb-4">
            <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <CustomDateField
                    value={date || ''}
                    onChange={() => {}}
                    disabled
                    placeholder="Date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="text"
                    value={amount ?? ''}
                    readOnly
                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <input
                    type="text"
                    value={paymentMode || ''}
                    readOnly
                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                  />
                </div>
              </div>
            </div>
            {isAdvanceOnlinePaymentModeForModal(paymentMode) && (
              <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                <div className="space-y-4">
                  {isChequePaymentMode(paymentMode) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentModalData.chequeNo}
                          onChange={(e) => setPaymentModalData((prev) => ({ ...prev, chequeNo: e.target.value }))}
                          placeholder="Enter cheque number"
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Date <span className="text-red-500">*</span>
                        </label>
                        <CustomDateField
                          value={paymentModalData.chequeDate}
                          onChange={(v) => setPaymentModalData((prev) => ({ ...prev, chequeDate: v }))}
                          placeholder="Cheque date"
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                      <input
                        type="text"
                        value={paymentModalData.transactionNumber}
                        onChange={(e) => setPaymentModalData((prev) => ({ ...prev, transactionNumber: e.target.value }))}
                        placeholder="Enter transaction number (optional)"
                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={accountOptions}
                        value={selectedAccountOption}
                        onChange={(selected) =>
                          setPaymentModalData((prev) => ({
                            ...prev,
                            accountNumber: selected ? selected.value : '',
                          }))
                        }
                        placeholder="Select Account"
                        isSearchable
                        isClearable
                        styles={paymentSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        menuPlacement="auto"
                        className="w-full focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-[100px] h-[45px] border border-[#BF9853] rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancePortalEditPaymentModal;
