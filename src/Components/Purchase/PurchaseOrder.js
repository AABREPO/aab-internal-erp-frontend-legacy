import { useState, useEffect, useRef } from 'react';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
const PurchaseOrder = ({ username, userRoles = [] }) => {
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
    const [poBrand, setPoBrand] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [hasRestoredSession, setHasRestoredSession] = useState(false);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const [groupName, setGroupName] = useState('');
    const [poNo, setPoNo] = useState(0);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [items, setItems] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [editedItem, setEditedItem] = useState({});
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [vendorNameOptions, setVendorNameOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const [mappedCategories, setMappedCategories] = useState([]);
    const categoryRef = useRef();
    const itemNameRef = useRef(null);
    const modelRef = useRef(null);
    const brandRef = useRef(null);
    const typeRef = useRef(null);
    const quantityRef = useRef(null);
    useEffect(() => {
        const savedSelectedVendor = sessionStorage.getItem('selectedVendor');
        const savedSelectedSite = sessionStorage.getItem('selectedSite');
        const savedPoNo = sessionStorage.getItem('poNo');
        const savedSelectedModel = sessionStorage.getItem('selectedModel');
        const savedSelectedCategory = sessionStorage.getItem('selectedCategory');
        const savedSelectedItemName = sessionStorage.getItem('selectedItemName');
        const savedSelectedBrand = sessionStorage.getItem('selectedBrand');
        const savedSelectedIncharge = sessionStorage.getItem('selectedIncharge');
        const savedQuantity = sessionStorage.getItem('quantity');
        const savedType = sessionStorage.getItem('selectedType');
        const savedItems = sessionStorage.getItem('items');
        try {
            if (savedSelectedVendor) setSelectedVendor(JSON.parse(savedSelectedVendor));
            if (savedSelectedModel) setSelectedModel(JSON.parse(savedSelectedModel));
            if (savedSelectedSite) setSelectedSite(JSON.parse(savedSelectedSite));
            if (savedPoNo) setPoNo(JSON.parse(savedPoNo));
            if (savedSelectedCategory) setSelectedCategory(JSON.parse(savedSelectedCategory));
            if (savedSelectedItemName) setSelectedItemName(JSON.parse(savedSelectedItemName));
            if (savedSelectedBrand) setSelectedBrand(JSON.parse(savedSelectedBrand));
            if (savedSelectedIncharge) setSelectedIncharge(JSON.parse(savedSelectedIncharge));
            if (savedQuantity) setQuantity(JSON.parse(savedQuantity));
            if (savedType) setSelectedType(JSON.parse(savedType));
            if (savedItems) setItems(JSON.parse(savedItems));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        setHasRestoredSession(true);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedVendor');
        sessionStorage.removeItem('selectedSite');
        sessionStorage.removeItem('selectedModel');
        sessionStorage.removeItem('selectedCategory');
        sessionStorage.removeItem('selectedItemName');
        sessionStorage.removeItem('selectedBrand');
        sessionStorage.removeItem('selectedType')
        sessionStorage.removeItem('poNo');
        sessionStorage.removeItem('selectedIncharge');
        sessionStorage.removeItem('quantity');
        sessionStorage.removeItem('items');
    };
    useEffect(() => {
        if (selectedCategory) sessionStorage.setItem('selectedCategory', JSON.stringify(selectedCategory));
        if (selectedVendor) sessionStorage.setItem('selectedVendor', JSON.stringify(selectedVendor));
        if (selectedSite) sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite));
        if (poNo) sessionStorage.setItem('poNo', JSON.stringify(poNo));
        if (selectedModel) sessionStorage.setItem('selectedModel', JSON.stringify(selectedModel));
        if (selectedItemName) sessionStorage.setItem('selectedItemName', JSON.stringify(selectedItemName));
        if (selectedBrand) sessionStorage.setItem('selectedBrand', JSON.stringify(selectedBrand));
        if (selectedType) sessionStorage.setItem('selectedType', JSON.stringify(selectedType));
        if (selectedIncharge) sessionStorage.setItem('selectedIncharge', JSON.stringify(selectedIncharge));
        if (quantity) sessionStorage.setItem('quantity', JSON.stringify(quantity));
        if (items) sessionStorage.setItem('items', JSON.stringify(items));
    }, [selectedCategory, selectedVendor, selectedSite, selectedModel, selectedItemName, selectedBrand, selectedType, selectedIncharge, quantity, items, poNo]);
    useEffect(() => {
        fetchPoModel();
    }, []);
    const fetchPoModel = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
            if (response.ok) {
                const data = await response.json();
                setPoModel(data);
            } else {
                console.log('Error fetching model names.');
            }
        } catch (error) {
            console.error('Error:', error);
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
            } else {
                console.log('Error fetching type names.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        fetchPoBrand();
    }, []);
    const fetchPoBrand = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
            if (response.ok) {
                const data = await response.json();
                setPoBrand(data);
            } else {
                console.log('Error fetching brand names.');
            }
        } catch (error) {
            console.error('Error:', error);
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
                    id: item.id,
                }));
                setVendorNameOptions(formattedData);
            } else {
                console.log('Error fetching vendor names.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const getNumericEno = (purchaseOrder = {}) => {
        const candidateKeys = ['eno', 'poNo', 'po_no', 'po_number', 'purchase_order_number'];
        for (const key of candidateKeys) {
            const value = purchaseOrder[key];
            if (value === undefined || value === null || value === '') continue;
            const parsed = parseInt(value, 10);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return 0;
    };
    const fetchNextPoNumberForVendor = async (vendorId) => {
        if (!vendorId) {
            return 1;
        }
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
            if (!response.ok) {
                throw new Error('Failed to fetch purchase orders');
            }
            const data = await response.json();
            const normalizedVendorId = String(vendorId);
            const vendorOrders = data.filter(order => String(order.vendor_id ?? order.vendorId) === normalizedVendorId);
            if (!vendorOrders.length) {
                return 1;
            }
            const latestEno = vendorOrders.reduce((maxValue, order) => {
                const currentEno = getNumericEno(order);
                return currentEno > maxValue ? currentEno : maxValue;
            }, 0);
            return latestEno + 1;
        } catch (error) {
            console.error('Failed to fetch last PO number:', error);
            return 1;
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
                    sNo: item.siteNo,
                    id: item.id,
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
                    id: item.id,
                }));
                setSiteInchargeOptions(formatted);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleChange = (selectedOption) => {
        setSelectedIncharge(selectedOption);
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
                    id: item.id,
                }));
                setCategoryOptions(options);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        fetchMappedPoCategory();
    }, []);
    const fetchMappedPoCategory = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/mapped/category/getAll');
            if (response.ok) {
                const data = await response.json();
                const options = data.map(item => ({
                    value: item.mappedCategory,
                    label: item.mappedCategory,
                    id: item.id,
                }));
                setMappedCategories(options);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
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
        }
    };
    const handleCategoryChange = (selectedOption) => {
        if (!selectedIncharge) {
            alert("Please select the Project Incharge first.");
            return;
        }
        const categoryValue = selectedOption?.value || '';
        if (selectedCategory?.value !== categoryValue) {
            setSelectedItemName(null);
            setSelectedModel(null);
            setSelectedBrand(null);
            setSelectedType(null);
        }
        setSelectedCategory(selectedOption);
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
            id: item.id,
        }));
        setItemNameOptions(itemNameOpts);
        const filteredModels = poModel
            .filter(item => item.category?.toLowerCase() === categoryValue.toLowerCase())
            .map(item => ({
                value: item.model?.trim(),
                label: item.model?.trim(),
                id: item.id
            }))
            .filter(item => item.value);
        setModelOptions(filteredModels);
    };
    const ensureIdFromList = (value, list, key, categoryKey, categoryValue) => {
        const match = list.find(item =>
            item[key]?.trim().toLowerCase() === value?.trim().toLowerCase() &&
            (!categoryKey || item[categoryKey]?.toLowerCase() === categoryValue?.toLowerCase())
        );
        return {
            value,
            label: value,
            id: match?.id || 0,
        };
    };
    const handleItemNameChange = (option) => {
        if (!option) {
            setSelectedItemName(null);
            setSelectedModel(null);
            setSelectedBrand(null);
            setSelectedType(null);
            setGroupName('');
            const categoryValue = selectedCategory?.value || '';
            if (categoryValue) {
                const categoryMatchedModels = poModel
                    .filter(item => item.category?.toLowerCase() === categoryValue.toLowerCase())
                    .map(item => ({
                        value: item.model?.trim(),
                        label: item.model?.trim(),
                        id: item.id
                    }))
                    .filter(item => item.value);
                setModelOptions(categoryMatchedModels);
            } else {
                setModelOptions([]);
            }
            setBrandOptions([]);
            setTypeOptions([]);
            return;
        }
        const itemValue = option.value;
        if (selectedItemName?.value !== itemValue) {
            setSelectedModel(null);
            setSelectedBrand(null);
            setSelectedType(null);
        }
        setSelectedItemName(option);
        const selectedItem = poItemName.find(
            item =>
                item.category.toLowerCase() === selectedCategory?.value.toLowerCase() &&
                item.itemName === itemValue
        );
        if (selectedItem) {
            setGroupName(selectedItem.groupName || '');
        }
        const isUnmappedCategory = !mappedCategories.some(cat =>
            cat.label.toLowerCase() === selectedCategory?.value.toLowerCase()
        );
        if (isUnmappedCategory) {
            const categoryMatchedModels = poModel
                .filter(item => item.category?.toLowerCase() === selectedCategory?.value.toLowerCase())
                .map(item => ({
                    value: item.model?.trim(),
                    label: item.model?.trim(),
                    id: item.id
                }))
                .filter(item => item.value);
            setModelOptions(categoryMatchedModels);
            const categoryMatchedTypes = poType
                .filter(item => item.category?.toLowerCase() === selectedCategory?.value.toLowerCase())
                .map(item => ({
                    value: item.typeColor?.trim(),
                    label: item.typeColor?.trim(),
                    id: item.id
                }))
                .filter(item => item.value);
            setTypeOptions(categoryMatchedTypes);
            const categoryMatchedBrands = poBrand
                .filter(item => {
                    const brandCategory = item.category?.toLowerCase() || "";
                    const currentCategory = selectedCategory?.value.toLowerCase();
                    return !brandCategory || brandCategory === currentCategory;
                })
                .map(item => ({
                    value: item.brand?.trim(),
                    label: item.brand?.trim(),
                    id: item.id
                }))
                .filter(item => item.value);
            setBrandOptions(categoryMatchedBrands);
            return;
        }
        if (selectedItem?.otherPOEntityList?.length > 0) {
            const models = [...new Set(selectedItem.otherPOEntityList.map(e => e.modelName?.trim()).filter(Boolean))];
            const modelOpts = models.map(modelName =>
                ensureIdFromList(modelName, poModel, 'model', 'category', selectedCategory?.value)
            );
            setModelOptions(modelOpts);
            if (modelOpts.length === 1) {
                const autoModel = ensureIdFromList(modelOpts[0].value, poModel, 'model', 'category', selectedCategory?.value);
                setSelectedModel(autoModel);
                const filteredByModel = selectedItem.otherPOEntityList.filter(
                    e => e.modelName?.trim() === autoModel.value
                );
                const brands = [...new Set(filteredByModel.map(e => e.brandName?.trim()).filter(Boolean))];
                const brandOpts = brands.map(b =>
                    ensureIdFromList(b, poBrand, 'brand', 'category', selectedCategory?.value)
                );
                setBrandOptions(brandOpts);
                if (brandOpts.length === 1) {
                    const autoBrand = brandOpts[0];
                    setSelectedBrand(autoBrand);
                    const filteredByBrand = filteredByModel.filter(
                        e => e.brandName?.trim() === autoBrand.value
                    );
                    const types = [...new Set(filteredByBrand.map(e => e.typeColor?.trim()).filter(Boolean))];
                    const typeOpts = types.map(t =>
                        ensureIdFromList(t, poType, 'typeColor', 'category', selectedCategory?.value)
                    );
                    setTypeOptions(typeOpts);
                    if (typeOpts.length === 1) {
                        setSelectedType(typeOpts[0]);
                    }
                }
            }
            else {
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
        const modelValue = option?.value?.trim() || '';        
        if (selectedModel?.value !== modelValue) {
            setSelectedBrand(null);
            setSelectedType(null);
        }
        setSelectedModel(option);
        if (!option) return;
        const isUnmappedCategory = !mappedCategories.some(cat =>
            cat.label.toLowerCase() === selectedCategory?.value.toLowerCase()
        );
        if (!selectedItemName) {
            const matchedItem = poItemName.find(item =>
                item.category?.toLowerCase() === selectedCategory?.value.toLowerCase() &&
                item.otherPOEntityList?.some(e => e.modelName?.trim().toLowerCase() === modelValue.toLowerCase())
            );
            if (matchedItem) {
                const itemOption = {
                    value: matchedItem.itemName,
                    label: matchedItem.itemName,
                    id: matchedItem.id
                };
                setSelectedItemName(itemOption);
                setGroupName(matchedItem.groupName || '');
            }
        }
        if (!selectedItemName) return;
        const selectedItem = poItemName.find(
            item =>
                item.category?.toLowerCase() === selectedCategory?.value.toLowerCase() &&
                item.itemName === selectedItemName.value
        );
        if (!selectedItem) return;
        const filtered = selectedItem.otherPOEntityList.filter(
            e => e.modelName?.trim().toLowerCase() === modelValue.toLowerCase()
        );
        if (isUnmappedCategory) {
            const matchedBrands = poBrand
                .filter(b => (!b.category || b.category.toLowerCase() === selectedCategory?.value.toLowerCase()))
                .map(b => ({
                    value: b.brand?.trim(),
                    label: b.brand?.trim(),
                    id: b.id
                }))
                .filter(b => b.value);
            setBrandOptions(matchedBrands);
            const matchedTypes = poType
                .filter(t => t.category?.toLowerCase() === selectedCategory?.value.toLowerCase())
                .map(item => ({
                    value: item.typeColor?.trim(),
                    label: item.typeColor?.trim(),
                    id: item.id
                }))
                .filter(item => item.value);
            setTypeOptions(matchedTypes);
            return;
        }
        const brands = [...new Set(filtered.map(e => e.brandName?.trim()).filter(Boolean))];
        const brandOpts = brands.map(val => {
            const matched = poBrand.find(
                b =>
                    b.brand?.trim().toLowerCase() === val.toLowerCase() &&
                    (!b.category || b.category.toLowerCase() === selectedCategory?.value.toLowerCase())
            );
            return {
                value: val,
                label: val,
                id: matched?.id || null
            };
        });
        setBrandOptions(brandOpts);
        if (brandOpts.length === 1) {
            const autoBrand = brandOpts[0];
            if (!autoBrand.id) {
                const fallback = poBrand.find(b =>
                    b.brand?.trim().toLowerCase() === autoBrand.value.toLowerCase() &&
                    (!b.category || b.category?.toLowerCase() === selectedCategory?.value.toLowerCase())
                );
                autoBrand.id = fallback?.id || null;
            }
            setSelectedBrand(autoBrand);
            const types = [...new Set(
                filtered
                    .filter(e => e.brandName?.trim() === autoBrand.value?.trim())
                    .map(e => e.typeColor?.trim())
                    .filter(Boolean)
            )];
            const typeOpts = types.map(val => {
                const matched = poType.find(
                    t =>
                        t.typeColor?.trim().toLowerCase() === val.toLowerCase() &&
                        t.category?.toLowerCase() === selectedCategory?.value.toLowerCase()
                );
                return {
                    value: val,
                    label: val,
                    id: matched?.id || null
                };
            });
            setTypeOptions(typeOpts);
            if (typeOpts.length === 1) {
                const autoType = typeOpts[0];
                if (!autoType.id) {
                    const fallbackType = poType.find(t =>
                        t.typeColor?.trim().toLowerCase() === autoType.value.toLowerCase() &&
                        t.category?.toLowerCase() === selectedCategory?.value.toLowerCase()
                    );
                    autoType.id = fallbackType?.id || null;
                }
                setSelectedType(autoType);
            }
        } else {
            setTypeOptions([]);
        }
    };
    const handleBrandChange = (option) => {
        const brandValue = option?.value?.trim() || '';
        if (selectedBrand?.value !== brandValue) {
            setSelectedType(null);
        }
        setSelectedBrand(option);
        if (!selectedItemName || !selectedModel || !option) return;
        const selectedItem = poItemName.find(
            item =>
                item.category?.toLowerCase() === selectedCategory?.value.toLowerCase() &&
                item.itemName === selectedItemName.value
        );
        if (!selectedItem) return;
        const isUnmappedCategory = !mappedCategories.some(cat =>
            cat.label.toLowerCase() === selectedCategory?.value.toLowerCase()
        );
        if (isUnmappedCategory) return;
        const filtered = selectedItem.otherPOEntityList.filter(
            e => e.modelName?.trim() === selectedModel.value?.trim() &&
                e.brandName?.trim() === brandValue
        );
        const types = [...new Set(filtered.map(e => e.typeColor?.trim()).filter(Boolean))];
        const typeOpts = types.map(val => {
            const matched = poType.find(
                t =>
                    t.typeColor?.trim().toLowerCase() === val.toLowerCase() &&
                    t.category?.toLowerCase() === selectedCategory?.value.toLowerCase()
            );
            return {
                value: val,
                label: val,
                id: matched?.id || null
            };
        });
        setTypeOptions(typeOpts);
        if (typeOpts.length === 1) {
            const autoType = typeOpts[0];
            if (!autoType.id) {
                const fallback = poType.find(t =>
                    t.typeColor?.trim().toLowerCase() === autoType.value.toLowerCase() &&
                    t.category?.toLowerCase() === selectedCategory?.value.toLowerCase()
                );
                autoType.id = fallback?.id || null;
            }
            setSelectedType(autoType);
        }
    };
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '45px',
            borderWidth: '2px',
            borderRadius: '8px',
            borderColor: state.isFocused
                ? 'rgba(191, 152, 83, 0.35)'
                : 'rgba(191, 152, 83, 0.35)',
            boxShadow: state.isFocused ? '0 0 0 1px #FAF6ED' : 'none',
            '&:hover': {
                borderColor: 'rgba(191, 152, 83, 0.5)',
            }
        }),
    };
    const handleAddItem = () => {
        if (
            selectedItemName &&
            selectedCategory &&
            selectedType &&
            quantity
        ) {
            const quantityNumber = Number(quantity);
            const itemLabel = selectedItemName.label;
            const itemId = selectedItemName.id ?? null;
            const categoryLabel = selectedCategory.value;
            const categoryId = selectedCategory.id ?? null;
            const modelLabel = selectedModel?.label || '';
            const modelId = selectedModel?.id ?? null;
            const brandLabel = selectedBrand?.label || '';
            const brandId = selectedBrand?.id ?? null;
            const typeLabel = selectedType.label;
            const typeId = selectedType.id ?? null;
            const existingIndex = items.findIndex(
                item =>
                    item.itemName === itemLabel &&
                    item.category === categoryLabel &&
                    item.model === modelLabel &&
                    item.brand === brandLabel &&
                    item.type === typeLabel
            );
            if (existingIndex !== -1) {
                const updatedItems = [...items];
                const existingItem = updatedItems[existingIndex];
                const updatedQuantity = Number(existingItem.quantity) + quantityNumber;
                updatedItems[existingIndex] = {
                    ...existingItem,
                    quantity: updatedQuantity.toString(),
                };
                setItems(updatedItems);
            } else {
                setItems([
                    ...items,
                    {
                        itemName: itemLabel,
                        itemId: itemId,
                        category: categoryLabel,
                        categoryId: categoryId,
                        model: modelLabel,
                        modelId: modelId,
                        brand: brandLabel,
                        brandId: brandId,
                        type: typeLabel,
                        typeId: typeId,
                        quantity,
                        amount: 0,
                    },
                ]);
            }
            sessionStorage.removeItem('selectedItemName');
            sessionStorage.removeItem('selectedModel');
            sessionStorage.removeItem('selectedBrand');
            sessionStorage.removeItem('selectedType');
            sessionStorage.removeItem('quantity');
            setSelectedItemName(null);
            setSelectedModel(null);
            setSelectedBrand(null);
            setSelectedType(null);
            setQuantity('');
            setGroupName('');
            const categoryValue = selectedCategory?.value || '';
            if (categoryValue) {
                const categoryMatchedModels = poModel
                    .filter(item => item.category?.toLowerCase() === categoryValue.toLowerCase())
                    .map(item => ({
                        value: item.model?.trim(),
                        label: item.model?.trim(),
                        id: item.id
                    }))
                    .filter(item => item.value);
                setModelOptions(categoryMatchedModels);
            } else {
                setModelOptions([]);
            }
        }
    };
    const generatePO = async () => {
        if (!selectedVendor?.id) {
            alert("Please select a Vendor before generating a PO.");
            return;
        }
        try {
            const currentPoNo = await fetchNextPoNumberForVendor(selectedVendor.id);
            setPoNo(currentPoNo);
            const payload = {
                vendor_id: selectedVendor?.id,
                client_id: selectedSite?.id,
                date: date,
                site_incharge_id: selectedIncharge?.id,
                site_incharge_mobile_number: selectedIncharge?.mobileNumber || "",
                eno: currentPoNo,
                created_by: username,
                purchaseTable: items.map(item => ({
                    item_id: item.itemId,
                    category_id: item.categoryId,
                    model_id: item.modelId,
                    brand_id: item.brandId,
                    type_id: item.typeId,
                    quantity: item.quantity,
                    amount: item.amount,
                }))
            };
            const response = await fetch("https://backendaab.in/aabuildersDash/api/purchase_orders/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const result = await response.json();
                generatePDF(payload);
                window.location.reload();
                alert("Purchase Order Generated!");
            } else {
                const error = await response.text();
                console.error("Error:", error);
                alert("Failed to save Purchase Order");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Server not responding");
        }
    };
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const grandTotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    useEffect(() => {
        if (selectedCategory?.value && poItemName.length > 0) {
            const fullOption = categoryOptions.find(opt => opt.value === selectedCategory.value);
            if (fullOption) {
                handleCategoryChange(fullOption);
            }
        }
    }, [selectedCategory, poItemName]);
    useEffect(() => {
        if (
            hasRestoredSession &&
            selectedCategory &&
            itemNameOptions.length > 0 &&
            selectedItemName?.value &&
            poItemName.length > 0
        ) {
            handleItemNameChange(selectedItemName);
        }
    }, [hasRestoredSession, selectedCategory, itemNameOptions, selectedItemName, poItemName]);
    const generatePDF = (payload) => {
        const doc = new jsPDF();
        const findNameById = (options, id, key) => {
            const match = options.find(opt => opt.id == id);
            return match ? match[key] : '';
        };
        const vendorName = findNameById(vendorNameOptions, payload.vendor_id, "label");
        const clientName = findNameById(siteOptions, payload.client_id, "label");
        const siteInchargeName = findNameById(siteInchargeOptions, payload.site_incharge_id, "label");
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 41.8);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("PURCHASE ORDER", 12, 22);
        doc.text(`PO No :`, 12, 28);
        doc.setFontSize(16);
        doc.text("AA BUILDERS", 105, 17, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("181 Madurai Road, Srivilliputtur - 626 125", 105, 28, { align: "center" });
        doc.line(10, 30, 200, 30);
        doc.setFont("helvetica", "bold");
        doc.text(`VENDOR:`, 12, 37);
        doc.setFont("helvetica", "normal");
        doc.text(`# ${payload.eno}`, 35, 28);
        doc.text(vendorName || "", 35, 37);
        doc.setFont("helvetica", "bold");
        doc.text(`DATE:`, 12, 43);
        doc.setFont("helvetica", "normal");
        doc.text(formatDateOnly(payload.date) || "", 35, 43);
        doc.setFont("helvetica", "bold");
        doc.text("SITE NAME:", 107, 37);
        doc.text("Site Incharge:", 104, 43);
        doc.setFont("helvetica", "normal");
        doc.text(clientName || "", 130, 37);
        doc.text(siteInchargeName || "", 130, 43);
        if (payload.site_incharge_mobile_number) {
            doc.setFont("helvetica", "bold");
            doc.text("Phone:", 115, 49);
            doc.setFont("helvetica", "normal");
            doc.text(`+91 ${payload.site_incharge_mobile_number}`, 130, 49);
        }
        const tableBody = payload.purchaseTable.map((item, index) => [
            index + 1,
            findNameById(poItemName, item.item_id, "itemName"),
            findNameById(categoryOptions, item.category_id, "label"),
            findNameById(poModel, item.model_id, "model"),
            findNameById(poBrand, item.brand_id, "brand"),
            findNameById(poType, item.type_id, "typeColor"),
            item.quantity || "",
            item.amount || ""
        ]);
        while (tableBody.length < 24) {
            tableBody.push(["", "", "", "", "", "", "", ""]);
        }
        const totalQty = payload.purchaseTable.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const totalAmount = payload.purchaseTable.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        tableBody.push([
            "", "", "", "", "",
            { content: `TOTAL`, styles: { fontStyle: "bold", halign: "center" } },
            { content: `${totalQty}`, styles: { fontStyle: "bold", halign: "center" } },
            { content: `${totalAmount}`, styles: { fontStyle: "bold", halign: "center" } }
        ]);
        doc.autoTable({
            startY: 52,
            margin: { left: 10, right: 10 },
            tableWidth: 190,
            head: [["SNO", "ITEM NAME", "CATEGORY", "MODEL", "BRAND", "TYPE", "QTY", "PRICE"]],
            body: tableBody,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 2,
                textColor: 0,
                lineColor: [100, 100, 100],
                lineWidth: 0.2,
                valign: 'middle',
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: "bold",
            },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 50 },
                2: { cellWidth: 30 },
                3: { cellWidth: 28 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 13 },
                7: { cellWidth: 17 }
            },
            didDrawPage: function () {
                const pageHeight = doc.internal.pageSize.height;
                const pageWidth = doc.internal.pageSize.width;
                doc.setFontSize(5);
                doc.text(`Created By: ${payload.created_by || ''}`, 14, pageHeight - 10);
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                let hours = now.getHours();
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
                doc.text(`Date: ${formattedDateTime}`, pageWidth - 60, pageHeight - 10);
            }
        });
        doc.save(`# ${payload.eno} - ${formatDateOnly(payload.date)}-${clientName}.pdf`);
    };
    useEffect(() => {
        if (
            hasRestoredSession &&
            selectedItemName &&
            selectedModel &&
            modelOptions.length > 0 &&
            poItemName.length > 0
        ) {
            handleModelChange(selectedModel);
        }
    }, [hasRestoredSession, selectedModel, modelOptions, selectedItemName, poItemName]);
    useEffect(() => {
        if (
            hasRestoredSession &&
            selectedItemName &&
            selectedModel &&
            selectedBrand &&
            brandOptions.length > 0 &&
            poItemName.length > 0
        ) {
            handleBrandChange(selectedBrand);
        }
    }, [hasRestoredSession, selectedBrand, brandOptions, selectedModel, selectedItemName, poItemName]);
    return (
        <div>
            <div className="p-6 border-collapse bg-[#FFFFFF] rounded-md ml-8 mr-8 [@media(min-width:1450)]w-[1900px]">
                <div className="flex flex-wrap [@media(min-width:1300px)]:gap-6 gap-3 ">
                    <div className="mt-2 text-left">
                        <h4 className="font-bold [@media(min-width:1300px)]:mb-2 ">Vendor Name</h4>
                        <Select
                            value={vendorNameOptions.find(option => option.value === selectedVendor?.value)}
                            onChange={async (selectedOption) => {
                                const value = selectedOption?.id || '';
                                setSelectedVendor(selectedOption);
                                if (value) {
                                    const nextPoNumber = await fetchNextPoNumberForVendor(value);
                                    setPoNo(nextPoNumber);
                                } else {
                                    setPoNo(0);
                                }
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
                        <div className="flex justify-between items-center [@media(min-width:1300px)]:mb-2">
                            <h4 className="font-bold ">Project Name</h4>
                            {selectedSite && (
                                <span className="text-[#E4572E] text-sm font-bold">
                                    PID: {selectedSite.sNo}
                                </span>
                            )}
                        </div>
                        <Select
                            value={selectedSite ? siteOptions.find(option => option.value === selectedSite.value) : null}
                            onChange={(selectedOption) => setSelectedSite(selectedOption)}
                            options={siteOptions}
                            placeholder="Select Site Name..."
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
                        <h4 className=" mt-2.5 font-bold">PO.No</h4>
                        <input
                            value={poNo}
                            readOnly
                            className="border-2 border-[#BF9853] border-opacity-35 focus:outline-none bg-[#F2F2F2] rounded-lg [@media(min-width:1500px)]:w-44 [@media(min-width:640px)]:w-20 w-[149px] h-[45px] [@media(min-width:1300px)]:mt-2 px-2 py-2 appearance-none no-spinner"
                        />
                    </div>
                    <div className="text-left ">
                        <div className="flex justify-between items-center [@media(min-width:1300px)]:mb-2 mt-2">
                            <h4 className="font-bold">Project Incharge</h4>
                            {selectedIncharge && (
                                <span className="text-[#E4572E] text-sm font-bold">
                                    +91 {selectedIncharge.mobileNumber}
                                </span>
                            )}
                        </div>
                        <Select
                            options={siteInchargeOptions}
                            value={selectedIncharge}
                            onChange={handleChange}
                            isSearchable
                            isClearable
                            placeholder="Select Site Incharge"
                            className="[@media(min-width:1500px)]:w-[370px] w-[250px]"
                            styles={customStyles}
                        />
                    </div>
                </div>
            </div>
            {selectedVendor && selectedSite && (
                <div className="p-6 border-collapse bg-[#FFFFFF] rounded-md ml-8 mr-8 mt-3 [@media(min-width:1450)]w-[1900px]">
                    <div className="lg:flex  lg:gap-10 gap-8">
                        <div className="[@media(min-width:1300px)]:space-y-6 text-left">
                            <div>
                                <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Category</label>
                                <Select
                                    ref={categoryRef}
                                    value={categoryOptions.find(opt => opt.value === selectedCategory?.value)}
                                    onChange={handleCategoryChange}
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
                                    className="[@media(min-width:1500px)]:w-[330px] w-[300px] h-[45px]"
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
                                    className="[@media(min-width:1500px)]:w-[330px] w-[300px] h-[45px]"
                                />
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
                                    className="[@media(min-width:1500px)]:w-[330px] w-[300px] h-[45px]"
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
                                    className="[@media(min-width:1500px)]:w-[330px] w-[300px] h-[45px]"
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
                                    className="[@media(min-width:1500px)]:w-[330px] w-[300px] h-[45px]"
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
                                    className="lg:w-[169px] w-[300px] h-[45px] pl-3 border-2 border-[#BF9853] border-opacity-[20%] focus:outline-none rounded-lg no-spinner"
                                />
                            </div>
                            <button onClick={handleAddItem} className="w-[80px] h-[35px] mt-2 text-white rounded bg-[#BF9853]">
                                Add
                            </button>
                        </div>
                        <div className='mt-3 overflow-auto no-scrollbar'>
                            <div className="text-sm font-bold mb-2 text-right">Export PDF</div>
                            <div
                                ref={scrollRef}
                                className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] select-none overflow-auto"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}>
                                <div className="min-w-[800px] md:min-w-full ">
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
                                                <th className="py-2 px-3">Activity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={index} className="border-b border-[#e6e1d1]">
                                                    <td className="py-2 px-3 font-semibold">{index + 1}</td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index ? (
                                                            <Select
                                                                value={editedItem.itemName ? { label: editedItem.itemName, value: editedItem.itemName } : null}
                                                                onChange={(option) => {
                                                                    const selectedItemName = option?.value || "";
                                                                    const itemCategoryLower = item.category?.toLowerCase() || "";
                                                                    let updated = {
                                                                        ...editedItem,
                                                                        itemName: selectedItemName,
                                                                        model: "",
                                                                        brand: "",
                                                                        type: "",
                                                                    };
                                                                    const selectedItem = poItemName.find(
                                                                        p => (p.category?.toLowerCase() || "") === itemCategoryLower &&
                                                                            p.itemName === selectedItemName
                                                                    );
                                                                    if (!selectedItem) {
                                                                        setModelOptions([]);
                                                                        setBrandOptions([]);
                                                                        setTypeOptions([]);
                                                                        setEditedItem(updated);
                                                                        return;
                                                                    }
                                                                    const isUnmappedCategory = !mappedCategories.some(cat =>
                                                                        cat.label.toLowerCase() === itemCategoryLower
                                                                    );
                                                                    if (isUnmappedCategory) {
                                                                        const models = poModel
                                                                            .filter(m => m.category?.toLowerCase() === itemCategoryLower)
                                                                            .map(m => ({
                                                                                value: m.model?.trim(),
                                                                                label: m.model?.trim(),
                                                                                id: m.id
                                                                            }))
                                                                            .filter(m => m.value);
                                                                        setModelOptions(models);
                                                                        const brands = poBrand
                                                                            .filter(b => !b.category || b.category.toLowerCase() === itemCategoryLower)
                                                                            .map(b => ({
                                                                                value: b.brand?.trim(),
                                                                                label: b.brand?.trim(),
                                                                                id: b.id
                                                                            }))
                                                                            .filter(b => b.value);
                                                                        setBrandOptions(brands);
                                                                        const types = poType
                                                                            .filter(t => t.category?.toLowerCase() === itemCategoryLower)
                                                                            .map(t => ({
                                                                                value: t.typeColor?.trim(),
                                                                                label: t.typeColor?.trim(),
                                                                                id: t.id
                                                                            }))
                                                                            .filter(t => t.value);
                                                                        setTypeOptions(types);
                                                                        setEditedItem(updated);
                                                                        return;
                                                                    }
                                                                    const otherList = selectedItem.otherPOEntityList || [];
                                                                    const models = [...new Set(otherList.map(e => e.modelName?.trim()).filter(Boolean))];
                                                                    const modelOpts = models.map(modelName => {
                                                                        const match = poModel.find(m =>
                                                                            m.model?.trim().toLowerCase() === modelName.toLowerCase() &&
                                                                            m.category?.toLowerCase() === itemCategoryLower
                                                                        );
                                                                        return {
                                                                            value: modelName,
                                                                            label: modelName,
                                                                            id: match?.id || null
                                                                        };
                                                                    });
                                                                    setModelOptions(modelOpts);
                                                                    if (models.length === 1) {
                                                                        updated.model = models[0];
                                                                        const filteredModel = otherList.filter(e => e.modelName === updated.model);
                                                                        const brands = [...new Set(filteredModel.map(e => e.brandName?.trim()).filter(Boolean))];
                                                                        const brandOpts = brands.map(brand => {
                                                                            const brandMatch = poBrand.find(b =>
                                                                                b.brand?.trim().toLowerCase() === brand.toLowerCase() &&
                                                                                (!b.category || b.category?.toLowerCase() === itemCategoryLower)
                                                                            );
                                                                            return {
                                                                                value: brand,
                                                                                label: brand,
                                                                                id: brandMatch?.id || null
                                                                            };
                                                                        });
                                                                        setBrandOptions(brandOpts);
                                                                        if (brands.length === 1) {
                                                                            updated.brand = brands[0];
                                                                            const filteredBrand = filteredModel.filter(e => e.brandName === updated.brand);
                                                                            const types = [...new Set(filteredBrand.map(e => e.typeColor?.trim()).filter(Boolean))];
                                                                            const typeOpts = types.map(type => {
                                                                                const typeMatch = poType.find(
                                                                                    t =>
                                                                                        t.typeColor?.trim().toLowerCase() === type.toLowerCase() &&
                                                                                        t.category?.toLowerCase() === itemCategoryLower
                                                                                );
                                                                                return {
                                                                                    value: type,
                                                                                    label: type,
                                                                                    id: typeMatch?.id || null
                                                                                };
                                                                            });
                                                                            setTypeOptions(typeOpts);
                                                                            if (types.length === 1) {
                                                                                updated.type = types[0];
                                                                            }
                                                                        } else {
                                                                            setTypeOptions([]);
                                                                        }
                                                                    } else {
                                                                        setBrandOptions([]);
                                                                        setTypeOptions([]);
                                                                    }
                                                                    setEditedItem(updated);
                                                                }}
                                                                options={poItemName
                                                                    .filter(p => (p.category?.toLowerCase() || "") === (item.category?.toLowerCase() || ""))
                                                                    .map(p => ({ label: p.itemName, value: p.itemName, id: p.id }))
                                                                }
                                                                isSearchable
                                                                isClearable
                                                                menuPortalTarget={document.body}
                                                                styles={customStyles}
                                                                className="w-[150px]"
                                                            />
                                                        ) : (
                                                            item.itemName
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold">{item.category}</td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index ? (
                                                            <Select
                                                                value={editedItem.model ? { label: editedItem.model, value: editedItem.model } : null}
                                                                onChange={(option) => {
                                                                    const selectedModel = option?.value?.trim() || "";
                                                                    const itemCategoryLower = item.category?.toLowerCase() || "";
                                                                    let updated = {
                                                                        ...editedItem,
                                                                        model: selectedModel,
                                                                        brand: "",
                                                                        type: ""
                                                                    };
                                                                    const isUnmappedCategory = !mappedCategories.some(cat =>
                                                                        cat.label.toLowerCase() === itemCategoryLower
                                                                    );
                                                                    if (!editedItem.itemName) {
                                                                        const matchedItem = poItemName.find(p =>
                                                                            p.category?.toLowerCase() === itemCategoryLower &&
                                                                            p.otherPOEntityList?.some(e =>
                                                                                e.modelName?.trim().toLowerCase() === selectedModel.toLowerCase()
                                                                            )
                                                                        );
                                                                        if (matchedItem) {
                                                                            updated.itemName = matchedItem.itemName;
                                                                        }
                                                                    }
                                                                    const selectedItem = poItemName.find(
                                                                        p =>
                                                                            p.category?.toLowerCase() === itemCategoryLower &&
                                                                            p.itemName === updated.itemName
                                                                    );
                                                                    if (!selectedItem) {
                                                                        setBrandOptions([]);
                                                                        setTypeOptions([]);
                                                                        setEditedItem(updated);
                                                                        return;
                                                                    }
                                                                    const filtered = selectedItem.otherPOEntityList?.filter(
                                                                        e => e.modelName?.trim().toLowerCase() === selectedModel.toLowerCase()
                                                                    ) || [];
                                                                    if (isUnmappedCategory) {
                                                                        const brands = poBrand
                                                                            .filter(b => !b.category || b.category.toLowerCase() === itemCategoryLower)
                                                                            .map(b => ({
                                                                                value: b.brand?.trim(),
                                                                                label: b.brand?.trim(),
                                                                                id: b.id
                                                                            }))
                                                                            .filter(b => b.value);
                                                                        setBrandOptions(brands);
                                                                        const types = poType
                                                                            .filter(t => t.category?.toLowerCase() === itemCategoryLower)
                                                                            .map(t => ({
                                                                                value: t.typeColor?.trim(),
                                                                                label: t.typeColor?.trim(),
                                                                                id: t.id
                                                                            }))
                                                                            .filter(t => t.value);
                                                                        setTypeOptions(types);
                                                                        setEditedItem(updated);
                                                                        return;
                                                                    }
                                                                    const brands = [...new Set(filtered.map(e => e.brandName?.trim()).filter(Boolean))];
                                                                    const brandOpts = brands.map(b => {
                                                                        const brandMatch = poBrand.find(br =>
                                                                            br.brand?.trim().toLowerCase() === b.toLowerCase() &&
                                                                            (!br.category || br.category.toLowerCase() === itemCategoryLower)
                                                                        );
                                                                        return {
                                                                            value: b,
                                                                            label: b,
                                                                            id: brandMatch?.id || null
                                                                        };
                                                                    });
                                                                    setBrandOptions(brandOpts);
                                                                    if (brands.length === 1) {
                                                                        const selectedBrand = brands[0];
                                                                        updated.brand = selectedBrand;
                                                                        const filteredBrand = filtered.filter(e => e.brandName?.trim() === selectedBrand);
                                                                        const types = [...new Set(filteredBrand.map(e => e.typeColor?.trim()).filter(Boolean))];
                                                                        const typeOpts = types.map(t => {
                                                                            const match = poType.find(tp =>
                                                                                tp.typeColor?.trim().toLowerCase() === t.toLowerCase() &&
                                                                                tp.category?.toLowerCase() === itemCategoryLower
                                                                            );
                                                                            return {
                                                                                value: t,
                                                                                label: t,
                                                                                id: match?.id || null
                                                                            };
                                                                        });
                                                                        setTypeOptions(typeOpts);
                                                                        if (types.length === 1) {
                                                                            updated.type = types[0];
                                                                        }
                                                                    } else {
                                                                        setTypeOptions([]);
                                                                    }
                                                                    setEditedItem(updated);
                                                                }}
                                                                options={modelOptions}
                                                                isSearchable
                                                                isClearable
                                                                menuPortalTarget={document.body}
                                                                styles={customStyles}
                                                                className="w-[150px]"
                                                            />
                                                        ) : (
                                                            item.model
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index ? (
                                                            <Select
                                                                value={
                                                                    editedItem.brand
                                                                        ? {
                                                                            label: editedItem.brand,
                                                                            value: editedItem.brand,
                                                                            id: poBrand.find(b =>
                                                                                b.brand?.trim().toLowerCase() === editedItem.brand?.toLowerCase() &&
                                                                                (!b.category || b.category?.toLowerCase() === item.category?.toLowerCase())
                                                                            )?.id || null
                                                                        }
                                                                        : null
                                                                }
                                                                onChange={(option) => {
                                                                    const selectedBrand = option?.value || "";
                                                                    let updated = {
                                                                        ...editedItem,
                                                                        brand: selectedBrand,
                                                                        type: "",
                                                                    };
                                                                    if (!editedItem.itemName || !editedItem.model || !selectedBrand) {
                                                                        setTypeOptions([]);
                                                                        setEditedItem(updated);
                                                                        return;
                                                                    }
                                                                    const itemCategoryLower = item.category?.toLowerCase() || "";
                                                                    const isUnmappedCategory = !mappedCategories.some(cat =>
                                                                        cat.label.toLowerCase() === itemCategoryLower
                                                                    );
                                                                    if (isUnmappedCategory) {
                                                                        const mappedTypes = new Set();
                                                                        poItemName.forEach(item => {
                                                                            item.otherPOEntityList?.forEach(entry => {
                                                                                if (entry.typeColor?.trim()) mappedTypes.add(entry.typeColor.trim().toLowerCase());
                                                                            });
                                                                        });
                                                                        const matchedTypes = poType
                                                                            .filter(t => (t.category?.toLowerCase() || "") === itemCategoryLower)
                                                                            .map(item => ({
                                                                                value: item.typeColor?.trim(),
                                                                                label: item.typeColor?.trim(),
                                                                                id: item.id
                                                                            }))
                                                                            .filter(item => item.value);
                                                                        const typeOpts = matchedTypes.map(val => ({ value: val, label: val }));
                                                                        setTypeOptions(matchedTypes);
                                                                        if (typeOpts.length === 1) {
                                                                            updated.type = typeOpts[0].value;
                                                                        }
                                                                        setEditedItem(updated);
                                                                        return;
                                                                    }
                                                                    const selectedItem = poItemName.find(
                                                                        p =>
                                                                            p.category?.toLowerCase() === itemCategoryLower &&
                                                                            p.itemName === editedItem.itemName
                                                                    );
                                                                    const filtered = selectedItem?.otherPOEntityList?.filter(
                                                                        e =>
                                                                            e.modelName === editedItem.model &&
                                                                            e.brandName === selectedBrand
                                                                    ) || [];
                                                                    const types = [...new Set(filtered.map(e => e.typeColor?.trim()).filter(Boolean))];
                                                                    const typeOpts = types.map(typeColor => {
                                                                        const typeMatch = poType.find(
                                                                            t =>
                                                                                t.typeColor?.trim().toLowerCase() === typeColor.toLowerCase() &&
                                                                                t.category?.toLowerCase() === itemCategoryLower
                                                                        );
                                                                        return {
                                                                            value: typeColor,
                                                                            label: typeColor,
                                                                            id: typeMatch?.id || null
                                                                        };
                                                                    });
                                                                    setTypeOptions(typeOpts);
                                                                    if (typeOpts.length === 1) {
                                                                        updated.type = typeOpts[0].value;
                                                                    }
                                                                    setEditedItem(updated);
                                                                }}
                                                                options={brandOptions}
                                                                isSearchable
                                                                isClearable
                                                                menuPortalTarget={document.body}
                                                                styles={customStyles}
                                                                className="w-[150px]"
                                                            />
                                                        ) : (
                                                            item.brand
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index ? (
                                                            <Select
                                                                value={editedItem.type ? typeOptions.find(opt => opt.value === editedItem.type) : null}
                                                                onChange={(option) =>
                                                                    setEditedItem((prev) => ({ ...prev, type: option ? option.value : "" }))
                                                                }
                                                                options={typeOptions}
                                                                isSearchable
                                                                isClearable
                                                                menuPortalTarget={document.body}
                                                                styles={customStyles}
                                                                className="w-[150px]"
                                                            />
                                                        ) : (
                                                            item.type
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index ? (
                                                            <input
                                                                type="number"
                                                                value={editedItem.quantity}
                                                                onChange={(e) =>
                                                                    setEditedItem((prev) => ({ ...prev, quantity: e.target.value }))
                                                                }
                                                                className="w-[80px] h-[35px] pl-2 border-2 border-[#FAF6ED] rounded no-spinner"
                                                            />
                                                        ) : (
                                                            item.quantity
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index ? (
                                                            <input
                                                                type="number"
                                                                value={editedItem.amount}
                                                                onChange={(e) =>
                                                                    setEditedItem((prev) => ({ ...prev, amount: e.target.value }))
                                                                }
                                                                className="w-[80px] h-[35px] pl-2 border-2 border-[#FAF6ED] rounded no-spinner"
                                                            />
                                                        ) : (
                                                            item.amount
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 font-semibold">
                                                        {editIndex === index
                                                            ? (Number(editedItem.quantity) * Number(editedItem.amount)).toString()
                                                            : item.totalAmount}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="flex space-x-3">
                                                            {editIndex === index ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            const updatedItems = [...items];
                                                                            const quantity = Number(editedItem.quantity);
                                                                            const amount = Number(editedItem.amount);
                                                                            const totalAmount = (quantity * amount).toString();
                                                                            const selectedModel = modelOptions.find(opt => opt.value === editedItem.model);
                                                                            const selectedBrand = brandOptions.find(opt => opt.value === editedItem.brand);
                                                                            const selectedType = typeOptions.find(opt => opt.value === editedItem.type);
                                                                            updatedItems[editIndex] = {
                                                                                ...editedItem,
                                                                                modelId: selectedModel?.id || null,
                                                                                brandId: selectedBrand?.id || null,
                                                                                typeId: selectedType?.id || null,
                                                                                totalAmount,
                                                                            };
                                                                            setItems(updatedItems);
                                                                            setEditIndex(null);
                                                                        }}
                                                                        className="text-green-600 text-sm"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button onClick={() => setEditIndex(null)} className="text-red-600 text-sm">
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditIndex(index);
                                                                            setEditedItem({ ...item });
                                                                            const itemCategoryLower = item.category?.toLowerCase() || "";
                                                                            const selectedItemName = item.itemName;
                                                                            const selectedModel = item.model;
                                                                            const selectedBrand = item.brand;
                                                                            const modelOpts = poModel
                                                                                .filter(m => (m.category?.toLowerCase() || "") === itemCategoryLower)
                                                                                .map(m => ({
                                                                                    value: m.model?.trim(),
                                                                                    label: m.model?.trim(),
                                                                                    id: m.id
                                                                                }))
                                                                                .filter(m => m.value);
                                                                            setModelOptions(modelOpts);
                                                                            const selectedItem = poItemName.find(p =>
                                                                                (p.category?.toLowerCase() || "") === itemCategoryLower &&
                                                                                p.itemName === selectedItemName
                                                                            );
                                                                            if (!selectedItem) {
                                                                                setBrandOptions([]);
                                                                                setTypeOptions([]);
                                                                                return;
                                                                            }
                                                                            const isUnmappedCategory = !mappedCategories.some(cat =>
                                                                                cat.label.toLowerCase() === itemCategoryLower
                                                                            );
                                                                            if (isUnmappedCategory) {
                                                                                const matchedBrands = poBrand
                                                                                    .filter(p => !p.category || p.category.toLowerCase() === itemCategoryLower)
                                                                                    .map(b => ({
                                                                                        value: b.brand?.trim(),
                                                                                        label: b.brand?.trim(),
                                                                                        id: b.id
                                                                                    }))
                                                                                    .filter(b => b.value);
                                                                                setBrandOptions(matchedBrands);
                                                                                const matchedTypes = poType
                                                                                    .filter(t => t.category?.toLowerCase() === itemCategoryLower)
                                                                                    .map(t => ({
                                                                                        value: t.typeColor?.trim(),
                                                                                        label: t.typeColor?.trim(),
                                                                                        id: t.id
                                                                                    }))
                                                                                    .filter(t => t.value);
                                                                                setTypeOptions(matchedTypes);
                                                                                return;
                                                                            }
                                                                            const filteredModelItems = selectedItem.otherPOEntityList?.filter(e =>
                                                                                e.modelName?.trim().toLowerCase() === selectedModel?.toLowerCase()
                                                                            ) || [];
                                                                            const brands = [...new Set(filteredModelItems.map(e => e.brandName?.trim()).filter(Boolean))];
                                                                            const brandOpts = brands.map(brandName => {
                                                                                const brandMatch = poBrand.find(
                                                                                    b => b.brand?.trim().toLowerCase() === brandName.toLowerCase() &&
                                                                                        (!b.category || b.category.toLowerCase() === itemCategoryLower)
                                                                                );
                                                                                return {
                                                                                    value: brandName,
                                                                                    label: brandName,
                                                                                    id: brandMatch?.id || null
                                                                                };
                                                                            });
                                                                            setBrandOptions(brandOpts);
                                                                            const filteredBrandItems = filteredModelItems.filter(e =>
                                                                                e.brandName?.trim().toLowerCase() === selectedBrand?.toLowerCase()
                                                                            );
                                                                            const types = [...new Set(filteredBrandItems.map(e => e.typeColor?.trim()).filter(Boolean))];
                                                                            const typeOpts = types.map(typeColor => {
                                                                                const typeMatch = poType.find(
                                                                                    t => t.typeColor?.trim().toLowerCase() === typeColor.toLowerCase() &&
                                                                                        t.category?.toLowerCase() === itemCategoryLower
                                                                                );
                                                                                return {
                                                                                    value: typeColor,
                                                                                    label: typeColor,
                                                                                    id: typeMatch?.id || null
                                                                                };
                                                                            });
                                                                            setTypeOptions(typeOpts);
                                                                        }}
                                                                    >
                                                                        <img src={edit} alt="edit" className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => { const updatedItems = items.filter((_, i) => i !== index); setItems(updatedItems);}}>
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-white font-bold border border-r-[#BF9853] border-t-[#BF9853] border-b-[#BF9853] border-opacity-15">
                                                <td className="py-2 font-semibold text-base pl-8 border-[#BF9853] border-r" colSpan="6">Total</td>
                                                <td className="py-2 font-semibold text-base pl-3 border-[#BF9853] border-r">{totalQuantity}</td>
                                                <td className="py-2 font-semibold text-base pl-3 border-[#BF9853] border-r">{totalAmount}</td>
                                                <td className="py-2 font-semibold text-base pl-3">{grandTotal}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex lg:justify-end gap-4 mt-4">
                                <button
                                    className="bg-[#BF9853] text-white w-[98px] h-[36px] px-6 rounded"
                                    onClick={() => {
                                        const confirmClear = window.confirm("Are you sure you want to clear the table?");
                                        if (confirmClear) {
                                            setItems([]);
                                            setEditIndex(null);
                                        }
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-[#BF9853] text-white w-[137px] h-[36px] px-5 rounded"
                                    onClick={generatePO}
                                >
                                    Generate PO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default PurchaseOrder;