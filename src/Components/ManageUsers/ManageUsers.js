import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import Gear from '../Images/gears.png'
import Reload from '../Images/reload.png'
import Edit from '../Images/Edit.svg'
import Pause from '../Images/pause-circle.png'
import Delete from '../Images/delete-account.png'

const API_BASE = "https://backendaab.in/aabuilderDash/api";
const BRANCH_API_URL = "https://backendaab.in/aabuildersDash/api/branch/getAll";
const FILE_UPLOAD_URL = "https://backendaab.in/aabuildersDash/api/files/upload";

const MODAL_OVERLAY_CLASS =
  "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4";

const ModalOverlay = ({ children }) =>
  createPortal(
    <div className={MODAL_OVERLAY_CLASS} role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );

const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive (Temporary)" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "LEFT", label: "Left Company" },
  { value: "RESIGNED", label: "Resigned" },
];

const getProfileImageSrc = (emp) => {
  if (emp.userImageUrl) {
    return emp.userImageUrl;
  }
  if (emp.userImage) {
    if (typeof emp.userImage === "string" && emp.userImage.startsWith("data:")) {
      return emp.userImage;
    }
    return `data:image/jpeg;base64,${emp.userImage}`;
  }
  return null;
};

const getStatusBadgeClass = (status) => {
  const normalized = (status || "ACTIVE").toUpperCase();
  if (normalized === "ACTIVE") {
    return "bg-green-100 text-green-700";
  }
  if (normalized === "INACTIVE") {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-red-100 text-red-700";
};

const formatUserStatus = (status) => {
  const normalized = (status || "ACTIVE").toUpperCase();
  const option = USER_STATUS_OPTIONS.find((item) => item.value === normalized);
  return option ? option.label : normalized;
};

const buildUserUpdatePayload = (user, overrides = {}) => ({
  username: user.username,
  email: user.email,
  userImageUrl: user.userImageUrl || null,
  employeeId: user.employeeId,
  position: user.position,
  branchId: user.branchId,
  userStatus: user.userStatus || "ACTIVE",
  userRoles: (user.roles || []).map((role) => ({ roles: role })),
  ...overrides,
});

const ManageUsers = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showModal1, setShowModal1] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [employees, setEmployees] = useState([
    { name: "", roles: [] },
  ]);
  const [selectedEmpIndex, setSelectedEmpIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [password, setPassword] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [showSuspendPopup, setShowSuspendPopup] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [suspendEmpIndex, setSuspendEmpIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [newUserPosition, setNewUserPosition] = useState("");
  const [newUserEmployeeId, setNewUserEmployeeId] = useState("");
  const [newUserBranchId, setNewUserBranchId] = useState("");
  const [newUserOtp, setNewUserOtp] = useState("");
  const [newUserOtpSent, setNewUserOtpSent] = useState(false);
  const [newUserImageUrl, setNewUserImageUrl] = useState("");
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [showNewUserConfirmPassword, setShowNewUserConfirmPassword] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionTarget, setPermissionTarget] = useState(null);
  const [permissionCanCreateUsers, setPermissionCanCreateUsers] = useState(false);
  const [permissionSuperAdmin, setPermissionSuperAdmin] = useState(false);
  const inputRef = useRef(null);

  const canCreateUsers = !!currentUser?.canCreateUsers;
  const isSuperAdmin = !!currentUser?.superAdmin;

  const resetNewUserForm = () => {
    setNewUserEmail("");
    setNewUserUsername("");
    setNewUserPassword("");
    setNewUserConfirmPassword("");
    setNewUserPosition("");
    setNewUserEmployeeId("");
    setNewUserBranchId("");
    setNewUserOtp("");
    setNewUserOtpSent(false);
    setNewUserImageUrl("");
    setSelectedProfileImage(null);
    setProfileImagePreview("");
    setShowNewUserPassword(false);
    setShowNewUserConfirmPassword(false);
  };

  const buildProfileImageFileName = () => {
    const timestamp = new Date()
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      .replace(',', '')
      .replace(/\s/g, '-');
    const safeName = (newUserUsername || newUserEmail || 'user')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${timestamp}_${safeName}_profile`;
  };

  const uploadProfileImage = async () => {
    if (!selectedProfileImage) {
      return newUserImageUrl;
    }

    const formData = new FormData();
    formData.append('files', selectedProfileImage);
    formData.append('folder', 'FileUpload / User_Profile_Images');
    formData.append('fileName', buildProfileImageFileName());

    const uploadResponse = await fetch(FILE_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Profile image upload failed');
    }

    const result = await uploadResponse.json();
    const uploadedUrl = result?.urls?.[0];
    if (!uploadedUrl) {
      throw new Error('Profile image upload did not return a URL');
    }

    setNewUserImageUrl(uploadedUrl);
    return uploadedUrl;
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedProfileImage(null);
      setProfileImagePreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      setSelectedProfileImage(null);
      setProfileImagePreview('');
      return;
    }

    setSelectedProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleCloseNewUserModal = () => {
    setShowModal(false);
    resetNewUserForm();
  };

  const handleRequestNewUserOtp = async () => {
    if (!newUserEmail.trim()) {
      alert("Please enter the new user's email.");
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${API_BASE}/user/create/request-otp`, { email: newUserEmail.trim() });
      setNewUserOtpSent(true);
      alert("OTP sent to the new user's email.");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert(error.response?.data?.message || error.response?.data || "Failed to send OTP");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserOtpSent) {
      await handleRequestNewUserOtp();
      return;
    }
    if (!newUserOtp.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      alert("Please fill email, OTP, username, and password.");
      return;
    }
    if (newUserPassword !== newUserConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      setSaving(true);
      const uploadedImageUrl = await uploadProfileImage();
      const response = await axios.post(`${API_BASE}/user/create`, {
        email: newUserEmail.trim(),
        otp: newUserOtp.trim(),
        username: newUserUsername.trim(),
        password: newUserPassword,
        position: newUserPosition.trim(),
        employeeId: newUserEmployeeId.trim() || null,
        branchId: newUserBranchId ? Number(newUserBranchId) : null,
        userImageUrl: uploadedImageUrl || null,
      });
      const createdUser = {
        ...response.data,
        roles: response.data.userRoles
          ? response.data.userRoles.map((role) => role.roles)
          : [],
      };
      setEmployees((prev) => [...prev, createdUser]);
      handleCloseNewUserModal();
      alert("User created successfully.");
    } catch (error) {
      console.error("Failed to create user:", error);
      alert(error.response?.data?.message || error.response?.data || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPermission = (emp) => {
    setPermissionTarget(emp);
    setPermissionCanCreateUsers(!!emp.canCreateUsers);
    setPermissionSuperAdmin(!!emp.superAdmin);
    setShowPermissionPopup(true);
  };

  const handleClosePermission = () => {
    setShowPermissionPopup(false);
    setPermissionTarget(null);
  };

  const handleSavePermissions = async () => {
    if (!permissionTarget) {
      return;
    }
    try {
      setSaving(true);
      const response = await axios.put(`${API_BASE}/user/${permissionTarget.id}/permissions`, {
        canCreateUsers: permissionCanCreateUsers,
        superAdmin: permissionSuperAdmin,
      });
      const updatedUser = {
        ...response.data,
        roles: response.data.userRoles
          ? response.data.userRoles.map((role) => role.roles)
          : permissionTarget.roles,
      };
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === permissionTarget.id ? updatedUser : emp))
      );
      handleClosePermission();
      alert("User permissions updated.");
    } catch (error) {
      console.error("Failed to update permissions:", error);
      alert(error.response?.data?.message || error.response?.data || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };
  const handleEditClick = () => {
    setIsEditable(true);
    setTimeout(() => {
      inputRef.current?.focus(); // Focus input after enabling edit mode
    }, 0); // Timeout ensures state updates first
  };
  const handleOpen = (emp) => {
    setShowPopup(true);
    setPassword("");
    setEmployeeEmail(emp.email);
    setEmployeeName(emp.username);
    setEditingUser(emp);
  };
  const handleClose = () => {
    setShowPopup(false);
    setIsEditable(false);
    setEditingUser(null);
    setPassword("");
  };
  const handleOpenSuspend = (emp, empIndex) => {
    setSuspendEmpIndex(empIndex);
    setSelectedType((emp.userStatus || "ACTIVE").toUpperCase());
    setShowSuspendPopup(true);
  };
  const handleCloseSuspend = () => {
    setShowSuspendPopup(false);
    setSuspendEmpIndex(null);
    setSelectedType("");
  };
  const handleSavePassword = async () => {
    if (!editingUser) {
      return;
    }
    if (!password.trim()) {
      alert("Please enter a new password.");
      return;
    }
    try {
      setSaving(true);
      const updatedUserDto = buildUserUpdatePayload(editingUser, { password });
      const response = await axios.put(
        `${API_BASE}/user/edit/${editingUser.id}`,
        updatedUserDto
      );
      const updatedUser = response.data;
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingUser.id
            ? {
                ...updatedUser,
                roles: updatedUser.userRoles
                  ? updatedUser.userRoles.map((role) => role.roles)
                  : emp.roles,
              }
            : emp
        )
      );
      alert("Password updated successfully.");
      handleClose();
    } catch (error) {
      console.error("Failed to update password:", error);
      alert(error.response?.data || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };
  const handleUpdateUserStatus = async () => {
    if (suspendEmpIndex === null || !selectedType) {
      alert("Please select a user status.");
      return;
    }
    const user = employees[suspendEmpIndex];
    try {
      setSaving(true);
      const updatedUserDto = buildUserUpdatePayload(user, {
        userStatus: selectedType,
      });
      const response = await axios.put(
        `${API_BASE}/user/edit/${user.id}`,
        updatedUserDto
      );
      const updatedUser = response.data;
      setEmployees((prev) =>
        prev.map((emp, i) =>
          i === suspendEmpIndex
            ? {
                ...updatedUser,
                roles: updatedUser.userRoles
                  ? updatedUser.userRoles.map((role) => role.roles)
                  : emp.roles,
              }
            : emp
        )
      );
      handleCloseSuspend();
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert(error.response?.data || "Failed to update user status");
    } finally {
      setSaving(false);
    }
  };
  const handleRoleChange = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };
  const roleColors = [
    { bg: 'bg-green-100', text: 'text-green-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-pink-100', text: 'text-pink-700' },
    { bg: 'bg-red-100', text: 'text-red-700' },
  ];
  const handleSubmitRoles = async (empIndex) => {
    const user = employees[empIndex];
    const updatedRoles = [...new Set([...user.roles, ...selectedRoles])];
    try {
      const updatedUserRoles = updatedRoles.map((role) => ({ roles: role })); // <-- consistently use 'roles'
      const updatedUserDto = buildUserUpdatePayload(user, {
        userRoles: updatedUserRoles,
      });
      const response = await axios.put(
        `${API_BASE}/user/edit/${user.id}`,
        updatedUserDto
      );
      const updatedUser = response.data;
      setEmployees((prev) =>
        prev.map((emp, i) =>
          i === empIndex ? { ...updatedUser, roles: updatedRoles } : emp
        )
      );
      setSelectedRoles([]);
      setShowModal1(false);
    } catch (error) {
      console.error("Failed to update roles:", error);
      alert("Failed to update roles");
    }
  };
  const handleRemoveRole = async (empIndex, roleToRemove) => {
    const user = employees[empIndex];
    const updatedRoles = user.roles.filter((r) => r !== roleToRemove);
    try {
      const updatedUserRoles = updatedRoles.map((role) => ({ roles: role })); // <-- consistently use 'roles'
      const updatedUserDto = buildUserUpdatePayload(user, {
        userRoles: updatedUserRoles,
      });
      const response = await axios.put(
        `${API_BASE}/user/edit/${user.id}`,
        updatedUserDto
      );
      const updatedUser = response.data;
      setEmployees((prev) =>
        prev.map((emp, i) =>
          i === empIndex ? { ...updatedUser, roles: updatedRoles } : emp
        )
      );
    } catch (error) {
      console.error("Failed to remove role:", error);
      alert("Failed to remove role");
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/user/all`);
        const usersWithRoles = response.data.map((user) => ({
          ...user,
          roles: user.userRoles ? user.userRoles.map((role) => role.roles) : [],
        }));
        setEmployees(usersWithRoles);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/me`);
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    const fetchBranches = async () => {
      try {
        const response = await axios.get(BRANCH_API_URL, { withCredentials: true });
        setBranchOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchUsers();
    fetchCurrentUser();
    fetchBranches();
  }, []);
  const fetchRoleNames = async () => {
    try {
      const response = await fetch(`${API_BASE}/roles/all`);
      if (response.ok) {
        const data = await response.json();
        setAllRoles(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    fetchRoleNames();
  }, []);

  const isAnyModalOpen =
    showModal || showModal1 || showPopup || showSuspendPopup || showPermissionPopup;

  useEffect(() => {
    if (!isAnyModalOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAnyModalOpen]);

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1750px] bg-white ml-0 md:ml-8 box-border">
      <div className="flex flex-wrap gap-4 sm:gap-5 text-left ml-0 md:ml-10">
        <div className="w-full sm:w-auto min-w-[200px]">
          <label className="block mb-3 font-semibold">Branch Name</label>
          <select className="w-full sm:w-[252px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
            <option>Select Branch</option>
            <option>Option 1</option>
          </select>
        </div>
        <div className="w-full sm:w-auto min-w-[200px]">
          <label className="block mb-3 font-semibold">Employee Name</label>
          <select className="w-full sm:w-[257px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
            <option>Select Employee Name</option>
            <option>Option 1</option>
          </select>
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <label className="block mb-3 font-semibold">Employee ID</label>
          <select className="w-full sm:w-[147px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
            <option>Select Employee ID</option>
            <option>Option 1</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center flex-wrap gap-4 mb-7 mt-4">
        <div className="text-sm text-gray-600">
          {isSuperAdmin && <span className="mr-3 font-semibold text-[#BF9853]">Super Admin</span>}
          {canCreateUsers && !isSuperAdmin && <span className="font-semibold text-[#BF9853]">Can create users</span>}
        </div>
        <div>
          {canCreateUsers && (
            <button
              className="w-full sm:w-[132px] h-[38px] bg-[#BF9853] text-white font-semibold rounded"
              onClick={() => setShowModal(true)}
            >
              + New User
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[800px] text-sm border-gray-200 rounded-md shadow">
          <thead className="bg-gray-100">
            <tr className="">
              <th className="px-2 py-3 text-lg font-semibold">EMP ID</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">Employee Name</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">Branch</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">Department</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">Designation</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">User Role</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">Actions</th>
              <th className="px-2 py-3 text-lg text-left font-semibold">User Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, empIndex) => (
              <tr key={emp.id} className="border-b font-semibold text-base">
                <td>{emp.employeeId || emp.id}</td>
                <td className="w- items-center">
                  <div className="flex items-center gap-3">
                    {getProfileImageSrc(emp) ? (
                      <img
                        src={getProfileImageSrc(emp)}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg cursor-default">
                        {emp.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className=" text-left p-2">
                      <p>{emp.username}</p>
                      <p className="text-gray-500 text-sm">{emp.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {emp.superAdmin && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#BF9853] text-white">
                            Super Admin
                          </span>
                        )}
                        {emp.canCreateUsers && !emp.superAdmin && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700">
                            User Creator
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className=""></td>
                <td></td>
                <td className="items-left text-left pl-3">{emp.position}</td>
                <td className="text-center align-middle">
                  <div className="flex flex-col items-start gap-2">
                    {/* First row: Add button + first role */}
                    <div className="flex gap-2 items-center">
                      <button className="border px-2 rounded-full w-[72px] h-[30px] hover:bg-gray-100" onClick={() => {setSelectedEmpIndex(empIndex); setShowModal1(true);}}>
                        Add +
                      </button>
                      {emp.roles.length > 0 && (
                        <span
                          className={`${roleColors[0 % roleColors.length].bg
                            } ${roleColors[0 % roleColors.length].text} h-[30px] px-2 flex items-center text-sm font-semibold rounded-full`}
                        >
                          {emp.roles[0]}
                          <button className="ml-2 cursor-pointer font-bold" onClick={() => handleRemoveRole(empIndex, emp.roles[0])}>
                            x
                          </button>
                        </span>
                      )}
                    </div>
                    {/* Remaining roles in 2-column grid */}
                    <div className="grid grid-cols-2 gap-1">
                      {emp.roles.slice(1).map((role, idx) => {
                        const color = roleColors[(idx + 1) % roleColors.length]; // +1 to offset color rotation
                        return (
                          <span key={idx} className={`${color.bg} ${color.text} h-[30px] px-2 flex items-center text-sm font-semibold rounded-full`}>
                            {role}
                            <button className="ml-2 cursor-pointer font-bold" onClick={() => handleRemoveRole(empIndex, role)}>
                              x
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </td>
                <td className="items-end">
                  <div className="flex items-end text-right">
                    <button className="flex items-center gap-2 text-sm font-semibold">
                      <img className="w-4 h-4" src={Gear} alt="Gear Icon" />
                      <span className="hover:text-[#E4572E]">Modify Roles</span>
                      <img className="w-4 h-4" src={Reload} alt="Reload Icon" />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-2 pl-3">
                    <span
                      className={`inline-flex w-fit px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(emp.userStatus)}`}
                    >
                      {formatUserStatus(emp.userStatus)}
                    </span>
                    <div className="flex gap-2">
                      {isSuperAdmin && emp.id !== currentUser?.id && (
                        <button onClick={() => handleOpenPermission(emp)} title="Manage user permissions">
                          <img className="w-5 h-5" src={Gear} alt="permissions" />
                        </button>
                      )}
                      <button onClick={() => handleOpen(emp)} title="Reset password">
                        <img className="w-5 h-5" src={Edit} alt="edit" />
                      </button>
                      <button onClick={() => handleOpenSuspend(emp, empIndex)} title="Change user status">
                        <img className="w-5 h-5" src={Pause} alt="Pause" />
                      </button>
                      <button title="Delete user">
                        <img className="w-5 h-5" src={Delete} alt="delete" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <ModalOverlay>
          <div className="bg-white p-5 sm:p-7 rounded shadow-md w-full max-w-[441px] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-red-600 font-semibold">Create New User</h2>
              <button onClick={handleCloseNewUserModal} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <div className="mr-0 sm:mr-7 text-left space-y-3">
              <div>
                <label className="text-base font-semibold">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                  placeholder="Enter email"
                />
              </div>
              {newUserOtpSent && (
                <div>
                  <label className="text-base font-semibold">OTP</label>
                  <input
                    type="text"
                    value={newUserOtp}
                    onChange={(e) => setNewUserOtp(e.target.value)}
                    className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                    placeholder="Enter OTP from email"
                  />
                  <button
                    type="button"
                    onClick={handleRequestNewUserOtp}
                    className="mt-2 text-sm text-[#BF9853] hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              )}
              <div>
                <label className="text-base font-semibold">Username</label>
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="text-base font-semibold">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                />
                {profileImagePreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <span className="text-xs text-gray-500">
                      Image will upload when you create the user.
                    </span>
                  </div>
                )}
                {newUserImageUrl && !selectedProfileImage && (
                  <p className="mt-1 text-xs text-green-700">Profile image uploaded.</p>
                )}
              </div>
              <div>
                <label className="text-base font-semibold">Position</label>
                <input
                  type="text"
                  value={newUserPosition}
                  onChange={(e) => setNewUserPosition(e.target.value)}
                  className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                  placeholder="Enter position"
                />
              </div>
              <div>
                <label className="text-base font-semibold">Employee ID</label>
                <input
                  type="text"
                  value={newUserEmployeeId}
                  onChange={(e) => setNewUserEmployeeId(e.target.value)}
                  className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                  placeholder="Enter employee ID"
                />
              </div>
              <div>
                <label className="text-base font-semibold">Branch</label>
                <select
                  value={newUserBranchId}
                  onChange={(e) => setNewUserBranchId(e.target.value)}
                  className="w-full max-w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none bg-white"
                >
                  <option value="">Select Branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-semibold">Password</label>
                <div className="relative w-full max-w-[361px]">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full h-[45px] p-2 pr-10 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 p-1"
                  >
                    {showNewUserPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-base font-semibold">Confirm Password</label>
                <div className="relative w-full max-w-[361px]">
                  <input
                    type={showNewUserConfirmPassword ? "text" : "password"}
                    value={newUserConfirmPassword}
                    onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                    className="w-full h-[45px] p-2 pr-10 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserConfirmPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 p-1"
                  >
                    {showNewUserConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={handleCloseNewUserModal} className="border w-[114px] h-[36px] px-4 rounded text-[#BF9853] border-[#BF9853]">
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={saving}
                className="bg-[#BF9853] text-white px-4 w-[132px] h-[36px] rounded disabled:opacity-50"
              >
                {saving ? "Please wait..." : newUserOtpSent ? "Create User" : "Send OTP"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {showModal1 && (
        <ModalOverlay>
          <div className="bg-white w-full max-w-[400px] rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-600 hover:text-black" onClick={() => setShowModal1(false)}>
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Select Roles</h2>
            <div className="overflow-y-auto ">
              {allRoles
                .filter((role) => role.roleName)
                .map((role, idx) => (
                  <label key={idx} className="flex items-center space-x-2 mb-2">
                    <input type="checkbox" checked={selectedRoles.includes(role.roleName)} onChange={() => handleRoleChange(role.roleName)}
                      className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                    />
                    <span>{role.roleName}</span>
                  </label>
                ))}
            </div>
            <div className="flex justify-end mt-4 gap-3">
              <button className="border border-[#BF9853] text-[#BF9853] w-[114px] h-[36px] rounded" onClick={() => setShowModal1(false)}>
                Cancel
              </button>
              <button className="bg-[#BF9853] text-white w-[114px] h-[36px] rounded" onClick={() => handleSubmitRoles(selectedEmpIndex)}>
                Submit
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {showPopup && (
        <ModalOverlay>
          <div className="bg-white p-6 w-full max-w-[441px] min-h-[321px] shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-3 right-5 text-red-500 text-lg font-bold" onClick={handleClose}>
              X
            </button>
            <h2 className="text-lg text-left pl-4 font-semibold text-red-600 mb-4">
              {employeeName}
            </h2>
            <label className="block pl-4 text-base text-left font-semibold">User ID</label>
            <input
              type="text"
              value={employeeEmail} disabled
              className="w-full max-w-[361px] h-[45px] bg-[#F2F2F2] text-gray-600 rounded-md mb-4 pl-2 focus:outline-none"
            />
            <label className="block text-base pl-4 text-left font-semibold">
              New Password
            </label>
            <div className="relative">
              <input type="text" ref={inputRef} // <-- Attach ref
                value={password} disabled={!isEditable} onChange={(e) => setPassword(e.target.value)}
                className={`w-full max-w-[361px] h-[45px] border-2 border-[#BF9853] border-opacity-20 pl-2 rounded-md focus:outline-none mt-1 ${!isEditable ? 'bg-white' : ''}`}
              />
              <span className="absolute right-6 top-4 text-green-600 cursor-pointer" onClick={handleEditClick}>
                <img className="w-5 h-5" src={Edit} alt="Edit" />
              </span>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} className=" border w-[111px] h-[35px] border-[#BF9853] text-[#BF9853] rounded">
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={saving || !isEditable}
                className="bg-[#BF9853] w-[96px] h-[35px] text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {showPermissionPopup && permissionTarget && (
        <ModalOverlay>
          <div className="bg-white p-6 w-full max-w-[420px] shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-3 right-3 text-red-500 text-xl font-bold" onClick={handleClosePermission}>
              X
            </button>
            <h2 className="text-lg pl-2 font-semibold text-left text-[#BF9853] mb-4">
              User Permissions
            </h2>
            <p className="pl-2 text-sm text-gray-600 mb-4">{permissionTarget.username} ({permissionTarget.email})</p>
            <label className="flex items-center gap-2 pl-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={permissionCanCreateUsers}
                onChange={(e) => setPermissionCanCreateUsers(e.target.checked)}
                disabled={permissionSuperAdmin}
              />
              <span className="font-semibold">Can create new users</span>
            </label>
            <label className="flex items-center gap-2 pl-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={permissionSuperAdmin}
                onChange={(e) => {
                  setPermissionSuperAdmin(e.target.checked);
                  if (e.target.checked) {
                    setPermissionCanCreateUsers(true);
                  }
                }}
              />
              <span className="font-semibold">Super Admin</span>
            </label>
            <div className="flex justify-end gap-3">
              <button onClick={handleClosePermission} className="border w-[111px] h-[35px] border-[#BF9853] text-[#BF9853] rounded">
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="bg-[#BF9853] w-[121px] h-[35px] text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {showSuspendPopup && (
        <ModalOverlay>
          <div className="bg-white p-6 w-full max-w-[405px] min-h-[262px] shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-3 right-3 text-red-500 text-xl font-bold" onClick={handleCloseSuspend}>
              X
            </button>
            <h2 className="text-lg pl-4 font-semibold text-left text-[#E4572E] mb-4">Change User Status</h2>
            <p className="pl-4 text-sm text-gray-600 mb-4">
              Inactive users cannot log in or reset their password.
            </p>
            <label className="block pl-4 text-base text-left font-semibold mb-1">
              User Status
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full max-w-[323px] h-[45px] border-2 border-[#BF9853] border-opacity-20 focus:outline-none rounded-md px-2 mb-6"
            >
              <option value="">Select status</option>
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={handleCloseSuspend} className="border w-[111px] h-[35px] border-[#BF9853] text-[#BF9853] rounded">
                Cancel
              </button>
              <button
                onClick={handleUpdateUserStatus}
                disabled={saving || !selectedType}
                className="bg-[#E4572E] w-[121px] h-[35px] text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
export default ManageUsers