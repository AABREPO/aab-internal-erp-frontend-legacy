import React from "react";
import OrbitBankRegisterStrip from "./OrbitBankRegisterStrip";
import BillPayment from "../Bank Register/BillPayment";

const ORBIT_PAGE_SHELL_CSS = `
.orbit-bill-payment-shell-inner{
  --gold:#D6AB60; --gold-deep:#B8924B; --ink:#212121; --muted:#8a8275;
  --cream:#FBF7F0; --line:#EADFC8;
  font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
  color:var(--ink);
  background:var(--cream);
  min-height:calc(100vh - 88px);
  box-sizing:border-box;
  padding:12px 18px;
}
@media(max-width:768px){
  .orbit-bill-payment-shell-inner{padding:10px;}
}
`;

/**
 * Bank Register–style tab strip + Bill Payment body. The global Orbit top bar is provided by OrbitAppChrome in App.js.
 */
export default function OrbitBillPaymentShell({ username, userRoles = [] }) {
  return (
    <>
      <OrbitBankRegisterStrip />
      <div className="orbit-bill-payment-shell-inner">
        <style>{ORBIT_PAGE_SHELL_CSS}</style>
        <BillPayment username={username} userRoles={userRoles} hideTopHeading />
      </div>
    </>
  );
}
