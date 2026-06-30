import React, { useState, useEffect, useRef } from 'react';
import EditIcon from '../Images/edit1.png';
import DeleteIcon from '../Images/delete.png';
import SelectOptionModal from '../PurchaseOrder/SelectOptionModal';
import Filter from '../Images/Filter.png';
import Close from '../Images/close.png';
import Search from '../Images/Search.png';
import CloseIcon from '../Images/Close F.svg'
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_tracker_management';
const PROJECT_NAMES_BASE_URL = 'https://backendaab.in/demoAabuilderDash/api/project_Names';
const VENDOR_NAMES_BASE_URL = 'https://backendaab.in/demoAabuilderDash/api/vendor_Names';
const EMPLOYEE_DETAILS_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/employee_details';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_item_name';
const TOOLS_BRAND_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_brand';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_item_id';
const TOOLS_MACHINE_NUMBER_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/tools_machine_number';

const flattenToolsTrackerEntries = (entries) => {
  const allEntries = Array.isArray(entries) ? entries : [];
  const flattenedData = [];

  allEntries.forEach((entry) => {
    const entryItems =
      entry.tools_tracker_item_name_table ||
      entry.toolsTrackerItemNameTable ||
      entry.toolsTrackerItemNameTables ||
      [];

    if (entryItems.length === 0) {
      flattenedData.push({
        id: `${entry.id}-0`,
        entryId: entry.id,
        itemTableId: null,
        eno: entry.eno || '',
        toolsEntryType: entry.tools_entry_type || entry.toolsEntryType || 'Entry',
        fromProjectId: entry.from_project_id || entry.fromProjectId || '',
        toProjectId: entry.to_project_id || entry.toProjectId || '',
        homeLocationId: entry.home_location_id || entry.homeLocationId || '',
        serviceStoreId: entry.service_store_id || entry.serviceStoreId || '',
        projectInchargeId: entry.project_incharge_id || entry.projectInchargeId || '',
        createdDateTime: entry.created_date_time || entry.createdDateTime || entry.timestamp || '',
        createdBy: entry.created_by || entry.createdBy || '',
        itemNameId: '',
        brandId: '',
        itemIdsId: '',
        machineNumber: '',
        machineStatus: '',
        quantity: 0,
        description: ''
      });
      return;
    }

    entryItems.forEach((item, index) => {
      const itemTableId = item.id ?? item.Id ?? null;
      flattenedData.push({
        id: `${entry.id}-${index}`,
        entryId: entry.id,
        itemTableId,
        eno: entry.eno || '',
        toolsEntryType: entry.tools_entry_type || entry.toolsEntryType || 'Entry',
        fromProjectId: entry.from_project_id || entry.fromProjectId || '',
        toProjectId: entry.to_project_id || entry.toProjectId || '',
        homeLocationId: item.home_location_id || item.homeLocationId || entry.home_location_id || entry.homeLocationId || '',
        serviceStoreId: entry.service_store_id || entry.serviceStoreId || '',
        projectInchargeId: entry.project_incharge_id || entry.projectInchargeId || '',
        createdDateTime: entry.created_date_time || entry.createdDateTime || entry.timestamp || '',
        createdBy: entry.created_by || entry.createdBy || '',
        itemNameId: item.item_name_id || item.itemNameId || '',
        brandId: item.brand_id || item.brandId || '',
        itemIdsId: item.item_ids_id || item.itemIdsId || '',
        machineNumber: item.machine_number || item.machineNumber || '',
        machineNumberId: item.machine_number_id || item.machineNumberId || '',
        machineStatus: item.machine_status || item.machineStatus || 'Working',
        quantity: item.quantity || 0,
        description: item.description || ''
      });
    });
  });

  flattenedData.sort((a, b) => {
    const idA = Number(a.entryId ?? a.id ?? 0);
    const idB = Number(b.entryId ?? b.id ?? 0);
    if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
      return idB - idA;
    }
    return String(b.entryId ?? b.id ?? '').localeCompare(String(a.entryId ?? a.id ?? ''));
  });

  return flattenedData;
};

const getHistoryTabRequests = (historyType, baseUrl) => {
  if (historyType === 'entry') {
    return [`${baseUrl}/getByEntryType/entry`];
  }
  if (historyType === 'service') {
    return [
      `${baseUrl}/getByEntryType/service`,
      `${baseUrl}/getByEntryType/service_return`
    ];
  }
  if (historyType === 'relocate') {
    return [`${baseUrl}/getByEntryType/relocate`];
  }
  return [`${baseUrl}/getAll`];
};

