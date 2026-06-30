import React, { useEffect, useRef, useState } from "react";
import aaLogo from "../Images/AALogo.svg";
import { canDownloadExpensesReport, downloadExpensesReport } from "../../utils/downloadExpensesReport";
import {
  formatOrbitLastSyncedTime,
  runOrbitCurrentModuleSync,
  subscribeOrbitSyncStatus,
  startOrbitAutoSync,
  stopOrbitAutoSync,
} from "../../utils/orbitProjectDataSync";

const IconDownload = () => (  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 4v12M6 11l6 6 6-6M5 21h14" />
  </svg>
);

const IconBell = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 21a2 2 0 004 0" />
  </svg>
);

const IconSignOut = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11" />
  </svg>
);

const IconSync = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4v5h5M20 20v-5h-5" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L4 4M3.51 15a9 9 0 0 0 14.85 3.36L20 20" />
  </svg>
);

const IconDot = () => (
  <svg viewBox="0 0 8 8" width="8" height="8">
    <circle cx="4" cy="4" r="3" fill="currentColor" />
  </svg>
);

const formatLiveDateTime = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours %= 12;
  hours = hours || 12;
  return {
    dateLine: `${day} ${month} ${year}`,
    timeLine: `${hours}:${minutes}:${seconds} ${ampm}`,
  };
};

