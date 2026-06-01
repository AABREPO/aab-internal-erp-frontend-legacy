import React from "react";
import OrbitERPHeading from "./OrbitERPHeading";
import { useSidebar } from "../../context/SidebarContext";

/**
 * Orbit ERP 1.6.html pattern: the root App renders TopBar once; module bodies swap below it.
 * Here: one OrbitERPHeading + children (each route module stays unchanged inside its folder).
 */
export default function OrbitAppChrome({ children, username, onLogout, branchId, brachId, disabled = false }) {
  const { toggleSidebar } = useSidebar();
  if (disabled) {
    return <>{children}</>;
  }
  return (
    <>
      <OrbitERPHeading
        displayName={username || "Admin"}
        branchId={branchId}
        brachId={brachId}
        onLogoClick={toggleSidebar}
        onSignOut={onLogout}
      />
      {children}
    </>
  );
}
