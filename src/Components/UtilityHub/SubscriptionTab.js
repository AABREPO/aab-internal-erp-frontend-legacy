import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import edit from '../Images/Edit.svg';

const SUBSCRIPTION_DIRECTORY_ENDPOINT = 'https://backendaab.in/aabuildersDash/api/utility-subscription/getAll';
const PROJECTS_ENDPOINT = 'https://backendaab.in/aabuilderDash/api/projects/getAll';
const SUBSCRIPTION_EXPENSES_ENDPOINT = 'https://backendaab.in/aabuilderDash/expenses_form/utility/subscription';
const FREQUENCY_HISTORY_ENDPOINT = 'https://backendaab.in/aabuildersDash/api/utility-frequency/getAll';
const SAVE_FREQUENCY_HISTORY_ENDPOINT = 'https://backendaab.in/aabuildersDash/api/utility-frequency/save';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthMap = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  June: '06',
  July: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12'
};

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    height: '45px',
    border: '2px solid #BF9853',
    borderRadius: '8px',
    boxShadow: 'none',
    '&:hover': {
      border: '2px solid #BF9853'
    },
    ...(state.isFocused && {
      border: '2px solid #BF9853',
      boxShadow: 'none'
    })
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#BF9853' : state.isFocused ? '#F5F5F5' : 'white',
    color: state.isSelected ? 'white' : 'black'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9CA3AF'
  })
};

const toLower = (value) => (value ? value.toString().toLowerCase() : '');

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getProjectCategoryStyles = (category = '') => {
  const normalized = category.toLowerCase();
  if (normalized.includes('client')) {
    return 'bg-orange-100 text-orange-800';
  }
  if (normalized.includes('own')) {
    return 'bg-green-100 text-green-800';
  }
  return 'bg-gray-100 text-gray-800';
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(numberValue);
};

