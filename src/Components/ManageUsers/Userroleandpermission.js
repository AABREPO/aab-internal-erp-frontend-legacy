import { all } from "axios";
import { id } from "date-fns/locale";
import React, { useState, useEffect, useRef } from "react";
import Select from 'react-select';
import {
  EDBC_TABLE_BODY_ROW_CLASS,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC_TABLE_HEADER_ROW_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
const Userroleandpermission = () => {
  const [showRoleCreationModal, setShowRoleCreationModal] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedModules, setSelectedModules] = useState({});
  const [isModuleSelectedOpen, setIsModuleSelectedOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [roleName, setRoleName] = useState('');
  const modules = [
    {
      id: 1,
      name: "Bill Entry Checklist",
      level: "Level 2",
    },
    {
      id: 2,
      name: "Expense Entry",
      level: "Level 2",
    },
    {
      id: 3,
      name: "Inventory",
      level: "Level 1",
    },
    {
      id: 4,
      name: "Bill Payments Tracker",
      level: "Level 2",
    },
    {
      id: 5,
      name: "Invoice",
      level: "level 3",
    },
    {
      id: 6,
      name: "Quotation",
      level: "Level 1",
    },
    {
      id: 7,
      name: "Change Order",
      level: "Level 2",
    },
    {
      id: 8,
      name: "Enquiry",
      level: "Level 1",
    },
    {
      id: 9,
      name: "Projects",
      level: "Level 2",
    },
    {
      id: 10,
      name: "Vendor Payments Tracker",
      level: "level 3",
    },
    {
      id: 11,
      name: "Advance Portal",
      level: "Level 1",
    },
    {
      id: 12,
      name: "Payment Receipt",
      level: "Level 2",
    },
    {
      id: 13,
      name: "Rent Management",
      level: "Level 1",
    },
    {
      id: 14,
      name: "Claim Payments",
      level: "Level 2",
    },
    {
      id: 15,
      name: "Weekly Payment Register",
      level: "level 3",
    },
    {
      id: 16,
      name: "Expense Dashboard",
      level: "Level 1",
    },
    {
      id: 17,
      name: "Purchase Order",
      level: "Level 2",
    },
    {
      id: 18,
      name: "Tools Tracker",
      level: "Level 2",
    },
    {
      id: 19,
      name: "Tile Calculator",
      level: "level 3",
    },
    {
      id: 20,
      name: "Paint Calculator",
      level: "Level 2",
    },
    {
      id: 21,
      name: "Bath Fixtures Matrix",
      level: "Level 1",
    },
    {
      id: 22,
      name: "RCC Calculation",
      level: "Level 2",
    },
    {
      id: 23,
      name: "Switch Matrix",
      level: "level 3",
    },
    {
      id: 24,
      name: "Masonary Calculator",
      level: "Level 1",
    },
    {
      id: 25,
      name: "Carpentry Calculator",
      level: "Level 2",
    },
    {
      id: 26,
      name: "Onboarding",
      level: "Level 1",
    },
    {
      id: 27,
      name: "Attendance",
      level: "Level 2",
    },
    {
      id: 28,
      name: "Staff Advance",
      level: "level 3",
    },
    {
      id: 29,
      name: "Manage User",
      level: "Level 1",
    },
    {
      id: 30,
      name: "Loan Portal",
      level: "Level 1",
    },
    {
      id: 31,
      name: "Bank Register",
      level: "Level 1",
    },
    {
      id: 32,
      name: "Bank Reconciliation",
      level: "level 1",
    },
    {
      id: 33,
      name: "Master Data",
      level: "Level 1",
    },
    {
      id: 34,
      name: "Dashboard",
      level: "Level 1",
    },
    {
      id: 35,
      name: "Directory",
      level: "Level 1",
    },
    {
      id: 36,
      name: "RFQ",
      level: "Level 1",
    }
  ];
  const [availableModules, setAvailableModules] = useState(modules);
  const [selectedModuleToAdd, setSelectedModuleToAdd] = useState(""); // module selected in dropdown
  const [activeModules, setActiveModules] = useState([]); // modules added by user
  const permissions = [
    "Create",
    "Read",
    "Edit",
    "Delete",
    "View",
    "Email",
    "Report",
    "Import",
    "Export",
    "PDF",
    "Share",
    "Print",
    "Write",
    "Set User Permissions",
  ];
  const handleSelectAll = (moduleName) => {
    setRolePermissions((prev) => {
      const roleData = { ...prev[selectedRole] };
      const allSelected = isAllSelected(moduleName);
      roleData[moduleName] = allSelected ? [] : [...permissions];
      return {
        ...prev,
        [selectedRole]: roleData,
      };
    });
  };
  const isAllSelected = (moduleName) => {
    return (
      rolePermissions[selectedRole]?.[moduleName]?.length === permissions.length
    );
  };
  const handleRoleChange = async (role) => {
    setSelectedRole(role);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/user_roles/all");
      const allRoles = await response.json();
      console.log('All roles from backend:', allRoles);
      const existingRole = allRoles.find((r) => r.userRoles === role);
      console.log('Existing role:', existingRole);
      if (existingRole) {
        const permissionsMap = {};
        const modulesMap = {};
        existingRole.userModels.forEach((moduleData) => {
          const moduleName = moduleData.models;
          const perms = moduleData.permissions?.[0]?.userPermissions || [];
          permissionsMap[moduleName] = perms;
          modulesMap[moduleName] = true;
        });
        modules.forEach((module) => {
          if (!permissionsMap[module.name]) permissionsMap[module.name] = [];
          if (!modulesMap[module.name]) modulesMap[module.name] = false;
        });
        setRolePermissions((prev) => ({
          ...prev,
          [role]: permissionsMap,
        }));
        console.log('Permissions Map:', permissionsMap);
        setSelectedModules((prev) => ({
          ...prev,
          [role]: modulesMap,
        }));
        console.log('Modules Map:', modulesMap);
        // ✅ Set active modules based on selected modules
        const activeFromBackend = modules.filter((mod) => modulesMap[mod.name]);
        setActiveModules(activeFromBackend);
        console.log('Active Modules:', activeFromBackend);
      } else {
        const newPermissions = {};
        const initialModules = {};
        modules.forEach((module) => {
          newPermissions[module.name] = [];
          initialModules[module.name] = false;
        });
        setRolePermissions((prev) => ({
          ...prev,
          [role]: newPermissions,
        }));
        setSelectedModules((prev) => ({
          ...prev,
          [role]: initialModules,
        }));
        // ✅ Clear activeModules if it's a new role
        setActiveModules([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      alert("Failed to fetch role data.");
    }
  };
  const handleModuleCheckboxChange = (moduleName) => {
    setSelectedModules((prev) => {
      const updatedRoleModules = { ...(prev[selectedRole] || {}) };
      updatedRoleModules[moduleName] = !updatedRoleModules[moduleName];
      return {
        ...prev,
        [selectedRole]: updatedRoleModules,
      };
    });
  };
  const isModuleSelected = (moduleName) =>
    selectedModules[selectedRole]?.[moduleName] || false;
  const handlePermissionChange = (moduleName, perm) => {
    setRolePermissions((prev) => {
      const roleData = { ...prev[selectedRole] };
      const currentPerms = roleData[moduleName] || [];
      const updatedPerms = currentPerms.includes(perm)
        ? currentPerms.filter((p) => p !== perm)
        : [...currentPerms, perm];
      roleData[moduleName] = updatedPerms;
      return {
        ...prev,
        [selectedRole]: roleData,
      };
    });
  };
  const isChecked = (moduleName, perm) => {
    return rolePermissions[selectedRole]?.[moduleName]?.includes(perm);
  };
  const saveRole = async () => {
    if (!selectedRole) return;
    const selected = selectedModules[selectedRole] || {};
    const permissionsForRole = rolePermissions[selectedRole] || {};
    const formattedData = {
      userRoles: selectedRole,
      userModels: Object.entries(selected)
        .filter(([moduleName, isChecked]) => isChecked)
        .map(([moduleName]) => ({
          models: moduleName,
          permissions: [
            {
              userPermissions: permissionsForRole[moduleName] || [],
            },
          ],
        })),
    };
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/user_roles/all");
      const allRoles = await response.json();
      const existingRole = allRoles.find((r) => r.userRoles === selectedRole);
      if (existingRole) {
        await fetch(`https://backendaab.in/aabuilderDash/api/user_roles/edit/${existingRole.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
      } else {
        await fetch("https://backendaab.in/aabuilderDash/api/user_roles/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
      }
    } catch (error) {
      console.error("Error auto-saving role:", error);
    }
  };
  useEffect(() => {
    if (selectedRole) {
      saveRole();
    }
  }, [rolePermissions, selectedModules]);
  const moduleOptions = availableModules
    .filter((mod) => !activeModules.some((m) => m.name === mod.name))
    .map((mod) => ({
      value: mod.name,
      label: mod.name,
    }));
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: state.isFocused ? "#FAF6ED" : "transparent",
      "&:hover": {
        borderColor: "none",
      },
      boxShadow: state.isFocused ? "0 0 0 #FAF6ED" : "none",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#000',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };
  const handleSubmitRoleName = async () => {
    const newRoleName = { roleName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/roles/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoleName),
      });
      if (response.ok) {
        setMessage('Role Name saved successfully!');
        window.location.reload();
      } else {
        setMessage('Error saving role name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving role name.');
    }
  };
  const fetchRoleNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/roles/all');
      if (response.ok) {
        const data = await response.json();
        setAllRoles(data);
      } else {
        setMessage('Error fetching role names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching role names.');
    }
  };
  useEffect(() => {
    fetchRoleNames();
  }, []);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };
  const handleTableMouseDown = (e) => {
    if (e.target.closest('input, button, a, select, textarea, label, [role="button"], .react-select')) return;
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
    cancelMomentum();
  };
  const handleTableMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleTableMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  };
  useEffect(() => () => cancelMomentum(), []);
  return (
    <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
      <div className="px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
        <div className="w-full pt-[18px] px-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-wrap gap-4 mb-[12px] text-left shrink-0">
            <div className="flex flex-wrap gap-4 flex-1 min-w-0">
              <div className="w-full sm:w-auto min-w-[200px]">
                <label className="block mb-[8px] font-semibold text-[16px]">Branch Name</label>
                <select className="w-full sm:w-[252px] h-[40px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none text-[14px] font-semibold px-2">
                  <option>Select Branch</option>
                  <option>Option 1</option>
                </select>
              </div>
              <div className="w-full sm:w-auto min-w-[200px]">
                <label className="block mb-[8px] font-semibold text-[16px]">Role</label>
                <select
                  className="w-full sm:w-[257px] h-[40px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none text-[14px] font-semibold px-2"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="">Select Role</option>
                  {allRoles.map((role) => (
                    <option key={role.roleName} value={role.roleName}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto min-w-[140px]">
                <label className="block mb-[8px] font-semibold text-[16px]">Level</label>
                <select className="w-full sm:w-[147px] h-[40px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none text-[14px] font-semibold px-2">
                  <option>Select Level</option>
                  <option>Option 1</option>
                </select>
              </div>
              <div className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-36 mt-0 sm:mt-[2rem] h-[40px] border bg-[#BF9853] text-white font-semibold rounded-lg text-[14px]"
                  onClick={() => setIsModuleSelectedOpen(true)}
                >
                  + Add Modules
                </button>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[132px] h-[40px] bg-[#BF9853] text-white font-semibold rounded-lg text-[14px] sm:ml-auto"
                onClick={() => setShowRoleCreationModal(true)}
              >
                + New Role
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div
              ref={scrollRef}
              className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none scrollbar-none no-scrollbar"
              onMouseDown={handleTableMouseDown}
              onMouseMove={handleTableMouseMove}
              onMouseUp={handleTableMouseUp}
              onMouseLeave={handleTableMouseUp}
            >
              <table className={`table-fixed w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} min-w-[1420px]`}>
                <colgroup>
                  <col style={{ width: 80 }} />
                  <col style={{ width: 300 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 900 }} />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className={EDBC_TABLE_HEADER_ROW_CLASS}>
                    <th className="w-[80px] text-left font-bold text-[16px]">S.No</th>
                    <th className="w-[300px] text-left font-bold text-[16px]">Module</th>
                    <th className="w-[140px] text-left font-bold text-[16px]">Levels</th>
                    <th className="w-[900px] text-left font-bold text-[16px]">Permissions</th>
                  </tr>
                </thead>
                {selectedRole ? (
                  <tbody>
                    {activeModules.map((module, index) => (
                      <tr key={module.name} className={`${EDBC_TABLE_BODY_ROW_CLASS} !h-auto min-h-[40px] align-top`}>
                        <td className="w-[80px] text-[#2E2E2E] text-left align-top py-3">{index + 1}</td>
                        <td className="w-[300px] text-left align-top py-3">
                          <div className="flex items-center font-semibold text-[14px] gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={isModuleSelected(module.name)}
                              onChange={() => handleModuleCheckboxChange(module.name)}
                              className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] shrink-0"
                            />
                            <span className="break-words">{module.name}</span>
                          </div>
                          <div className="items-center">
                            <label className="text-[14px] text-[#6B7280] items-center font-medium inline-flex gap-1">
                              <input
                                type="checkbox"
                                checked={isAllSelected(module.name)}
                                disabled={!isModuleSelected(module.name)}
                                onChange={() => handleSelectAll(module.name)}
                                className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] disabled:opacity-50 shrink-0"
                              />
                              <span>Select All</span>
                            </label>
                          </div>
                        </td>
                        <td className="w-[140px] text-[14px] font-semibold text-left align-top py-3">{module.level}</td>
                        <td className="w-[900px] text-left align-top py-3">
                          <div
                            className="inline-grid gap-x-12 gap-y-10"
                            style={{ gridTemplateColumns: 'repeat(5, max-content)' }}
                          >
                            {permissions.map((perm) => (
                              <label
                                key={perm}
                                className="inline-flex items-center gap-1 text-[14px] font-medium whitespace-nowrap"
                              >
                                <input
                                  type="checkbox"
                                  className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] shrink-0"
                                  checked={isChecked(module.name, perm)}
                                  disabled={!isModuleSelected(module.name)}
                                  onChange={() => handlePermissionChange(module.name, perm)}
                                />
                                {perm}
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr className={EDBC_TABLE_BODY_ROW_CLASS}>
                      <td colSpan={4} className="py-6 text-center text-[16px] font-medium text-[#666666]">
                        Select a role to view and edit permissions
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
      {showRoleCreationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[448px] min-h-[255px] shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-3 text-red-500 font-bold text-base"
              onClick={() => setShowRoleCreationModal(false)}
            >
              ✕
            </button>
            <div className="text-left p-4">
              <h2 className="text-lg text-[#E4572E] font-semibold mb-4">Role Creation</h2>
              <label className="block mb-2 font-semibold">Role</label>
              <input
                type="text"
                placeholder="Enter New Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full max-w-[360px] h-[45px] px-3 border-2 border-[#BF9853] border-opacity-25 rounded-md mb-4 focus:outline-none"
              />
            </div>
            <div className="flex justify-end mr-6 gap-3">
              <button
                className="border border-[#BF9853] text-[#BF9853] text-sm font-semibold px-4 py-1 w-[114px] h-[36px] rounded"
                onClick={() => {
                  setShowRoleCreationModal(false);
                  setRoleName("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-[#BF9853] text-white px-4 py-1 w-[99px] h-[36px] rounded"
                onClick={() => {
                  handleSubmitRoleName();
                  setShowRoleCreationModal(false);
                  setRoleName("");
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isModuleSelectedOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4" >
          <div className="bg-white w-full max-w-[448px] min-h-[100px] shadow-lg p-6 relative" >
            <button className="absolute top-2 right-3 text-red-500 font-bold text-base"
              onClick={() => setIsModuleSelectedOpen(false)}>
              ✕
            </button>
            <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Select
                className="w-full max-w-[320px] border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-lg"
                options={moduleOptions}
                isClearable
                value={moduleOptions.find((option) => option.value === selectedModuleToAdd) || null}
                onChange={(selectedOption) => setSelectedModuleToAdd(selectedOption?.value || '')}
                placeholder="Select a Module"
                styles={customSelectStyles}
                isSearchable
              />
              <button
                onClick={() => {
                  if (!selectedModuleToAdd || !selectedRole) return;
                  const moduleToAdd = modules.find((m) => m.name === selectedModuleToAdd);
                  if (moduleToAdd) {
                    setActiveModules((prev) => [...prev, moduleToAdd]);
                    setSelectedModuleToAdd("");
                    setSelectedModules((prev) => ({
                      ...prev,
                      [selectedRole]: {
                        ...(prev[selectedRole] || {}),
                        [moduleToAdd.name]: true,
                      },
                    }));
                    setRolePermissions((prev) => ({
                      ...prev,
                      [selectedRole]: {
                        ...(prev[selectedRole] || {}),
                        [moduleToAdd.name]: [],
                      },
                    }));
                    setIsModuleSelectedOpen(false);
                  }
                }}
                className="bg-[#BF9853] text-white px-4 py-[6px] rounded "
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Userroleandpermission;