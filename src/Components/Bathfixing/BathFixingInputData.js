import React, { useState, useEffect, useCallback } from "react";
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import download from '../Images/Download.svg';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import attach from '../Images/Attachfile.svg';

const BathTableView = () => {
    const [message, setMessage] = useState('');
    console.log(message);
    const [itemName, setItemName] = useState("");
    const [itemNameEdit, setItemNameEdit] = useState(null);
    const [brandNameEdit, setBrandNameEdit] = useState(null);
    const [typeEdit, setTypeEdit] = useState(null);
    const [modelEdit, setModelEdit] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [selectedImageFileName, setSelectedImageFileName] = useState("");
    const [selectedItemName, setSelectedItemName] = useState('');
    const [selectedBrandName, setSelectedBrandName] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [previewImageEdit, setPreviewImageEdit] = useState(null);
    const [previewTechImage, setPreviewTechImage] = useState(null);
    const [modelImage, setModelImage] = useState(null);
    const [modelImageEdit, setModelImageEdit] = useState(null);
    const [modelTechnicalImage, setModelTechnicalImage] = useState(null);
    const [modelTechnicalImageEdit, setModelTechnicalImageEdit] = useState(null);
    const [itemNames, setItemNames] = useState([]);
    const [brandName, setBrandName] = useState("");
    const [model, setModel] = useState("");
    const [price, setPrice] = useState("");
    const [brandNames, setBrandNames] = useState([]);
    const [type, setType] = useState("");
    const [types, setTypes] = useState([]);
    const [bathModelData, setBathModelData] = useState([]);
    const [brandSearch, setBrandSearch] = useState("");
    const [typeSearch, setTypeSearch] = useState("")
    const [itemSearch, setItemSearch] = useState("");
    const [modelSearch, setModelSearch] = useState("");
    const [isBrandMoalOpen, setIsBrandModalOpen] = useState(false);
    const [isModelModalOpen, setModelModalOpen] = useState(false);
    const [isTypeMoalOpen, setIsTypeModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const openItemModal = () => setIsItemModalOpen(true);
    const closeItemModal = () => setIsItemModalOpen(false);
    const openBrandModal = () => setIsBrandModalOpen(true);
    const closeBrandModel = () => setIsBrandModalOpen(false);
    const openModelModal = () => setModelModalOpen(true);
    const closeModelModal = () => setModelModalOpen(false);
    const openTypeModal = () => setIsTypeModalOpen(true);
    const closeTypeModel = () => setIsTypeModalOpen(false);
    const handleSubmitBrandName = async (e) => {
        e.preventDefault();
        const newBrand = { brandName };
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/brand_names/save", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBrand),
            });
            if (response.ok) {
                setBrandName("");
                alert("Brand name saved successfully!!!")
                closeBrandModel();
                window.location.reload();
            } else {
                console.log("Error saving brand name!!");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleSubmitModelWithDetails = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("brandName", selectedBrandName);
        formData.append("itemName", selectedItemName);
        formData.append("model", model);
        formData.append("price", price);
        formData.append("type", selectedType);
        if (modelImage) formData.append("image", modelImage);
        if (modelTechnicalImage) formData.append("technicalImage", modelTechnicalImage);
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/bath_model/save", {
                method: "POST",
                body: formData,
            });
            if (response.ok){
                window.location.reload();
            }else {
                console.log("Error Saving Model Data's!!")
            }
            
        } catch (error) {
            console.error("Error uploading paint data:", error);
        }
    };
    const handleSubmitType = async (e) => {
        e.preventDefault();
        const newType = { type };
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/bath_types/save", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newType),
            });
            if (response.ok) {
                setType("");
                alert("Brand name saved successfully!!!")
                closeTypeModel();
                window.location.reload();
            } else {
                console.log("Error saving brand name!!");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleSubmitItemName = async (e) => {
        e.preventDefault();
        const newItem = { itemName };
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/bath/item/save", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });
            if (response.ok) {
                setItemName("");
                alert("Item name saved successfully!!!")
                closeBrandModel();
                window.location.reload();
            } else {
                console.log("Error saving brand name!!");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleTypeDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath_types/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTypes(types.filter(item => item.id !== id));
                window.location.reload();
            } else {
                console.error("Failed to delete the area name. Status:", response.status);
                alert("Error deleting the area name. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the area name.");
        }
    };
    const handleBrandNameDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/brand_names/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setBrandNames(brandNames.filter(item => item.id !== id));
                window.location.reload();
            } else {
                console.error("Failed to delete the area name. Status:", response.status);
                alert("Error deleting the area name. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the area name.");
        }
    };
    const handleITemNameDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setItemNames(itemNames.filter(item => item.id !== id));
                window.location.reload();
            } else {
                console.error("Failed to delete the area name. Status:", response.status);
                alert("Error deleting the area name. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the area name.");
        }
    };
    const handleModelDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath_model/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log("Deleted Successfully!!");
                window.location.reload();
            } else {
                console.error("Failed to delete the area name. Status:", response.status);
                alert("Error deleting the area name. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the area name.");
        }
    };
    const handleItemNameEditSave = async () => {
        if (!itemNameEdit) return;
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath/edit/${itemNameEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemName: itemNameEdit.itemName }),
            });

            if (response.ok) {
                console.log(response);
                const result = await response.json();
                console.log("Result:", result);
                setItemNames(itemNames.map(item => (item.id === itemNameEdit.id ? itemNameEdit : item)));
                setItemNameEdit(null);
                window.location.reload();
            } else {
                console.error('Failed to update the item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };
    const handleBrandNameEditSave = async () => {
        if (!brandNameEdit) return;
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/brand_names/edit/${brandNameEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ brandName: brandNameEdit.brandName }),
            });

            if (response.ok) {
                console.log(response);
                const result = await response.json();
                console.log("Result:", result);
                setBrandNames(brandNames.map(item => (item.id === brandNameEdit.id ? brandNameEdit : item)));
                setBrandNameEdit(null);
                window.location.reload();
            } else {
                console.error('Failed to update the item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };
    const handleModelEditSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('brandName', modelEdit.brandName);
            formData.append('itemName', modelEdit.itemName);
            formData.append('model', modelEdit.model);
            formData.append('type', modelEdit.type);
            formData.append('price', modelEdit.price);
            if (modelEdit.imageFile) {
                formData.append('image', modelEdit.imageFile);
            }
            if (modelEdit.technicalImageFile) {
                formData.append('technicalImage', modelEdit.technicalImageFile);
            }
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath_model/edit/${modelEdit.id}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Updated successfully:', data);
                window.location.reload();
                setModelEdit(null);                
            } else {
                console.error('Failed to update');
            }
        } catch (error) {
            console.error('Error submitting edit:', error);
        }
    };
    const handleTypeEditSave = async () => {
        if (!typeEdit) return;
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath_types/edit/${typeEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: typeEdit.type }),
            });
            if (response.ok) {
                console.log(response);
                const result = await response.json();
                console.log("Result:", result);
                setTypes(itemNames.map(item => (item.id === typeEdit.id ? typeEdit : item)));
                setTypeEdit(null);
                window.location.reload();
            } else {
                console.error('Failed to update the item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };
    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    const fetchBathModelData = useCallback(async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/bath_model/getAll");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const bathDataWithImages = await Promise.all(
                data.map(async (model) => {
                    let imageBase64 = model.image;
                    let technicalImageBase64 = model.technicalImage;

                    if (model.image instanceof Blob) {
                        imageBase64 = await convertBlobToBase64(model.image);
                    }

                    if (model.technicalImage instanceof Blob) {
                        technicalImageBase64 = await convertBlobToBase64(model.technicalImage);
                    }

                    return {
                        ...model,
                        image: imageBase64,
                        technicalImage: technicalImageBase64,
                    };
                })
            );
            setBathModelData(bathDataWithImages);
        } catch (error) {
            console.error("Error fetching paint data:", error);
        }
    }, []);
    useEffect(() => {
        fetchBathModelData();
    }, [fetchBathModelData]);
    useEffect(() => {
        fetchBrandNames();
    }, []);
    const fetchBrandNames = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/brand_names/getAll');
            if (response.ok) {
                const data = await response.json();
                setBrandNames(data);
            } else {
                setMessage('Error fetching Brand names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching Brand names.');
        }
    };
    useEffect(() => {
        fetchTypes();
    }, []);
    const fetchTypes = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/bath_types/getAll');
            if (response.ok) {
                const data = await response.json();
                setTypes(data);
            } else {
                setMessage('Error fetching Brand names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching Brand names.');
        }
    };
    useEffect(() => {
        fetchItemNames();
    }, []);
    const fetchItemNames = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/bath/getAll/item');
            if (response.ok) {
                const data = await response.json();
                setItemNames(data);
            } else {
                setMessage('Error fetching item names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching item names.');
        }
    };
    const handelItemName = (item) => {
        setItemNameEdit(item);
    }
    const handleBrandName = (item) => {
        setBrandNameEdit(item);
    }
    const handleType = (item) => {
        setTypeEdit(item);
    }
    const bathModelImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setModelImage(file);
            setSelectedFileName(file.name);
            setPreviewImage(URL.createObjectURL(file));
        }
    };
    const bathModelImageEdit = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setModelEdit((prev) => ({
                    ...prev,
                    image: reader.result,
                    imageFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    const bathModelTechnicalImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setModelTechnicalImage(file);
            setSelectedImageFileName(file.name);
            setPreviewTechImage(URL.createObjectURL(file));
        }
    };
    const bathModelTechnicalImageEdit = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setModelEdit((prev) => ({
                    ...prev,
                    technicalImage: reader.result,
                    technicalImageFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    const filteredBrandNames = brandNames.filter((item) =>
        (item?.brandName || '').toLowerCase().includes((brandSearch || '').toLowerCase())
    );

    const filteredTypes = types.filter((item) =>
        (item?.type || '').toLowerCase().includes((typeSearch || '').toLowerCase())
    );

    const filteredItemNames = itemNames.filter((item) =>
        (item?.itemName || '').toLowerCase().includes((itemSearch || '').toLowerCase())
    );

    const filteredModels = bathModelData.filter((item) =>
        (item?.model || '').toLowerCase().includes((modelSearch || '').toLowerCase())
    );

    return (
        <div className="p-4 bg-white ml-6 mr-8">
            <div className=" flex overflow-y-auto space-x-[1%]">
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex w-[16.8rem] h-12 focus:outline-none"
                            placeholder="Search Item Name..."
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt="search" className=" w-5 h-5" />
                        </button>
                        <button className=" text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openItemModal}>
                            +Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex ">
                        <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
                        <h1 className='mt-1.5 text-sm'>Import file</h1>
                    </button>
                    <button >
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[15rem] ml-[10rem]' />
                    </button>
                    <div className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-80 w-64">
                                <thead className="bg-[#FAF6ED]">
                                    <tr className=" border-b">
                                        <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left w-72 text-xl font-bold">Item Name</th>

                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-80 w-64">
                                <tbody>
                                    {filteredItemNames.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.itemName}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => handelItemName(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleITemNameDelete(item.id)} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex w-[14rem] h-12 focus:outline-none"
                            placeholder="Search Model..."
                            value={modelSearch}
                            onChange={(e) => setModelSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt="search" className=" w-5 h-5" />
                        </button>
                        <button className=" text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openModelModal}>
                            +Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex ">
                        <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
                        <h1 className='mt-1.5 text-sm'>Import file</h1>
                    </button>
                    <button >
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[15rem] ml-[10rem]' />
                    </button>
                    <div className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-72 w-64">
                                <thead className="bg-[#FAF6ED]">
                                    <tr className=" border-b">
                                        <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left w-72 text-xl font-bold">Model</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-72 w-64">
                                <tbody>
                                    {filteredModels.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.model}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => setModelEdit(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4"  onClick={() => handleModelDelete(item.id)}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex w-[16.5rem] h-12 focus:outline-none"
                            placeholder="Search Brand Name..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt="search" className=" w-5 h-5" />
                        </button>
                        <button className=" text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openBrandModal}>
                            +Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex ">
                        <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
                        <h1 className='mt-1.5 text-sm'>Import file</h1>
                    </button>
                    <button >
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[18rem] ml-[15rem]' />
                    </button>
                    <div className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-80 w-64">
                                <thead className="bg-[#FAF6ED]">
                                    <tr className=" border-b">
                                        <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left w-72 text-xl font-bold">Brand Name</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-80 w-64">
                                <tbody>
                                    {filteredBrandNames.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.brandName}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => handleBrandName(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleBrandNameDelete(item.id)} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex w-[16rem] h-12 focus:outline-none"
                            placeholder="Search Type..."
                            value={typeSearch}
                            onChange={(e) => setTypeSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt="search" className=" w-5 h-5" />
                        </button>
                        <button className=" text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openTypeModal}>
                            +Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex ">
                        <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
                        <h1 className='mt-1.5 text-sm'>Import file</h1>
                    </button>
                    <button >
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[18rem] ml-[15rem]' />
                    </button>
                    <div className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-80 w-64">
                                <thead className="bg-[#FAF6ED]">
                                    <tr className=" border-b">
                                        <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left w-72 text-xl font-bold">Type</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-80 w-64">
                                <tbody>
                                    {filteredTypes.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.type}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => handleType(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} onClick={() => handleTypeDelete(item.id)} alt="delete" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {isItemModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeItemModal}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitItemName}>
                            <div className="mb-4">
                                <label className="block text-xl font-medium mb-2 -ml-72">Item Name</label>
                                <input
                                    type="text"
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                    placeholder="Enter Item Name"
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-8 ml-12">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    onClick={closeItemModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isBrandMoalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeBrandModel}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitBrandName}>
                            <div className="mb-4">
                                <label className="block text-xl font-medium mb-2 -ml-[16rem]">Brand Name</label>
                                <input
                                    type="text"
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                    placeholder="Enter Brand Name"
                                    onChange={(e) => setBrandName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-8 ml-12">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    onClick={closeBrandModel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isModelModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md px-2 py-2 w-[36rem] h-[37rem]">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeModelModal}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitModelWithDetails}>
                            <div className="mb-4">
                                <label className="block text-base font-medium mb-2 -ml-[22rem]">Brand Name</label>
                                <select
                                    className="border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 h-12 rounded-lg w-[28rem] focus:outline-none"
                                    value={selectedBrandName}
                                    onChange={(e) => setSelectedBrandName(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Brand</option>
                                    {brandNames.map((brand, idx) => (
                                        <option key={idx} value={brand.brandName}>{brand.brandName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex ml-4">
                                <div className="mb-4">
                                    <label className="block text-base font-medium mb-2 -ml-24">Item Name</label>
                                    <select
                                        className="ml-10 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-12 w-[14rem] focus:outline-none"
                                        value={selectedItemName}
                                        onChange={(e) => setSelectedItemName(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select Item</option>
                                        {itemNames.map((item, idx) => (
                                            <option key={idx} value={item.itemName}>{item.itemName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-base font-medium mb-2 -ml-32">Model</label>
                                    <input
                                        type="text"
                                        className="ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-12 focus:outline-none"
                                        placeholder="Enter Model"
                                        onChange={(e) => setModel(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex">
                                <div className="mb-4 ml-4">
                                    <label className="block text-base font-medium mb-2 -ml-36">Type</label>
                                    <select
                                        className="ml-10 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-12 w-[14rem] focus:outline-none"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>select</option>
                                        {types.map((type, idx) => (
                                            <option key={idx} value={type.type}>{type.type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-base font-medium mb-2 -ml-32">Price</label>
                                    <input
                                        type="text"
                                        className="ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-12 focus:outline-none"
                                        placeholder="Enter Price"
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="ml-14">
                                    <label className="block text-base font-medium mb-2 -ml-44">Image</label>
                                    <img
                                        src={previewImage || '/path-to-placeholder.png'}
                                        alt=""
                                        className="w-[14rem] h-32 object-cover rounded border"
                                    />
                                    <div className="flex items-center space-x-2 -mb-4 mt-2">
                                        <label htmlFor="imageUpload" className="cursor-pointer flex items-center text-orange-600">
                                            <img src={attach} alt="attach" className="w-[0.90rem] h-[0.90rem]" />
                                            <h1 className="text-sm ml-2"> Upload Image</h1>
                                        </label>
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            className="hidden"
                                            onChange={bathModelImage}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-base font-medium mb-2 -ml-24">Technical Image</label>
                                    <img
                                        src={previewTechImage || '/path-to-placeholder.png'}
                                        alt=""
                                        className="w-[13rem] h-32 object-cover rounded border"
                                    />
                                    <div className="flex items-center space-x-2 -mb-4 mt-2">
                                        <label htmlFor="techImageUpload" className="cursor-pointer flex items-center text-orange-600">
                                            <img src={attach} alt="attach" className="w-[0.90rem] h-[0.90rem]" />
                                            <h1 className="text-sm ml-2">Upload Image</h1>
                                        </label>
                                        <input
                                            type="file"
                                            id="techImageUpload"
                                            className="hidden"
                                            onChange={bathModelTechnicalImage}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-10 ml-14">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    onClick={closeModelModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isTypeMoalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeTypeModel}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitType}>
                            <div className="mb-4">
                                <label className="block text-xl font-medium mb-2 -ml-80">Type</label>
                                <input
                                    type="text"
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                    placeholder="Enter Type"
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-8 ml-12">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    onClick={closeTypeModel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {itemNameEdit && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={() => setItemNameEdit(null)}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <label className="block text-xl font-medium mb-2 -ml-72">Item Name</label>
                        <input
                            type="text"
                            value={itemNameEdit.itemName}
                            onChange={(e) => setItemNameEdit({ ...itemNameEdit, itemName: e.target.value })}
                            className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                        />
                        <div className="flex space-x-2 mt-8 ml-12">
                            <button onClick={handleItemNameEditSave} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
                            <button onClick={() => setItemNameEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {brandNameEdit && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={() => setBrandNameEdit(null)}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <label className="block text-xl font-medium mb-2 -ml-[17rem]">Brand Name</label>
                        <input
                            type="text"
                            value={brandNameEdit.brandName}
                            onChange={(e) => setBrandNameEdit({ ...brandNameEdit, brandName: e.target.value })}
                            className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                        />
                        <div className="flex space-x-2 mt-8 ml-12">
                            <button onClick={handleBrandNameEditSave} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
                            <button onClick={() => setBrandNameEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {typeEdit && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={() => setTypeEdit(null)}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <label className="block text-xl font-medium mb-2 -ml-[22rem]">Type</label>
                        <input
                            type="text"
                            value={typeEdit.type}
                            onChange={(e) => setTypeEdit({ ...typeEdit, type: e.target.value })}
                            className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                        />
                        <div className="flex space-x-2 mt-8 ml-12">
                            <button onClick={handleTypeEditSave} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
                            <button onClick={() => setTypeEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {modelEdit && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-md w-[36rem] h-[37rem] px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={() => setModelEdit(null)}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-base font-medium mb-2 -ml-[24rem]">Brand Name</label>
                            <select
                                className="border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 h-12 rounded-lg w-[30rem] focus:outline-none"
                                value={modelEdit.brandName}
                                onChange={(e) => setModelEdit({ ...modelEdit, brandName: e.target.value })}
                                required>
                                <option value="" disabled>Select Brand</option>
                                {brandNames.map((brand, idx) => (
                                    <option key={idx} value={brand.brandName}>{brand.brandName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex ml-6 mb-3">
                            <div className="ml-4">
                                <label className="block text-base font-medium mb-2 -ml-[9.5rem]">Item Name</label>
                                <select
                                    className="border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 h-12 rounded-lg w-[15rem] focus:outline-none"
                                    value={modelEdit.itemName}
                                    onChange={(e) => setModelEdit({ ...modelEdit, itemName: e.target.value })}
                                    required>
                                    <option value="" disabled>Select Brand</option>
                                    {itemNames.map((item, idx) => (
                                        <option key={idx} value={item.itemName}>{item.itemName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ml-6">
                                <label className="block text-base font-medium mb-2 -ml-[10.2rem]">Model</label>
                                <input
                                    type="text"
                                    value={modelEdit.model}
                                    onChange={(e) => setModelEdit({ ...modelEdit, model: e.target.value })}
                                    className="w- -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex ml-6 mb-4">
                            <div className="ml-4">
                                <label className="block text-base font-medium mb-2 -ml-[12rem]">Type</label>
                                <select
                                    className="border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 h-12 rounded-lg w-[15rem] focus:outline-none"
                                    value={modelEdit.type}
                                    onChange={(e) => setModelEdit({ ...modelEdit, type: e.target.value })}
                                    required>
                                    <option value="" disabled>Select Brand</option>
                                    {types.map((item, idx) => (
                                        <option key={idx} value={item.type}>{item.type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ml-6">
                                <label className="block text-base font-medium mb-2 -ml-[10.5rem]">Price</label>
                                <input
                                    type="text"
                                    value={modelEdit.price}
                                    onChange={(e) => setModelEdit({ ...modelEdit, price: e.target.value })}
                                    className="w- -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <div className="ml-10">
                                <label className="block text-base font-medium mb-2 -ml-48">Image</label>
                                <img
                                    src={
                                        modelEdit.image?.startsWith("data:image")
                                            ? modelEdit.image
                                            : modelEdit.image
                                                ? `data:image/png;base64,${modelEdit.image}`
                                                : '/path-to-placeholder.png'
                                    }
                                    alt=""
                                    className="w-[15rem] h-32 object-cover rounded border"
                                />
                                <div className="flex items-center space-x-2 -mb-4 mt-2">
                                    <label htmlFor="imageUpload" className="cursor-pointer flex items-center text-orange-600">
                                        <img src={attach} alt="attach" className="w-[0.90rem] h-[0.90rem]" />
                                        <h1 className="text-sm ml-2"> Upload Image</h1>
                                    </label>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        className="hidden"
                                        onChange={bathModelImageEdit}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-medium mb-2 -ml-24">Technical Image</label>
                                <img
                                    src={
                                        modelEdit.technicalImage?.startsWith("data:image")
                                            ? modelEdit.technicalImage
                                            : modelEdit.technicalImage
                                                ? `data:image/png;base64,${modelEdit.technicalImage}`
                                                : '/path-to-placeholder.png'
                                    }
                                    alt=""
                                    className="w-[14rem] h-32 object-cover rounded border"
                                />
                                <div className="flex items-center space-x-2 -mb-4 mt-2">
                                    <label htmlFor="techImageUpload" className="cursor-pointer flex items-center text-orange-600">
                                        <img src={attach} alt="attach" className="w-[0.90rem] h-[0.90rem]" />
                                        <h1 className="text-sm ml-2">Upload Image</h1>
                                    </label>
                                    <input
                                        type="file"
                                        id="techImageUpload"
                                        className="hidden"
                                        onChange={bathModelTechnicalImageEdit}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2 mt-8 ml-12">
                            <button onClick={handleModelEditSubmit} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
                            <button onClick={() => setModelEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};
export default BathTableView;