import { all } from "axios";
import { id } from "date-fns/locale";
import React, { useState, useEffect } from "react";
import Select from 'react-select';
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
      id:5,
      name:"Invoice",
      level:"level 3",
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
      name:"Vendor Payments Tracker",
      level:"level 3",
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
      name:"Weekly Payment Register",
      level:"level 3",
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
      id: 19,
      name: "Tools Tracker",
      level: "Level 2",
    },
    {
      id: 20,
      name:"Tile Calculator",
      level:"level 3",
    },
    {
      id: 21,
      name: "Paint Calculator",
      level: "Level 2",
    },
    {
      id: 22,
      name: "Bath Fixtures Matrix",
      level: "Level 1",
    },
    {
      id: 23,
      name: "RCC Calculation",
      level: "Level 2",
    },
    {
      id: 24,
      name:"Switch Matrix",
      level:"level 3",
    },
    {
      id: 25,
      name: "Masonary Calculator",
      level: "Level 1",
    },
    {
      id: 26,
      name: "Carpentry Calculator",
      level: "Level 2",
    },
    {
      id: 27,
      name: "Onboarding",
      level: "Level 1",
    },
    {
      id: 28,
      name: "Attendance",
      level: "Level 2",
    },
    {
      id: 29,
      name:"Staff Advance",
      level:"level 3",
    },
    {
      id: 30,
      name: "Manage User",
      level: "Level 1",
    },
    
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
  return (
    <div className="p-6 w-[1750px] bg-white ml-8">
      <div className="p-6 min-h-screen">
        <div className="flex gap-4 mb-4 overflow-hidden">
          <div className="flex gap-4 text-left">
            <div>
              <label className="block mb-3 font-semibold">Branch Name</label>
              <select className="w-[252px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
                <option>Select Branch</option>
                <option>Option 1</option>
              </select>
            </div>
            <div>
              <label className="block mb-3 font-semibold">Role</label>
              <select
                className="w-[257px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none"
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
            <div>
              <label className="block mb-3 font-semibold">Level</label>
              <select className="w-[147px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
                <option>Select Level</option>
                <option>Option 1</option>
              </select>
            </div>
            <div>
              <button
                className=" w-36 mt-[2.38rem] p-2 border bg-[#BF9853] text-white font-semibold rounded"
                onClick={() => setIsModuleSelectedOpen(true)}>
                + Add Modules
              </button>
            </div>
          </div>
          <div>
            <button
              className="w-[132px] h-[38px] mr-96 bg-[#BF9853] text-white font-semibold rounded mt-14 ml-[600px]"
              onClick={() => setShowRoleCreationModal(true)}
            >
              + New Role
            </button>
          </div>
        </div>
        <table className="w-full table-fixed border-collapse bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-[#F5F5F5] text-left text-[16px] font-semibold ">
              <th className="px-4 py-3 w-[120px]">S.No</th>
              <th className="px-4 py-3 w-[300px]">Module</th>
              <th className="px-4 py-3 w-[320px]">Levels</th>
              <th className="px-4 py-3 w-full">Permissions</th>
            </tr>
          </thead>
          {selectedRole && (
            <tbody>
              {activeModules.map((module, index) => (
                <tr key={module.name} className="border-t text-[14px] align-top">
                  <td className="px-4 py-4 text-[#2E2E2E] text-left">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center font-semibold text-base gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={isModuleSelected(module.name)}
                        onChange={() => handleModuleCheckboxChange(module.name)}
                        className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                      />
                      {module.name}
                    </div>
                    <div className="mr-36 items-center">
                      <label className="text-[14px] text-[#6B7280] items-center font-medium">
                        <input
                          type="checkbox"
                          checked={isAllSelected(module.name)}
                          disabled={!isModuleSelected(module.name)}
                          onChange={() => handleSelectAll(module.name)}
                          className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] disabled:opacity-50"
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-base font-semibold text-left">{module.level}</td>
                  <td className="px-4 py-4">
                    <div className="grid grid-cols-5 gap-y-8 max-w-[900px]">
                      {permissions.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-1 text-base font-medium whitespace-nowrap"
                        >
                          <input
                            type="checkbox"
                            className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
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
          )}
        </table>
      </div>
      {showRoleCreationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[448px] h-[255px] shadow-lg p-6 relative">
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
                className="w-[360px] h-[45px] px-3 border-2 border-[#BF9853] border-opacity-25 rounded-md mb-4 focus:outline-none"
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50" >
          <div className="bg-white w-[448px] h-[100px] shadow-lg p-6 relative" >
            <button className="absolute top-2 right-3 text-red-500 font-bold text-base"
              onClick={() => setIsModuleSelectedOpen(false)}>
              ✕
            </button>
            <div className="mb-4 flex items-center gap-4">
              <Select
                className="w-[320px] border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-lg"
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