const History = ({ user, onTabChange }) => {
  const [historyType, setHistoryType] = useState('entry'); // 'entry' | 'service' | 'relocate' | 'log'
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve module permissions from user's roles (used to block Edit/Delete on History cards).
  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    const moduleName = 'Tools Tracker';
    const resolvedUserRoles =
      user?.userRoles ||
      (() => {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          return stored?.userRoles || [];
        } catch {
          return [];
        }
      })();

    fetchUserModulePermissions(resolvedUserRoles, moduleName)
      .then(setModulePermissions)
      .catch(() => setModulePermissions([]));
  }, [user?.userRoles]);

  const canEdit = modulePermissions.includes('Edit');
  const canDelete = modulePermissions.includes('Delete');
  const [fullEntriesData, setFullEntriesData] = useState([]); // Store full entries before flattening
  const [projectsMap, setProjectsMap] = useState({});
  const [vendorsMap, setVendorsMap] = useState({});
  const [employeesMap, setEmployeesMap] = useState({});
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [brandsMap, setBrandsMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [machineNumbersMap, setMachineNumbersMap] = useState({});
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  // Cache whether a given itemTableId has images to avoid misleading underline/click.
  const [itemHasImagesByItemTableId, setItemHasImagesByItemTableId] = useState({});
  const [imageViewerData, setImageViewerData] = useState({
    images: [],
    currentIndex: 0,
    itemName: '',
    itemId: '',
    machineStatus: ''
  });
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [cloneExpandedEntryId, setCloneExpandedEntryId] = useState(null);
  const [filterItemId, setFilterItemId] = useState('');
  const [showFilterItemIdModal, setShowFilterItemIdModal] = useState(false);
  const [logEditEvents, setLogEditEvents] = useState([]); // array of { id, type, flattenedEntry, editedFields, oldValues, editedDate }
  const [logLoading, setLogLoading] = useState(false);
  const [showFilterBottomSheet, setShowFilterBottomSheet] = useState(false);
  const [filterItemName, setFilterItemName] = useState('');
  const [filterFromLocation, setFilterFromLocation] = useState('');
  const [filterToLocation, setFilterToLocation] = useState('');
  const [filterMachineStatus, setFilterMachineStatus] = useState('');
  const [filterProjectIncharge, setFilterProjectIncharge] = useState('');
  const [filterMachineNumber, setFilterMachineNumber] = useState('');
  const [showFilterItemNameDropdown, setShowFilterItemNameDropdown] = useState(false);
  const [showFilterFromLocationDropdown, setShowFilterFromLocationDropdown] = useState(false);
  const [showFilterToLocationDropdown, setShowFilterToLocationDropdown] = useState(false);
  const [showFilterMachineStatusDropdown, setShowFilterMachineStatusDropdown] = useState(false);
  const [showFilterProjectInchargeDropdown, setShowFilterProjectInchargeDropdown] = useState(false);
  const [showFilterMachineNumberDropdown, setShowFilterMachineNumberDropdown] = useState(false);
  const [filterItemNameSearchQuery, setFilterItemNameSearchQuery] = useState('');
  const [filterFromLocationSearchQuery, setFilterFromLocationSearchQuery] = useState('');
  const [filterToLocationSearchQuery, setFilterToLocationSearchQuery] = useState('');
  const [filterProjectInchargeSearchQuery, setFilterProjectInchargeSearchQuery] = useState('');
  const [filterMachineNumberSearchQuery, setFilterMachineNumberSearchQuery] = useState('');
  const expandedEntryIdRef = useRef(expandedEntryId);
  const cloneExpandedEntryIdRef = useRef(cloneExpandedEntryId);
  const historyCacheRef = useRef({});
  const logCacheRef = useRef(null);
  useEffect(() => {
    expandedEntryIdRef.current = expandedEntryId;
  }, [expandedEntryId]);
  useEffect(() => {
    cloneExpandedEntryIdRef.current = cloneExpandedEntryId;
  }, [cloneExpandedEntryId]);
  useEffect(() => {
    if (historyType !== 'entry' && cloneExpandedEntryIdRef.current) {
      setCloneExpandedEntryId(null);
    }
  }, [historyType]);
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const projectsRes = await fetch(`${PROJECT_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(p => {
            map[p.id] = p.siteName || p.site_name || p.projectName || p.project_name || '';
          });
          setProjectsMap(map);
        }
        const vendorsRes = await fetch(`${VENDOR_NAMES_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(v => {
            map[v.id] = v.vendorName || v.vendor_name || '';
          });
          setVendorsMap(map);
        }
        const employeesRes = await fetch(`${EMPLOYEE_DETAILS_BASE_URL}/site_engineers`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(e => {
            map[e.id] = e.employee_name || e.employeeName || '';
          });
          setEmployeesMap(map);
        }
        const itemNamesRes = await fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(i => {
            map[i.id] = i.item_name || i.itemName || '';
          });
          setItemNamesMap(map);
        }
        const brandsRes = await fetch(`${TOOLS_BRAND_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(b => {
            map[b.id] = b.tools_brand || b.toolsBrand || '';
          });
          setBrandsMap(map);
        }
        const itemIdsRes = await fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (itemIdsRes.ok) {
          const data = await itemIdsRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(i => {
            const toolsId = i.item_id || i.itemId || '';
            map[i.id] = toolsId;
            map[String(i.id)] = toolsId;
          });
          setItemIdsMap(map);
        }
        const machineNumbersRes = await fetch(`${TOOLS_MACHINE_NUMBER_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (machineNumbersRes.ok) {
          const data = await machineNumbersRes.json();
          const map = {};
          (Array.isArray(data) ? data : []).forEach(m => {
            const id = m?.id ?? m?._id;
            const machineNumber = (m?.machine_number ?? m?.machineNumber ?? '').trim();
            if (id != null && machineNumber) {
              map[String(id)] = machineNumber;
            }
          });
          setMachineNumbersMap(map);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchLookupData();
  }, []);

  // Prefetch image availability for current list (best-effort).
  useEffect(() => {
    if (!Array.isArray(historyData) || historyData.length === 0) return;

    const ids = Array.from(
      new Set(
        historyData
          .map((e) => e?.itemTableId)
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map((v) => String(v))
      )
    );

    const missing = ids.filter((id) => itemHasImagesByItemTableId[id] === undefined);
    if (missing.length === 0) return;

    let cancelled = false;
    const maxToCheck = 40; // keep it light for mobile
    const toCheck = missing.slice(0, maxToCheck);
    const concurrency = 5;

    const worker = async (queue) => {
      while (!cancelled) {
        const id = queue.shift();
        if (!id) return;
        try {
          const res = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/items/${id}/images`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          if (!res.ok) {
            if (!cancelled) {
              setItemHasImagesByItemTableId((prev) => ({ ...prev, [id]: false }));
            }
            continue;
          }
          const data = await res.json();
          const arr = Array.isArray(data) ? data : [];
          const hasAny = arr.some((img) => {
            const url = img?.tools_image_url ?? img?.toolsImageUrl;
            return Boolean(url);
          });
          if (!cancelled) {
            setItemHasImagesByItemTableId((prev) => ({ ...prev, [id]: hasAny }));
          }
        } catch {
          if (!cancelled) {
            setItemHasImagesByItemTableId((prev) => ({ ...prev, [id]: false }));
          }
        }
      }
    };

    const queue = [...toCheck];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => worker(queue));
    Promise.allSettled(workers).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [historyData, itemHasImagesByItemTableId]);
  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      const cachedTabData = historyCacheRef.current[historyType];
      if (cachedTabData) {
        setFullEntriesData(cachedTabData.fullEntriesData);
        setHistoryData(cachedTabData.historyData);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const buildFetchOptions = () => ({
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const responses = await Promise.all(
          getHistoryTabRequests(historyType, TOOLS_TRACKER_MANAGEMENT_BASE_URL).map((url) =>
            fetch(url, buildFetchOptions())
          )
        );

        if (responses.every((response) => response.ok)) {
          const dataSets = await Promise.all(responses.map((response) => response.json()));
          const allEntries = dataSets.flatMap((data) => (Array.isArray(data) ? data : []));
          const flattenedData = flattenToolsTrackerEntries(allEntries);
          const nextTabData = {
            fullEntriesData: allEntries,
            historyData: flattenedData
          };

          historyCacheRef.current[historyType] = nextTabData;

          if (!cancelled) {
            setFullEntriesData(allEntries);
            setHistoryData(flattenedData);
          }
        } else {
          console.error('Failed to fetch history data');
          if (!cachedTabData && !cancelled) {
            setFullEntriesData([]);
            setHistoryData([]);
          }
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        if (!cachedTabData && !cancelled) {
          setFullEntriesData([]);
          setHistoryData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [historyType]);

  // Fetch edited history and build separate events per edit (no merging)
  useEffect(() => {
    if (historyType !== 'log' || fullEntriesData.length === 0 || historyData.length === 0) return;
    const fetchEditedEntriesAndFields = async () => {
      const cachedLogEvents = logCacheRef.current;
      if (cachedLogEvents) {
        setLogEditEvents(cachedLogEvents);
        setLogLoading(false);
      } else {
        setLogLoading(true);
      }

      try {
        const entryIds = [...new Set((fullEntriesData || []).map(e => e.id).filter(Boolean))];
        const events = [];
        const g = (obj, k1, k2) => obj && (obj[k1] ?? obj[k2]);
        const getLocName = (id, checkVendors) => {
          if (!id) return '-';
          const s = String(id);
          if (checkVendors && (vendorsMap[s] || vendorsMap[id])) return vendorsMap[s] || vendorsMap[id];
          if (projectsMap[s] || projectsMap[id]) return projectsMap[s] || projectsMap[id];
          if (vendorsMap[s] || vendorsMap[id]) return vendorsMap[s] || vendorsMap[id];
          return '-';
        };
        const formatDateForTooltip = (oldDate) => {
          try {
            const d = oldDate ? new Date(oldDate) : null;
            if (d && !isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              const h = d.getHours();
              const m = d.getMinutes();
              const h12 = h % 12 || 12;
              const ampm = h < 12 ? 'AM' : 'PM';
              return `${day}/${month}/${year} • ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
            }
            return oldDate || '-';
          } catch {
            return oldDate || '-';
          }
        };
        await Promise.all(
          entryIds.map(async (managementId) => {
            try {
              const [mgmtRes, itemRes] = await Promise.all([
                fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/history/${managementId}`, {
                  method: 'GET',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/itemHistoryByManagement/${managementId}`, {
                  method: 'GET',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                })
              ]);
              const mgmtList = mgmtRes.ok ? (await mgmtRes.json()) : [];
              const itemList = itemRes.ok ? (await itemRes.json()) : [];
              const mgmtArr = Array.isArray(mgmtList) ? mgmtList : [];
              const itemArr = Array.isArray(itemList) ? itemList : [];
              const flattenedForMgmt = historyData.filter(e => String(e.entryId) === String(managementId));
              const reprFlattened = flattenedForMgmt[0];

              // Build a correct snapshot per edit event:
              // - Card shows NEW values for that edit moment (not today's latest state)
              // - Tooltip shows OLD values from the history row
              const entryFull = (fullEntriesData || []).find(e => String(e.id) === String(managementId));
              if (!entryFull) return;

              const fullEntryItems =
                entryFull.tools_tracker_item_name_table ||
                entryFull.toolsTrackerItemNameTable ||
                entryFull.toolsTrackerItemNameTables ||
                [];

              const normalize = (obj, a, b) => (obj && (obj[a] ?? obj[b])) ?? '';
              const currentState = {
                id: entryFull.id,
                eno: normalize(entryFull, 'eno', 'ENo') || '',
                toolsEntryType: normalize(entryFull, 'tools_entry_type', 'toolsEntryType') || '',
                fromProjectId: normalize(entryFull, 'from_project_id', 'fromProjectId') || '',
                toProjectId: normalize(entryFull, 'to_project_id', 'toProjectId') || '',
                serviceStoreId: normalize(entryFull, 'service_store_id', 'serviceStoreId') || '',
                projectInchargeId: normalize(entryFull, 'project_incharge_id', 'projectInchargeId') || '',
                date: normalize(entryFull, 'date', 'date') || '',
                createdDateTime: normalize(entryFull, 'created_date_time', 'createdDateTime') || '',
                createdBy: normalize(entryFull, 'created_by', 'createdBy') || '',
                itemsById: {}
              };

              (Array.isArray(fullEntryItems) ? fullEntryItems : []).forEach((it) => {
                const itemId = it?.id ?? it?.Id ?? null;
                if (!itemId) return;
                currentState.itemsById[String(itemId)] = {
                  id: itemId,
                  itemNameId: normalize(it, 'item_name_id', 'itemNameId') || '',
                  itemIdsId: normalize(it, 'item_ids_id', 'itemIdsId') || '',
                  brandId: normalize(it, 'brand_id', 'brandId') || '',
                  model: normalize(it, 'model', 'model') || '',
                  machineNumberId: normalize(it, 'machine_number_id', 'machineNumberId') || '',
                  machineNumber: normalize(it, 'machine_number', 'machineNumber') || '',
                  quantity: Number(normalize(it, 'quantity', 'quantity') || 0),
                  machineStatus: normalize(it, 'machine_status', 'machineStatus') || 'Working',
                  description: normalize(it, 'description', 'description') || '',
                  homeLocationId: normalize(it, 'home_location_id', 'homeLocationId') || ''
                };
              });

              const recordEditedDate = (rec) => g(rec, 'editedDate', 'edited_date') || '';
              const allRecords = [];
              mgmtArr.forEach((mgmtRec) => allRecords.push({ kind: 'mgmt', rec: mgmtRec, editedDate: recordEditedDate(mgmtRec) }));
              itemArr.forEach((itemRec) => {
                const itemTableId = g(itemRec, 'toolsTrackerItemNameTableId', 'tools_tracker_item_name_table_id');
                allRecords.push({ kind: 'item', rec: itemRec, itemTableId: itemTableId, editedDate: recordEditedDate(itemRec) });
              });

              allRecords.sort((a, b) => {
                const da = a.editedDate ? new Date(a.editedDate).getTime() : 0;
                const db = b.editedDate ? new Date(b.editedDate).getTime() : 0;
                return db - da;
              });

              const cloneState = (s) => ({
                ...s,
                itemsById: Object.fromEntries(Object.entries(s.itemsById || {}).map(([k, v]) => [k, { ...v }]))
              });

              let state = cloneState(currentState);

              allRecords.forEach((r) => {
                const snapshotAfter = cloneState(state); // this is the NEW state at the time right after this edit
                const itemIds = Object.keys(snapshotAfter.itemsById || {});
                const primaryItemId = itemIds[0] || null;
                const targetItemId = r.kind === 'item' ? (r.itemTableId != null ? String(r.itemTableId) : primaryItemId) : primaryItemId;
                const snapItem = targetItemId ? snapshotAfter.itemsById[targetItemId] : null;
                const snapEntry = {
                  id: `log-${managementId}-${targetItemId || '0'}-${String(r.editedDate || '')}`,
                  entryId: managementId,
                  itemTableId: snapItem ? snapItem.id : null,
                  eno: snapshotAfter.eno,
                  toolsEntryType: snapshotAfter.toolsEntryType,
                  fromProjectId: snapshotAfter.fromProjectId,
                  toProjectId: snapshotAfter.toProjectId,
                  homeLocationId: snapItem?.homeLocationId || '',
                  serviceStoreId: snapshotAfter.serviceStoreId,
                  projectInchargeId: snapshotAfter.projectInchargeId,
                  createdDateTime: snapshotAfter.createdDateTime,
                  createdBy: snapshotAfter.createdBy,
                  itemNameId: snapItem?.itemNameId || '',
                  brandId: snapItem?.brandId || '',
                  itemIdsId: snapItem?.itemIdsId || '',
                  machineNumber: snapItem?.machineNumber || '',
                  machineNumberId: snapItem?.machineNumberId || '',
                  machineStatus: snapItem?.machineStatus || 'Working',
                  quantity: snapItem?.quantity || 0,
                  description: snapItem?.description || ''
                };

                const changed = new Set();
                const oldVals = {};
                const newVals = {};
                const entryTypeLower = String(snapshotAfter.toolsEntryType || reprFlattened?.toolsEntryType || '').toLowerCase();

                if (r.kind === 'mgmt') {
                  const mgmtRec = r.rec;
                  const oldFrom = g(mgmtRec, 'oldFromProjectId', 'old_from_project_id');
                  const newFrom = g(mgmtRec, 'newFromProjectId', 'new_from_project_id');
                  const oldTo = g(mgmtRec, 'oldToProjectId', 'old_to_project_id');
                  const newTo = g(mgmtRec, 'newToProjectId', 'new_to_project_id');
                  const oldIncharge = g(mgmtRec, 'oldProjectInchargeId', 'old_project_incharge_id');
                  const newIncharge = g(mgmtRec, 'newProjectInchargeId', 'new_project_incharge_id');
                  const oldService = g(mgmtRec, 'oldServiceStoreId', 'old_service_store_id');
                  const newService = g(mgmtRec, 'newServiceStoreId', 'new_service_store_id');
                  const oldDate = g(mgmtRec, 'oldDate', 'old_date');
                  const newDate = g(mgmtRec, 'newDate', 'new_date');

                  if (oldFrom !== newFrom || oldService !== newService) {
                    changed.add('fromLocation');
                    oldVals.fromLocation = entryTypeLower === 'service_return' ? getLocName(oldService, true) : getLocName(oldFrom, false);
                    newVals.fromLocation = entryTypeLower === 'service_return'
                      ? getLocName(snapshotAfter.serviceStoreId, true)
                      : getLocName(snapshotAfter.fromProjectId, false);
                  }
                  if (oldTo !== newTo) {
                    changed.add('toLocation');
                    oldVals.toLocation = getLocName(oldTo, false);
                    newVals.toLocation = getLocName(snapshotAfter.toProjectId, false);
                  }
                  if (String(oldIncharge) !== String(newIncharge)) {
                    changed.add('incharge');
                    oldVals.incharge = employeesMap[String(oldIncharge)] || employeesMap[oldIncharge] || '-';
                    newVals.incharge = employeesMap[String(snapshotAfter.projectInchargeId)] || employeesMap[snapshotAfter.projectInchargeId] || '-';
                  }
                  if (oldDate !== newDate) {
                    changed.add('date');
                    oldVals.date = formatDateForTooltip(oldDate);
                    newVals.date = formatDateForTooltip(newDate);
                  }

                  if (changed.size > 0) {
                    const hId = g(mgmtRec, 'id', 'id');
                    events.push({
                      id: `mgmt-${managementId}-${hId}`,
                      type: 'management',
                      flattenedEntry: snapEntry,
                      editedFields: changed,
                      oldValues: oldVals,
                      newValues: newVals,
                      editedDate: r.editedDate
                    });
                  }

                  // Reverse apply: step state back to OLD values (so next iteration represents older edit's NEW state)
                  if (oldFrom != null) state.fromProjectId = oldFrom;
                  if (oldTo != null) state.toProjectId = oldTo;
                  if (oldService != null) state.serviceStoreId = oldService;
                  if (oldIncharge != null) state.projectInchargeId = oldIncharge;
                  if (oldDate != null) state.date = oldDate;
                } else {
                  const itemRec = r.rec;
                  const itemTableId = r.itemTableId != null ? String(r.itemTableId) : null;
                  if (!itemTableId) return;
                  if (!state.itemsById[itemTableId]) {
                    state.itemsById[itemTableId] = { id: r.itemTableId };
                  }
                  const oldItemNameId = g(itemRec, 'oldItemNameId', 'old_item_name_id');
                  const newItemNameId = g(itemRec, 'newItemNameId', 'new_item_name_id');
                  const oldItemIdsId = g(itemRec, 'oldItemIdsId', 'old_item_ids_id');
                  const newItemIdsId = g(itemRec, 'newItemIdsId', 'new_item_ids_id');
                  const oldMachineNumId = g(itemRec, 'oldMachineNumberId', 'old_machine_number_id');
                  const newMachineNumId = g(itemRec, 'newMachineNumberId', 'new_machine_number_id');
                  const oldQty = g(itemRec, 'oldQuantity', 'old_quantity');
                  const newQty = g(itemRec, 'newQuantity', 'new_quantity');
                  const oldHomeId = g(itemRec, 'oldHomeLocationId', 'old_home_location_id');
                  const newHomeId = g(itemRec, 'newHomeLocationId', 'new_home_location_id');

                  if (oldItemNameId !== newItemNameId) {
                    changed.add('itemName');
                    oldVals.itemName = itemNamesMap[String(oldItemNameId)] || itemNamesMap[oldItemNameId] || '-';
                    newVals.itemName = itemNamesMap[String(snapshotAfter.itemsById[itemTableId]?.itemNameId)] || itemNamesMap[snapshotAfter.itemsById[itemTableId]?.itemNameId] || '-';
                  }
                  if (oldItemIdsId !== newItemIdsId) {
                    changed.add('itemId');
                    oldVals.itemId = itemIdsMap[String(oldItemIdsId)] || itemIdsMap[oldItemIdsId] || '-';
                    newVals.itemId = itemIdsMap[String(snapshotAfter.itemsById[itemTableId]?.itemIdsId)] || itemIdsMap[snapshotAfter.itemsById[itemTableId]?.itemIdsId] || '-';
                  }
                  if (String(oldMachineNumId) !== String(newMachineNumId)) {
                    changed.add('machineNumber');
                    oldVals.machineNumber = machineNumbersMap[String(oldMachineNumId)] || machineNumbersMap[oldMachineNumId] || '-';
                    newVals.machineNumber = machineNumbersMap[String(snapshotAfter.itemsById[itemTableId]?.machineNumberId)] || machineNumbersMap[snapshotAfter.itemsById[itemTableId]?.machineNumberId] || '-';
                  }
                  if (Number(oldQty) !== Number(newQty)) {
                    changed.add('quantity');
                    oldVals.quantity = String(oldQty ?? '-');
                    newVals.quantity = String(snapshotAfter.itemsById[itemTableId]?.quantity ?? '-');
                  }
                  if (oldHomeId !== newHomeId) {
                    changed.add('toLocation');
                    oldVals.toLocation = getLocName(oldHomeId, false);
                    newVals.toLocation = getLocName(snapshotAfter.itemsById[itemTableId]?.homeLocationId, false);
                  }

                  if (changed.size > 0) {
                    const hId = g(itemRec, 'id', 'id');
                    events.push({
                      id: `item-${managementId}-${itemTableId}-${hId}`,
                      type: 'item',
                      flattenedEntry: snapEntry,
                      editedFields: changed,
                      oldValues: oldVals,
                      newValues: newVals,
                      editedDate: r.editedDate
                    });
                  }

                  // Reverse apply item fields
                  if (oldItemNameId != null) state.itemsById[itemTableId].itemNameId = oldItemNameId;
                  if (oldItemIdsId != null) state.itemsById[itemTableId].itemIdsId = oldItemIdsId;
                  if (oldMachineNumId != null) state.itemsById[itemTableId].machineNumberId = oldMachineNumId;
                  if (oldQty != null) state.itemsById[itemTableId].quantity = Number(oldQty);
                  if (oldHomeId != null) state.itemsById[itemTableId].homeLocationId = oldHomeId;
                }
              });
            } catch {
              // ignore per-entry failures
            }
          })
        );
        events.sort((a, b) => {
          const da = a.editedDate ? new Date(a.editedDate).getTime() : 0;
          const db = b.editedDate ? new Date(b.editedDate).getTime() : 0;
          return db - da;
        });
        logCacheRef.current = events;
        setLogEditEvents(events);
      } catch (err) {
        console.error('Error fetching edited entries:', err);
        if (!cachedLogEvents) {
          setLogEditEvents([]);
        }
      } finally {
        setLogLoading(false);
      }
    };
    fetchEditedEntriesAndFields();
  }, [historyType, fullEntriesData, historyData, projectsMap, vendorsMap, employeesMap, itemNamesMap, itemIdsMap, machineNumbersMap]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '', time: '', dateTime: '' };
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return { date: '', time: '', dateTime: '' };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const h = d.getHours();
      const m = d.getMinutes();
      const h12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const formattedTime = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      const dateTime = `${formattedDate} • ${formattedTime}`;
      return { date: formattedDate, time: formattedTime, dateTime };
    } catch {
      return { date: '', time: '', dateTime: '' };
    }
  };

  const formatRelativeDateLabel = (input) => {
    if (!input) return '';
    try {
      const asString = String(input).trim();
      let d = new Date(asString);

      // Force-parse numeric dates with / or - separators.
      // Backend is sending MM/DD/YYYY (or MM-DD-YYYY). We always DISPLAY as DD/MM/YYYY.
      // If the first part is > 12, treat as DD/MM/YYYY; otherwise treat as MM/DD/YYYY.
      const parts = asString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (parts) {
        const a = parseInt(parts[1], 10);
        const b = parseInt(parts[2], 10);
        const year = parseInt(parts[3], 10);
        const isLikelyDMY = a > 12; // 13/04/2026 -> DMY
        const day = isLikelyDMY ? a : b;
        const month = (isLikelyDMY ? b : a) - 1;
        const forced = new Date(year, month, day);
        if (!isNaN(forced.getTime())) {
          d = forced;
        }
      }

      if (isNaN(d.getTime())) return asString;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (dateOnly.getTime() === today.getTime()) return 'Today';
      if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(input);
    }
  };

  const formatBackendDateOrRelative = (backendDate) => {
    if (!backendDate) return '';
    const label = formatRelativeDateLabel(backendDate);
    if (label === 'Today' || label === 'Yesterday') return label;
    return String(backendDate);
  };
  const resolveMachineNumberText = (entry) => {
    if (entry.machineNumber && String(entry.machineNumber).trim()) {
      return String(entry.machineNumber).trim();
    }
    const id = entry.machineNumberId;
    if (id) {
      const text = machineNumbersMap[String(id)] || machineNumbersMap[id];
      if (text) return text;
    }
    return '';
  };
  const getLocationName = (id, checkVendorsFirst = false) => {
    if (!id) return '-';
    const idStr = String(id);
    if (checkVendorsFirst) {
      if (vendorsMap[idStr]) {
        return vendorsMap[idStr];
      }
      if (vendorsMap[id]) {
        return vendorsMap[id];
      }
    }
    if (projectsMap[idStr]) {
      return projectsMap[idStr];
    }
    if (projectsMap[id]) {
      return projectsMap[id];
    }
    if (vendorsMap[idStr]) {
      return vendorsMap[idStr];
    }
    if (vendorsMap[id]) {
      return vendorsMap[id];
    }
    return '-';
  };
  const handleOpenImageViewer = async (entry, itemName, displayValue) => {
    const itemTableId = entry.itemTableId;
    if (!itemTableId) {
      alert('No images available for this item');
      return;
    }
    setImageViewerData({
      images: [],
      currentIndex: 0,
      itemName: itemName,
      itemId: displayValue,
      machineStatus: entry.machineStatus || ''
    });
    setShowImageViewer(true);
    setImagesLoading(true);
    try {
      const res = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/items/${itemTableId}/images`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        setImageViewerData(prev => ({ ...prev, images: [] }));
        setImagesLoading(false);
        return;
      }
      const rawImages = await res.json();
      const arr = Array.isArray(rawImages) ? rawImages : [];
      const processedImages = arr
        .map((img) => img?.tools_image_url ?? img?.toolsImageUrl ?? null)
        .filter(Boolean);
      setImageViewerData(prev => ({
        ...prev,
        images: processedImages,
        currentIndex: 0
      }));
      if (processedImages.length === 0) {
        alert('No images available for this item');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      alert('Failed to load images');
      setImageViewerData(prev => ({ ...prev, images: [] }));
    } finally {
      setImagesLoading(false);
    }
  };
  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
  };
  // Handle edit (for update)
  const handleEdit = async (entry) => {
    if (!canEdit) {
      alert("You don't have permission to edit.");
      return;
    }
    try {
      // Get the entry ID
      const entryId = entry.entryId || entry.id;
      if (!entryId) {
        console.error('Entry ID not found');
        return;
      }

      // Try to fetch the full entry data from the backend
      try {
        const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/get/${entryId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const editData = await response.json();
          // Mark as edit mode (update, not create)
          editData.isEditMode = true;
          // Mark as from History (for showing appropriate UI in Transfer page)
          editData.fromHistory = true;

          // Store entry ID in localStorage for Transfer page compatibility
          localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
          localStorage.removeItem('toolsTrackerCloneMode');
          // Store full entry data in localStorage (for potential future use)
          localStorage.setItem('editingToolsTrackerEntry', JSON.stringify(editData));
          // Dispatch custom event for Transfer component to listen
          window.dispatchEvent(new CustomEvent('editToolsTrackerEntry', { detail: editData }));
        } else {
          // If fetch fails, still store the ID and navigate
          localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
          localStorage.removeItem('toolsTrackerCloneMode');
        }
      } catch (fetchError) {
        console.error('Error fetching entry details:', fetchError);
        // Continue with ID-only approach if fetch fails
        localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
        localStorage.removeItem('toolsTrackerCloneMode');
      }

      // Navigate to transfer tab for editing
      if (onTabChange) {
        onTabChange('transfer');
      }
      setExpandedEntryId(null);
      setCloneExpandedEntryId(null);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      // Fallback: still try to navigate even if there's an error
      const entryId = entry.entryId || entry.id;
      if (entryId) {
        localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
        localStorage.removeItem('toolsTrackerCloneMode');
        if (onTabChange) {
          onTabChange('transfer');
        }
      }
      setExpandedEntryId(null);
      setCloneExpandedEntryId(null);
    }
  };
  // Handle clone (for create new)
  const handleClone = async (entry) => {
    try {
      const entryId = entry.entryId || entry.id;
      if (!entryId) {
        console.error('Entry ID not found for clone');
        return;
      }

      let cloneData = null;
      try {
        const response = await fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/get/${entryId}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          cloneData = await response.json();
        }
      } catch (fetchError) {
        console.error('Error fetching entry details for clone:', fetchError);
      }

      if (!cloneData) {
        cloneData = fullEntriesData.find((item) => String(item.id) === String(entryId)) || null;
      }
      if (!cloneData) {
        console.error('No clone data found');
        return;
      }

      const normalizedCloneData = { ...cloneData };
      delete normalizedCloneData.id;
      delete normalizedCloneData.eno;
      normalizedCloneData.isEditMode = false;
      normalizedCloneData.fromHistory = true;

      const entryItems = normalizedCloneData.tools_tracker_item_name_table || normalizedCloneData.toolsTrackerItemNameTable || [];
      const clonedItems = (Array.isArray(entryItems) ? entryItems : []).map((item) => {
        const clonedItem = { ...item };
        delete clonedItem.id;
        return clonedItem;
      });

      normalizedCloneData.tools_tracker_item_name_table = clonedItems;
      normalizedCloneData.toolsTrackerItemNameTable = clonedItems;

      localStorage.setItem('editingToolsTrackerEntryId', String(entryId));
      localStorage.setItem('toolsTrackerCloneMode', 'true');
      localStorage.setItem('toolsTrackerCloneItemIdsId', entry.itemIdsId ? String(entry.itemIdsId) : '');
      localStorage.setItem('toolsTrackerCloneBrandId', entry.brandId ? String(entry.brandId) : '');
      localStorage.setItem('toolsTrackerCloneMachineNumber', entry.machineNumber ? String(entry.machineNumber) : '');
      window.dispatchEvent(new CustomEvent('editToolsTrackerEntry', { detail: normalizedCloneData }));

      if (onTabChange) {
        onTabChange('transfer');
      }
      setExpandedEntryId(null);
      setCloneExpandedEntryId(null);
    } catch (error) {
      console.error('Error in handleClone:', error);
      setCloneExpandedEntryId(null);
    }
  };
  const handlePrevImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };
  const handleNextImage = () => {
    setImageViewerData(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1
    }));
  };
  const minSwipeDistance = 50;
  const handleTouchStart = (e, entryId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    const wasCloneExpanded = cloneExpandedEntryIdRef.current === entryId;
    setSwipeStates(prev => ({
      ...prev,
      [entryId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false,
        wasCloneExpanded: wasCloneExpanded
      }
    }));
  };
  const handleTouchMove = (e, entryId) => {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => {
      const state = prev[entryId];
      if (!state) return prev;
      const deltaX = touch.clientX - state.startX;
      const isExpanded = expandedEntryIdRef.current === entryId;
      const isCloneExpanded = cloneExpandedEntryIdRef.current === entryId;
      const canRevealClone = historyType === 'entry';
      if (deltaX < 0 || (canRevealClone && deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
        return {
          ...prev,
          [entryId]: {
            ...state,
            currentX: touch.clientX,
            isSwiping: true
          }
        };
      }
      return prev;
    });
  };
  const handleTouchEnd = (entryId) => {
    setSwipeStates(prev => {
      const state = prev[entryId];
      if (!state) return prev;
      const deltaX = state.currentX - state.startX;
      const absDeltaX = Math.abs(deltaX);
      const wasCloneExpanded = state.wasCloneExpanded || false;
      if (absDeltaX >= minSwipeDistance) {
        if (deltaX < 0) {
          if (wasCloneExpanded) {
            setCloneExpandedEntryId(null);
          } else {
            setExpandedEntryId(entryId);
            setCloneExpandedEntryId(null);
          }
        } else {
          if (historyType === 'entry') {
            if (expandedEntryIdRef.current === entryId) {
              setExpandedEntryId(null);
            } else {
              setCloneExpandedEntryId(entryId);
            }
          } else {
            setExpandedEntryId(null);
          }
        }
      } else {
        if (expandedEntryIdRef.current === entryId) {
          setExpandedEntryId(null);
        }
      }
      const newState = { ...prev };
      delete newState[entryId];
      return newState;
    });
  };
  const handleMouseDown = (e, entryId) => {
    if (e.button !== 0) return;
    const syntheticEvent = {
      touches: [{ clientX: e.clientX }],
      preventDefault: () => e.preventDefault()
    };
    handleTouchStart(syntheticEvent, entryId);
  };
  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      return;
    }
    if (expandedEntryId) {
      setExpandedEntryId(null);
    }
    if (cloneExpandedEntryId) {
      setCloneExpandedEntryId(null);
    }
  };
  useEffect(() => {
    if (historyData.length === 0) return;
    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        historyData.forEach(entry => {
          const state = prev[entry.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedEntryIdRef.current === entry.id;
          const isCloneExpanded = cloneExpandedEntryIdRef.current === entry.id;
          const canRevealClone = historyType === 'entry';
          if (deltaX < 0 || (canRevealClone && deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
            newState[entry.id] = {
              ...state,
              currentX: e.clientX,
              isSwiping: true
            };
            hasChanges = true;
          }
        });
        return hasChanges ? newState : prev;
      });
    };
    const globalMouseUpHandler = () => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        historyData.forEach(entry => {
          const state = prev[entry.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const wasCloneExpanded = state.wasCloneExpanded || false;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              if (wasCloneExpanded) {
                setCloneExpandedEntryId(null);
              } else {
                setExpandedEntryId(entry.id);
                setCloneExpandedEntryId(null);
              }
            } else {
              if (historyType === 'entry') {
                if (expandedEntryIdRef.current === entry.id) {
                  setExpandedEntryId(null);
                } else {
                  setCloneExpandedEntryId(entry.id);
                }
              } else {
                setExpandedEntryId(null);
              }
            }
          } else {
            if (expandedEntryIdRef.current === entry.id) {
              setExpandedEntryId(null);
            }
          }
          delete newState[entry.id];
          hasChanges = true;
        });
        return hasChanges ? newState : prev;
      });
    };
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    return () => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [historyData, historyType]);

  // Get Item ID options for filter
  const filterItemIdOptions = Array.from(new Set(Object.values(itemIdsMap))).filter(Boolean).sort();

  // Get filter options from all entries
  const getAllItemNames = () => {
    const names = new Set();
    historyData.forEach(entry => {
      const name = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || '';
      if (name) names.add(name);
    });
    return Array.from(names).sort();
  };

  const getAllFromLocations = () => {
    const locations = new Set();
    historyData.forEach(entry => {
      const entryType = String(entry.toolsEntryType || '').toLowerCase();
      let location = '';
      if (entryType === 'service_return') {
        location = vendorsMap[entry.serviceStoreId] || vendorsMap[String(entry.serviceStoreId)] || '';
      } else {
        location = projectsMap[entry.fromProjectId] || projectsMap[String(entry.fromProjectId)] || '';
      }
      if (location) locations.add(location);
    });
    return Array.from(locations).sort();
  };

  const getAllToLocations = () => {
    const locations = new Set();
    historyData.forEach(entry => {
      const entryType = String(entry.toolsEntryType || '').toLowerCase();
      let location = '';
      if (entryType === 'entry') {
        location = projectsMap[entry.toProjectId] || projectsMap[String(entry.toProjectId)] || '';
        if (!location) location = vendorsMap[entry.serviceStoreId] || vendorsMap[String(entry.serviceStoreId)] || '';
      } else if (entryType === 'relocate' || entryType === 'relocation') {
        location = projectsMap[entry.homeLocationId] || projectsMap[String(entry.homeLocationId)] || '';
        if (!location) location = projectsMap[entry.toProjectId] || projectsMap[String(entry.toProjectId)] || '';
      } else if (entryType === 'service_return') {
        location = projectsMap[entry.toProjectId] || projectsMap[String(entry.toProjectId)] || '';
        if (!location) location = projectsMap[entry.fromProjectId] || projectsMap[String(entry.fromProjectId)] || '';
      }
      if (location) locations.add(location);
    });
    return Array.from(locations).sort();
  };

  const getAllMachineStatuses = () => ['Working', 'Not Working', 'Under Repair'];

  const getAllProjectIncharges = () => {
    const incharges = new Set();
    historyData.forEach(entry => {
      const incharge = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '';
      if (incharge) incharges.add(incharge);
    });
    return Array.from(incharges).sort();
  };

  const getAllMachineNumbers = () => {
    const numbers = new Set();
    historyData.forEach(entry => {
      const machineNum = resolveMachineNumberText(entry);
      if (machineNum) numbers.add(machineNum);
    });
    return Array.from(numbers).sort();
  };

  // Filter functions
  const normalizeSearchText = (text) => {
    if (!text) return '';
    return String(text).toLowerCase().trim();
  };

  const getFilteredItemNames = () => {
    const options = getAllItemNames();
    if (!filterItemNameSearchQuery.trim()) return options;
    const query = normalizeSearchText(filterItemNameSearchQuery);
    return options.filter(name => normalizeSearchText(name).includes(query));
  };

  const getFilteredFromLocations = () => {
    const options = getAllFromLocations();
    if (!filterFromLocationSearchQuery.trim()) return options;
    const query = normalizeSearchText(filterFromLocationSearchQuery);
    return options.filter(loc => normalizeSearchText(loc).includes(query));
  };

  const getFilteredToLocations = () => {
    const options = getAllToLocations();
    if (!filterToLocationSearchQuery.trim()) return options;
    const query = normalizeSearchText(filterToLocationSearchQuery);
    return options.filter(loc => normalizeSearchText(loc).includes(query));
  };

  const getFilteredProjectIncharges = () => {
    const options = getAllProjectIncharges();
    if (!filterProjectInchargeSearchQuery.trim()) return options;
    const query = normalizeSearchText(filterProjectInchargeSearchQuery);
    return options.filter(incharge => normalizeSearchText(incharge).includes(query));
  };

  const getFilteredMachineNumbers = () => {
    const options = getAllMachineNumbers();
    if (!filterMachineNumberSearchQuery.trim()) return options;
    const query = normalizeSearchText(filterMachineNumberSearchQuery);
    return options.filter(num => normalizeSearchText(num).includes(query));
  };

  const filteredHistoryData = historyType === 'log'
    ? logEditEvents.filter(ev => {
      const e = ev.flattenedEntry;
      // Filter by Item ID
      if (filterItemId) {
        const entryItemId = e?.itemIdsId ? (itemIdsMap[e.itemIdsId] || itemIdsMap[String(e.itemIdsId)] || '') : '';
        if (entryItemId !== filterItemId) return false;
      }
      // Filter by Item Name
      if (filterItemName) {
        const entryItemName = itemNamesMap[e?.itemNameId] || itemNamesMap[String(e?.itemNameId)] || '';
        if (entryItemName !== filterItemName) return false;
      }
      // Filter by From Location
      if (filterFromLocation) {
        const entryType = String(e?.toolsEntryType || '').toLowerCase();
        let entryFromLocation = '';
        if (entryType === 'service_return') {
          entryFromLocation = vendorsMap[e?.serviceStoreId] || vendorsMap[String(e?.serviceStoreId)] || '';
        } else {
          entryFromLocation = projectsMap[e?.fromProjectId] || projectsMap[String(e?.fromProjectId)] || '';
        }
        if (entryFromLocation !== filterFromLocation) return false;
      }
      // Filter by To Location
      if (filterToLocation) {
        const entryType = String(e?.toolsEntryType || '').toLowerCase();
        let entryToLocation = '';
        if (entryType === 'entry') {
          entryToLocation = projectsMap[e?.toProjectId] || projectsMap[String(e?.toProjectId)] || '';
          if (!entryToLocation) entryToLocation = vendorsMap[e?.serviceStoreId] || vendorsMap[String(e?.serviceStoreId)] || '';
        } else if (entryType === 'relocate' || entryType === 'relocation') {
          entryToLocation = projectsMap[e?.homeLocationId] || projectsMap[String(e?.homeLocationId)] || '';
          if (!entryToLocation) entryToLocation = projectsMap[e?.toProjectId] || projectsMap[String(e?.toProjectId)] || '';
        } else if (entryType === 'service_return') {
          entryToLocation = projectsMap[e?.toProjectId] || projectsMap[String(e?.toProjectId)] || '';
          if (!entryToLocation) entryToLocation = projectsMap[e?.fromProjectId] || projectsMap[String(e?.fromProjectId)] || '';
        }
        if (entryToLocation !== filterToLocation) return false;
      }
      // Filter by Machine Status
      if (filterMachineStatus) {
        const entryMachineStatus = e?.machineStatus || 'Working';
        if (entryMachineStatus !== filterMachineStatus) return false;
      }
      // Filter by Project Incharge
      if (filterProjectIncharge) {
        const entryIncharge = employeesMap[e?.projectInchargeId] || employeesMap[String(e?.projectInchargeId)] || '';
        if (entryIncharge !== filterProjectIncharge) return false;
      }
      // Filter by Machine Number
      if (filterMachineNumber) {
        const entryMachineNumber = resolveMachineNumberText(e);
        if (entryMachineNumber !== filterMachineNumber) return false;
      }
      return true;
    })
    : historyData.filter(entry => {
      const entryType = entry.toolsEntryType || 'Entry';
      let typeMatch = false;
      if (historyType === 'entry') {
        typeMatch = entryType.toLowerCase() === 'entry';
      } else if (historyType === 'service') {
        typeMatch = ['service', 'service_return'].includes(entryType.toLowerCase());
      } else {
        typeMatch = entryType.toLowerCase() === 'relocate';
      }
      if (!typeMatch) return false;

      // Filter by Item ID
      if (filterItemId) {
        const entryItemId = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
        if (entryItemId !== filterItemId) return false;
      }
      // Filter by Item Name
      if (filterItemName) {
        const entryItemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || '';
        if (entryItemName !== filterItemName) return false;
      }
      // Filter by From Location
      if (filterFromLocation) {
        const entryTypeLower = String(entry.toolsEntryType || '').toLowerCase();
        let entryFromLocation = '';
        if (entryTypeLower === 'service_return') {
          entryFromLocation = vendorsMap[entry.serviceStoreId] || vendorsMap[String(entry.serviceStoreId)] || '';
        } else {
          entryFromLocation = projectsMap[entry.fromProjectId] || projectsMap[String(entry.fromProjectId)] || '';
        }
        if (entryFromLocation !== filterFromLocation) return false;
      }
      // Filter by To Location
      if (filterToLocation) {
        const entryTypeLower = String(entry.toolsEntryType || '').toLowerCase();
        let entryToLocation = '';
        if (entryTypeLower === 'entry') {
          entryToLocation = projectsMap[entry.toProjectId] || projectsMap[String(entry.toProjectId)] || '';
          if (!entryToLocation) entryToLocation = vendorsMap[entry.serviceStoreId] || vendorsMap[String(entry.serviceStoreId)] || '';
        } else if (entryTypeLower === 'relocate' || entryTypeLower === 'relocation') {
          entryToLocation = projectsMap[entry.homeLocationId] || projectsMap[String(entry.homeLocationId)] || '';
          if (!entryToLocation) entryToLocation = projectsMap[entry.toProjectId] || projectsMap[String(entry.toProjectId)] || '';
        } else if (entryTypeLower === 'service_return') {
          entryToLocation = projectsMap[entry.toProjectId] || projectsMap[String(entry.toProjectId)] || '';
          if (!entryToLocation) entryToLocation = projectsMap[entry.fromProjectId] || projectsMap[String(entry.fromProjectId)] || '';
        }
        if (entryToLocation !== filterToLocation) return false;
      }
      // Filter by Machine Status
      if (filterMachineStatus) {
        const entryMachineStatus = entry.machineStatus || 'Working';
        if (entryMachineStatus !== filterMachineStatus) return false;
      }
      // Filter by Project Incharge
      if (filterProjectIncharge) {
        const entryIncharge = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '';
        if (entryIncharge !== filterProjectIncharge) return false;
      }
      // Filter by Machine Number
      if (filterMachineNumber) {
        const entryMachineNumber = resolveMachineNumberText(entry);
        if (entryMachineNumber !== filterMachineNumber) return false;
      }
      return true;
    });

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="sticky top-0 bg-white z-10 flex-shrink-0">
        <div className="flex items-center justify-between pb-[8px] border-b border-[#E0E0E0]">
          <p className="text-[12px] text-black font-semibold">Category</p>
          <div className="flex items-center gap-[4px] flex-shrink-0">
            <button
              type="button" onClick={() => setShowFilterItemIdModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-right"
            >
              {filterItemId ? filterItemId : 'Item ID'}
            </button>
            {filterItemId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterItemId('');
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex w-full bg-[#F2F4F7] items-center h-[32px] rounded-md mt-[8px]">
          <button
            onClick={() => setHistoryType('entry')}
            className={`flex-1 ml-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal transition-colors ${historyType === 'entry'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#9E9E9E]'
              }`}
            style={{ minWidth: 0 }}
          >
            Entry
          </button>
          <button
            onClick={() => setHistoryType('service')}
            className={`flex-1 ml-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal transition-colors ${historyType === 'service'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#9E9E9E]'
              }`}
            style={{ minWidth: 0 }}
          >
            Service
          </button>
          <button
            onClick={() => setHistoryType('relocate')}
            className={`flex-1 ml-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal transition-colors ${historyType === 'relocate'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#9E9E9E]'
              }`}
            style={{ minWidth: 0 }}
          >
            Relocate
          </button>
          <button
            onClick={() => setHistoryType('log')}
            className={`flex-1 mr-0.5 h-[28px] rounded text-[12px] font-semibold leading-normal transition-colors ${historyType === 'log'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#9E9E9E]'
              }`}
            style={{ minWidth: 0 }}
          >
            Log
          </button>
        </div>
      </div>
      {/* Filter and Download Row */}
      <div className="flex justify-between items-center gap-[4px] px-0 mt-[6px] flex-shrink-0">
        <div className="flex items-center gap-[4px] min-w-0">
          <button onClick={() => setShowFilterBottomSheet(true)} className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
            <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
            {!(filterItemName || filterFromLocation || filterToLocation || filterMachineStatus || filterProjectIncharge || filterMachineNumber) && (
              <span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
            )}
          </button>
          {/* Active Filter Tags - Next to Filter button */}
          <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {(filterItemName || filterFromLocation || filterToLocation || filterMachineStatus || filterProjectIncharge || filterMachineNumber) && (
              <div className="flex items-center gap-[4px] flex-nowrap">
                {filterItemName && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Item Name</span>
                    <button
                      onClick={() => setFilterItemName('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterFromLocation && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">From</span>
                    <button
                      onClick={() => setFilterFromLocation('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterToLocation && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">To</span>
                    <button
                      onClick={() => setFilterToLocation('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterMachineStatus && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Status</span>
                    <button
                      onClick={() => setFilterMachineStatus('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterProjectIncharge && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Incharge</span>
                    <button
                      onClick={() => setFilterProjectIncharge('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {filterMachineNumber && (
                  <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                    <span className="text-[11px] font-medium text-black">Machine</span>
                    <button
                      onClick={() => setFilterMachineNumber('')}
                      className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pb-4">
        {(loading || (historyType === 'log' && logLoading)) ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : filteredHistoryData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">
              {historyType === 'log' ? 'No edited entries found.' : 'No history entries found.'}
            </p>
          </div>
        ) : (
          <div className="mt-[6px]">
            {filteredHistoryData.map((rawEntry) => {
              const entry = historyType === 'log' ? rawEntry.flattenedEntry : rawEntry;
              const editedFields = historyType === 'log' ? (rawEntry.editedFields || new Set()) : new Set();
              const oldVals = historyType === 'log' ? (rawEntry.oldValues || {}) : {};
              const newVals = historyType === 'log' ? (rawEntry.newValues || {}) : {};
              const createdDateTime = historyType === 'log' ? rawEntry.editedDate : rawEntry.createdDateTime;
              const entryKey = historyType === 'log' ? rawEntry.id : entry.id;
              const { date, time, dateTime } = formatDateTime(createdDateTime);
              const entryType = String(entry.toolsEntryType || '').toLowerCase();
              let fromLocation = getLocationName(entry.fromProjectId, false);
              let toLocation = '-';
              if (entryType === 'entry') {
                toLocation = getLocationName(entry.toProjectId, false);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.serviceStoreId, true);
                }
              } else if (entryType === 'relocate' || entryType === 'relocation') {
                toLocation = getLocationName(entry.homeLocationId, false);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.toProjectId, false);
                }
              } else if (entryType === 'service_return') {
                fromLocation = getLocationName(entry.serviceStoreId, true);
                toLocation = getLocationName(entry.toProjectId, false);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.fromProjectId, false);
                }
              } else {
                toLocation = getLocationName(entry.serviceStoreId, true);
                if (toLocation === '-') {
                  toLocation = getLocationName(entry.toProjectId, false);
                }
              }
              let inchargeName = employeesMap[entry.projectInchargeId] || employeesMap[String(entry.projectInchargeId)] || '-';
              let itemName = itemNamesMap[entry.itemNameId] || itemNamesMap[String(entry.itemNameId)] || entry.itemNameId || '-';
              const itemIdName = entry.itemIdsId ? (itemIdsMap[entry.itemIdsId] || itemIdsMap[String(entry.itemIdsId)] || '') : '';
              const itemTableIdStr = entry.itemTableId != null ? String(entry.itemTableId) : '';
              const canViewImages = Boolean(itemTableIdStr) && itemHasImagesByItemTableId[itemTableIdStr] === true;
              let displayValue = itemIdName || (entry.quantity > 0 ? String(entry.quantity) : '');
              let machineNumberText = resolveMachineNumberText(entry);
              // Get entry date from original entry
              const originalEntry = fullEntriesData.find(e => String(e.id) === String(entry.entryId));
              const entryDate = originalEntry?.date || '';
              // Show Today/Yesterday for current/previous date; otherwise show backend date string as-is.
              const formattedDate = formatBackendDateOrRelative(entryDate);
              const formattedCreatedDateTime = createdDateTime ? dateTime : '';
              let dateTimeDisplay = dateTime || `${date} • ${time}`;
              if (historyType === 'log') {
                // In Log tab, show NEW values (after edit) on the card
                if (editedFields.has('fromLocation')) fromLocation = newVals.fromLocation ?? fromLocation;
                if (editedFields.has('toLocation')) toLocation = newVals.toLocation ?? toLocation;
                if (editedFields.has('incharge')) inchargeName = newVals.incharge ?? inchargeName;
                if (editedFields.has('itemName')) itemName = newVals.itemName ?? itemName;
                if (editedFields.has('itemId')) displayValue = newVals.itemId ?? displayValue;
                if (editedFields.has('quantity')) displayValue = newVals.quantity ?? displayValue;
                if (editedFields.has('machineNumber')) machineNumberText = newVals.machineNumber ?? machineNumberText;
                if (editedFields.has('date')) dateTimeDisplay = newVals.date ?? dateTimeDisplay;
              }
              const entryId = entryKey;
              const swipeState = swipeStates[entryId];
              const isExpanded = expandedEntryId === entryId;
              const isCloneExpanded = cloneExpandedEntryId === entryId;
              const canShowClone = historyType === 'entry';
              const isLogCard = historyType === 'log';
              const tooltip = (key) => {
                if (historyType === 'log') {
                  // In Log tab, tooltip should show OLD value (before edit)
                  const v = oldVals[key];
                  return v != null && v !== '' && v !== '-' ? `Previous: ${v}` : null;
                }
                const v = oldVals[key];
                return v != null && v !== '' && v !== '-' ? `Previous: ${v}` : null;
              };
              const buttonWidth = 96;
              const cloneButtonWidth = canShowClone ? 48 : 0;
              let swipeOffset = 0;
              if (swipeState && swipeState.isSwiping) {
                const deltaX = swipeState.currentX - swipeState.startX;
                if (deltaX < 0) {
                  swipeOffset = Math.max(-buttonWidth, deltaX);
                } else if (canShowClone) {
                  swipeOffset = Math.min(cloneButtonWidth, deltaX);
                } else {
                  swipeOffset = 0;
                }
              } else if (isExpanded) {
                swipeOffset = -buttonWidth;
              } else if (isCloneExpanded && canShowClone) {
                swipeOffset = cloneButtonWidth;
              } else {
                swipeOffset = 0;
              }
              return (
                <div
                  key={entryKey}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px]"
                >
                  {canShowClone && (
                    <div
                      className="absolute left-0 top-0 flex gap-2 flex-shrink-0 z-0"
                      style={{
                        opacity: isCloneExpanded || (swipeState && swipeState.isSwiping && swipeOffset > 20) ? 1 : 0,
                        transition: 'opacity 0.2s ease-out',
                        pointerEvents: isCloneExpanded ? 'auto' : 'none'
                      }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleClone(entry); }}
                        className="action-button w-[48px] h-[95px] bg-[#BF9853] rounded-[6px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Clone"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6.75V3.75C12 3.33579 11.6642 3 11.25 3H3.75C3.33579 3 3 3.33579 3 3.75V11.25C3 11.6642 3.33579 12 3.75 12H6.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 6.75H7.5C6.67157 6.75 6 7.42157 6 8.25V14.25C6 15.0784 6.67157 15.75 7.5 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V8.25C15.75 7.42157 15.0784 6.75 14.25 6.75H15Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div
                    className="rounded-[8px] h-full px-3 py-[10px] cursor-pointer transition-all duration-300 ease-out select-none bg-white"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, entryId)}
                    onTouchMove={(e) => handleTouchMove(e, entryId)}
                    onTouchEnd={() => handleTouchEnd(entryId)}
                    onMouseDown={(e) => handleMouseDown(e, entryId)}
                    onClick={handleCardClick}
                  >
                    <div className="flex items-start justify-between mb-[2px]">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <p className={`text-[12px] font-semibold leading-snug truncate ${editedFields.has('itemName') ? 'text-[#2563eb] font-bold' : 'text-black'}`}
                          title={editedFields.has('itemName') ? tooltip('itemName') : undefined}
                        >
                          #{entry.eno}, {itemName}
                        </p>
                        {isLogCard && editedFields.size > 0 && (
                          <span className="flex-shrink-0 px-1.5 rounded text-[10px] font-semibold text-[#2563eb]">
                            Edited
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        {displayValue ? (
                          <p
                            className={`text-[12px] font-semibold leading-snug ${editedFields.has('itemId') || editedFields.has('quantity') ? 'text-[#2563eb] font-bold' : canViewImages ? 'text-black' : 'text-black'} ${canViewImages ? 'cursor-pointer underline' : ''}`}
                            onClick={() => canViewImages && handleOpenImageViewer(entry, itemName, displayValue)}
                            title={editedFields.has('itemId') ? tooltip('itemId') : editedFields.has('quantity') ? tooltip('quantity') : undefined}
                          >
                            {displayValue}
                          </p>
                        ) : canViewImages ? (
                          <p className="text-[12px] font-semibold leading-snug text-[#E4572E] cursor-pointer underline"
                            onClick={() => handleOpenImageViewer(entry, itemName, 'View')}
                          >
                            📷 Image
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-start justify-between mb-[2px]">
                      <p className={`text-[11px] leading-snug font-semibold truncate flex-1 min-w-0 ${editedFields.has('fromLocation') ? 'text-[#2563eb] font-semibold' : 'text-black'}`}
                        title={editedFields.has('fromLocation') ? tooltip('fromLocation') : undefined}
                      >
                        From - {fromLocation}
                      </p>
                      {machineNumberText ? (
                        <p className={`text-[11px] leading-snug flex-shrink-0 ml-2 truncate max-w-[40%] ${editedFields.has('machineNumber') ? 'text-[#2563eb] font-semibold' : 'text-black'}`}
                          title={editedFields.has('machineNumber') ? tooltip('machineNumber') : undefined}
                        >
                          {machineNumberText}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-start justify-between mb-[2px]">
                      <p className={`text-[11px] leading-snug font-semibold truncate flex-1 min-w-0 ${editedFields.has('toLocation') ? 'text-[#2563eb] font-semibold' : 'text-[#BF9853]'}`}
                        title={editedFields.has('toLocation') ? tooltip('toLocation') : undefined}
                      >
                        To - {toLocation}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${entry.machineStatus === 'Working' ? 'bg-[#4CAF50]' :
                            entry.machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                              entry.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                                'bg-[#9E9E9E]'
                            }`}
                        ></span>
                        <p className={`text-[11px] font-medium leading-snug ${entry.machineStatus === 'Working' ? 'text-[#4CAF50]' :
                            entry.machineStatus === 'Not Working' ? 'text-[#F44336]' :
                              entry.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                                'text-[#9E9E9E]'
                            }`}
                        >
                          {entry.machineStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="flex items-center gap-[2px] text-[11px] leading-normal min-w-0 flex-1">
                        <span className={`font-bold ${editedFields.has('date') ? 'text-[#2563eb]' : 'text-black'}`}>{formattedDate || date}</span>
                        {formattedCreatedDateTime && <span className={`font-semibold ${editedFields.has('date') ? 'text-[#2563eb]' : 'text-[#9E9E9E]'}`}> • {formattedCreatedDateTime}</span>}
                      </p>
                      <p className={`text-[12px] font-medium leading-snug flex-shrink-0 ml-2 ${editedFields.has('incharge') ? 'text-[#2563eb] font-semibold' : 'text-black'}`}
                        title={editedFields.has('incharge') ? tooltip('incharge') : undefined}
                      >
                        {inchargeName}
                      </p>
                    </div>
                  </div>
                  <div
                    className="absolute right-0 top-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                      transform: swipeOffset < 0
                        ? `translateX(${Math.max(0, 96 + swipeOffset)}px)`
                        : 'translateX(96px)',
                      transition: (swipeState && swipeState.isSwiping) ? 'none' : 'opacity 0.2s ease-out, transform 0.3s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(entry);
                      }}
                      disabled={!canEdit}
                      className={`action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm ${
                        !canEdit ? 'opacity-50 cursor-not-allowed hover:bg-[#007233]' : ''
                      }`}
                      title="Edit"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canDelete) {
                          alert("You don't have permission to delete.");
                          return;
                        }
                        setExpandedEntryId(null);
                      }}
                      disabled={!canDelete}
                      className={`action-button w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm ${
                        !canDelete ? 'opacity-50 cursor-not-allowed hover:bg-[#E4572E]' : ''
                      }`}
                      title="Delete"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showImageViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleCloseImageViewer} style={{ fontFamily: "'Manrope', sans-serif" }} >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 w-full max-w-[90%] mx-4" onClick={(e) => e.stopPropagation()} >
            <div className="relative">
              {imagesLoading ? (
                <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-gray-100">
                  <p className="text-[14px] text-gray-600">Loading images...</p>
                </div>
              ) : imageViewerData.images.length > 0 && imageViewerData.images[imageViewerData.currentIndex] ? (
                <img
                  src={imageViewerData.images[imageViewerData.currentIndex]}
                  alt={`${imageViewerData.itemName} - ${imageViewerData.currentIndex + 1}`}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-gray-100">
                  <p className="text-[14px] text-gray-600">No images available</p>
                </div>
              )}
              <button onClick={handleCloseImageViewer} className="absolute -top-7 -right-1 w-8 h-8 rounded-full flex items-center justify-center z-20 ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#E4572E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {imageViewerData.images.length > 1 && (
                <button onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              {imageViewerData.images.length > 1 && (
                <button onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              {imageViewerData.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
                  <span className="text-[12px] text-white">
                    {imageViewerData.currentIndex + 1} / {imageViewerData.images.length}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span
                className={`w-2 h-2 rounded-full ${imageViewerData.machineStatus === 'Working' ? 'bg-[#4CAF50]' :
                  imageViewerData.machineStatus === 'Not Working' ? 'bg-[#F44336]' :
                    imageViewerData.machineStatus === 'Under Repair' ? 'bg-[#FF9800]' :
                      'bg-[#9E9E9E]'
                  }`}
              ></span>
              <p
                className={`text-[12px] font-medium ${imageViewerData.machineStatus === 'Working' ? 'text-[#4CAF50]' :
                  imageViewerData.machineStatus === 'Not Working' ? 'text-[#F44336]' :
                    imageViewerData.machineStatus === 'Under Repair' ? 'text-[#FF9800]' :
                      'text-[#9E9E9E]'
                  }`}
              >
                {imageViewerData.machineStatus}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Item ID Filter Modal */}
      <SelectOptionModal
        isOpen={showFilterItemIdModal}
        onClose={() => setShowFilterItemIdModal(false)}
        onSelect={(value) => {
          setFilterItemId(value);
          setShowFilterItemIdModal(false);
        }}
        selectedValue={filterItemId}
        options={filterItemIdOptions}
        fieldName="Item ID"
      />
      {/* Filter Bottom Sheet */}
      {showFilterBottomSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={() => setShowFilterBottomSheet(false)}>
          <div className="bg-white w-full h-[440px] rounded-tl-[16px] rounded-tr-[16px] relative z-[101] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={() => setShowFilterBottomSheet(false)} className="text-[#e06256] text-xl font-bold leading-none">
                <img src={Close} alt="close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-1">
              {/* Item Name Filter */}
              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  Item Name
                </p>
                <div className="relative">
                  <div
                    onClick={() => setShowFilterItemNameDropdown(!showFilterItemNameDropdown)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                    style={{
                      color: filterItemName ? '#000' : '#9E9E9E',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span className="truncate">{filterItemName || 'Select Item Name'}</span>
                  </div>
                  {filterItemName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterItemName('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                  {!filterItemName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {showFilterItemNameDropdown && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowFilterItemNameDropdown(false); setFilterItemNameSearchQuery(''); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
                    <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center px-6 pt-[24px]">
                        <p className="text-[16px] font-semibold text-black">Select Item Name</p>
                        <button onClick={() => { setShowFilterItemNameDropdown(false); setFilterItemNameSearchQuery(''); }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                          <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                        </button>
                      </div>
                      <div className="px-6 pt-[4px] pb-[6px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={filterItemNameSearchQuery}
                            onChange={(e) => setFilterItemNameSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                            autoFocus
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
                        <div className="shadow-md rounded-lg overflow-hidden">
                          {getFilteredItemNames().length > 0 ? (
                            <div className="space-y-0">
                              {getFilteredItemNames().map((name, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setFilterItemName(name);
                                    setShowFilterItemNameDropdown(false);
                                    setFilterItemNameSearchQuery('');
                                  }}
                                  className={`w-full px-[16px] flex items-center gap-3 transition-colors ${filterItemName === name ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                                  style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                                >
                                  <p className="text-[12px] font-medium text-black text-left">{name}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                {filterItemNameSearchQuery ? 'No options found' : 'No options available'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* From Location Filter */}
              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  From Location
                </p>
                <div className="relative">
                  <div
                    onClick={() => setShowFilterFromLocationDropdown(!showFilterFromLocationDropdown)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                    style={{
                      color: filterFromLocation ? '#000' : '#9E9E9E',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span className="truncate">{filterFromLocation || 'Select From Location'}</span>
                  </div>
                  {filterFromLocation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterFromLocation('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                  {!filterFromLocation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {showFilterFromLocationDropdown && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowFilterFromLocationDropdown(false); setFilterFromLocationSearchQuery(''); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
                    <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center px-6 pt-[24px]">
                        <p className="text-[16px] font-semibold text-black">Select From Location</p>
                        <button onClick={() => { setShowFilterFromLocationDropdown(false); setFilterFromLocationSearchQuery(''); }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                          <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                        </button>
                      </div>
                      <div className="px-6 pt-[4px] pb-[6px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={filterFromLocationSearchQuery}
                            onChange={(e) => setFilterFromLocationSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                            autoFocus
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
                        <div className="shadow-md rounded-lg overflow-hidden">
                          {getFilteredFromLocations().length > 0 ? (
                            <div className="space-y-0">
                              {getFilteredFromLocations().map((location, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setFilterFromLocation(location);
                                    setShowFilterFromLocationDropdown(false);
                                    setFilterFromLocationSearchQuery('');
                                  }}
                                  className={`w-full px-[16px] flex items-center gap-3 transition-colors ${filterFromLocation === location ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                                  style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                                >
                                  <p className="text-[12px] font-medium text-black text-left">{location}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                {filterFromLocationSearchQuery ? 'No options found' : 'No options available'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* To Location Filter */}
              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  To Location
                </p>
                <div className="relative">
                  <div
                    onClick={() => setShowFilterToLocationDropdown(!showFilterToLocationDropdown)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                    style={{
                      color: filterToLocation ? '#000' : '#9E9E9E',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span className="truncate">{filterToLocation || 'Select To Location'}</span>
                  </div>
                  {filterToLocation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterToLocation('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                  {!filterToLocation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {showFilterToLocationDropdown && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowFilterToLocationDropdown(false); setFilterToLocationSearchQuery(''); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
                    <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center px-6 pt-[24px]">
                        <p className="text-[16px] font-semibold text-black">Select To Location</p>
                        <button onClick={() => { setShowFilterToLocationDropdown(false); setFilterToLocationSearchQuery(''); }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                          <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                        </button>
                      </div>
                      <div className="px-6 pt-[4px] pb-[6px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={filterToLocationSearchQuery}
                            onChange={(e) => setFilterToLocationSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                            autoFocus
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
                        <div className="shadow-md rounded-lg overflow-hidden">
                          {getFilteredToLocations().length > 0 ? (
                            <div className="space-y-0">
                              {getFilteredToLocations().map((location, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setFilterToLocation(location);
                                    setShowFilterToLocationDropdown(false);
                                    setFilterToLocationSearchQuery('');
                                  }}
                                  className={`w-full px-[16px] flex items-center gap-3 transition-colors ${filterToLocation === location ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                                  style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                                >
                                  <p className="text-[12px] font-medium text-black text-left">{location}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                {filterToLocationSearchQuery ? 'No options found' : 'No options available'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Machine Status and Project Incharge Filters */}
              <div className="flex gap-[12px] mb-4">
                {/* Machine Status Filter */}
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                    Machine Status
                  </p>
                  <div className="relative">
                    <div
                      onClick={() => setShowFilterMachineStatusDropdown(!showFilterMachineStatusDropdown)}
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                      style={{
                        color: filterMachineStatus ? '#000' : '#9E9E9E',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span className="truncate">{filterMachineStatus || 'Select Status'}</span>
                    </div>
                    {filterMachineStatus && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterMachineStatus('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    )}
                    {!filterMachineStatus && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {showFilterMachineStatusDropdown && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowFilterMachineStatusDropdown(false); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
                      <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-6 pt-[24px]">
                          <p className="text-[16px] font-semibold text-black">Select Machine Status</p>
                          <button onClick={() => setShowFilterMachineStatusDropdown(false)} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                            <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
                          <div className="shadow-md rounded-lg overflow-hidden">
                            {getAllMachineStatuses().length > 0 ? (
                              <div className="space-y-0">
                                {getAllMachineStatuses().map((status, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setFilterMachineStatus(status);
                                      setShowFilterMachineStatusDropdown(false);
                                    }}
                                    className={`w-full px-[16px] flex items-center gap-3 transition-colors ${filterMachineStatus === status ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                                    style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                                  >
                                    <p className="text-[12px] font-medium text-black text-left">{status}</p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-4">
                                <p className="text-[14px] font-medium text-[#9E9E9E] text-center">No options available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Project Incharge Filter */}
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                    Project Incharge
                  </p>
                  <div className="relative">
                    <div
                      onClick={() => setShowFilterProjectInchargeDropdown(!showFilterProjectInchargeDropdown)}
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                      style={{
                        color: filterProjectIncharge ? '#000' : '#9E9E9E',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span className="truncate">{filterProjectIncharge || 'Select Incharge'}</span>
                    </div>
                    {filterProjectIncharge && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterProjectIncharge('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    )}
                    {!filterProjectIncharge && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {showFilterProjectInchargeDropdown && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowFilterProjectInchargeDropdown(false); setFilterProjectInchargeSearchQuery(''); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
                      <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-6 pt-[24px]">
                          <p className="text-[16px] font-semibold text-black">Select Project Incharge</p>
                          <button onClick={() => { setShowFilterProjectInchargeDropdown(false); setFilterProjectInchargeSearchQuery(''); }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                            <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                          </button>
                        </div>
                        <div className="px-6 pt-[4px] pb-[6px]">
                          <div className="relative">
                            <input
                              type="text"
                              value={filterProjectInchargeSearchQuery}
                              onChange={(e) => setFilterProjectInchargeSearchQuery(e.target.value)}
                              placeholder="Search"
                              className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                              autoFocus
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
                          <div className="shadow-md rounded-lg overflow-hidden">
                            {getFilteredProjectIncharges().length > 0 ? (
                              <div className="space-y-0">
                                {getFilteredProjectIncharges().map((incharge, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setFilterProjectIncharge(incharge);
                                      setShowFilterProjectInchargeDropdown(false);
                                      setFilterProjectInchargeSearchQuery('');
                                    }}
                                    className={`w-full px-[16px] flex items-center gap-3 transition-colors ${filterProjectIncharge === incharge ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                                    style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                                  >
                                    <p className="text-[12px] font-medium text-black text-left">{incharge}</p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-4">
                                <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                  {filterProjectInchargeSearchQuery ? 'No options found' : 'No options available'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Machine Number Filter */}
              <div className="mb-4">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  Machine Number
                </p>
                <div className="relative">
                  <div
                    onClick={() => setShowFilterMachineNumberDropdown(!showFilterMachineNumberDropdown)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer min-w-0"
                    style={{
                      color: filterMachineNumber ? '#000' : '#9E9E9E',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span className="truncate">{filterMachineNumber || 'Select Machine Number'}</span>
                  </div>
                  {filterMachineNumber && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterMachineNumber('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                    </button>
                  )}
                  {!filterMachineNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {showFilterMachineNumberDropdown && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowFilterMachineNumberDropdown(false); setFilterMachineNumberSearchQuery(''); } }} style={{ fontFamily: "'Manrope', sans-serif" }}>
                    <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center px-6 pt-[24px]">
                        <p className="text-[16px] font-semibold text-black">Select Machine Number</p>
                        <button onClick={() => { setShowFilterMachineNumberDropdown(false); setFilterMachineNumberSearchQuery(''); }} className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity">
                          <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
                        </button>
                      </div>
                      <div className="px-6 pt-[4px] pb-[6px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={filterMachineNumberSearchQuery}
                            onChange={(e) => setFilterMachineNumberSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                            autoFocus
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <img src={Search} alt="Search" className="w-[12px] h-[12px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none mb-4 px-6 min-h-[65vh]">
                        <div className="shadow-md rounded-lg overflow-hidden">
                          {getFilteredMachineNumbers().length > 0 ? (
                            <div className="space-y-0">
                              {getFilteredMachineNumbers().map((number, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setFilterMachineNumber(number);
                                    setShowFilterMachineNumberDropdown(false);
                                    setFilterMachineNumberSearchQuery('');
                                  }}
                                  className={`w-full px-[16px] flex items-center gap-3 transition-colors ${filterMachineNumber === number ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`}
                                  style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                                >
                                  <p className="text-[12px] font-medium text-black text-left">{number}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4">
                              <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
                                {filterMachineNumberSearchQuery ? 'No options found' : 'No options available'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
