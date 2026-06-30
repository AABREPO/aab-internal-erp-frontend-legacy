import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Close from '../Images/close.png';
import Search from '../Images/Search.png';

const TOOLS_TRACKER_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_management';
const TOOLS_STOCK_MANAGEMENT_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_tracker_stock_management';
const PROJECTS_BASE_URL = 'https://backendaab.in/aabuilderDash/api/projects';
const TOOLS_ITEM_NAME_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_name';
const TOOLS_ITEM_ID_BASE_URL = 'https://backendaab.in/aabuildersDash/api/tools_item_id';

const extractArrayFromResponse = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && raw.data && Array.isArray(raw.data)) return raw.data;
  return [];
};

// Parse DMS (degrees° minutes' seconds" N/S E/W) to decimal lat, lng. e.g. "9°31'13.5"N 77°38'02.5"E"
const parseDMS = (str) => {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim();
  const latMatch = s.match(/(\d+)[°º]\s*(\d+)['′]?\s*([\d.]+)["″]?\s*([NnSs])/i);
  const lngMatch = s.match(/(\d+)[°º]\s*(\d+)['′]?\s*([\d.]+)["″]?\s*([EeWw])/i);
  if (!latMatch || !lngMatch) return null;
  const latDeg = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10) / 60 + parseFloat(latMatch[3]) / 3600;
  const lngDeg = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10) / 60 + parseFloat(lngMatch[3]) / 3600;
  const lat = latMatch[4].toUpperCase() === 'S' ? -latDeg : latDeg;
  const lng = lngMatch[4].toUpperCase() === 'W' ? -lngDeg : lngDeg;
  return { lat, lng };
};

// Extract lat,lng from Google Maps URL (e.g. ...@9.52,77.63,17z or @9.52,77.63)
const parseGoogleMapsCoords = (url) => {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

const Locate = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [projectsWithAddress, setProjectsWithAddress] = useState([]);
  const [toolsTrackerManagementData, setToolsTrackerManagementData] = useState([]);
  const [stockManagementData, setStockManagementData] = useState([]);
  const [itemNamesMap, setItemNamesMap] = useState({});
  const [itemIdsMap, setItemIdsMap] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState(null); // when Item ID cleared, keep name for display
  const [geocodedCoords, setGeocodedCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [showItemNameModal, setShowItemNameModal] = useState(false);
  const [showItemIdModal, setShowItemIdModal] = useState(false);
  const [itemNameSearchQuery, setItemNameSearchQuery] = useState('');
  const [itemIdSearchQuery, setItemIdSearchQuery] = useState('');

  const projectAddressById = useMemo(() => {
    const map = {};
    (projectsWithAddress || []).forEach((p) => {
      const id = p.id ?? p._id;
      const addr = (p.projectAddress ?? p.project_address ?? '').toString().trim();
      if (id != null && addr) {
        map[id] = addr;
        map[String(id)] = addr;
      }
    });
    return map;
  }, [projectsWithAddress]);

  const projectNameById = useMemo(() => {
    const map = {};
    (projectsWithAddress || []).forEach((p) => {
      const id = p.id ?? p._id;
      const name = (p.projectName ?? p.project_name ?? '').toString().trim();
      if (id != null) {
        map[id] = name;
        map[String(id)] = name;
      }
    });
    return map;
  }, [projectsWithAddress]);

  // Get latest to_project_id per item (item_ids_id + brand_id + machine_number)
  const getCurrentToProjectId = useCallback(
    (itemIdsId, itemNameId, brandId, machineNumber, homeLocationId) => {
      const movementTypes = ['entry', 'relocation', 'relocate', 'service_return', 'service return'];
      let latestEntryId = 0;
      let latestEntry = null;

      for (const entry of toolsTrackerManagementData) {
        const entryType = (entry.tools_entry_type || entry.toolsEntryType || 'Entry').toLowerCase().trim();
        if (!movementTypes.some((t) => t === entryType)) continue;

        const items = entry.tools_tracker_item_name_table || entry.toolsTrackerItemNameTable || [];
        for (const entryItem of items) {
          const eItemIdsId = entryItem.item_ids_id || entryItem.itemIdsId;
          const eBrandId = entryItem.brand_id || entryItem.brandId;
          const eMachine = (entryItem.machine_number || entryItem.machineNumber || '').trim();
          const eItemNameId = entryItem.item_name_id || entryItem.itemNameId;

          const itemMatch =
            String(eItemIdsId || '') === String(itemIdsId || '') &&
            (!brandId || String(eBrandId || '') === String(brandId)) &&
            (!machineNumber || String(eMachine) === String(machineNumber)) &&
            (!itemNameId || String(eItemNameId || '') === String(itemNameId));

          if (!itemMatch) continue;

          const entryId = Number(entry.id ?? entry._id ?? 0) || 0;
          if (entryId > latestEntryId) {
            latestEntryId = entryId;
            latestEntry = { entry, entryItem };
          }
        }
      }

      if (latestEntry) {
        const toId = latestEntry.entry.to_project_id || latestEntry.entry.toProjectId;
        if (toId) return toId;
        const serviceId = latestEntry.entry.service_store_id || latestEntry.entry.serviceStoreId;
        if (serviceId) return serviceId;
        const fromId = latestEntry.entry.from_project_id || latestEntry.entry.fromProjectId;
        if (fromId) return fromId;
      }
      return homeLocationId;
    },
    [toolsTrackerManagementData]
  );

  // Build list of item locations: item display name, item id display, to_project_id, projectAddress
  const locationList = useMemo(() => {
    const seen = new Set();
    const list = [];

    const addFromStock = () => {
      (stockManagementData || []).forEach((stock) => {
        const itemNameId = stock.item_name_id ?? stock.itemNameId;
        const itemIdsId = stock.item_ids_id ?? stock.itemIdsId;
        const brandId = stock.brand_name_id ?? stock.brandNameId ?? stock.brand_id ?? stock.brandId;
        const homeLocationId = stock.home_location_id || stock.homeLocationId;
        const machineNumber = (stock.machine_number || stock.machineNumber || '').trim();

        const toProjectId = getCurrentToProjectId(itemIdsId, itemNameId, brandId, machineNumber, homeLocationId);
        const address = toProjectId ? projectAddressById[toProjectId] || projectAddressById[String(toProjectId)] : '';

        const itemName = itemNamesMap[itemNameId] || itemNamesMap[String(itemNameId)] || '';
        const itemIdDisplay = itemIdsMap[itemIdsId] || itemIdsMap[String(itemIdsId)] || '';

        const key = `${itemIdsId}_${brandId}_${machineNumber}_${toProjectId}`;
        if (seen.has(key)) return;
        seen.add(key);

        if (address) {
          list.push({
            key,
            itemName,
            itemIdDisplay,
            toProjectId,
            address
          });
        }
      });
    };

    addFromStock();
    return list;
  }, [stockManagementData, getCurrentToProjectId, projectAddressById, itemNamesMap, itemIdsMap]);

  const addressSource = selectedLocation ?? (selectedItemName ? locationList.find((l) => l.itemName === selectedItemName) : null) ?? locationList[0];
  const displayAddress = addressSource?.address ?? '';
  const rawAddress = (displayAddress || '').trim();

  // Check if projectAddress is a Google Maps link (share link or place URL)
  const isGoogleMapsUrl = (str) => {
    if (!str || typeof str !== 'string') return false;
    const s = str.trim();
    return (
      (s.startsWith('http://') || s.startsWith('https://')) &&
      (s.includes('google.com/maps') || s.includes('goo.gl/maps') || s.includes('maps.app.goo.gl'))
    );
  };

  // Check if address contains DMS coordinates (e.g. 9°31'13.5"N 77°38'02.5"E)
  const dmsCoords = parseDMS(rawAddress);
  const googleUrlCoords = isGoogleMapsUrl(rawAddress) ? parseGoogleMapsCoords(rawAddress) : null;

  // Coordinates for embedding map on page: DMS, or from Google URL, or geocoded from plain address
  const embedCoords = dmsCoords || googleUrlCoords || geocodedCoords;

  // OpenStreetMap embed URL (works in iframe) – show map on page
  const osmEmbedUrl = embedCoords
    ? (() => {
        const { lat, lng } = embedCoords;
        const delta = 0.005;
        const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',');
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;
      })()
    : null;

  // Build URL to open in new tab (fallback when no embed)
  const mapsUrl = (() => {
    if (isGoogleMapsUrl(rawAddress)) return rawAddress;
    if (embedCoords) return `https://www.google.com/maps?q=${embedCoords.lat},${embedCoords.lng}&z=19`;
    const query = encodeURIComponent(
      (rawAddress || 'India').replace(/\s+/g, ' ').trim()
    );
    return `https://www.google.com/maps?q=${query}&z=19`;
  })();

  // Geocode plain text address via Nominatim so we can embed map on page
  useEffect(() => {
    if (!rawAddress || parseDMS(rawAddress) || isGoogleMapsUrl(rawAddress)) {
      setGeocodedCoords(null);
      return;
    }
    let cancelled = false;
    setGeocoding(true);
    setGeocodedCoords(null);
    const query = rawAddress.replace(/\s+/g, ' ').trim();
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { Accept: 'application/json' } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) setGeocodedCoords({ lat, lng: lon });
      })
      .catch(() => {})
      .finally(() => setGeocoding(false));
    return () => { cancelled = true; };
  }, [rawAddress]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [projectsRes, trackerRes, stockRes, itemNamesRes, itemIdsRes] = await Promise.all([
          fetch(`${PROJECTS_BASE_URL}/getAll`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
          fetch(`${TOOLS_TRACKER_MANAGEMENT_BASE_URL}/getAll`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
          fetch(`${TOOLS_STOCK_MANAGEMENT_BASE_URL}/getAll`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
          fetch(`${TOOLS_ITEM_NAME_BASE_URL}/getAll`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
          fetch(`${TOOLS_ITEM_ID_BASE_URL}/getAll`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
        ]);

        if (projectsRes.ok) {
          const raw = await projectsRes.json();
          const data = extractArrayFromResponse(raw);
          setProjectsWithAddress(Array.isArray(data) ? data : []);
        }

        if (trackerRes.ok) {
          const raw = await trackerRes.json();
          const data = extractArrayFromResponse(raw);
          const movementTypes = ['entry', 'relocation', 'relocate', 'service_return', 'service return'];
          const entries = (Array.isArray(data) ? data : []).filter((entry) => {
            const t = (entry.tools_entry_type || entry.toolsEntryType || 'Entry').toLowerCase().trim();
            return movementTypes.some((m) => t === m);
          });
          setToolsTrackerManagementData(entries);
        }

        if (stockRes.ok) {
          const raw = await stockRes.json();
          const data = extractArrayFromResponse(raw);
          setStockManagementData(Array.isArray(data) ? data : []);
        }

        if (itemNamesRes.ok) {
          const raw = await itemNamesRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          (data || []).forEach((i) => {
            const id = i.id ?? i._id;
            const name = (i.item_name ?? i.itemName ?? '').toString().trim();
            if (id != null) {
              map[id] = name;
              map[String(id)] = name;
            }
          });
          setItemNamesMap(map);
        }

        if (itemIdsRes.ok) {
          const raw = await itemIdsRes.json();
          const data = extractArrayFromResponse(raw);
          const map = {};
          (data || []).forEach((i) => {
            const id = i.id ?? i._id;
            const label = (i.item_id ?? i.itemId ?? '').toString().trim();
            if (id != null) {
              map[id] = label;
              map[String(id)] = label;
            }
          });
          setItemIdsMap(map);
        }
      } catch (err) {
        console.error('Locate fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentItem = useMemo(() => {
    if (selectedLocation) return { ...selectedLocation, itemName: selectedLocation.itemName, itemIdDisplay: selectedLocation.itemIdDisplay };
    if (selectedItemName) return { itemName: selectedItemName, itemIdDisplay: null };
    const first = locationList[0];
    return first ? { ...first } : null;
  }, [selectedLocation, selectedItemName, locationList]);

  const listLocationsForCurrentItem = useMemo(() => {
    const name = currentItem?.itemName ?? selectedItemName;
    if (!name) return [];
    return locationList.filter((l) => l.itemName === name);
  }, [locationList, currentItem?.itemName, selectedItemName]);

  const itemNameOptions = useMemo(() => [...new Set(locationList.map((l) => l.itemName).filter(Boolean))].sort(), [locationList]);
  const itemIdOptions = useMemo(() => {
    if (currentItem?.itemName) {
      return locationList.filter((l) => l.itemName === currentItem.itemName).map((l) => l.itemIdDisplay).filter(Boolean);
    }
    return [...new Set(locationList.map((l) => l.itemIdDisplay).filter(Boolean))].sort();
  }, [locationList, currentItem?.itemName]);

  const filteredItemNameOptions = useMemo(() => {
    const q = (itemNameSearchQuery || '').trim().toLowerCase();
    if (!q) return itemNameOptions;
    return itemNameOptions.filter((name) => String(name).toLowerCase().includes(q));
  }, [itemNameOptions, itemNameSearchQuery]);

  const filteredItemIdOptions = useMemo(() => {
    const q = (itemIdSearchQuery || '').trim().toLowerCase();
    if (!q) return itemIdOptions;
    return itemIdOptions.filter((id) => String(id).toLowerCase().includes(q));
  }, [itemIdOptions, itemIdSearchQuery]);

  const StarOutline = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Item Name (left) + Item ID (right) – like image / ToolsHistory: plain text buttons, no bordered boxes */}
      <div className="flex-shrink-0 flex justify-between items-center border-b border-[#E0E0E0] pb-[8px] gap-[8px]">
        <div className="flex items-center gap-[8px] min-w-0">
          <button
            type="button"
            onClick={() => { setShowItemNameModal(true); setShowItemIdModal(false); }}
            className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-left"
          >
            {currentItem?.itemName || 'Item Name'}
          </button>
          {currentItem?.itemName && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(null);
                setItemNameSearchQuery('');
                setItemIdSearchQuery('');
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-[8px] flex-shrink-0">
          <button
            type="button"
            onClick={() => { setShowItemIdModal(true); setShowItemNameModal(false); }}
            className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent text-right"
          >
            {currentItem?.itemIdDisplay || 'Item ID'}
          </button>
          {currentItem?.itemIdDisplay && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(null);
                setItemIdSearchQuery('');
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Select Item Name modal - like NetStock / images */}
      {showItemNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" onClick={() => { setShowItemNameModal(false); setItemNameSearchQuery(''); }}>
          <div className="bg-white w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5 pb-1">
              <p className="text-[16px] font-semibold text-black">Select Item Name</p>
              <button type="button" onClick={() => { setShowItemNameModal(false); setItemNameSearchQuery(''); }} className="p-1 text-red-500 hover:opacity-80">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <div className="relative">
                <img src={Search} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-[12px] h-[12px] opacity-60" />
                <input type="text" value={itemNameSearchQuery} onChange={(e) => setItemNameSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
              <div className="shadow-md rounded-lg overflow-hidden">
                {filteredItemNameOptions.length > 0 ? (
                  filteredItemNameOptions.map((name) => {
                    const isSelected = currentItem?.itemName === name;
                    return (
                      <button key={name} type="button" onClick={() => { const loc = locationList.find((l) => l.itemName === name); if (loc) { setSelectedLocation(loc); setSelectedItemName(name); } setShowItemNameModal(false); setItemNameSearchQuery(''); }} className={`w-full px-[10px] flex items-center gap-3 transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', height: '44px' }}>
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0"><StarOutline /></div>
                        <p className="text-[12px] font-medium text-black truncate text-left flex-1">{name}</p>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 text-center"><p className="text-[14px] font-medium text-[#9E9E9E]">{itemNameSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Item ID modal - like NetStock / images */}
      {showItemIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" onClick={() => { setShowItemIdModal(false); setItemIdSearchQuery(''); }}>
          <div className="bg-white w-full max-w-[360px] rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5 pb-1">
              <p className="text-[16px] font-semibold text-black">Select Item ID</p>
              <button type="button" onClick={() => { setShowItemIdModal(false); setItemIdSearchQuery(''); }} className="p-1 text-red-500 hover:opacity-80">
                <img src={Close} alt="Close" className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <div className="relative">
                <img src={Search} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-[12px] h-[12px] opacity-60" />
                <input type="text" value={itemIdSearchQuery} onChange={(e) => setItemIdSearchQuery(e.target.value)} placeholder="Search" className="w-full h-[32px] pl-[30px] pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium placeholder:text-[#9E9E9E] bg-white focus:outline-none" autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
              <div className="shadow-md rounded-lg overflow-hidden">
                {filteredItemIdOptions.length > 0 ? (
                  filteredItemIdOptions.map((id) => {
                    const isSelected = currentItem?.itemIdDisplay === id;
                    return (
                      <button key={id} type="button" onClick={() => { const loc = locationList.find((l) => l.itemIdDisplay === id); if (loc) { setSelectedLocation(loc); setSelectedItemName(loc.itemName); } setShowItemIdModal(false); setItemIdSearchQuery(''); }} className={`w-full px-[10px] flex items-center gap-3 transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'}`} style={{ minHeight: '44px', height: '44px' }}>
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0"><StarOutline /></div>
                        <p className="text-[12px] font-medium text-black truncate text-left flex-1">{id}</p>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 text-center"><p className="text-[14px] font-medium text-[#9E9E9E]">{itemIdSearchQuery.trim() ? 'No options found' : 'No options available'}</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col pt-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[12px] text-[#9E9E9E]">Loading...</p>
          </div>
        ) : (
          <>
            {/* Map embedded on page (OpenStreetMap) when we have coordinates */}
            {osmEmbedUrl ? (
              <div className="flex-shrink-0 h-[400px] w-full rounded-lg overflow-hidden border border-[#E0E0E0] bg-[#f5f5f5] mt-2">
                <iframe
                  title="Location map"
                  src={osmEmbedUrl}
                  className="w-full h-full border-0"
                  style={{ height: '400px' }}
                  loading="lazy"
                />
              </div>
            ) : (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 h-[200px] w-full rounded-lg overflow-hidden border border-[#E0E0E0] bg-[#f5f5f5] flex flex-col items-center justify-center gap-2 no-underline text-inherit hover:bg-[#ebebeb] transition-colors mt-2"
              >
                <span className="text-[48px] opacity-70" aria-hidden>📍</span>
                <span className="text-[14px] font-semibold text-[#1a73e8]">
                  {geocoding ? 'Finding location…' : 'View on Google Maps'}
                </span>
                <span className="text-[11px] text-[#5f6368] max-w-[90%] text-center truncate">
                  {rawAddress || 'Open map'}
                </span>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Locate;