const ORBIT_TOPBAR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
.orbit-erp-heading-root{
  --gold:#D6AB60; --gold-soft:#E6C68A; --gold-deep:#B8924B; --gold-darker:#9C7A3A;
  --ink:#212121; --ink-2:#3a3a3a; --muted:#8a8275; --muted-2:#a59c8a;
  --cream:#FBF7F0; --cream-2:#F5EFE3; --cream-3:#FAF4E8; --row-alt:#FAF4E8;
  --line:#EADFC8; --line-soft:#f0e9d8;
  --green:#2f9e6e; --green-soft:#3eb37f; --green-bg:#E0F1E5;
  --red:#d23b3b; --red-bg:#FFE7E7;
  font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
  color:var(--ink);
}
.orbit-erp-heading-root .ink{color:var(--ink);}
.orbit-erp-heading-root .muted{color:var(--muted);}
.orbit-erp-heading-root .topbar > div:first-child{display:flex;align-items:center;gap:10px;}
.orbit-erp-heading-root .brand-text{font-family:'Outfit',sans-serif;font-weight:700;font-size:15.5px;color:var(--gold-deep);letter-spacing:0.16em;line-height:1;white-space:nowrap;text-transform:uppercase;}
@media(max-width:480px){
  .orbit-erp-heading-root .brand-text{font-size:13.5px;letter-spacing:0.13em;}
}
.orbit-erp-heading-root .topbar{background:#fff;border-bottom:1px solid var(--line);padding:5px 16px;display:flex;align-items:center;gap:10px;position:fixed;top:0;left:0;right:0;width:100%;box-sizing:border-box;z-index:300;min-height:56px;}
.orbit-erp-heading-root::after{content:'';display:block;height:56px;}
.orbit-erp-heading-root .topbar-end{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0;min-width:0;}
.orbit-erp-heading-root .live-clock{display:inline-flex;flex-direction:column;align-items:flex-end;line-height:1.15;padding:3px 10px;border:1px solid var(--line);border-radius:7px;background:#fff;flex-shrink:0;white-space:nowrap;}
.orbit-erp-heading-root .live-clock .live-date{font-size:11px;font-weight:600;color:var(--ink-2);}
.orbit-erp-heading-root .live-clock .live-time{font-size:10px;font-weight:500;color:var(--muted-2);font-variant-numeric:tabular-nums;}
.orbit-erp-heading-root .user-pill{flex-shrink:0;}
.orbit-erp-heading-root .user-pill .icon-btn{flex-shrink:0;}
.orbit-erp-heading-root .branch-select{background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 28px 5px 10px;font-size:12.5px;font-weight:600;color:var(--ink-2);appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M2 4l3 3 3-3' stroke='%238a8275' stroke-width='1.5' fill='none'/></svg>");background-repeat:no-repeat;background-position:right 9px center;cursor:pointer;min-width:128px;}
.orbit-erp-heading-root .branch-select:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(214,171,96,0.15);}
.orbit-erp-heading-root .icon-btn{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink-2);cursor:pointer;transition:all .15s;position:relative;}
.orbit-erp-heading-root .icon-btn:hover{background:var(--cream-2);}
.orbit-erp-heading-root .icon-btn.gold{color:var(--gold-deep);}
.orbit-erp-heading-root .sync-btn{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink-2);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;min-width:0;}
.orbit-erp-heading-root .sync-btn:hover:not(:disabled){background:var(--cream-2);color:var(--gold-deep);}
.orbit-erp-heading-root .sync-btn:disabled{opacity:.72;cursor:wait;}
.orbit-erp-heading-root .sync-btn .sync-copy{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15;min-width:0;}
.orbit-erp-heading-root .sync-btn .sync-title{font-size:12px;font-weight:700;color:inherit;}
.orbit-erp-heading-root .sync-btn .sync-time{font-size:9.5px;font-weight:500;color:var(--muted-2);max-width:110px;overflow:hidden;text-overflow:ellipsis;}
.orbit-erp-heading-root .sync-btn .sync-icon{display:inline-flex;flex-shrink:0;}
.orbit-erp-heading-root .sync-btn .sync-icon.spinning svg{animation:orbitSyncSpin .85s linear infinite;}
@keyframes orbitSyncSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.orbit-erp-heading-root .avatar-mark{width:30px;height:30px;border-radius:50%;background:var(--cream-2);border:1.5px solid var(--gold);display:inline-flex;align-items:center;justify-content:center;}
.orbit-erp-heading-root .user-pill{display:inline-flex;align-items:center;gap:7px;padding:2px 8px 2px 2px;}
.orbit-erp-heading-root .brand-button{display:flex;align-items:center;gap:9px;cursor:pointer;background:transparent;border:none;padding:3px 6px;margin-left:-6px;border-radius:8px;transition:background .15s;}
.orbit-erp-heading-root .brand-button:hover{background:var(--cream-2);}
.orbit-erp-heading-root .brand-button .menu-icon{color:var(--muted-2);transition:color .15s;}
.orbit-erp-heading-root .brand-button:hover .menu-icon{color:var(--gold-deep);}
.orbit-erp-heading-root .icon-btn .notif-dot{position:absolute;top:-3px;right:-3px;background:var(--red);color:#fff;font-size:9px;font-weight:700;min-width:15px;height:15px;border-radius:999px;padding:0 4px;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid #fff;line-height:1;}
.orbit-erp-heading-root .notif-popover{position:absolute;top:calc(100% + 6px);right:0;width:320px;max-width:calc(100vw - 24px);background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 18px 36px -12px rgba(33,33,33,0.18),0 4px 10px -4px rgba(33,33,33,0.08);z-index:60;overflow:hidden;}
.orbit-erp-heading-root .notif-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--line-soft);}
.orbit-erp-heading-root .notif-head h4{font-family:'Manrope',sans-serif;font-weight:600;font-size:15px;color:var(--ink);margin:0;}
.orbit-erp-heading-root .notif-head .mark-all{font-size:11.5px;color:var(--gold-deep);font-weight:600;background:none;border:none;cursor:pointer;padding:0;}
.orbit-erp-heading-root .notif-head .mark-all:hover{text-decoration:underline;}
.orbit-erp-heading-root .notif-list{max-height:340px;overflow-y:auto;}
.orbit-erp-heading-root .notif-item{display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line-soft);cursor:pointer;transition:background .15s;}
.orbit-erp-heading-root .notif-item:hover{background:var(--cream-3);}
.orbit-erp-heading-root .notif-item:last-child{border-bottom:none;}
.orbit-erp-heading-root .notif-item.unread{background:#FFFCF5;}
.orbit-erp-heading-root .notif-item .icon-wrap{flex-shrink:0;width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:14px;}
.orbit-erp-heading-root .notif-item .icon-wrap.gold{background:#FFF3D9;color:var(--gold-deep);}
.orbit-erp-heading-root .notif-item .icon-wrap.green{background:var(--green-bg);color:var(--green);}
.orbit-erp-heading-root .notif-item .icon-wrap.red{background:var(--red-bg);color:var(--red);}
.orbit-erp-heading-root .notif-item .body{flex:1;min-width:0;}
.orbit-erp-heading-root .notif-item .title{font-size:12.5px;font-weight:600;color:var(--ink);line-height:1.35;}
.orbit-erp-heading-root .notif-item .desc{font-size:11.5px;color:var(--muted);margin-top:2px;line-height:1.4;}
.orbit-erp-heading-root .notif-item .time{font-size:10.5px;color:var(--muted-2);margin-top:3px;display:flex;align-items:center;gap:5px;}
.orbit-erp-heading-root .notif-item .time .dot{color:var(--red);}
.orbit-erp-heading-root .notif-empty{padding:32px 14px;text-align:center;color:var(--muted);font-size:13px;}
.orbit-erp-heading-root .notif-foot{padding:9px 14px;border-top:1px solid var(--line-soft);text-align:center;background:var(--cream-3);}
.orbit-erp-heading-root .notif-foot a{font-size:12px;color:var(--gold-deep);font-weight:600;cursor:pointer;}
.orbit-erp-heading-root .notif-foot a:hover{text-decoration:underline;}
@media(max-width:768px){
  .orbit-erp-heading-root .topbar{padding:10px 12px;gap:8px;}
  .orbit-erp-heading-root .topbar .desktop-only{display:none;}
  .orbit-erp-heading-root .live-clock .live-date{display:none;}
}
`;

/**
 * Top bar from Orbit ERP 1.6.html (single heading block only).
 */
export default function OrbitERPHeading({
  branch: branchProp,
  setBranch: setBranchProp,
  onLogoClick,
  notifications: notificationsProp,
  onMarkAllRead,
  onNotifClick,
  displayName = "Admin",
  orgLine = "AA Builders",
  branchId,
  brachId,
  /** When true, only the brand row is shown; pair with OrbitBankRegisterStrip for tabs + tools on the row below. */
  hideEndToolbar = false,
  onSignOut,
  currentPath = "",
}) {
  const [branchInternal, setBranchInternal] = useState("");
  const branch = branchProp !== undefined ? branchProp : branchInternal;
  const setBranch = setBranchProp || setBranchInternal;

  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const normalizedUsername = String(displayName || "").trim().toLowerCase();
  const canSelectBranch = normalizedUsername === "admin" || normalizedUsername === "mahalingam m";

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };
  const storedUser = getStoredUser();
  const parsedBranchId = Number(
    branchId ??
      brachId ??
      storedUser?.branchId ??
      storedUser?.branch_id ??
      storedUser?.brachId
  );
  const userBranchId = Number.isFinite(parsedBranchId) && parsedBranchId > 0 ? parsedBranchId : "";

  const emitBranchChange = (nextBranchId) => {
    const branchIdString = nextBranchId ? String(nextBranchId) : "";
    if (branchIdString) {
      localStorage.setItem("selectedBranchId", branchIdString);
      const selectedBranch = branchOptions.find((item) => String(item.id) === branchIdString);
      if (selectedBranch?.branch) {
        localStorage.setItem("selectedBranchName", selectedBranch.branch);
      }
    }
    window.dispatchEvent(
      new CustomEvent("branchSelectionChanged", { detail: { branchId: branchIdString } })
    );
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBranches = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/branch/getAll", {
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!isMounted) return;
        setBranchOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching branch list:", error);
      }
    };
    void fetchBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const savedBranchId = localStorage.getItem("selectedBranchId");
    const savedBranchIdAsNumber = Number(savedBranchId);
    const hasValidSavedBranch = Number.isFinite(savedBranchIdAsNumber) && savedBranchIdAsNumber > 0;
    if (canSelectBranch) {
      const nextBranchId = hasValidSavedBranch ? String(savedBranchIdAsNumber) : "";
      setSelectedBranchId(nextBranchId);
      if (nextBranchId) {
        localStorage.setItem("selectedBranchId", nextBranchId);
        window.dispatchEvent(
          new CustomEvent("branchSelectionChanged", { detail: { branchId: nextBranchId } })
        );
      }
      return;
    }
    if (userBranchId !== "") {
      const fixedBranchId = String(userBranchId);
      setSelectedBranchId(fixedBranchId);
      localStorage.setItem("selectedBranchId", fixedBranchId);
      window.dispatchEvent(
        new CustomEvent("branchSelectionChanged", { detail: { branchId: fixedBranchId } })
      );
    }
  }, [canSelectBranch, userBranchId]);

  useEffect(() => {
    if (!Array.isArray(branchOptions) || branchOptions.length === 0) return;
    if (canSelectBranch) {
      if (selectedBranchId) return;
      const fallbackBranchId = userBranchId || branchOptions[0]?.id;
      if (fallbackBranchId) {
        const branchIdString = String(fallbackBranchId);
        setSelectedBranchId(branchIdString);
        localStorage.setItem("selectedBranchId", branchIdString);
        window.dispatchEvent(
          new CustomEvent("branchSelectionChanged", { detail: { branchId: branchIdString } })
        );
      }
      return;
    }
    if (userBranchId !== "") {
      const fixedBranchId = String(userBranchId);
      if (selectedBranchId !== fixedBranchId) {
        setSelectedBranchId(fixedBranchId);
        localStorage.setItem("selectedBranchId", fixedBranchId);
        window.dispatchEvent(
          new CustomEvent("branchSelectionChanged", { detail: { branchId: fixedBranchId } })
        );
      }
    }
  }, [branchOptions, canSelectBranch, selectedBranchId, userBranchId]);

  const handleBranchChange = (event) => {
    const nextBranchId = event.target.value;
    setSelectedBranchId(nextBranchId);
    setBranch(nextBranchId);
    emitBranchChange(nextBranchId);
  };

  const [notifOpen, setNotifOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [syncState, setSyncState] = useState({ lastSyncedAt: null, isSyncing: false });
  const [liveDateTime, setLiveDateTime] = useState(() => formatLiveDateTime(new Date()));
  const [notificationsInternal] = useState([]);
  const notifications = notificationsProp !== undefined ? notificationsProp : notificationsInternal;
  const canDownloadExpenses = canDownloadExpensesReport(displayName);

  const popRef = useRef();

  useEffect(() => {
    return subscribeOrbitSyncStatus(setSyncState);
  }, []);

  useEffect(() => {
    const tick = () => setLiveDateTime(formatLiveDateTime(new Date()));
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [notifOpen]);

  const unread = notifications.filter((n) => !n.read).length;
  const navLogoSrc = aaLogo;
  const navLogoStyle = { display: "block", flexShrink: 0, objectFit: "contain" };

  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleNotifItem = (n) => {
    if (onNotifClick) onNotifClick(n);
  };

  const handleDownloadExpenses = async () => {
    if (isDownloading || !canDownloadExpenses) return;
    setIsDownloading(true);
    try {
      await downloadExpensesReport();
    } catch (error) {
      console.error("Error generating expenses report:", error);
      alert("Unable to download expenses report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleManualSync = () => {
    if (syncState.isSyncing) return;
    void runOrbitCurrentModuleSync({
      currentPath: currentPath || window.location.pathname || "",
    });
  };

  const lastSyncedLabel = syncState.isSyncing
    ? "Syncing..."
    : `Last: ${formatOrbitLastSyncedTime(syncState.lastSyncedAt)}`;

  useEffect(() => {
    const pathGetter = () => currentPath || window.location.pathname || "";
    startOrbitAutoSync(pathGetter);
    return () => stopOrbitAutoSync();
  }, [currentPath]);

  return (
    <div className="orbit-erp-heading-root">
      <style>{ORBIT_TOPBAR_CSS}</style>
      <div className="topbar flex w-full items-center justify-start">
        <div className="brand-button w-[147px] h-[32px]">
          <img
            src={navLogoSrc}
            className="w-full h-full object-contain"
            alt="AA Builders"
            style={navLogoStyle}
          />
        </div>
        {!hideEndToolbar && (
        <div className="topbar-end">
          <div className="live-clock" aria-live="polite">
            <span className="live-date">{liveDateTime.dateLine}</span>
            <span className="live-time">{liveDateTime.timeLine}</span>
          </div>
          <button
            type="button"
            className="sync-btn desktop-only"
            title="Sync current module data"
            onClick={handleManualSync}
            disabled={syncState.isSyncing}
          >
            <span className={`sync-icon${syncState.isSyncing ? " spinning" : ""}`}>
              <IconSync />
            </span>
            <span className="sync-copy">
              <span className="sync-title">Sync</span>
              <span className="sync-time">{lastSyncedLabel}</span>
            </span>
          </button>
          {canSelectBranch ? (
            <select
              value={selectedBranchId}
              onChange={handleBranchChange}
              className="branch-select"
              title="Select Branch"
            >
              <option value="">Select Branch</option>
              {branchOptions.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.branch}
                </option>
              ))}
            </select>
          ) : selectedBranchId ? (
            <span className="branch-select">{branchOptions.find((b) => String(b.id) === String(selectedBranchId))?.branch || ""}</span>
          ) : null}          {canDownloadExpenses && (
            <button
              type="button"
              className="icon-btn desktop-only"
              onClick={handleDownloadExpenses}
              disabled={isDownloading}
              title={isDownloading ? "Preparing download..." : "Download expenses and master data"}
            >
              <IconDownload />
            </button>
          )}
          <div style={{ position: "relative" }} ref={popRef}>
            <button type="button" className="icon-btn gold" onClick={() => setNotifOpen(!notifOpen)} title="Notifications">
              <IconBell />
              {unread > 0 && <span className="notif-dot">{unread > 9 ? "9+" : unread}</span>}
            </button>
            {notifOpen && (
              <div className="notif-popover" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Notifications">
                <div className="notif-head">
                  <h4>Notifications</h4>
                  {unread > 0 && (
                    <button type="button" className="mark-all" onClick={handleMarkAll}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.read ? "" : "unread"}`}
                        onClick={() => handleNotifItem(n)}
                        onKeyDown={(e) => e.key === "Enter" && handleNotifItem(n)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={`icon-wrap ${n.tone}`}>{n.emoji}</div>
                        <div className="body">
                          <div className="title">{n.title}</div>
                          {n.desc && <div className="desc">{n.desc}</div>}
                          <div className="time">
                            {!n.read && (
                              <span className="dot">
                                <IconDot />
                              </span>
                            )}
                            <span>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="notif-foot">
                  <a>View all notifications</a>
                </div>
              </div>
            )}
          </div>
          <span className="user-pill">
            <span className="avatar-mark">
              <img src={navLogoSrc} width={18} height={18} alt="" style={{ display: "block", objectFit: "contain" }} />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-[12px] font-semibold ink">{displayName}</span>
              <span className="text-[9.5px] muted">{orgLine}</span>
            </span>
            <button type="button" className="icon-btn ml-1" title="Sign out" onClick={() => onSignOut?.()}>
              <IconSignOut />
            </button>
          </span>
        </div>
        )}
      </div>
    </div>
  );
}
