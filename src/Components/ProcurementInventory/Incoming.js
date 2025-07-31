import { useState, useEffect, useRef } from 'react';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
const Incoming = ({ username, userRoles = [] }) => {
    const [siteInchargeOptions, setSiteInchargeOptions] = useState([]);
    const [selectedIncharge, setSelectedIncharge] = useState(null);
    const [poItemName, setPoItemName] = useState([]);
    const [itemNameOptions, setItemNameOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState(null);
    const [poModel, setPoModel] = useState([]);
    const [poType, setPoType] = useState([]);
    const [typeColorOptions, setTypeColorOptions] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [stockingLocationAddPopup, setStockingLocationAddPopup] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [savedOptions, setSavedOptions] = useState([]);
    const [search, setSearch] = useState("");
    const [poNos, setPoNos] = useState('');
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    });
    const [groupName, setGroupName] = useState('');
    const [poNo, setPoNo] = useState(0);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState([]);
    const [selectedVendorName, setSelectedVendorName] = useState('');
    const [poNosOption, setPoNosOption] = useState([]);
    const [selectedStockLocation, setSelectedStockLocation] = useState(null);
    const [vendorNameOptions, setVendorNameOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
    const [filteredPurchaseItems, setFilteredPurchaseItems] = useState([]);
    const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const categoryRef = useRef();
    const itemNameRef = useRef(null);
    const modelRef = useRef(null);
    const brandRef = useRef(null);
    const typeRef = useRef(null);
    const quantityRef = useRef(null);

    useEffect(() => {
        const savedSelectedVendor = sessionStorage.getItem('selectedVendorName');
        const savedSelectedSite = sessionStorage.getItem('selectedStockLocation');
        const savedPoNo = sessionStorage.getItem('poNo');
        const savedSelectedModel = sessionStorage.getItem('selectedModel');
        const savedSelectedCategory = sessionStorage.getItem('selectedCategory');
        const savedSelectedItemName = sessionStorage.getItem('selectedItemName');
        const savedSelectedBrand = sessionStorage.getItem('selectedBrand');
        const savedSelectedIncharge = sessionStorage.getItem('selectedIncharge');
        const savedQuantity = sessionStorage.getItem('quantity');
        const savedItems = sessionStorage.getItem('items');
        try {
            if (savedSelectedVendor) setSelectedVendorName(JSON.parse(savedSelectedVendor));
            if (savedSelectedModel) setSelectedModel(JSON.parse(savedSelectedModel));
            if (savedSelectedSite) setSelectedStockLocation(JSON.parse(savedSelectedSite));
            if (savedPoNo) setPoNo(JSON.parse(savedPoNo));
            if (savedSelectedCategory) setSelectedCategory(JSON.parse(savedSelectedCategory));
            if (savedSelectedItemName) setSelectedItemName(JSON.parse(savedSelectedItemName));
            if (savedSelectedBrand) setSelectedBrand(JSON.parse(savedSelectedBrand));
            if (savedSelectedIncharge) setSelectedIncharge(JSON.parse(savedSelectedIncharge));
            if (savedQuantity) setQuantity(JSON.parse(savedQuantity));
            if (savedItems) setItems(JSON.parse(savedItems));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedVendorName');
        sessionStorage.removeItem('selectedStockLocation');
        sessionStorage.removeItem('selectedModel');
        sessionStorage.removeItem('selectedCategory');
        sessionStorage.removeItem('selectedItemName');
        sessionStorage.removeItem('selectedBrand');
        sessionStorage.removeItem('poNo');
        sessionStorage.removeItem('selectedIncharge');
        sessionStorage.removeItem('quantity');
        sessionStorage.removeItem('items');
    };
    useEffect(() => {
        if (selectedCategory) sessionStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
        if (selectedVendorName) sessionStorage.setItem('selectedVendorName', JSON.stringify(selectedVendorName));
        if (selectedStockLocation) sessionStorage.setItem('selectedStockLocation', JSON.stringify(selectedStockLocation));
        if (poNo) sessionStorage.setItem('poNo', JSON.stringify(poNo));
        if (selectedModel) sessionStorage.setItem('selectedModel', JSON.stringify(selectedModel));
        if (selectedItemName) sessionStorage.setItem('selectedItemName', JSON.stringify(selectedItemName));
        if (selectedBrand) sessionStorage.setItem('selectedBrand', JSON.stringify(selectedBrand));
        if (selectedIncharge) sessionStorage.setItem('selectedIncharge', JSON.stringify(selectedIncharge));
        if (quantity) sessionStorage.setItem('quantity', JSON.stringify(quantity));
        if (items) sessionStorage.setItem('items', JSON.stringify(items));
    }, [selectedCategory, selectedVendorName, selectedStockLocation, selectedModel, selectedItemName, selectedBrand, selectedIncharge, quantity, items, poNo]);
    useEffect(() => {
        fetchPoModel();
    }, []);
    const fetchPoModel = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
            if (response.ok) {
                const data = await response.json();
                setPoModel(data);
                const options = data.map(item => ({
                    value: item.model,
                    label: item.model,
                }));
                setModelOptions(options)
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };
    useEffect(() => {
        fetchPoType();
    }, []);
    const fetchPoType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
            if (response.ok) {
                const data = await response.json();
                setPoType(data);
                const options = data.map(item => ({
                    value: item.typeColor,
                    label: item.typeColor,
                }));
                setTypeColorOptions(options)
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e) => {
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
    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
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
    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
        applyMomentum();
    };
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

    useEffect(() => {
        fetchVendorNames();
    }, []);
    const fetchVendorNames = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(item => ({
                    value: item.vendorName,
                    label: item.vendorName,
                    type: "Vendor",
                }));
                setVendorNameOptions(formattedData);
            } else {
                console.log('Error fetching vendor names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching vendor names.');
        }
    };
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                const data = await response.json();
                const formattedData = data.map(item => ({
                    value: item.siteName,
                    label: item.siteName,
                    sNo: item.siteNo
                }));
                setSiteOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    useEffect(() => {
        fetchSiteIncharge();
    }, []);
    const fetchSiteIncharge = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/site_incharge/getAll');
            if (response.ok) {
                const data = await response.json();
                const formatted = data.map((item) => ({
                    value: item.id,
                    label: item.siteEngineer,
                    mobileNumber: item.mobileNumber,
                }));
                setSiteInchargeOptions(formatted);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };

    useEffect(() => {
        fetchPoOrders();
    }, [selectedVendorName]);
    const fetchPoOrders = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
            if (response.ok) {
                const data = await response.json();
                setAllPurchaseOrders(data);
                console.log(data);
                if (selectedVendorName) {
                    // Filter all POs that match the vendor name
                    const matchingPOs = data.filter(po => po.vendorName === selectedVendorName);
                    if (matchingPOs.length > 0) {
                        // Map their eno fields to react-select options
                        const options = matchingPOs.map(po => ({
                            label: po.eno,
                            value: po.eno
                        }));
                        setPoNosOption(options);
                    } else {
                        setPoNosOption([]);
                        setPoNos('');
                    }
                }
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };

    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        fetchPoCategory();
    }, []);
    const fetchPoCategory = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
            if (response.ok) {
                const data = await response.json();
                const options = data.map(item => ({
                    value: item.category,
                    label: item.category,
                }));
                setCategoryOptions(options);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };
    useEffect(() => {
        fetchPoItemName();
    }, []);
    const fetchPoItemName = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
            if (response.ok) {
                const data = await response.json();
                setPoItemName(data);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };
    const handleCategoryChange = (selectedOption) => {
        const categoryValue = selectedOption?.value || '';
        setSelectedCategory(categoryValue);
        setSelectedItemName(null);
        setSelectedModel(null);
        setSelectedBrand(null);
        setSelectedType(null);
        if (!categoryValue) {
            setItemNameOptions([]);
            setModelOptions([]);
            setBrandOptions([]);
            setTypeOptions([]);
            return;
        }
        const filteredItems = poItemName.filter(
            item => item.category.toLowerCase() === categoryValue.toLowerCase()
        );
        const itemNameOpts = filteredItems.map(item => ({
            value: item.itemName,
            label: item.itemName,
        }));
        setItemNameOptions(itemNameOpts);
    };

    const handleItemNameChange = (option) => {
        setSelectedItemName(option);
        setSelectedModel(null);
        setSelectedBrand(null);
        setSelectedType(null);

        if (!option?.value || !selectedCategory) {
            setModelOptions([]);
            setBrandOptions([]);
            setTypeOptions([]);
            return;
        }
        const selectedItem = poItemName.find(
            item =>
                item.category.toLowerCase() === selectedCategory.toLowerCase() &&
                item.itemName === option.value
        );
        if (selectedItem) {
            setGroupName(selectedItem.groupName || '');
        }
        // Special handling for PAINTING category
        if (selectedCategory.toLowerCase() === "painting") {
            // Step 1: Get all mapped models/types/brands
            const mappedModels = new Set();
            const mappedTypes = new Set();
            const mappedBrands = new Set();
            poItemName.forEach(item => {
                item.otherPOEntityList?.forEach(entry => {
                    if (entry.modelName?.trim()) mappedModels.add(entry.modelName.trim());
                    if (entry.typeColor?.trim()) mappedTypes.add(entry.typeColor.trim());
                    if (entry.brandName?.trim()) mappedBrands.add(entry.brandName.trim());
                });
            });
            // Step 2: Get all available master models/types
            const allModelOpts = poModel.map(item => item.model?.trim()).filter(Boolean);
            const allTypeOpts = poType.map(item => item.typeColor?.trim()).filter(Boolean);
            // ✅ Only get brands from the selected item's entries
            const allBrands = selectedItem?.otherPOEntityList
                ?.map(e => e.brandName?.trim())
                .filter(Boolean) || [];
            const uniqueBrands = [...new Set(allBrands)];
            const brandOpts = uniqueBrands.map(val => ({ value: val, label: val }));
            setBrandOptions(brandOpts);
            // Step 3: Filter out mapped models/types
            const unmappedModels = [...new Set(allModelOpts.filter(m => !mappedModels.has(m)))];
            const unmappedTypes = [...new Set(allTypeOpts.filter(t => !mappedTypes.has(t)))];
            // Step 4: Set options
            const modelOpts = unmappedModels.map(val => ({ value: val, label: val }));
            const typeOpts = unmappedTypes.map(val => ({ value: val, label: val }));
            setModelOptions(modelOpts);
            setTypeOptions(typeOpts);
            return;
        }
        // Logic for other categories
        if (selectedItem?.otherPOEntityList?.length > 0) {
            const models = [...new Set(selectedItem.otherPOEntityList.map(e => e.modelName))];
            const modelOpts = models.map(val => ({ value: val, label: val }));
            setModelOptions(modelOpts);
            if (models.length === 1) {
                const autoModel = modelOpts[0];
                setSelectedModel(autoModel);
                const filteredByModel = selectedItem.otherPOEntityList.filter(
                    e => e.modelName === autoModel.value
                );
                const brands = [...new Set(filteredByModel.map(e => e.brandName))];
                const brandOpts = brands.map(val => ({ value: val, label: val }));
                setBrandOptions(brandOpts);
                if (brands.length === 1) {
                    const autoBrand = brandOpts[0];
                    setSelectedBrand(autoBrand);
                    const filteredByBrand = filteredByModel.filter(
                        e => e.brandName === autoBrand.value
                    );
                    const types = [...new Set(filteredByBrand.map(e => e.typeColor))];
                    const typeOpts = types.map(val => ({ value: val, label: val }));
                    setTypeOptions(typeOpts);
                    if (typeOpts.length === 1) {
                        setSelectedType(typeOpts[0]);
                    }
                }
            } else {
                setBrandOptions([]);
                setTypeOptions([]);
            }
        } else {
            setModelOptions([]);
            setBrandOptions([]);
            setTypeOptions([]);
        }
    };
    const handleModelChange = (option) => {
        setSelectedModel(option);
        setSelectedBrand(null);
        setSelectedType(null);
        if (!selectedItemName || !option) return;
        const selectedItem = poItemName.find(
            item =>
                item.category.toLowerCase() === selectedCategory.toLowerCase() &&
                item.itemName === selectedItemName.value
        );
        if (!selectedItem) return;
        const filtered = selectedItem.otherPOEntityList.filter(
            e => e.modelName === option.value
        );
        // ✅ If PAINTING: skip brand setting, only show unmapped type options
        if (selectedCategory.toLowerCase() === "painting") {
            const mappedTypes = new Set();
            poItemName.forEach(item => {
                item.otherPOEntityList?.forEach(entry => {
                    if (entry.typeColor?.trim()) {
                        mappedTypes.add(entry.typeColor.trim());
                    }
                });
            });
            const allTypes = poType.map(t => t.typeColor?.trim()).filter(Boolean);
            const unmatchedTypes = [...new Set(allTypes.filter(t => !mappedTypes.has(t)))];
            const typeOpts = unmatchedTypes.map(val => ({ value: val, label: val }));
            setTypeOptions(typeOpts);
            // ❌ Don't touch brandOptions
            return;
        }
        // ✅ Only handle brand/type if NOT painting
        const brands = [...new Set(filtered.map(e => e.brandName))];
        const brandOpts = brands.map(val => ({ value: val, label: val }));
        setBrandOptions(brandOpts);
        if (brands.length === 1) {
            const autoBrand = brandOpts[0];
            setSelectedBrand(autoBrand);
            const types = [...new Set(
                filtered.filter(e => e.brandName === autoBrand.value).map(e => e.typeColor)
            )];
            const typeOpts = types.map(val => ({ value: val, label: val }));
            setTypeOptions(typeOpts);
            if (typeOpts.length === 1) {
                setSelectedType(typeOpts[0]);
            }
        } else {
            setTypeOptions([]);
        }
    };
    const handleBrandChange = (option) => {
        setSelectedBrand(option);
        setSelectedType(null);
        if (!selectedItemName || !selectedModel || !option) return;
        const selectedItem = poItemName.find(
            item =>
                item.category.toLowerCase() === selectedCategory.toLowerCase() &&
                item.itemName === selectedItemName.value
        );
        if (!selectedItem) return;
        if (selectedCategory.toLowerCase() === "painting") {
            // Type options already set in handleModelChange, no filtering by brand
            return;
        }
        const filtered = selectedItem.otherPOEntityList.filter(
            e => e.modelName === selectedModel.value && e.brandName === option.value
        );
        const types = [...new Set(filtered.map(e => e.typeColor))];
        const typeOpts = types.map(val => ({ value: val, label: val }));
        setTypeOptions(typeOpts);
        if (typeOpts.length === 1) {
            setSelectedType(typeOpts[0]);
        }
    };
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '45px',
            borderWidth: '2px',
            borderRadius: '8px',
            borderColor: state.isFocused
                ? 'rgba(191, 152, 83, 0.35)'   // Full opacity on focus
                : 'rgba(191, 152, 83, 0.35)', // 35% opacity default
            boxShadow: state.isFocused ? '0 0 0 1px #FAF6ED' : 'none',
            '&:hover': {
                borderColor: 'rgba(191, 152, 83, 0.5)', // 50% on hover
            }
        }),
    };
    const handleAddItem = () => {
        if (
            selectedItemName &&
            selectedCategory &&
            selectedModel &&
            selectedBrand &&
            selectedType &&
            quantity
        ) {
            const quantityNumber = Number(quantity);
            const amount = 0; // You can modify this if needed
            const existingIndex = items.findIndex(
                item =>
                    item.itemName === selectedItemName.label &&
                    item.category === selectedCategory &&
                    item.model === selectedModel.label &&
                    item.brand === selectedBrand.label &&
                    item.type === selectedType.label
            );
            if (existingIndex !== -1) {
                const updatedItems = [...items];
                const existingItem = updatedItems[existingIndex];
                const updatedQuantity = Number(existingItem.quantity) + quantityNumber;
                updatedItems[existingIndex] = {
                    ...existingItem,
                    quantity: updatedQuantity.toString(), // update quantity
                    // amount stays 0 as per your structure
                };
                setItems(updatedItems);
            } else {
                setItems([
                    ...items,
                    {
                        itemName: selectedItemName?.label,
                        category: selectedCategory,
                        model: selectedModel?.label,
                        brand: selectedBrand?.label,
                        type: selectedType?.label,
                        quantity,
                        amount: 0,
                    },
                ]);
            }
            // Clear sessionStorage (keep as is)
            sessionStorage.removeItem('selectedItemName');
            sessionStorage.removeItem('selectedModel');
            sessionStorage.removeItem('selectedBrand');
            sessionStorage.removeItem('selectedType');
            sessionStorage.removeItem('quantity');
            // Reset inputs (keep as is)
            setSelectedItemName(null);
            setSelectedModel(null);
            setSelectedBrand(null);
            setSelectedType(null);
            setQuantity('');
            setGroupName('');
        }
    };
    const totalQuantity = filteredPurchaseItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = filteredPurchaseItems.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );
    const grandTotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    useEffect(() => {
        if (selectedCategory && poItemName.length > 0) {
            handleCategoryChange({ value: selectedCategory });
        }
    }, [selectedCategory, poItemName]);
    useEffect(() => {
        if (
            selectedCategory &&
            selectedItemName &&
            itemNameOptions.length > 0 &&
            poItemName.length > 0
        ) {
            handleItemNameChange(selectedItemName);
        }
    }, [selectedItemName, itemNameOptions, selectedCategory, poItemName]);

    useEffect(() => {
        if (
            selectedItemName &&
            selectedModel &&
            modelOptions.length > 0 &&
            poItemName.length > 0
        ) {
            handleModelChange(selectedModel);
        }
    }, [selectedModel, modelOptions, selectedItemName, poItemName]);
    useEffect(() => {
        if (
            selectedItemName &&
            selectedModel &&
            selectedBrand &&
            brandOptions.length > 0 &&
            poItemName.length > 0
        ) {
            handleBrandChange(selectedBrand);
        }
    }, [selectedBrand, brandOptions, selectedModel, selectedItemName, poItemName]);

    const toggleSelection = (item) => {
        setSelectedOptions((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

    const filteredOptions = siteOptions.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (selectedVendorName && poNos) {
            const matchedPO = allPurchaseOrders.find(
                (item) => item.vendorName === selectedVendorName && item.eno === poNos
            );

            if (matchedPO && Array.isArray(matchedPO.purchaseTable)) {
                setFilteredPurchaseItems(matchedPO.purchaseTable);
            } else {
                setFilteredPurchaseItems([]);
            }
        } else {
            setFilteredPurchaseItems([]);
        }
    }, [selectedVendorName, poNos, allPurchaseOrders]);


    useEffect(() => {
        const fetchSavedLocations = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/stocking_location/all", {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json();
                const saved = data.map(loc => loc.stockingLocation);
                setSavedOptions(saved);           // <-- store separately
                console.log(saved);
                setSelectedOptions(saved);        // pre-select checkboxes
            } catch (err) {
                console.error("Error loading saved locations:", err);
            }
        };
        fetchSavedLocations();
    }, []);
    const handleSubmit = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/stocking_location/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedOptions)
            });

            if (!response.ok) {
                throw new Error("Failed to save stocking locations");
            }
            console.log("Saved successfully!");
            window.location.reload();
            setStockingLocationAddPopup(false);
        } catch (error) {
            console.error("Error saving:", error);
        }
    };
    const savedDropdownOptions = savedOptions.map((loc) => ({
        value: loc,
        label: loc,
    }));
    return (
        <div>
            <div className="p-6 border-collapse bg-[#FFFFFF] rounded-md mx-auto ml-4 mr-2 w-full sm:w-[100%] md:w-[95%] lg:w-[95%] xl:w-[95%] 2xl:max-w-[1870px]">
                <div className="flex flex-wrap [@media(min-width:1300px)]:gap-6 gap-3 ">
                    <div className="mt-2 text-left">
                        <h4 className="font-bold [@media(min-width:1300px)]:mb-2 ">Vendor Name</h4>
                        <Select
                            value={vendorNameOptions.find(option => option.value === selectedVendorName)}
                            onChange={async (selectedOption) => {
                                const value = selectedOption?.value || '';
                                setSelectedVendorName(value);
                            }}
                            options={vendorNameOptions}
                            placeholder="Select Vendor"
                            isSearchable
                            isClearable
                            className=" [@media(min-width:1500px)]:w-[370px] w-[270px]"
                            styles={customStyles}
                        />
                    </div>
                    <div className="mt-2 text-left ">
                        <h4 className="font-bold [@media(min-width:1300px)]:mb-2">Stocking Location</h4>
                        <Select
                            value={selectedStockLocation ? savedDropdownOptions.find(option => option.value === selectedStockLocation.value) : null}
                            onChange={(selectedOption) => setSelectedStockLocation(selectedOption)}
                            options={savedDropdownOptions}
                            placeholder="Select location..."
                            isSearchable
                            isClearable
                            className="[@media(min-width:1500px)]:w-[370px] w-[270px]"
                            styles={customStyles}
                        />
                    </div>
                    <div className="text-left mt-2">
                        <h4 className=" font-bold [@media(min-width:1300px)]:mb-2">Date</h4>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border-2 border-[#BF9853] border-opacity-35 focus:outline-none [@media(min-width:640px)]:w-[160px] [@media(min-width:1600px)]:w-[218px] w-[218px] h-[45px] rounded-lg px-4 py-2 cursor-pointer"
                        />
                    </div>
                    <div className="text-left">
                        <h4 className=" mt-2.5 font-bold [@media(min-width:1300px)]:mb-2">PO.No</h4>
                        <Select
                            value={poNos ? poNosOption.find(option => option.value === poNos) : null}
                            onChange={(selectedOption) => setPoNos(selectedOption?.value || '')}
                            options={poNosOption}
                            placeholder="Select Po No..."
                            isSearchable
                            isClearable
                            className="w-[270px] "
                            styles={customStyles}
                        />
                    </div>
                    <div className='mt-[42px]'>
                        <button onClick={() => setStockingLocationAddPopup(true)} className=' rounded-md text-white font-medium w-48 bg-[#BF9853] p-2.5'>
                            Stock Location
                        </button>
                    </div>
                </div>
            </div>
            {selectedVendorName && selectedStockLocation && poNos && (
                <div className="p-6 border-collapse bg-[#FFFFFF] rounded-md mx-auto ml-4 mr-4 mt-3 w-full sm:w-[100%] md:w-[95%] lg:w-[95%] xl:w-[95%] 2xl:max-w-[1870px]">
                    <div className="lg:flex  lg:gap-6 gap-6">
                        <div className="[@media(min-width:1300px)]:space-y-6 text-left">
                            <div>
                                <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Category</label>
                                <Select
                                    ref={categoryRef}
                                    value={categoryOptions.find(opt => opt.value === selectedCategory)}
                                    onChange={(option) => {
                                        handleCategoryChange(option);
                                        setSelectedCategory(option?.value);
                                    }}
                                    onMenuOpen={() => setIsCategoryMenuOpen(true)}
                                    onMenuClose={() => setIsCategoryMenuOpen(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isCategoryMenuOpen) {
                                            e.preventDefault();
                                            itemNameRef.current?.focus();
                                        }
                                    }}
                                    options={categoryOptions}
                                    placeholder="Select Category"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="[@media(min-width:1500px)]:w-[330px] w-[200px] h-[45px]"
                                />
                            </div>
                            <div>
                                <div className='flex justify-between'>
                                    <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Item Name</label>
                                    {groupName && (
                                        <div className="mt-2 text-[#E4572E] text-sm font-bold">
                                            {groupName}
                                        </div>
                                    )}
                                </div>
                                <div className='flex gap-2'>
                                    <Select
                                        ref={itemNameRef}
                                        value={selectedItemName}
                                        onChange={handleItemNameChange}
                                        onMenuOpen={() => setIsItemMenuOpen(true)}
                                        onMenuClose={() => setIsItemMenuOpen(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !isItemMenuOpen) {
                                                e.preventDefault();
                                                modelRef.current?.focus();
                                            }
                                        }}
                                        options={itemNameOptions}
                                        placeholder="Select Item Name"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="[@media(min-width:1500px)]:w-[330px] w-[200px] h-[45px]"
                                    />
                                    <div className='-mt-8'>
                                        <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Available</label>
                                        <input
                                            placeholder='Avl'
                                            className='border p-2 w-28 h-[45px] bg-gray-200 rounded-lg text-sm'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Model</label>
                                <Select
                                    ref={modelRef}
                                    value={selectedModel}
                                    onChange={handleModelChange}
                                    onMenuOpen={() => setIsModelMenuOpen(true)}
                                    onMenuClose={() => setIsModelMenuOpen(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isModelMenuOpen) {
                                            e.preventDefault();
                                            brandRef.current?.focus();
                                        }
                                    }}
                                    options={modelOptions}
                                    placeholder="Select Model"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="[@media(min-width:1500px)]:w-[330px] w-[200px] h-[45px]"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Brand</label>
                                <Select
                                    ref={brandRef}
                                    value={selectedBrand}
                                    onChange={handleBrandChange}
                                    onMenuOpen={() => setIsBrandMenuOpen(true)}
                                    onMenuClose={() => setIsBrandMenuOpen(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isBrandMenuOpen) {
                                            e.preventDefault();
                                            typeRef.current?.focus();
                                        }
                                    }}
                                    options={brandOptions}
                                    placeholder="Select Brand"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="[@media(min-width:1500px)]:w-[330px] w-[200px] h-[45px]"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Type</label>
                                <Select
                                    ref={typeRef}
                                    value={selectedType}
                                    onChange={(option) => setSelectedType(option)}
                                    onMenuOpen={() => setIsTypeMenuOpen(true)}
                                    onMenuClose={() => setIsTypeMenuOpen(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isTypeMenuOpen) {
                                            e.preventDefault();
                                            quantityRef.current?.focus();
                                        }
                                    }}
                                    options={typeOptions}
                                    placeholder="Select Type"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="[@media(min-width:1500px)]:w-[330px] w-[200px] h-[45px]"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Quantity</label>
                                <input
                                    ref={quantityRef}
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddItem();

                                            setTimeout(() => {
                                                if (categoryRef.current) {
                                                    categoryRef.current.focus();
                                                }
                                            }, 0);
                                        }
                                    }}
                                    placeholder="Enter Qty"
                                    className="w-[169px] h-[45px] pl-3 border-2 border-[#BF9853] border-opacity-[20%] focus:outline-none rounded-lg no-spinner"
                                />
                            </div>
                            <button onClick={handleAddItem} className="w-[80px] h-[35px] mt-2 text-white rounded bg-[#BF9853]">
                                Add
                            </button>
                        </div>
                        {/* Table */}
                        <div className='mt-3'>
                            <div className="text-sm font-bold mb-2 text-right">Export PDF</div>
                            <div
                                ref={scrollRef}
                                className="w-full overflow-y-auto rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] select-none"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}>
                                <div className="min-w-[800px] md:min-w-full">
                                    <table className="w-full text-left text-base table-auto">
                                        <thead className="bg-[#FAF6ED] text-left">
                                            <tr className="border-b border-[#e6e1d1]">
                                                <th className="py-2 px-3">S.No</th>
                                                <th className="py-2 w-60 px-3">Item Name</th>
                                                <th className="py-2 px-3">Category</th>
                                                <th className="py-2 px-3">Model</th>
                                                <th className="py-2 px-3">Brand</th>
                                                <th className="py-2 px-3">Type</th>
                                                <th className="py-2 px-3">Qty</th>
                                                <th className="py-2 px-3">Price</th>
                                                <th className="py-2 px-3">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPurchaseItems.map((item, index) => {
                                                const quantity = Number(item.quantity) || 0;
                                                const price = Number(item.amount) || 0;
                                                const amount = quantity * price;

                                                return (
                                                    <tr key={index} className="border-b border-[#e6e1d1]">
                                                        <td className="py-2 px-3">{index + 1}</td>
                                                        <td className="py-2 px-3">{item.itemName}</td>
                                                        <td className="py-2 px-3">{item.category}</td>
                                                        <td className="py-2 px-3">{item.model}</td>
                                                        <td className="py-2 px-3">{item.brand}</td>
                                                        <td className="py-2 px-3">{item.type}</td>
                                                        <td className="py-2 px-3">{quantity}</td>
                                                        <td className="py-2 px-3">{price.toFixed(2)}</td>
                                                        <td className="py-2 px-3">{item.totalAmount}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex border-[2px] border-opacity-25 rounded mt-2 lg:w-[451px] border-[#BF9853] [@media(min-ml:1500px)]:ml-[635px] [@media(min-ml:950px)]:ml-[900px] lg:ml-[600px] text-sm">
                                <div className="grid grid-cols-4 divide-x divide-[#e6e1d1] lg:w-[451px] lg:h-[40px] text-center">
                                    <label className="py-2 font-semibold text-base">Total</label>
                                    <label className="py-2 font-semibold text-base">{totalQuantity}</label>
                                    <label className="py-2 font-semibold text-base">{totalAmount}</label>
                                    <label className="py-2 font-semibold text-base">{grandTotal}</label>
                                </div>
                            </div>
                            <div className="flex lg:justify-end gap-4 mt-4">
                                <button
                                    className="bg-[#BF9853] text-white w-[137px] h-[36px] px-5 rounded"
                                >
                                    Add To Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {stockingLocationAddPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[500px] max-h-[80vh] overflow-y-auto shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Select Stocking Locators</h2>
                        <input
                            type="text"
                            placeholder="Search Locations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                        />
                        <div className="max-h-[200px] overflow-y-auto mb-4 space-y-2">
                            {filteredOptions.map((option) => {
                                const isSaved = savedOptions.includes(option.label);
                                return (
                                    <label key={option.sNo} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedOptions.includes(option.label)}
                                            onChange={() => {
                                                if (!isSaved) toggleSelection(option.label); // block toggle if saved
                                            }}
                                            disabled={isSaved}
                                            className="accent-[#288a15] w-5 h-4"
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-md text-sm"
                                onClick={() => setStockingLocationAddPopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-md text-sm"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Incoming