const SubscriptionTab = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    provider: '',
    serviceNumber: '',
    registered: '',
    planNumber: '',
    projectName: '',
    serviceType: '',
    purpose: ''
  });
  const [projects, setProjects] = useState([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  const [frequencyHistory, setFrequencyHistory] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showHideModal, setShowHideModal] = useState(false);
  const [hiddenProjects, setHiddenProjects] = useState([]);
  const [providerOptions, setProviderOptions] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityFormData, setActivityFormData] = useState({
    subscriptionFrequency: '',
    subscriptionStartingMonth: ''
  });
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [submittedFrequencyData, setSubmittedFrequencyData] = useState({});

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [subscriptionRes, projectsRes, expensesRes] = await Promise.all([
          axios.get(SUBSCRIPTION_DIRECTORY_ENDPOINT),
          axios.get(PROJECTS_ENDPOINT),
          axios.get(SUBSCRIPTION_EXPENSES_ENDPOINT).catch((err) => {
            console.error('Error fetching subscription payments:', err);
            return { data: [] };
          })
        ]);

        const subscriptionEntries = Array.isArray(subscriptionRes.data) ? subscriptionRes.data : [];
        const projectRecords = Array.isArray(projectsRes.data) ? projectsRes.data : [];

        const projectLookup = new Map();
        projectRecords.forEach((record) => {
          const projectIdVariants = [record.id, record.projectId, record.project_id, record.projectID, record.siteNo];
          projectIdVariants.forEach((key) => {
            if (key !== undefined && key !== null) {
              projectLookup.set(String(key), {
                id: record.id ?? record.projectId ?? record.project_id ?? record.projectID ?? String(key),
                projectId: record.projectId ?? record.project_id ?? record.projectID ?? record.projectCode ?? '-',
                projectName: record.projectName ?? record.siteName ?? record.project ?? '-',
                projectCategory: record.projectCategory ?? record.project_category ?? record.category ?? '',
                raw: record
              });
            }
          });
        });

        const groupedProjectsMap = new Map();
        const providerSet = new Set();

        subscriptionEntries
          .filter((entry) => entry && (entry.service_number || entry.serviceNumber))
          .forEach((entry) => {
            const serviceNumber = entry.service_number ?? entry.serviceNumber;
            if (!serviceNumber || !String(serviceNumber).trim()) {
              return;
            }
            const rawProjectId = entry.project_id ?? entry.projectId ?? entry.projectID ?? null;
            const projectKey = rawProjectId !== null ? String(rawProjectId) : `subscription-${entry.id ?? serviceNumber}`;
            const projectMeta = rawProjectId !== null ? projectLookup.get(String(rawProjectId)) : null;

            const existingProject = groupedProjectsMap.get(projectKey) || {
              id: projectKey,
              projectId: projectMeta?.projectId ?? rawProjectId ?? '-',
              projectName: projectMeta?.projectName ?? entry.project_name ?? entry.project ?? '-',
              projectCategory: projectMeta?.projectCategory ?? entry.project_category ?? entry.category ?? '',
              subscriptionDetails: []
            };

            const detailId = entry.id ?? `${projectKey}-${existingProject.subscriptionDetails.length + 1}`;
            const providerName = entry.service_provider ?? entry.serviceProvider ?? '';
            if (providerName) {
              providerSet.add(providerName);
            }

            existingProject.subscriptionDetails.push({
              id: detailId,
              utilitySubscriptionId: entry.id ?? detailId,
              registeredPerson: entry.registered_person ?? entry.registeredPerson ?? '',
              planNumber: entry.plan_number ?? entry.planNumber ?? '',
              serviceType: entry.service_type ?? entry.serviceType ?? '',
              serviceNumber,
              purpose: entry.purpose ?? '',
              serviceProvider: providerName,
              amount: entry.amount ?? '',
              paymentDate: entry.payment_date ?? entry.paymentDate ?? '',
              validityValue: entry.validity ?? entry.validity_value ?? '',
              validityUnit: entry.validity_type ?? entry.validityType ?? '',
              serviceStart: entry.service_starting_date ?? entry.serviceStartingDate ?? '',
              serviceEnd: entry.service_end_date ?? entry.serviceEndDate ?? '',
              subscriptionEntry: entry
            });

            groupedProjectsMap.set(projectKey, existingProject);
          });

        const groupedProjects = Array.from(groupedProjectsMap.values()).filter((project) =>
          project.subscriptionDetails.some((detail) => detail.serviceNumber && detail.serviceNumber.trim() !== '')
        );

        setProjects(groupedProjects);
        setFilteredProjects(groupedProjects);
        setHiddenProjects([]);
        setProviderOptions(
          Array.from(providerSet)
            .sort()
            .map((provider) => ({
              value: provider,
              label: provider
            }))
        );
        setSubscriptionPayments(expensesRes.data || []);
      } catch (fetchError) {
        console.error('Error fetching subscription data:', fetchError);
        setError('Failed to fetch subscription directory data');
        setProjects([]);
        setFilteredProjects([]);
        setProviderOptions([]);
        setSubscriptionPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionData();
  }, []);

  useEffect(() => {
    const fetchFrequencyHistory = async () => {
      try {
        const response = await axios.get(FREQUENCY_HISTORY_ENDPOINT);
        setFrequencyHistory(response.data || []);
      } catch (err) {
        console.error('Error fetching frequency history:', err);
      }
    };
    fetchFrequencyHistory();
  }, []);

  useEffect(() => {
    const providerFilter = toLower(filters.provider);
    const serviceFilter = toLower(filters.serviceNumber);
    const registeredFilter = toLower(filters.registered);
    const planFilter = toLower(filters.planNumber);
    const serviceTypeFilter = toLower(filters.serviceType);
    const purposeFilter = toLower(filters.purpose);
    const projectNameFilter = toLower(filters.projectName);

    const filtered = projects.reduce((acc, project) => {
      if (selectedCategory && project.projectCategory !== selectedCategory) {
        return acc;
      }

      if (projectNameFilter && !toLower(project.projectName).includes(projectNameFilter)) {
        return acc;
      }

      const filteredDetails = (project.subscriptionDetails || []).filter((detail) => {
        if (!detail || !detail.serviceNumber || !detail.serviceNumber.trim()) {
          return false;
        }

        if (registeredFilter && !toLower(detail.registeredPerson).includes(registeredFilter)) {
          return false;
        }
        if (planFilter && !toLower(detail.planNumber).includes(planFilter)) {
          return false;
        }
        if (serviceTypeFilter && !toLower(detail.serviceType).includes(serviceTypeFilter)) {
          return false;
        }
        if (serviceFilter && !toLower(detail.serviceNumber).includes(serviceFilter)) {
          return false;
        }
        if (purposeFilter && !toLower(detail.purpose).includes(purposeFilter)) {
          return false;
        }
        if (providerFilter && !toLower(detail.serviceProvider).includes(providerFilter)) {
          return false;
        }

        if (filters.year) {
          const paymentYear = detail.paymentDate ? String(new Date(detail.paymentDate).getFullYear()) : '';
          if (paymentYear !== filters.year) {
            return false;
          }
        }

        return true;
      });

      if (filteredDetails.length === 0) {
        return acc;
      }

      acc.push({
        ...project,
        subscriptionDetails: filteredDetails
      });

      return acc;
    }, []);

    setFilteredProjects(filtered);
  }, [filters, projects, selectedCategory]);

  const handleFilterChange = (filterType, selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: selectedOption ? selectedOption.value : ''
    }));
  };

  const getUniqueValues = (key) => {
    const values = new Set();
    projects.forEach((project) => {
      if (key === 'projectName') {
        if (project.projectName) values.add(project.projectName);
      } else {
        project.subscriptionDetails.forEach((detail) => {
          if (key === 'serviceNumber' && detail.serviceNumber) values.add(detail.serviceNumber);
          if (key === 'registered' && detail.registeredPerson) values.add(detail.registeredPerson);
          if (key === 'planNumber' && detail.planNumber) values.add(detail.planNumber);
          if (key === 'serviceType' && detail.serviceType) values.add(detail.serviceType);
          if (key === 'purpose' && detail.purpose) values.add(detail.purpose);
        });
      }
    });
    return Array.from(values)
      .sort()
      .map((value) => ({
        value,
        label: value
      }));
  };

  const filteredFrequencyHistory = useMemo(() => frequencyHistory || [], [frequencyHistory]);

  const getFrequencyData = (subscriptionId) => {
    if (!subscriptionId) return null;
    const subscriptionIdStr = String(subscriptionId);
    const found = filteredFrequencyHistory.find((freq) => {
      const freqSubscriptionId =
        freq.utilitySubscriptionId ??
        freq.utility_subscription_id ??
        freq.UtilitySubscriptionId ??
        null;
      if (freqSubscriptionId === undefined || freqSubscriptionId === null) return false;
      return String(freqSubscriptionId) === subscriptionIdStr;
    });
    if (found) {
      return found;
    }
    const submitted = submittedFrequencyData[subscriptionIdStr];
    if (submitted) {
      return {
        subscriptionFrequencyNo: submitted.subscriptionFrequencyNo,
        startingMonthOfSubscriptionFrequency: submitted.startingMonthOfSubscriptionFrequency
      };
    }
    return null;
  };

  const shouldPayInMonth = (subscriptionId, month, year) => {
    const freqData = getFrequencyData(subscriptionId);
    if (!freqData) {
      return true;
    }
    const frequency = parseInt(
      freqData.subscriptionFrequencyNo ?? freqData.SubscriptionFrequencyNo ?? freqData.subscription_frequency_no ?? 0,
      10
    );
    if (!frequency || Number.isNaN(frequency) || frequency <= 0) {
      return true;
    }

    const startMonthKey =
      freqData.startingMonthOfSubscriptionFrequency ??
      freqData.StartingMonthOfSubscriptionFrequency ??
      freqData.starting_month_of_subscription_frequency ??
      null;
    if (!startMonthKey) {
      return true;
    }
    const [startYearStr, startMonthStr] = startMonthKey.split('-');
    const startYear = parseInt(startYearStr, 10);
    const startMonth = parseInt(startMonthStr, 10);
    if (Number.isNaN(startYear) || Number.isNaN(startMonth)) {
      return true;
    }

    const currentMonth = parseInt(month, 10);
    const currentYear = parseInt(year, 10);
    const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
  };

  const getPaymentData = (serviceNumber, month, subscriptionId) => {
    const selectedYear = filters.year || new Date().getFullYear().toString();
    const monthNumber = monthMap[month];
    if (!monthNumber) return { amount: '-', date: null };
    const yearMonth = `${selectedYear}-${monthNumber}`;
    const payment = subscriptionPayments.find((p) => {
      const payNumber =
        p.utilityTypeNumber ??
        p.utility_type_number ??
        p.utilityTypeNo ??
        p.utility_type_no ??
        p.subscriptionServiceNumber ??
        p.subscription_service_number ??
        p.subscriptionNumber ??
        p.subscription_number ??
        p.serviceNumber ??
        p.service_number;
      const monthValue =
        p.utilityForTheMonth ??
        p.utility_for_the_month ??
        p.subscriptionForTheMonth ??
        p.subscription_for_the_month;
      return payNumber === serviceNumber && monthValue === yearMonth;
    });
    if (payment) {
      return {
        amount: payment.amount || '0',
        date: payment.date || payment.paymentDate || null,
        billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || payment.attachmentUrl || null
      };
    }
    if (!shouldPayInMonth(subscriptionId, monthNumber, selectedYear)) {
      return { amount: '-', date: null, isNotRequired: true };
    }
    return { amount: '0', date: null };
  };

  const getUnpaidCount = (serviceNumber, subscriptionId) => {
    const selectedYear = filters.year || new Date().getFullYear().toString();
    let unpaidCount = 0;
    monthLabels.forEach((month) => {
      const monthNumber = monthMap[month];
      if (shouldPayInMonth(subscriptionId, monthNumber, selectedYear)) {
        const yearMonth = `${selectedYear}-${monthNumber}`;
        const payment = subscriptionPayments.find((p) => {
          const payNumber =
            p.utilityTypeNumber ??
            p.utility_type_number ??
            p.utilityTypeNo ??
            p.utility_type_no ??
            p.subscriptionServiceNumber ??
            p.subscription_service_number ??
            p.subscriptionNumber ??
            p.subscription_number ??
            p.serviceNumber ??
            p.service_number;
          const monthValue =
            p.utilityForTheMonth ??
            p.utility_for_the_month ??
            p.subscriptionForTheMonth ??
            p.subscription_for_the_month;
          return payNumber === serviceNumber && monthValue === yearMonth;
        });
        if (!payment) {
          unpaidCount++;
        }
      }
    });
    return unpaidCount;
  };

  const buildExportRows = () => {
    const rows = [];
    let rowNumber = 0;

    filteredProjects.forEach((project) => {
      const details = Array.isArray(project.subscriptionDetails) ? project.subscriptionDetails : [];
      details
        .filter((detail) => detail.serviceNumber && detail.serviceNumber.trim() !== '')
        .forEach((detail) => {
          rowNumber += 1;
          const row = {
            slNo: rowNumber,
            pid: project.projectId || '-',
            projectName: project.projectName || '-',
            category: detail.serviceType || project.projectCategory || '-',
            registered: detail.registeredPerson || '-',
            serviceNo: detail.serviceNumber || '-'
          };

          monthLabels.forEach((month) => {
            const paymentData = getPaymentData(detail.serviceNumber, month, detail.utilitySubscriptionId);
            row[month] = paymentData && paymentData.amount !== undefined ? paymentData.amount : '-';
          });

          row.unpaid = getUnpaidCount(detail.serviceNumber, detail.utilitySubscriptionId);
          rows.push(row);
        });
    });

    return rows;
  };

  const handleExportPDF = () => {
    const rows = buildExportRows();
    if (!rows.length) return;

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Subscription Services Overview', 14, 20);

    const headers = ['Sl.No', 'PID', 'Project Name', 'Category', 'Registered', 'Service No', ...monthLabels, 'Unpaid'];
    const body = rows.map((row) => [
      row.slNo,
      row.pid,
      row.projectName,
      row.category,
      row.registered,
      row.serviceNo,
      ...monthLabels.map((month) => row[month]),
      row.unpaid
    ]);

    doc.autoTable({
      head: [headers],
      body,
      startY: 28,
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [191, 152, 83]
      },
      margin: {
        left: 10,
        right: 10
      }
    });

    doc.save('SubscriptionServices.pdf');
  };

  const handleExportExcel = () => {
    const rows = buildExportRows();
    if (!rows.length) return;

    const worksheetData = rows.map((row) => {
      const base = {
        'Sl.No': row.slNo,
        PID: row.pid,
        'Project Name': row.projectName,
        Category: row.category,
        Registered: row.registered,
        'Service No': row.serviceNo
      };

      monthLabels.forEach((month) => {
        base[month] = row[month];
      });

      base['Unpaid'] = row.unpaid;
      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SubscriptionServices');
    XLSX.writeFile(workbook, 'SubscriptionServices.xlsx');
  };

  const hasExportableData = filteredProjects.some(
    (project) =>
      Array.isArray(project.subscriptionDetails) &&
      project.subscriptionDetails.some((detail) => detail.serviceNumber && detail.serviceNumber.trim() !== '')
  );

  const toggleProjectHideStatus = (projectId, isHide) => {
    if (isHide) {
      const projectToHide = projects.find((p) => p.id === projectId);
      if (projectToHide) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setFilteredProjects((prev) => prev.filter((p) => p.id !== projectId));
        setHiddenProjects((prev) => [...prev, projectToHide]);
      }
    } else {
      const projectToShow = hiddenProjects.find((p) => p.id === projectId);
      if (projectToShow) {
        setHiddenProjects((prev) => prev.filter((p) => p.id !== projectId));
        setProjects((prev) => [...prev, projectToShow]);
      }
    }
  };

  const handleFileClick = (fileData) => {
    if (fileData && fileData.billCopyUrl) {
      window.open(fileData.billCopyUrl, '_blank');
    } else if (fileData) {
      alert('No file attached for this payment');
    }
  };

  const handleActivityEdit = (project, detail) => {
    setSelectedRowData({ project, detail });
    setActivityFormData({
      subscriptionFrequency: '',
      subscriptionStartingMonth: ''
    });
    setShowActivityModal(true);
  };

  const handleFrequencyInputChange = (key, value) => {
    setActivityFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleActivitySubmit = async () => {
    if (!activityFormData.subscriptionFrequency.trim() || !activityFormData.subscriptionStartingMonth) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const subscriptionKey =
        selectedRowData?.detail?.utilitySubscriptionId ?? selectedRowData?.detail?.id;
      if (!subscriptionKey) {
        alert('Unable to determine subscription record identifier');
        return;
      }
      const subscriptionKeyStr = String(subscriptionKey);
      const frequencyHistoryData = {
        utilityTelecomId: null,
        utilitySubscriptionId: subscriptionKey,
        utilityAmcId: null,
        telecomFrequencyNo: null,
        startingMonthOfTelecomFrequency: null,
        subscriptionFrequencyNo: parseInt(activityFormData.subscriptionFrequency, 10),
        startingMonthOfSubscriptionFrequency: activityFormData.subscriptionStartingMonth,
        amcFrequencyNo: null,
        startingMonthOfAmcFrequency: null
      };
      const response = await axios.post(SAVE_FREQUENCY_HISTORY_ENDPOINT, frequencyHistoryData);
      if (response.data) {
        setSubmittedFrequencyData((prev) => ({
          ...prev,
          [subscriptionKeyStr]: {
            subscriptionFrequencyNo: activityFormData.subscriptionFrequency,
            startingMonthOfSubscriptionFrequency: activityFormData.subscriptionStartingMonth
          }
        }));
        const refreshFrequencyHistory = async () => {
          try {
            const refreshed = await axios.get(FREQUENCY_HISTORY_ENDPOINT);
            setFrequencyHistory(refreshed.data || []);
          } catch (err) {
            console.error('Error refreshing frequency history:', err);
          }
        };
        refreshFrequencyHistory();
        alert('Subscription frequency saved successfully!');
        window.location.reload();
        setShowActivityModal(false);
        setSelectedRowData(null);
        setActivityFormData({
          subscriptionFrequency: '',
          subscriptionStartingMonth: ''
        });
      }
    } catch (err) {
      console.error('Error saving frequency history:', err);
      alert('Failed to save frequency history. Please try again.');
    }
  };

  const frequencyRowsForDetail = (subscriptionId) => {
    if (!subscriptionId) return [];
    const subscriptionIdStr = String(subscriptionId);
    const entries = filteredFrequencyHistory
      .filter((freq) => {
        const freqSubscriptionId =
          freq.utilitySubscriptionId ??
          freq.utility_subscription_id ??
          freq.UtilitySubscriptionId ??
          null;
        if (freqSubscriptionId === undefined || freqSubscriptionId === null) {
          return false;
        }
        return String(freqSubscriptionId) === subscriptionIdStr;
      })
      .map((freq) => {
        const subscriptionFrequencyNo = freq.subscriptionFrequencyNo ?? freq.SubscriptionFrequencyNo ?? null;
        const startingMonthOfSubscriptionFrequency =
          freq.startingMonthOfSubscriptionFrequency ??
          freq.StartingMonthOfSubscriptionFrequency ??
          null;
        if (!subscriptionFrequencyNo || !startingMonthOfSubscriptionFrequency) {
          return null;
        }
        return {
          subscriptionFrequencyNo,
          startingMonthOfSubscriptionFrequency
        };
      })
      .filter(Boolean);
    const submittedData = submittedFrequencyData[subscriptionIdStr];
    if (submittedData?.subscriptionFrequencyNo && submittedData?.startingMonthOfSubscriptionFrequency) {
      entries.push({
        subscriptionFrequencyNo: submittedData.subscriptionFrequencyNo,
        startingMonthOfSubscriptionFrequency: submittedData.subscriptionStartingMonth ?? submittedData.startingMonthOfSubscriptionFrequency
      });
    }
    return entries;
  };

  const renderFrequencyTable = (detail) => {
    const rows = frequencyRowsForDetail(detail.utilitySubscriptionId ?? detail.id);
    if (!rows.length) return null;
    return (
      <table className="w-[220px] border-collapse border border-gray-300 mt-2 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Frequency</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Starting Month</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-1">{row.subscriptionFrequencyNo}</td>
              <td className="border border-gray-300 px-2 py-1">
                {row.startingMonthOfSubscriptionFrequency
                  ? new Date(`${row.startingMonthOfSubscriptionFrequency}-01`).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
      <div className="bg-white rounded-md mb-5 h-[128px] ml-5 mr-5">
        <div className="p-6">
          <div className="flex text-left gap-4">
            <div>
              <label className="block font-semibold mb-1">Year</label>
              <Select
                options={[
                  { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                  { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                  { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() }
                ]}
                value={filters.year ? { value: filters.year, label: filters.year } : null}
                onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                placeholder="Select Year"
                isClearable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Service Provider</label>
              <Select
                options={providerOptions}
                value={filters.provider ? { value: filters.provider, label: filters.provider } : null}
                onChange={(selectedOption) => handleFilterChange('provider', selectedOption)}
                placeholder="Select Provider"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Service Number</label>
              <Select
                options={getUniqueValues('serviceNumber')}
                value={filters.serviceNumber ? { value: filters.serviceNumber, label: filters.serviceNumber } : null}
                onChange={(selectedOption) => handleFilterChange('serviceNumber', selectedOption)}
                placeholder="Select Service No"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Registered Person</label>
              <Select
                options={getUniqueValues('registered')}
                value={filters.registered ? { value: filters.registered, label: filters.registered } : null}
                onChange={(selectedOption) => handleFilterChange('registered', selectedOption)}
                placeholder="Select Registered"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Plan Number</label>
              <Select
                options={getUniqueValues('planNumber')}
                value={filters.planNumber ? { value: filters.planNumber, label: filters.planNumber } : null}
                onChange={(selectedOption) => handleFilterChange('planNumber', selectedOption)}
                placeholder="Select Plan"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Project Name</label>
              <Select
                options={getUniqueValues('projectName')}
                value={filters.projectName ? { value: filters.projectName, label: filters.projectName } : null}
                onChange={(selectedOption) => handleFilterChange('projectName', selectedOption)}
                placeholder="Select Project"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Service Type</label>
              <Select
                options={getUniqueValues('serviceType')}
                value={filters.serviceType ? { value: filters.serviceType, label: filters.serviceType } : null}
                onChange={(selectedOption) => handleFilterChange('serviceType', selectedOption)}
                placeholder="Select Type"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Purpose</label>
              <Select
                options={getUniqueValues('purpose')}
                value={filters.purpose ? { value: filters.purpose, label: filters.purpose } : null}
                onChange={(selectedOption) => handleFilterChange('purpose', selectedOption)}
                placeholder="Select Purpose"
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md ml-5 mr-5 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Client Project' ? '' : 'Client Project')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === 'Client Project'
                  ? 'bg-[#BF9853] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Clients Projects
            </button>
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Own Project' ? '' : 'Own Project')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === 'Own Project'
                  ? 'bg-[#BF9853] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Own Projects
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-black">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={loading || !hasExportableData}
              className="flex items-center font-semibold gap-2 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading || !hasExportableData}
              className="flex items-center font-semibold gap-2 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
            >
              Export XL
            </button>
            <button className="flex items-center font-semibold gap-2 hover:text-gray-600">Print</button>
            <button
              onClick={() => setShowHideModal(true)}
              className="px-4 py-2 bg-[#BF9853] text-white rounded-lg font-semibold hover:bg-[#A68B4A] transition-colors"
            >
              Hide Items
            </button>
          </div>
        </div>
        <div className="border-l-8 border-l-[#BF9853] rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF6ED]">
                  <td className="px-4 py-2 text-left font-semibold">Sl.No</td>
                  <td className="px-4 py-2 text-left font-semibold">PID</td>
                  <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                  <td className="px-4 py-2 text-left font-semibold">Category</td>
                  <td className="px-4 py-2 text-left font-semibold">Registered</td>
                  <td className="px-4 py-2 text-left font-semibold">Service No</td>
                  {monthLabels.map((month) => (
                    <td key={month} className="px-4 py-2 text-left font-semibold">
                      {month}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-left font-semibold">Unpaid</td>
                  
                  <td className="px-4 py-2 text-left font-semibold">Activity</td>
                  <td className="px-4 py-2 text-left font-semibold">Hide</td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={20} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={20} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center py-4">
                      No subscription services found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, projectIndex) =>
                    project.subscriptionDetails
                      .filter((detail) => detail.serviceNumber && detail.serviceNumber.trim() !== '')
                      .map((detail, detailIndex) => {
                        const rowIndex = projectIndex * project.subscriptionDetails.length + detailIndex;
                        const subscriptionKey = detail.utilitySubscriptionId ?? detail.id;
                        return (
                          <tr key={`${project.id}-${detail.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                            <td className="px-4 py-2">{rowIndex + 1}</td>
                            <td className="px-4 py-2">{project.projectId}</td>
                            <td className="px-4 py-2 text-left">{project.projectName}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getProjectCategoryStyles(
                                  project.projectCategory
                                )}`}
                              >
                                {project.projectCategory || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2">{detail.registeredPerson || '-'}</td>
                            <td className="px-4 py-2 text-left">
                              <div className="relative inline-block group">
                                <span className="cursor-default">{detail.serviceNumber}</span>
                                <div className="absolute right-0 top-full z-40 mt-2 hidden w-60 rounded-lg border border-[#BF9853]/30 bg-white p-3 text-sm shadow-lg group-hover:block">
                                  <div className="space-y-2">
                                    <div className="flex">
                                      <span className="w-20 font-medium text-black">Provider :</span>
                                      <span className="flex-1 font-semibold text-[#E4572E] truncate" title={detail.serviceProvider}>
                                        {detail.serviceProvider || '-'}
                                      </span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-20 font-medium text-black">Type :</span>
                                      <span className="flex-1 font-semibold text-[#E4572E] truncate" title={detail.serviceType}>
                                        {detail.serviceType || '-'}
                                      </span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-20 font-medium text-black">Plan :</span>
                                      <span className="flex-1 font-semibold text-[#E4572E] truncate" title={detail.planNumber}>
                                        {detail.planNumber || '-'}
                                      </span>
                                    </div>
                                    <div className="flex">
                                      <span className="w-20 font-medium text-black">Purpose :</span>
                                      <span className="flex-1 font-semibold text-[#E4572E] truncate" title={detail.purpose}>
                                        {detail.purpose || '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            {monthLabels.map((month) => {
                              const paymentData = getPaymentData(detail.serviceNumber, month, subscriptionKey);
                              const isPaid = paymentData.amount !== '-' && paymentData.amount !== '0';
                              const isNotRequired = paymentData.isNotRequired;
                              return (
                                <td key={month} className="px-4 py-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      isNotRequired
                                        ? 'text-gray-400 cursor-default'
                                        : isPaid
                                          ? 'text-green-600 hover:text-green-800 cursor-pointer'
                                          : paymentData.amount === '0'
                                            ? 'text-red-600 hover:text-red-800 cursor-pointer'
                                            : 'text-gray-500 cursor-default'
                                    }`}
                                    title={
                                      isNotRequired
                                        ? 'No payment required this month'
                                        : paymentData.date
                                          ? `Date: ${formatDate(paymentData.date)}`
                                          : ''
                                    }
                                    onClick={isNotRequired ? undefined : () => handleFileClick(paymentData)}
                                  >
                                    {paymentData.amount}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="px-4 py-2">
                              <span className="text-sm font-medium text-gray-700">
                                {getUnpaidCount(detail.serviceNumber, subscriptionKey)}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleActivityEdit(project, detail)}
                                className="rounded-full transition duration-200 hover:scale-110 hover:brightness-110"
                              >
                                <img src={edit} alt="Edit" className="w-5 h-4" />
                              </button>
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => toggleProjectHideStatus(project.id, true)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Hide
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showHideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Hidden Subscription Services</h2>
              <button onClick={() => setShowHideModal(false)} className="text-red-600 hover:text-red-800">
                ×
              </button>
            </div>
            {hiddenProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hidden items</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6ED]">
                      <td className="px-4 py-2 text-left font-semibold">Sl.No</td>
                      <td className="px-4 py-2 text-left font-semibold">PID</td>
                      <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                      <td className="px-4 py-2 text-left font-semibold">Registered</td>
                      <td className="px-4 py-2 text-left font-semibold">Service No</td>
                      <td className="px-4 py-2 text-left font-semibold">Unhide</td>
                    </tr>
                  </thead>
                  <tbody>
                    {hiddenProjects.map((project, projectIndex) =>
                      project.subscriptionDetails
                        .filter((detail) => detail.serviceNumber && detail.serviceNumber.trim() !== '')
                        .map((detail, detailIndex) => {
                          const rowIndex = projectIndex * project.subscriptionDetails.length + detailIndex;
                          return (
                            <tr key={`${project.id}-${detail.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                              <td className="px-4 py-2">{rowIndex + 1}</td>
                              <td className="px-4 py-2">{project.projectId}</td>
                              <td className="px-4 py-2">{project.projectName}</td>
                              <td className="px-4 py-2">{detail.registeredPerson || '-'}</td>
                              <td className="px-4 py-2">{detail.serviceNumber}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => toggleProjectHideStatus(project.id, false)}
                                  className="text-[#BF9853] hover:text-[#A68B4A]"
                                >
                                  Unhide
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {showActivityModal && selectedRowData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Subscription Activity Entry</h2>
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setSelectedRowData(null);
                  setActivityFormData({
                    subscriptionFrequency: '',
                    subscriptionStartingMonth: ''
                  });
                }}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-left">
              <div className="bg-gray-50 flex p-3 rounded-lg gap-4">
                <div className="border-r border-gray-300 pr-3">
                  <h3 className="font-semibold text-gray-700 mb-1">Subscription Details:</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Project:</span> {selectedRowData.project.projectName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Service No:</span> {selectedRowData.detail.serviceNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Registered:</span> {selectedRowData.detail.registeredPerson || '-'}
                  </p>
                </div>
                <div>{renderFrequencyTable(selectedRowData.detail)}</div>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-md font-semibold mb-2 block">
                    Subscription Frequency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={activityFormData.subscriptionFrequency}
                    onChange={(e) => handleFrequencyInputChange('subscriptionFrequency', e.target.value)}
                    placeholder="Enter subscription frequency"
                    className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                  />
                </div>
                <div>
                  <label className="text-md font-semibold mb-2 block">
                    Subscription Starting Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={activityFormData.subscriptionStartingMonth}
                    onChange={(e) => handleFrequencyInputChange('subscriptionStartingMonth', e.target.value)}
                    className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[250px] h-[45px] focus:outline-none border-opacity-[0.20]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedRowData(null);
                    setActivityFormData({
                      subscriptionFrequency: '',
                      subscriptionStartingMonth: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivitySubmit}
                  className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68B4A] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTab;

