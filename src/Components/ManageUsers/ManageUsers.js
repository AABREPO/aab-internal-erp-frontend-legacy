import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Gear from '../Images/gears.png'
import Reload from '../Images/reload.png'
import Edit from '../Images/Edit.svg'
import Pause from '../Images/pause-circle.png'
import Delete from '../Images/delete-account.png'

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
  const [isEditable, setIsEditable] = useState(false);
  const [showSuspendPopup, setShowSuspendPopup] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const inputRef = useRef(null); // <-- Ref for input

  const handleEditClick = () => {
    setIsEditable(true);
    setTimeout(() => {
      inputRef.current?.focus(); // Focus input after enabling edit mode
    }, 0); // Timeout ensures state updates first
  };

  const handleOpen = (emp) => {
    setShowPopup(true);
    setPassword(emp.password);
    setEmployeeEmail(emp.email);
    setEmployeeName(emp.username);
  };
  const handleClose = () => {
    setShowPopup(false);
    setIsEditable(false);
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
      const updatedUserDto = {
        ...user,
        userRoles: updatedUserRoles,
      };
      const response = await axios.put(
        `https://backendaab.in/aabuilderDash/api/user/edit/${user.id}`,
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
      const updatedUserDto = {
        ...user,
        userRoles: updatedUserRoles,
      };
      const response = await axios.put(
        `https://backendaab.in/aabuilderDash/api/user/edit/${user.id}`,
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
        const response = await axios.get("https://backendaab.in/aabuilderDash/api/user/all");
        const usersWithRoles = response.data.map((user) => ({
          ...user,
          roles: user.userRoles ? user.userRoles.map((role) => role.roles) : [],
        }));
        setEmployees(usersWithRoles);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    const fetchroles = async () => {
      try {
        const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
        const usersWithRoles = response.data
        console.log(usersWithRoles);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchroles();
  }, []);
  const fetchRoleNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/roles/all');
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
  return (
    <div className="p-6 w-[1750px] bg-white ml-8">
      <div className="flex ml-10 gap-5 text-left">
        <div>
          <label className="block mb-3 font-semibold">Branch Name</label>
          <select className="w-[252px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
            <option>Select Branch</option>
            <option>Option 1</option>
          </select>
        </div>
        <div>
          <label className="block mb-3 font-semibold">Employee Name</label>
          <select className="w-[257px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
            <option>Select Employee Name</option>
            <option>Option 1</option>
          </select>
        </div>
        <div>
          <label className="block mb-3 font-semibold">Employee ID</label>
          <select className="w-[147px] h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg focus:outline-none">
            <option>Select Employee ID</option>
            <option>Option 1</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between mb-7">
        <div></div>
        <div>
          <div>
            <button
              className="w-[132px] h-[38px] mr-96 bg-[#BF9853] text-white font-semibold rounded"
              onClick={() => setShowModal(true)}
            >
              + New User
            </button>
          </div>
        </div>
      </div>
      <div>
        <table className="w-full text-sm border-gray-200 rounded-md shadow">
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
                    {emp.userImage ? (
                      <img
                        src={`data:image/jpeg;base64,${emp.userImage}`}
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
                      <button
                        className="border px-2 rounded-full w-[72px] h-[30px] hover:bg-gray-100"
                        onClick={() => {
                          setSelectedEmpIndex(empIndex);
                          setShowModal1(true);
                        }}
                      >
                        Add +
                      </button>

                      {emp.roles.length > 0 && (
                        <span
                          className={`${roleColors[0 % roleColors.length].bg
                            } ${roleColors[0 % roleColors.length].text} h-[30px] px-2 flex items-center text-sm font-semibold rounded-full`}
                        >
                          {emp.roles[0]}
                          <button
                            className="ml-2 cursor-pointer font-bold"
                            onClick={() => handleRemoveRole(empIndex, emp.roles[0])}
                          >
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
                          <span
                            key={idx}
                            className={`${color.bg} ${color.text} h-[30px] px-2 flex items-center text-sm font-semibold rounded-full`}
                          >
                            {role}
                            <button
                              className="ml-2 cursor-pointer font-bold"
                              onClick={() => handleRemoveRole(empIndex, role)}
                            >
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
                  <div className="flex gap-2 pl-3">
                    <button onClick={() => handleOpen(emp)}>
                      <img className="w-5 h-5" src={Edit} alt="edit" />
                    </button>
                    <button onClick={() => setShowSuspendPopup(true)}>
                      <img className="w-5 h-5" src={Pause} alt="Pause" />
                    </button>
                    <button><img className="w-5 h-5" src={Delete}></img></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-7 rounded shadow-md w-[441px] h-[415px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-red-600 font-semibold">New user</h2>
              <button onClick={() => setShowModal(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <div className="flex flex-row text-left mb-4">
              <div>
                <label className="text-base font-semibold">Select Employee</label>
                <select className="w-[198px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg  focus:outline-none">
                  <option>Select Employee</option>
                </select>
              </div>
              <div>
                <label className="text-base font-semibold">Employee ID</label>
                <select className="w-[147px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg  focus:outline-none">
                  <option>ID</option>
                </select>
              </div>
            </div>
            <div className="mr-7 text-left">
              <div className="mb-4">
                <label className="text-base font-semibold">Create User ID</label>
                <input type="text" placeholder="Enter New User id" className="w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none" />
              </div>
              <div className="mb-4">
                <label className="text-base font-semibold">Create Password</label>
                <input type="password" placeholder="Enter New Password" className="w-[361px] h-[45px] p-2 border-2 border-[#BF9853] border-opacity-20 rounded-lg mt-1 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border w-[114px] h-[36px] px-4 rounded text-[#BF9853] border-[#BF9853]">Cancel</button>
              <button className="bg-[#BF9853] text-white px-4 w-[112px] h-[36px] rounded">Create</button>
            </div>
          </div>
        </div>
      )}
      {showModal1 && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[400px] rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setShowModal1(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Select Roles</h2>
            <div className="overflow-y-auto ">
              {allRoles
                .filter((role) => role.roleName) // Ensures you skip null or invalid entries
                .map((role, idx) => (
                  <label key={idx} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.roleName)}
                      onChange={() => handleRoleChange(role.roleName)}
                      className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                    />
                    <span>{role.roleName}</span>
                  </label>
                ))}
            </div>
            <div className="flex justify-end mt-4 gap-3">
              <button
                className="border border-[#BF9853] text-[#BF9853] w-[114px] h-[36px] rounded"
                onClick={() => setShowModal1(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#BF9853] text-white w-[114px] h-[36px] rounded"
                onClick={() => handleSubmitRoles(selectedEmpIndex)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 w-[441px] h-[321px] shadow-lg relative">
            <button
              className="absolute top-3 right-5 text-red-500 text-lg font-bold"
              onClick={handleClose}
            >
              X
            </button>
            <h2 className="text-lg text-left pl-4 font-semibold text-red-600 mb-4">
              {employeeName}
            </h2>
            <label className="block pl-4 text-base text-left font-semibold">User ID</label>
            <input
              type="text"
              value={employeeEmail}
              disabled
              className="w-[361px] h-[45px] bg-[#F2F2F2] text-gray-600 rounded-md mb-4 pl-2 focus:outline-none"
            />
            <label className="block text-base pl-4 text-left font-semibold">
              New Password
            </label>
            <div className="relative">
              <input
                type="text"
                ref={inputRef} // <-- Attach ref
                value={password}
                disabled={!isEditable}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-[361px] h-[45px] border-2 border-[#BF9853] border-opacity-20 pl-2 rounded-md focus:outline-none mt-1 ${!isEditable ? 'bg-white' : ''}`}
              />
              <span
                className="absolute right-6 top-4 text-green-600 cursor-pointer"
                onClick={handleEditClick}
              >
                <img className="w-5 h-5" src={Edit} alt="Edit" />
              </span>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className=" border w-[111px] h-[35px] border-[#BF9853] text-[#BF9853] rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Saving password:", password);
                  handleClose();
                }}
                className="bg-[#BF9853] w-[96px] h-[35px] text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuspendPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 w-[405px] h-[262px] shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-red-500 text-xl font-bold"
              onClick={() => setShowSuspendPopup(false)}
            >
              X
            </button>
            <h2 className="text-lg pl-4 font-semibold text-left text-[#E4572E] mb-4">Suspend</h2>

            <label className="block pl-4 text-base text-left font-semibold mb-1">
              Select Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-[323px] h-[45px] border-2 border-[#BF9853] border-opacity-20 focus:outline-none rounded-md px-2 mb-6"
            >
              <option value="">Select One</option>
              <option value="Temporary">Temporary</option>
              <option value="Permanent">Permanent</option>
            </select>
            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSuspendPopup(false)}
                className="border w-[111px] h-[35px] border-[#BF9853] text-[#BF9853] rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Suspending type:', selectedType);
                  setShowSuspendPopup(false);
                }}
                className="bg-[#E4572E] w-[121px] h-[35px] text-white rounded"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ManageUsers