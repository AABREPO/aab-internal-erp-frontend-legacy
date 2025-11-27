import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import loadingScreen from '../Images/AAlogoBlackSVG.svg';
const RentalAgreement = () => {
    const [projects, setProjects] = useState([]);
    const [fullAgreementData, setFullAgreementData] = useState([]);
    const [isRentPopupOpen, setIsRentPopupOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [options, setOptions] = useState([]);
    const [selectedPropertyType, setSelectedPropertyType] = useState(null);
    const [tenantFullNameOptions, setTenantFullNameOptions] = useState([]);
    const [message, setMessage] = useState('');
    console.log(message);
    const [revisionCount, setRevisionCount] = useState(0);
    const [Renttobepaid, setRentTobepaid] = useState('5');
    const [Lockinperiod, setLockInperiod] = useState('3');
    const [Noticeperiod, setNoticePeriod] = useState('2');
    const [Agreementvalidity, setAgreementValidity] = useState('12');
    const [Agreementstartdate, setAgreementStartDate] = useState('');
    const [selectedPercent, setSelectedPercent] = useState('5');
    const [Agreementcreatedate, setAgreementCreateDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const percentageOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 5);
    const [owners, setOwners] = useState([
        {
            ownerName: '',
            fatherName: '',
            fullName: '',
            age: '',
            mobile: '',
            ownerAddress: '',
        }
    ]);
    const [ownersProperty, setOwnersProperty] = useState([
        {
            propertyType: '',
            selectFloor: [],
            floorOptions: [],
            shopNos: '',
            doorNo: '',
            area: '',
            bedroomsByFloor: {},
            rent: '',
            advance: '',
            shouldCollectAdvance: true
        }
    ]);
    const [totals, setTotals] = useState({ totalRent: 0, totalAdvance: 0 });
    const [Agreementenddate, setAgreementEndDate] = useState('')
    const [floorOptions, setFloorOptions] = useState([]);
    const [shopNo, setShopNo] = useState([]);
    const [Createdby, setCreatedBy] = useState('')
    const [currentStep, setCurrentStep] = useState(1);
    useEffect(() => {
        const totalRent = ownersProperty.reduce((sum, o) => sum + Number(o.rent || 0), 0);
        const totalAdvance = ownersProperty.reduce((sum, o) => sum + Number(o.advance || 0), 0);
        setTotals({ totalRent, totalAdvance });
    }, [ownersProperty]);
    const [agreementFileOptions, setAgreementFileOptions] = useState([]);
    const [agreementFilteredFileOptions, setAgreementFilteredFileOptions] = useState([]);
    const handleOwnerChange = (index, field, value) => {
        const updatedOwners = [...owners];
        updatedOwners[index][field] = value;
        setOwners(updatedOwners);
    };
    const addOwner = () => {
        setOwners([
            ...owners,
            { fullName: '', fatherName: '', age: '', mobileNumber: '', address: '' },
        ]);
    };
    const [tenantList, setTenantList] = useState([]);
    const [tenants, setTenants] = useState([
        {
            id: Date.now(),
            tenantId: null,
            tenantName: '',
            tenantsList: [
                {
                    tenantFullName: '',
                    tenantFatherName: '',
                    tenantMobile: '',
                    tenantAge: '',
                    tenantAddress: ''
                }
            ]
        }
    ]);
    const steps = [
        "Owner Details",
        "Tenant Details",
        "Property Details",
        "Agreement Terms",
        "Annexures",
    ];
    const [items, setItems] = useState([
        { name: "", quantity: "" },
        { name: "", quantity: "" },
        { name: "", quantity: "" },
    ]);
    const numberToWords = (num) => {
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const inWords = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
            if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
            if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
            return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
        };
        return inWords(num);
    };
    const numberToWords1 = (num) => {
        const words = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if (num < 20) return words[num];
        if (num < 100) return `${tens[Math.floor(num / 10)]} ${words[num % 10]}`.trim();
        if (num < 1000) return `${words[Math.floor(num / 100)]} hundred ${numberToWords(num % 100)}`.trim();
        return num;
    };
    useEffect(() => {
        const savedRentToBePaid = sessionStorage.getItem('Renttobepaid');
        const savedSelectedProperty = sessionStorage.getItem('selectedProperty')
        const savedClientSNo = sessionStorage.getItem('Lockinperiod');
        const savedInteriorFloors = sessionStorage.getItem('owners');
        const savedExteriorFloors = sessionStorage.getItem('tenants');
        const savedOthersFloors = sessionStorage.getItem('Agreementvalidity');
        const savedFilteredFileOptions = sessionStorage.getItem('Agreementstartdate');
        const savedAgreementEndDate = sessionStorage.getItem('Agreementenddate')
        const savedSelectedFile = sessionStorage.getItem('Noticeperiod');
        const savedOwnerProperty = sessionStorage.getItem('ownersProperty');
        const savedSelectedPropertyType = sessionStorage.getItem('selectedPropertyType');
        try {
            if (savedRentToBePaid) setRentTobepaid(JSON.parse(savedRentToBePaid));
            if (savedClientSNo) setLockInperiod(JSON.parse(savedClientSNo));
            if (savedSelectedProperty) setSelectedProperty(JSON.parse(savedSelectedProperty));
            if (savedInteriorFloors) setOwners(JSON.parse(savedInteriorFloors));
            if (savedExteriorFloors) setTenants(JSON.parse(savedExteriorFloors));
            if (savedOwnerProperty) setOwnersProperty(JSON.parse(savedOwnerProperty));
            if (savedOthersFloors) setAgreementValidity(JSON.parse(savedOthersFloors));
            if (savedAgreementEndDate) setAgreementEndDate(JSON.parse(savedAgreementEndDate));
            if (savedFilteredFileOptions) setAgreementStartDate(JSON.parse(savedFilteredFileOptions));
            if (savedSelectedFile) setNoticePeriod(JSON.parse(savedSelectedFile));
            if (savedSelectedPropertyType) setSelectedPropertyType(JSON.parse(savedSelectedPropertyType));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('Renttobepaid');
        sessionStorage.removeItem('Lockinperiod');
        sessionStorage.removeItem('Agreementstartdate');
        sessionStorage.removeItem('owners');
        sessionStorage.removeItem('ownersProperty');
        sessionStorage.removeItem('selectedProperty');
        sessionStorage.removeItem('tenants')
        sessionStorage.removeItem('Agreementvalidity');
        sessionStorage.removeItem('Agreementenddate');
        sessionStorage.removeItem('rows');
        sessionStorage.removeItem('Noticeperiod');
        sessionStorage.removeItem('selectedPropertyType');
    };
    useEffect(() => {
        if (Renttobepaid) sessionStorage.setItem('Renttobepaid', JSON.stringify(Renttobepaid));
        if (Lockinperiod) sessionStorage.setItem('Lockinperiod', Lockinperiod);
        sessionStorage.setItem('owners', JSON.stringify(owners));
        sessionStorage.setItem('ownersProperty', JSON.stringify(ownersProperty));
        sessionStorage.setItem('selectedProperty', JSON.stringify(selectedProperty));
        sessionStorage.setItem('selectedPropertyType', JSON.stringify(selectedPropertyType));
        sessionStorage.setItem('tenants', JSON.stringify(tenants));
        sessionStorage.setItem('Agreementvalidity', JSON.stringify(Agreementvalidity));
        sessionStorage.setItem('Agreementstartdate', JSON.stringify(Agreementstartdate));
        sessionStorage.setItem('Agreementenddate', JSON.stringify(Agreementenddate));
        if (Noticeperiod) sessionStorage.setItem('Noticeperiod', JSON.stringify(Noticeperiod));
    }, [Noticeperiod, Lockinperiod, owners, Agreementstartdate, Agreementvalidity, Renttobepaid, tenants, selectedProperty, Agreementenddate, ownersProperty, selectedPropertyType]);
    const getRevisionNumber = async (propertyName, doorNos) => {
        try {
            const clientResponse = await fetch("https://backendaab.in/aabuildersDash/api/agreements/all");
            if (!clientResponse.ok) {
                throw new Error("Failed to fetch agreements from the backend");
            }
            const clientData = await clientResponse.json();
            const matchingAgreements = clientData.filter((agreement) => {
                if (agreement.propertyName !== propertyName) {
                    return false;
                }
                let existingDoorNos = [];
                if (agreement.fileName) {
                    const fileNameParts = agreement.fileName.split('_');
                    const doorNoParts = [];
                    for (let i = 1; i < fileNameParts.length; i++) {
                        if (fileNameParts[i].startsWith('R')) break;
                        doorNoParts.push(fileNameParts[i]);
                    }
                    if (doorNoParts.length > 0) {
                        existingDoorNos = doorNoParts;
                    }
                }
                if (existingDoorNos.length === 0 && agreement.propertyTypeDetails) {
                    const propertyDetails = Array.isArray(agreement.propertyTypeDetails) 
                        ? agreement.propertyTypeDetails 
                        : [agreement.propertyTypeDetails];
                    existingDoorNos = propertyDetails
                        .map(detail => detail?.doorNo)
                        .filter(doorNo => doorNo);
                }
                const normalizedExisting = existingDoorNos.sort().join('_');
                const normalizedCurrent = Array.isArray(doorNos) 
                    ? doorNos.sort().join('_') 
                    : (doorNos || '').split('_').sort().join('_');
                
                return normalizedExisting === normalizedCurrent && normalizedCurrent !== '';
            });
            return matchingAgreements.length;
        } catch (error) {
            console.error("Error fetching revision number:", error.message);
            return 0;
        }
    };
    useEffect(() => {
        const fetchRevision = async () => {
            if (selectedProperty?.value && ownersProperty.length > 0) {
                const doorNos = ownersProperty
                    .map(prop => prop.doorNo)
                    .filter(doorNo => doorNo && doorNo.trim() !== '');
                if (doorNos.length > 0) {
                    const count = await getRevisionNumber(selectedProperty.value, doorNos);
                    setRevisionCount(count);
                } else {
                    setRevisionCount(0);
                }
            } else {
                setRevisionCount(0);
            }
        };
        fetchRevision();
    }, [selectedProperty, ownersProperty]);
    useEffect(() => {
        fetchAgreements();
    }, []);
    const fetchAgreements = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/agreements/all');
            if (response.ok) {
                const data = await response.json();
                const formattedOptions = data.map(calculation => ({
                    value: calculation.id,
                    propertyName: calculation.propertyName,
                    label: calculation.fileName,
                }));
                setFullAgreementData(data);
                setAgreementFileOptions(formattedOptions);
            } else {
                setMessage('Error fetching agreements.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching agreements.');
        }
    };
    const generatePDF = async () => {
        const doorNos = ownersProperty
            .map(prop => prop.doorNo)
            .filter(doorNo => doorNo && doorNo.trim() !== '');
        let currentRevision = revisionCount;
        if (selectedProperty?.value && doorNos.length > 0) {
            currentRevision = await getRevisionNumber(selectedProperty.value, doorNos);
            setRevisionCount(currentRevision);
        }
        const doc = new jsPDF();
        const title = "RENTAL AGREEMENT";
        const pageWidth = doc.internal.pageSize.getWidth();
        const firstPageMarginTop = 150;
        const defaultMarginTop = 30;
        let cursorY = firstPageMarginTop;
        let isFirstPage = true;
        const marginLeft = 30;
        const marginRight = 40;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;
        const maxLineWidth = pageWidth - marginLeft - marginRight;
        const addFooter = () => {
            const footerY = pageHeight - 8;
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("TENANT", marginLeft, footerY);
            const tenantText = "LANDLORD";
            const tenantTextWidth = doc.getTextWidth(tenantText);
            doc.text(tenantText, pageWidth - marginRight - tenantTextWidth, footerY);
        };
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const textWidth = doc.getTextWidth(title);
        const centerX = (pageWidth - textWidth) / 2;
        doc.text(title, centerX, cursorY);
        const titleFontSize = 16;
        const titleHeight = titleFontSize * 0.35;
        const titleY = cursorY + 2;
        const titleMarginTop = 10;
        doc.line(centerX, titleY, centerX + textWidth, titleY);
        cursorY += 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        const rentInWords = numberToWords(totals.totalRent);
        const advanceInWords = numberToWords(totals.totalAdvance);
        const formattedMonthlyRent = Number(totals.totalRent).toLocaleString("en-IN");
        const formattedSecurityDeposit = Number(totals.totalAdvance).toLocaleString("en-IN");
        const agreementValidityInWords = numberToWords1(Number(Agreementvalidity));
        const propertyTypes = ownersProperty.map(o => o.propertyType);
        const propertyDoorNo = doorNos.join("_");
        const propertyAddress = projects.find(
            p => p.projectReferenceName === selectedProperty.value
        )?.projectAddress || "";
        const floorBedroomDescriptions = (ownersProperty || []).map(owner => {
            const { selectFloor = [], bedroomsByFloor = {}, propertyType, area, doorNo } = owner;
            const floorDescription = selectFloor.map(floor => {
                const count = bedroomsByFloor[floor.label] || 0;
                if (propertyType === "House") {
                    return `${floor.label} - ${count} Bedroom${count !== 1 ? 's' : ''}`;
                } else {
                    return `${floor.label}`;
                }
            }).join(", ");
            return `${floorDescription} of the building at the above said premises of area ${area} Sqft bearing ${doorNo}, ${propertyAddress}`;
        });
        const floorBedroomDescriptions1 = (ownersProperty || []).map(owner => {
            const { selectFloor = [], bedroomsByFloor = {}, propertyType, doorNo } = owner;
            const floorDescription = selectFloor.map(floor => {
                const count = bedroomsByFloor[floor.label] || 0;
                if (propertyType === "House") {
                    return `${floor.label} - ${count} Bedroom${count !== 1 ? 's' : ''}`;
                } else {
                    return `${floor.label}`;
                }
            }).join(", ");
            return `${floorDescription} of the building at ${doorNo}, ${propertyAddress}`;
        });
        const combinedFloorDescription = floorBedroomDescriptions.join(" & ");
        const combinedFloorDescription1 = floorBedroomDescriptions1.join(" & ");
        const BeforeDatemarginLeft = 30;
        const contentBeforeDate = `THIS DEED OF RENTAL AGREEMENT ENTERED into at Srivilliputtur, this the`;
        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        doc.text(contentBeforeDate, BeforeDatemarginLeft, cursorY);
        cursorY += lineHeight;
        const formatDateOnly = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const landlordIntroWidth = 150;
        const formatAgreementDateLine = (dateStr) => {
            if (!dateStr) return "";
            const dateObj = new Date(dateStr);
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            const month = dateObj.toLocaleString("default", { month: "long" });
            const getOrdinal = (n) => {
                const s = ["th", "st", "nd", "rd"];
                const v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            };
            const dayWithSuffix = getOrdinal(day);
            return `${dayWithSuffix} day of ${month} ${year}, between`;
        };
        const centeredLine = formatAgreementDateLine(Agreementcreatedate);
        const centeredTextWidth = doc.getTextWidth(centeredLine);
        const centeredX = (pageWidth - centeredTextWidth) / 2;
        const enhancedPercentage = Agreementvalidity;
        doc.text(centeredLine, centeredX, cursorY);
        cursorY += lineHeight;
        const landlordLinesRaw = owners.map((owner, index) => {
            const isLast = index === owners.length - 1;
            return `Mr. ${owner.fullName}, aged ${owner.age} years, son of Mr. ${owner.fatherName}, residing at Door No.${owner.ownerAddress}${isLast ? ', hereinafter called the' : ','}`;
        });
        const tenantDetails = tenants.flatMap(group => group.tenantsList || []);
        cursorY += 10;
        const customLandlordFirstLineMargin = 30;
        const landlordLineSpacing = 2;
        landlordLinesRaw.forEach((line, index) => {
            if (cursorY > pageHeight - 20) {
                doc.addPage();
                cursorY = defaultMarginTop;
            }
            const wrappedLines = doc.splitTextToSize(line, landlordIntroWidth);
            wrappedLines.forEach((wrappedLine, subIndex) => {
                const leftMargin = (index === 0 && subIndex === 0) ? customLandlordFirstLineMargin : marginLeft;
                doc.text(wrappedLine.trim(), leftMargin, cursorY);
                cursorY += lineHeight;
            });
            cursorY += landlordLineSpacing;
        });
        const landlordTag = owners.length > 1 ? "“LANDLORDS”" : "“LANDLORD”";
        const landlordTagWidth = doc.getTextWidth(landlordTag);
        doc.text(landlordTag, (pageWidth - landlordTagWidth) / 2, cursorY);
        cursorY += lineHeight + 3;
        const andLine = "AND";
        const andWidth = doc.getTextWidth(andLine);
        doc.text(andLine, (pageWidth - andWidth) / 2, cursorY);
        cursorY += lineHeight + 3;
        const tenantLines = tenantDetails.map((tenant, index) => {
            const isLast = index === tenantDetails.length - 1;
            return `Mr. ${tenant.tenantFullName}, aged ${tenant.tenantAge} years, son of Mr. ${tenant.tenantFatherName}, residing at Door No. ${tenant.tenantAddress}${isLast ? ', hereinafter called the' : ','}`;
        });
        const customTenantFirstLineMargin = 30;
        tenantLines.forEach((line, index) => {
            if (cursorY > pageHeight - 20) {
                doc.addPage();
                cursorY = defaultMarginTop;
            }
            const wrappedLines = doc.splitTextToSize(line, landlordIntroWidth); 
            wrappedLines.forEach((wrappedLine, subIndex) => {
                const leftMargin = (index === 0 && subIndex === 0) ? customTenantFirstLineMargin : marginLeft;
                doc.text(wrappedLine.trim(), leftMargin, cursorY);
                cursorY += lineHeight;
            });
            cursorY += 2; 
        });
        const tenantTag = tenantDetails.length > 1 ? "“TENANTS”" : "“TENANT”";
        const tenantTagWidth = doc.getTextWidth(tenantTag);
        doc.text(tenantTag, (pageWidth - tenantTagWidth) / 2, cursorY);
        cursorY += lineHeight;
        doc.addPage();
        isFirstPage = false;
        cursorY = defaultMarginTop;
        const restOfContent = `
            
                      The terms ${landlordTag} and ${tenantTag} wherever the context so permits, meaning and including their respective heirs, legal representatives, executors, administrators, successors and assigns witnesseth:
            
                      WHEREAS the Landlord is the sole and absolute owner of the premises bearing ${propertyDoorNo}, ${propertyAddress}.
            
                      WHEREAS the Landlord has agreed to let the ${combinedFloorDescription}, more particularly described in the Schedule hereto for a period of ${Agreementvalidity}  months, commencing from ${formatDateOnly(Agreementstartdate)} to ${formatDateOnly(Agreementenddate)}, to the Tenant on a monthly rent for Rs.${formattedMonthlyRent}/- (${rentInWords}) and exclusive of the Electricity, being payable on or before the 5th day of the succeeding month, the month of tenancy being according to the Calendar.
            
                      THE TENANT has paid a refundable non-interest bearing a Security Deposit of Rs.${formattedSecurityDeposit}/- (${advanceInWords} Rupees) towards advance to the Landlord with free of interest, by Cash/NetBanking/Cheque/UPI which shall be refundable to the tenant on settlement of all accounts at the time of the tenancy becomes determine by efflux of time or otherwise, after deducting the arrears, if any in Rent, Electricity, Water charges, also the cost of replacement of fittings and fixtures if damaged by the tenant,
            
                      (1) That the Tenancy shall be for a period of ${Agreementvalidity} (${agreementValidityInWords}) months, commencing from ${formatDateOnly(Agreementstartdate)} to ${formatDateOnly(Agreementenddate)}.
            
                      (2) The rent for Rs.${formattedMonthlyRent}/- (${rentInWords} Rupees) per month.
            
                      (3) The Tenant shall pay the electricity consumption charges sub-meter reading promptly and regularly as per T.N.E.B. E.B. Department.
            
                      (4) If the Tenant commits any default in payment of rent consecutively for a period of three months, the landlord shall be at liberty to evict them from the premises.
            
                      (5) The tenant shall use the premises for ${propertyTypes === 'House' ? 'Residential' : 'Commercial'} purposes only.
            
                      (6) The Tenant shall not sublet or part with any third party at any cost.
            
                      (7) It is agreed between the parties that either party shall have the right to determine the tenancy by issuing three months notice in writing, ending on the last day of any month of tenancy.
            
                      (8) The Tenant shall not cause any hindrance to the neighbours.
            
                      (9) The Tenant shall not carry any alterations or additions to the portion let out to them.
            
                      (10) The premises shall be vacated by giving ${Noticeperiod} months notice by either side or in lieu of it ${Noticeperiod} month rent will be recovered from the deposit amount if the Tenant vacates earlier.
            
                      (11) The Tenant shall attend to the minor repairs to the building caused by normal wear and tear.
            
                      (12) Any statutory payment of present and all future municipal Government land and revenue taxes and cess levied is landlord responsibilities.
            
                      (13) The tenant shall put the Landlord back in possession of the demised property in as good a condition as it is this day on the tenancy becoming determined by efflux of time or otherwise on settlement of all accounts.
            
                      (14) The Landlord or his representatives may inspect the premises at any reasonable times.
            
                      (15) The Tenant shall not claim any compensation or any other amount at the time of vacating the rented portion except the advance amount.
            
                      (16) The period of tenancy for ${Agreementvalidity} (${agreementValidityInWords}) months, commencing from Rs.${formattedMonthlyRent}/- (${rentInWords} Rupees), rent is to be enhanced ${selectedPercent}% for every three years from the previous rent;
                `.trim();

        const firstLineMargin = 40;
        const paragraphs = restOfContent.trim().split(/\n\s*\n/);
        paragraphs.forEach(paragraph => {
            const lines = doc.splitTextToSize(paragraph.trim(), maxLineWidth);
            lines.forEach((line, index) => {
                if (cursorY > pageHeight - 20) {
                    doc.addPage();
                    isFirstPage = false;
                    cursorY = defaultMarginTop;
                }
                const currentMargin = index === 0 ? firstLineMargin : marginLeft;
                doc.text(line.trim(), currentMargin, cursorY);
                cursorY += lineHeight;
            });
            cursorY += 3;
        });
        doc.addPage();
        cursorY = defaultMarginTop;
        const scheduleTitle = "SCHEDULE";
        const scheduleTitleWidth = doc.getTextWidth(scheduleTitle);
        const scheduleTitleX = (pageWidth - scheduleTitleWidth) / 2;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        cursorY += 0;
        doc.text(scheduleTitle, pageWidth / 2, cursorY, { align: "center" });
        const underlineY = cursorY + 1;
        doc.setLineWidth(0.3);
        const underlinePadding = 3;
        const underlineStartX = (pageWidth - scheduleTitleWidth - underlinePadding) / 2;
        const underlineEndX = (pageWidth + scheduleTitleWidth + underlinePadding) / 2;
        doc.line(underlineStartX, underlineY, underlineEndX, underlineY);
        cursorY += lineHeight + 5;
        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        const customFirstLineMargin = marginLeft + 15; 
        const scheduleContent = `All that piece and portion of ${combinedFloorDescription1}, including separate T.N.E.B. Meter and Existing Provisions as listed below.`;
        const scheduleLines = doc.splitTextToSize(scheduleContent.trim(), maxLineWidth);
        scheduleLines.forEach((line, index) => {
            if (cursorY > pageHeight - 20) {
                doc.addPage();
                cursorY = defaultMarginTop;
            }
            const leftMargin = index === 0 ? customFirstLineMargin : marginLeft;
            doc.text(line.trim(), leftMargin, cursorY);
            cursorY += lineHeight;
        });
        const filteredItems = items.filter(item => item.name.trim() !== "");
        if (filteredItems.length > 0) {
            doc.autoTable({
                startY: cursorY + 2,
                body: [
                    [{ content: "Item Name", styles: { fontStyle: "bold", halign: "center" } },
                    { content: "Item Count", styles: { fontStyle: "bold", halign: "center" } }],
                    ...filteredItems.map(item => [item.name, item.quantity])
                ],
                theme: "grid",
                tableWidth: '400px',
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 50 }
                },
                styles: {
                    fillColor: false,
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: 0,
                    fontStyle: 'bold',
                },
                margin: { left: 40, top: 30 },
            });
            cursorY = doc.autoTable.previous.finalY + 10;
        }
        if (cursorY > pageHeight - 60) {
            doc.addPage();
            cursorY = defaultMarginTop;
        }
        const afterTableText = `
        IN WITNESS WHEREOF the parties have set their respective hands to this Rental Agreement on the day, month, and year first above written in the presence of the under-mentioned witnesses:
        `.trim();
        const afterTableLines = doc.splitTextToSize(afterTableText, maxLineWidth);
        afterTableLines.forEach((line, index) => {
            if (cursorY > pageHeight - 20) {
                doc.addPage();
                cursorY = defaultMarginTop;
            }
            const leftMargin = index === 0 ? customFirstLineMargin : marginLeft;
            doc.text(line.trim(), leftMargin, cursorY);
            cursorY += lineHeight;
        });
        if (cursorY > pageHeight - 60) {
            doc.addPage();
            cursorY = defaultMarginTop;
        }

        const witnessText = `



WITNESSES:

    1)


    2)
        
        `.trim();

        cursorY += 16;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("TENANT", marginLeft, cursorY);
        const landLordText = "LANDLORD";
        const landLordWidth = doc.getTextWidth(landLordText);
        doc.text(landLordText, pageWidth - marginRight - landLordWidth, cursorY);
        doc.setFont("helvetica", "normal");
        cursorY += lineHeight * 2;
        doc.setFontSize(13);
        const witnessLines = doc.splitTextToSize(witnessText, maxLineWidth);
        witnessLines.forEach(line => {
            if (cursorY > pageHeight - 20) {
                doc.addPage();
                cursorY = defaultMarginTop;
            }
            doc.text(line, marginLeft, cursorY);
            cursorY += lineHeight;
        });
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i < totalPages; i++) {
            doc.setPage(i);
            addFooter();
        }
        const filename = `${selectedProperty.value}_${propertyDoorNo}_R${currentRevision}`;
        doc.save(filename);
        return doc.output('blob');
    };
    const handleInputChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };
    const handleTenantChange = (tenantId, field, value) => {
        if (field === 'tenantName') {
            const selectedTenant = tenantList.find(t => t.tenantName === value);
            setTenants((prevTenants) =>
                prevTenants.map((tenant) => {
                    if (tenant.id === tenantId) {
                        const updatedTenantsList = [...tenant.tenantsList];
                        if (selectedTenant && updatedTenantsList.length > 0) {
                            updatedTenantsList[0] = {
                                ...updatedTenantsList[0],
                                tenantFullName: selectedTenant.fullName || '',
                                tenantFatherName: selectedTenant.tenantFatherName || '',
                                tenantAge: selectedTenant.age || '',
                                tenantMobile: selectedTenant.mobileNumber || '',
                                tenantAddress: selectedTenant.tenantAddress || ''
                            };
                        }
                        return {
                            ...tenant,
                            tenantName: value,
                            tenantId: selectedTenant?.id || null,
                            tenantsList: updatedTenantsList
                        };
                    }
                    return tenant;
                })
            );
            if (selectedTenant) {
                const fullName = selectedTenant.fullName;
                if (fullName) {
                    setTenantFullNameOptions([{
                        label: fullName,
                        value: fullName,
                    }]);
                } else {
                    setTenantFullNameOptions([]);
                }
            } else {
                setTenantFullNameOptions([]);
            }
        } else {
            setTenants((prevTenants) =>
                prevTenants.map((tenant) =>
                    tenant.id === tenantId ? { ...tenant, [field]: value } : tenant
                )
            );
        }
        if (value && !options.find((opt) => opt.value === value)) {
            setOptions((prevOptions) => [...prevOptions, { value, label: value }]);
        }
    };
    const handlePartnerChange = (tenantId, partnerIndex, field, value) => {
        setTenants((prev) =>
            prev.map((tenant) => {
                if (tenant.id === tenantId) {
                    const updatedPartners = [...tenant.tenantsList];
                    updatedPartners[partnerIndex] = {
                        ...updatedPartners[partnerIndex],
                        [field]: value,
                    };
                    return { ...tenant, tenantsList: updatedPartners };
                }
                return tenant;
            })
        );
    };
    const addTenant = () => {
        setTenants((prev) => [
            ...prev,
            {
                id: prev.length ? prev[prev.length - 1].id + 1 : 1,
                tenantId: null,
                tenantName: '',
                tenantsList: [
                    {
                        tenantFullName: '',
                        tenantFatherName: '',
                        tenantAge: '',
                        tenantMobile: '',
                        tenantAddress: '',
                        aadhaarFile: null,
                    },
                ],
            },
        ]);
    };
    const removeTenant = (tenantId) => {
        setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    };
    const addPartner = (tenantId) => {
        setTenants((prev) =>
            prev.map((tenant) => {
                if (tenant.id === tenantId) {
                    return {
                        ...tenant,
                        tenantsList: [
                            ...tenant.tenantsList,
                            {
                                tenantFullName: '',
                                tenantFatherName: '',
                                tenantAge: '',
                                tenantMobile: '',
                                tenantAddress: '',
                                aadhaarFile: null,
                            },
                        ],
                    };
                }
                return tenant;
            })
        );
    };
    const removePartner = (tenantId, partnerIndex) => {
        setTenants((prev) =>
            prev.map((tenant) => {
                if (tenant.id === tenantId) {
                    const newPartners = tenant.tenantsList.filter(
                        (_, idx) => idx !== partnerIndex
                    );
                    return { ...tenant, tenantsList: newPartners };
                }
                return tenant;
            })
        );
    };
    const addMoreItems = () => {
        setItems([...items, { name: "", quantity: "" }]);
    };
    const removeLastItem = () => {
        if (items.length > 3) {
            setItems(items.slice(0, -1));
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);
    const fetchProjects = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
            if (response.ok) {
                const data = await response.json();
                const ownProjects = Array.isArray(data)
                    ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
                    : [];
                setProjects(ownProjects);
            } else {
                setMessage('Error fetching projects.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching projects.');
        }
    };
    const calculateEndDate = (startDate, validity) => {
        if (startDate && validity) {
            let start = new Date(startDate);
            start.setMonth(start.getMonth() + parseInt(validity));
            const formattedEndDate = start.toISOString().split("T")[0];
            setAgreementEndDate(formattedEndDate);
        }
    };
    const removeOwner = (indexToRemove) => {
        setOwners((prevOwners) => prevOwners.filter((_, i) => i !== indexToRemove));
    };
    const propertyTypeOptions = [
        { value: 'Shop', label: 'Shop' },
        { value: 'House', label: 'House' },
        { value: 'Land', label: 'Land' },
    ];
    const handleAgreementEndDate = (event) => {
        setAgreementEndDate(event.target.value);
    };
    const handlecreateby = (event) => {
        setCreatedBy(event.target.value)
    }
    const handleagreementcreatedate = (event) => {
        setAgreementCreateDate(event.target.value)
    }
    const handleAgreementStartDate = (event) => {
        const startDate = event.target.value;
        setAgreementStartDate(startDate);
        calculateEndDate(startDate, Agreementvalidity);
    };
    const handleAgreementValidity = (event) => {
        const validity = event.target.value;
        setAgreementValidity(validity);
        if (validity) {
            const percent = Math.min(Math.floor(validity / 12) * 5, 50);
            setSelectedPercent(percent.toString());
        } else {
            setSelectedPercent('');
        }
        if (!validity) {
            setAgreementEndDate("");
            return;
        }
        calculateEndDate(Agreementstartdate, validity);
    };
    const handlenoticeperiod = (event) => {
        setNoticePeriod(event.target.value)
    }
    const handlelockinperiod = (event) => {
        setLockInperiod(event.target.value)
    }
    const handlerenttobepaid = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setRentTobepaid(value);
    };
    const handleShopSelection = (ownerIndex, selectedOption) => {
        setOwnersProperty((prev) => {
            const updated = prev.map((owner, idx) => (idx === ownerIndex ? { ...owner } : owner));
            const ownerToUpdate = { ...updated[ownerIndex] };
            const selectedValue = selectedOption?.value || '';
            ownerToUpdate.shopNos = selectedValue;
            if (!selectedValue) {
                ownerToUpdate.propertyType = '';
                ownerToUpdate.selectFloor = [];
                ownerToUpdate.doorNo = '';
                ownerToUpdate.area = '';
                updated[ownerIndex] = ownerToUpdate;
                return updated;
            }
            const matchedDetail = projectPropertyDetails.find(
                detail => detail?.shopNo != null && String(detail.shopNo) === selectedValue
            );
            if (matchedDetail) {
                const inferredType = matchedDetail.projectType || '';
                const inferredFloorOptions = inferredType ? (floorOptionsByType[inferredType] || []) : [];
                const inferredShopOptions = inferredType ? (shopOptionsByType[inferredType] || []) : [];
                const floorOption = matchedDetail.floorName
                    ? { value: String(matchedDetail.floorName), label: String(matchedDetail.floorName) }
                    : null;
                ownerToUpdate.propertyType = inferredType;
                ownerToUpdate.floorOptions = inferredFloorOptions;
                ownerToUpdate.shopNoOptions = inferredShopOptions;
                ownerToUpdate.selectFloor = floorOption ? [floorOption] : [];
                ownerToUpdate.doorNo = matchedDetail.doorNo || '';
                ownerToUpdate.area = matchedDetail.area || '';
            }
            updated[ownerIndex] = ownerToUpdate;
            return updated;
        });
    };
    const customStyles = {
        multiValue: (provided) => ({
            ...provided,
            display: "inline-flex",
            marginRight: "5px",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            whiteSpace: "nowrap",
        }),
    };
    const handleQuantityChange = (index, delta) => {
        setItems(prevItems =>
            prevItems.map((item, i) =>
                i === index
                    ? { ...item, quantity: Math.max(0, (parseInt(item.quantity) || 0) + delta) }
                    : item
            )
        );
    };
    const getSuffix = (num) => {
        if (!num) return '';
        const n = parseInt(num);
        if (isNaN(n)) return '';
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
        if (lastDigit === 1) return 'st';
        if (lastDigit === 2) return 'nd';
        if (lastDigit === 3) return 'rd';
        return 'th';
    };
    const propertyOptions = projects
        .filter(project => project.projectReferenceName)
        .map((project) => ({
            value: project.projectReferenceName,
            label: project.projectReferenceName,
        }));
    const matchedProject = useMemo(() => {
        if (!selectedProperty?.value) return null;
        return projects.find(p => p.projectReferenceName === selectedProperty.value) || null;
    }, [projects, selectedProperty]);
    const projectPropertyDetails = useMemo(() => {
        if (!matchedProject?.propertyDetails) return [];
        if (Array.isArray(matchedProject.propertyDetails)) {
            return matchedProject.propertyDetails.filter(Boolean);
        }
        try {
            return Array.from(matchedProject.propertyDetails || []).filter(Boolean);
        } catch (error) {
            console.error("Error parsing property details:", error);
            return [];
        }
    }, [matchedProject]);
    const { floorOptionsByType, shopOptionsByType, globalShopOptions } = useMemo(() => {
        const floorMap = {};
        const shopMap = {};
        const globalShopSet = new Map();
        projectPropertyDetails.forEach(detail => {
            if (!detail) return;
            const type = detail.projectType || '';
            if (type) {
                if (!floorMap[type]) floorMap[type] = new Map();
                if (!shopMap[type]) shopMap[type] = new Map();
                if (detail.floorName) {
                    const floorValue = String(detail.floorName);
                    if (!floorMap[type].has(floorValue)) {
                        floorMap[type].set(floorValue, { value: floorValue, label: floorValue });
                    }
                }
                if (detail.shopNo != null) {
                    const shopValue = String(detail.shopNo);
                    if (!shopMap[type].has(shopValue)) {
                        shopMap[type].set(shopValue, { value: shopValue, label: shopValue });
                    }
                }
            }
            if (detail?.shopNo != null) {
                const shopValue = String(detail.shopNo);
                if (!globalShopSet.has(shopValue)) {
                    globalShopSet.set(shopValue, { value: shopValue, label: shopValue });
                }
            }
        });
        const convert = (map) =>
            Object.keys(map).reduce((acc, key) => {
                acc[key] = Array.from(map[key].values());
                return acc;
            }, {});
        return {
            floorOptionsByType: convert(floorMap),
            shopOptionsByType: convert(shopMap),
            globalShopOptions: Array.from(globalShopSet.values()),
        };
    }, [projectPropertyDetails]);
    const filteredOwnerOptions = selectedProperty
        ? projects
            .find(p => p.projectReferenceName === selectedProperty.value)
            ?.ownerDetails
            ?.map(owner => ({ value: owner.clientName, label: owner.clientName })) || []
        : [];
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
                if (response.ok) {
                    const data = await response.json();
                    const tenantNameOptions = [...new Set(data.map(t => t.tenantName))]
                        .filter(name => !!name)
                        .map(name => ({
                            label: name,
                            value: name,
                        }));
                    setOptions(tenantNameOptions);
                    setTenantList(data);
                } else {
                    console.error('Error fetching tenant link data');
                }
            } catch (error) {
                console.error('Error fetching tenants:', error);
            }
        };
        fetchTenants();
    }, []);
    const handleSubmitAgreement = async () => {
        setIsRentPopupOpen(true);
        try {
            const doorNos = ownersProperty
                .map(prop => prop.doorNo)
                .filter(doorNo => doorNo && doorNo.trim() !== '');
            let currentRevisionCount = revisionCount;
            if (selectedProperty?.value && doorNos.length > 0) {
                currentRevisionCount = await getRevisionNumber(selectedProperty.value, doorNos);
                setRevisionCount(currentRevisionCount);
            }
            const pdfData = await generatePDF();
            const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
            const date = new Date();
            const propertyDoorNo = doorNos.join("_");
            const filename = `${selectedProperty.value}_${propertyDoorNo}_R${currentRevisionCount}`;
            const formData = new FormData();
            formData.append("file", pdfBlob);
            formData.append("file_name", filename);
            const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/agreement/googleUploader/uploadToGoogleDrive", {
                method: "POST",
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error("PDF upload failed");
            const { url: pdfUrl } = await uploadResponse.json();
            const updatedOwners = owners.map(own => ({
                ownerName: own.ownerName,
                fatherName: own.fatherName,
                fullName: own.fullName,
                age: own.age,
                mobile: own.mobile,
                ownerAddress: own.ownerAddress,
            }));
            const updatedPropertyTypes = ownersProperty.map(own => ({
                propertyType: own.propertyType,
                selectFloor: Array.isArray(own.selectFloor)
                    ? own.selectFloor.map(floor => (typeof floor === "object" ? floor.value || floor.label : floor)).join(", ")
                    : typeof own.selectFloor === "object"
                        ? own.selectFloor.value || own.selectFloor.label
                        : own.selectFloor,
                shopNos: own.shopNos,
                doorNo: own.doorNo,
                area: own.area,
                bedroomsByFloor: typeof own.bedroomsByFloor === "object"
                    ? Object.values(own.bedroomsByFloor).join(", ")
                    : own.bedroomsByFloor,
                rent: own.rent,
                advance: own.advance,
            }));
            const updatedTenants = tenants.map(group => ({
                tenantName: group.tenantName,
                tenantId: group.tenantId || null,
                agreementTenantDetails: group.tenantsList.map(tenant => ({
                    tenantFullName: tenant.tenantFullName,
                    tenantFatherName: tenant.tenantFatherName,
                    tenantMobile: tenant.tenantMobile,
                    tenantAge: tenant.tenantAge,
                    tenantAddress: tenant.tenantAddress,
                }))
            }));
            const updatedAnnexureItem = items.map(item => ({
                itemName: item.name,
                howMany: item.quantity,
            }));
            const agreementPayload = {
                propertyName: selectedProperty.value,
                propertyAddress: projects.find(p => p.projectReferenceName === selectedProperty.value)?.projectAddress || "",
                fileName: filename,
                rentToBePaid: Renttobepaid,
                lockInPeriod: Lockinperiod,
                noticePeriod: Noticeperiod,
                createdBy: Createdby || 'Owner',
                rentIncrementPercentage: selectedPercent,
                agreementValidity: Agreementvalidity,
                agreementCreatedDate: Agreementcreatedate,
                agreementStartDate: Agreementstartdate,
                agreementEndDate: Agreementenddate,
                agreementUrl: pdfUrl,
                agreementOwnerWithPropertyTypes: updatedOwners,
                propertyTypeDetails: updatedPropertyTypes,
                agreementTenantNames: updatedTenants,
                annexureItems: updatedAnnexureItem,
            };
            const saveResponse = await fetch("https://backendaab.in/aabuildersDash/api/agreements/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(agreementPayload),
            });
            if (!saveResponse.ok) throw new Error("Failed to save agreement");
            const saveResult = await saveResponse.json();
            setIsRentPopupOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error:", error);
            setIsRentPopupOpen(false);
        }
    };
    const reversedAgreementFileOptions = [...agreementFilteredFileOptions].reverse();
    const handleAgreementSelection = (selectedOption) => {
        const selectedAgreementId = selectedOption.value;
        const selectedAgreement = fullAgreementData.find(
            (item) => item.id === selectedAgreementId
        );
        if (selectedAgreement) {
            const ownerDataList = selectedAgreement.agreementOwnerWithPropertyTypes || [];
            setRentTobepaid(selectedAgreement.rentToBePaid || '');
            setLockInperiod(selectedAgreement.lockInPeriod || '');
            setNoticePeriod(selectedAgreement.noticePeriod || '');
            setAgreementValidity(selectedAgreement.agreementValidity || '');
            setAgreementStartDate(selectedAgreement.agreementStartDate || '');
            setAgreementCreateDate(selectedAgreement.agreementCreatedDate || '');
            setAgreementEndDate(selectedAgreement.agreementEndDate || '');
            setCreatedBy(selectedAgreement.createdBy || '');
            const formattedOwners = ownerDataList.map((owner) => ({
                ownerName: owner.ownerName || '',
                fatherName: owner.fatherName || '',
                fullName: owner.fullName || '',
                age: owner.age || '',
                mobile: owner.mobile || '',
                ownerAddress: owner.ownerAddress || ''
            }));
            setOwners(formattedOwners);
            const propertyDetailsList = selectedAgreement.propertyTypeDetails || [];
            // Compute options from project data if property is selected
            let computedFloorOptionsByType = {};
            let computedShopOptionsByType = {};
            let computedGlobalShopOptions = [];
            if (selectedProperty?.value) {
                const matchedProject = projects.find(p => p.projectReferenceName === selectedProperty.value);
                if (matchedProject?.propertyDetails) {
                    const propertyDetailsArray = Array.isArray(matchedProject.propertyDetails) 
                        ? matchedProject.propertyDetails 
                        : Array.from(matchedProject.propertyDetails || []);                    
                    const floorMap = {};
                    const shopMap = {};
                    const globalShopSet = new Map();                    
                    propertyDetailsArray.forEach(detail => {
                        if (!detail) return;
                        const type = detail.projectType || '';
                        if (type) {
                            if (!floorMap[type]) floorMap[type] = new Map();
                            if (!shopMap[type]) shopMap[type] = new Map();                            
                            if (detail.floorName) {
                                const floorValue = String(detail.floorName);
                                if (!floorMap[type].has(floorValue)) {
                                    floorMap[type].set(floorValue, { value: floorValue, label: floorValue });
                                }
                            }
                            if (detail.shopNo != null) {
                                const shopValue = String(detail.shopNo);
                                if (!shopMap[type].has(shopValue)) {
                                    shopMap[type].set(shopValue, { value: shopValue, label: shopValue });
                                }
                            }
                        }                        
                        if (detail?.shopNo != null) {
                            const shopValue = String(detail.shopNo);
                            if (!globalShopSet.has(shopValue)) {
                                globalShopSet.set(shopValue, { value: shopValue, label: shopValue });
                            }
                        }
                    });                    
                    computedFloorOptionsByType = Object.keys(floorMap).reduce((acc, key) => {
                        acc[key] = Array.from(floorMap[key].values());
                        return acc;
                    }, {});                    
                    computedShopOptionsByType = Object.keys(shopMap).reduce((acc, key) => {
                        acc[key] = Array.from(shopMap[key].values());
                        return acc;
                    }, {});                    
                    computedGlobalShopOptions = Array.from(globalShopSet.values());
                }
            }            
            const formattedProperties = propertyDetailsList.map((property) => {
                const floorValue = property.selectFloor || '';
                const propertyType = property.propertyType || '';
                const shopNoValue = property.shopNos != null ? String(property.shopNos) : '';               
                // Get floor and shop options based on property type
                const typeFloorOptions = propertyType ? (computedFloorOptionsByType[propertyType] || floorOptionsByType[propertyType] || []) : [];
                let typeShopOptions = propertyType ? (computedShopOptionsByType[propertyType] || shopOptionsByType[propertyType] || []) : [];
                // If shop number exists but not in options, add it
                if (shopNoValue && !typeShopOptions.find(opt => opt.value === shopNoValue)) {
                    typeShopOptions = [...typeShopOptions, { value: shopNoValue, label: shopNoValue }];
                }                
                // Use global options as fallback, and ensure shop number is included
                let finalShopOptions = typeShopOptions.length > 0 
                    ? typeShopOptions 
                    : (computedGlobalShopOptions.length > 0 ? computedGlobalShopOptions : globalShopOptions);
                // Ensure the shop number is in the final options
                if (shopNoValue && !finalShopOptions.find(opt => opt.value === shopNoValue)) {
                    finalShopOptions = [...finalShopOptions, { value: shopNoValue, label: shopNoValue }];
                }                
                // Parse selectFloor if it's a string (comma-separated)
                let parsedSelectFloor = [];
                if (floorValue) {
                    if (typeof floorValue === 'string' && floorValue.includes(',')) {
                        // Handle comma-separated floor values
                        parsedSelectFloor = floorValue.split(',').map(f => {
                            const trimmed = f.trim();
                            return { label: trimmed, value: trimmed };
                        });
                    } else if (typeof floorValue === 'string') {
                        parsedSelectFloor = [{ label: floorValue, value: floorValue }];
                    } else {
                        parsedSelectFloor = floorValue ? [{ label: floorValue, value: floorValue }] : [];
                    }
                }                
                return {
                    propertyType: propertyType,
                    selectFloor: parsedSelectFloor,
                    floorOptions: typeFloorOptions.length > 0 ? typeFloorOptions : (parsedSelectFloor.length > 0 ? parsedSelectFloor : []),
                    shopNoOptions: finalShopOptions,
                    shopNos: shopNoValue,
                    doorNo: property.doorNo || '',
                    area: property.area || '',
                    bedroomsByFloor: {},
                    rent: property.rent || '',
                    advance: property.advance || '',
                    shouldCollectAdvance: true
                };
            });
            setOwnersProperty(formattedProperties);
            const propertyAnnexures = selectedAgreement.annexureItems || [];
            const formattedAnnexures = propertyAnnexures.map((property) => ({
                name: property.itemName || '',
                quantity: property.howMany || '',
            }));
            setItems(formattedAnnexures);
            const uniqueShopNos = propertyDetailsList
                .map((p) => p.shopNos)
                .filter((v, i, arr) => v != null && arr.indexOf(v) === i)
                .map((v) => ({
                    value: String(v),
                    label: String(v)
                }));
            setShopNo(uniqueShopNos);
            const uniqueFloors = propertyDetailsList
                .map((p) => p.selectFloor)
                .filter((v, i, arr) => v && arr.indexOf(v) === i)
                .map((v) => ({
                    value: v,
                    label: v
                }));
            setFloorOptions(uniqueFloors);
            const tenantBlockList = selectedAgreement.agreementTenantNames || [];
            const formattedTenants = tenantBlockList.map((block) => ({
                id: Date.now() + Math.random(),
                tenantName: block.tenantName || '',
                tenantsList: (block.agreementTenantDetails || []).map((tenant) => ({
                    tenantFullName: tenant.tenantFullName || '',
                    tenantFatherName: tenant.tenantFatherName || '',
                    tenantMobile: tenant.tenantMobile || '',
                    tenantAge: tenant.tenantAge || '',
                    tenantAddress: tenant.tenantAddress || '',
                    aadhaarFile: null
                }))
            }));
            setTenants(formattedTenants);
        }
    };
    const nameOptions = [
        { label: 'Fan', value: 'Fan' },
        { label: 'Light', value: 'Light' },
        { label: 'Ac', value: 'Ac' },
    ];
    return (
        <body>
            <div className="flex lg:ml-12 lg:h-[743px] lg:w-[1724px] bg-white">
                <div>
                    <div className="flex  bg-white rounded-lg mt-4 p-5 ml-5 lg:w-[1100px] ">
                        <div>
                            <div className="mb-6 lg:flex gap-5 items-baseline text-left">
                                <div>
                                    <label className="block font-semibold text-base mb-2">Property Name</label>
                                    <Select
                                        options={propertyOptions}
                                        value={selectedProperty}
                                        onChange={(selected) => {
                                            setSelectedProperty(selected);
                                            setOwnersProperty((prev) => {
                                                return prev.map((owner) => ({
                                                    ...owner,
                                                    propertyType: '',
                                                    selectFloor: [],
                                                    floorOptions: [],
                                                    shopNos: '',
                                                    shopNoOptions: [],
                                                    doorNo: '',
                                                    bedroomsByFloor: {}
                                                }));
                                            });
                                            const matchedProject = projects.find(p => p.projectReferenceName === selected?.value);
                                            const propertyDetailsArray = matchedProject?.propertyDetails 
                                                ? (Array.isArray(matchedProject.propertyDetails) 
                                                    ? matchedProject.propertyDetails 
                                                    : Array.from(matchedProject.propertyDetails || []))
                                                : [];
                                            if (propertyDetailsArray.length > 0) {
                                                const propertyNameCheck = selected.value;
                                                const filteredFileOption = agreementFileOptions.filter(option => option.propertyName === propertyNameCheck);
                                                setAgreementFilteredFileOptions(filteredFileOption);
                                            }
                                        }}
                                        placeholder="Select Project Reference Name"
                                        className="w-[300px]"
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{
                                            control: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: 'transparent',
                                                borderWidth: '2.5px',
                                                borderColor: state.isFocused
                                                    ? 'rgba(191, 152, 83, 0.2)'
                                                    : 'rgba(191, 152, 83, 0.2)',
                                                borderRadius: '6px',
                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                '&:hover': {
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                },
                                            }),
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                color: '#999',
                                                textAlign: 'left',
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999,
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                textAlign: 'left',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                color: 'black',
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                textAlign: 'left',
                                                fontWeight: 'normal',
                                                color: 'black',
                                            }),
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-base mb-2 lg:mt-0 mt-3">Retrive</label>
                                    <Select
                                        className="w-[340px] text-sm"
                                        classNamePrefix="react-select"
                                        options={reversedAgreementFileOptions}
                                        placeholder="Select"
                                        isSearchable
                                        onChange={handleAgreementSelection}
                                        isDisabled={!selectedProperty || !selectedProperty.value}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: 43,
                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                borderWidth: 2,
                                                borderRadius: 8,
                                                fontSize: '0.875rem',
                                                paddingLeft: 4,
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    borderColor: 'rgba(191, 152, 83, 0.3)',
                                                },
                                            }),
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-14">
                                <div className="lg:flex p-5 border-2 border-opacity-20 border-[#BF9853] rounded-lg lg:w-[1610px] lg:h-[587px] overflow-y-auto no-scrollbar w-[420px] appearance-none no-spinner">
                                    <div className="relative  mt-5">
                                        <div className="absolute lg:right-2 top-0 bottom-0 lg:w-[2px] bg-[#BF9853] opacity-20" />
                                        <span
                                            className="absolute lg:right-1.5 lg:w-[6px] lg:h-10 lg:rounded-full bg-[#BF9853] transition-all duration-300"
                                            style={{ top: `${(currentStep - 1) * 68 + 12}px` }}
                                        />
                                        <ul className="relative z-10 lg:grid lg:gird-col-1 flex  overflow-auto no-scrollbar">
                                            {steps.map((step, index) => (
                                                <li key={index}
                                                    className="relative flex items-center justify-between lg:py-4 lg:px-6 py-4 lg:mr-5 ml-[-30px] cursor-pointer"
                                                    onClick={() => setCurrentStep(index + 1)}
                                                >
                                                    <span
                                                        className={`text-base w-[200px] mt-3 ${index + 1 === currentStep ? 'text-[#BF9853] font-bold' : 'text-gray-400 font-semibold '}`}
                                                    >
                                                        {step}
                                                    </span>
                                                    <span
                                                        className={`text-base hidden lg:inline ${index + 1 === currentStep ? 'text-[#BF9853]' : 'text-gray-400'}`}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="lg:w-full">
                                        {currentStep === 1 && (
                                            <div className="rounded-md p-6 bg-white text-left  border-opacity-15 flex flex-col">
                                                <div className="overflow-y-auto pr-2 flex-grow no-scrollbar">
                                                    {owners.map((owner, index) => (
                                                        <div key={index} className="mb-6">
                                                            <div className="flex items-end gap-x-5 mb-4">
                                                                <div className="text-lg font-semibold ml-2 mb-[7px]">
                                                                    {index + 1}.
                                                                </div>
                                                                <div>
                                                                    <label className="block font-semibold text-base mb-2">Owner</label>
                                                                    <Select
                                                                        options={filteredOwnerOptions}
                                                                        value={filteredOwnerOptions.find(option => option.value === owner.ownerName) || null}
                                                                        onChange={(selected) => {
                                                                            if (!selected) {
                                                                                handleOwnerChange(index, 'ownerName', '');
                                                                                handleOwnerChange(index, 'fullName', '');
                                                                                handleOwnerChange(index, 'fatherName', '');
                                                                                handleOwnerChange(index, 'age', '');
                                                                                handleOwnerChange(index, 'mobile', '');
                                                                                handleOwnerChange(index, 'ownerAddress', '');
                                                                                return;
                                                                            }
                                                                            const matchedProject = projects.find(p => p.projectReferenceName === selectedProperty?.value);
                                                                            const ownerDetailsArray = matchedProject?.ownerDetails 
                                                                                ? (Array.isArray(matchedProject.ownerDetails) 
                                                                                    ? matchedProject.ownerDetails 
                                                                                    : Array.from(matchedProject.ownerDetails || []))
                                                                                : [];
                                                                            const ownerObj = ownerDetailsArray.find(o => o.clientName === selected.value);
                                                                            if (ownerObj) {
                                                                                handleOwnerChange(index, 'ownerName', ownerObj.clientName);
                                                                                handleOwnerChange(index, 'fullName', ownerObj.clientName);
                                                                                handleOwnerChange(index, 'fatherName', ownerObj.fatherName);
                                                                                handleOwnerChange(index, 'age', ownerObj.age);
                                                                                handleOwnerChange(index, 'mobile', ownerObj.mobile);
                                                                                handleOwnerChange(index, 'ownerAddress', ownerObj.clientAddress);
                                                                            } else {
                                                                                handleOwnerChange(index, 'ownerName', selected.value || '');
                                                                            }
                                                                        }}
                                                                        placeholder="Select Owner"
                                                                        className="w-[210px]"
                                                                        isClearable
                                                                        menuPortalTarget={document.body}
                                                                        styles={{
                                                                            control: (provided, state) => ({
                                                                                ...provided,
                                                                                backgroundColor: 'transparent',
                                                                                borderWidth: '2px',
                                                                                borderColor: state.isFocused
                                                                                    ? 'rgba(191, 152, 83, 0.2)'
                                                                                    : 'rgba(191, 152, 83, 0.2)',
                                                                                borderRadius: '6px',
                                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                                '&:hover': {
                                                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                                },
                                                                            }),
                                                                            menuPortal: (base) => ({
                                                                                ...base,
                                                                                zIndex: 9999,
                                                                            }),
                                                                            placeholder: (provided) => ({
                                                                                ...provided,
                                                                                color: '#999',
                                                                                textAlign: 'left',
                                                                            }),
                                                                            menu: (provided) => ({
                                                                                ...provided,
                                                                                zIndex: 9999,
                                                                            }),
                                                                            option: (provided, state) => ({
                                                                                ...provided,
                                                                                textAlign: 'left',
                                                                                fontWeight: 'normal',
                                                                                fontSize: '15px',
                                                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                                color: 'black',
                                                                            }),
                                                                            singleValue: (provided) => ({
                                                                                ...provided,
                                                                                textAlign: 'left',
                                                                                fontWeight: 'normal',
                                                                                color: 'black',
                                                                            }),
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="ml-1">
                                                                    <label className="block font-semibold mb-2">Full Name</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter Name"
                                                                        className="w-[180px] h-[43px] border-2 border-opacity-20 border-[#BF9853] rounded-lg px-3 focus:outline-none placeholder:text-sm pl-4"
                                                                        value={owner.fullName}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            handleOwnerChange(index, 'fullName', value);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="ml-1">
                                                                    <label className="block font-semibold mb-2">Father Name</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter Name"
                                                                        className="w-[180px] h-[43px] border-2 border-opacity-20 border-[#BF9853] rounded-lg px-3 focus:outline-none placeholder:text-sm pl-4"
                                                                        value={owner.fatherName}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            handleOwnerChange(index, 'fatherName', value);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="ml-1">
                                                                    <label className="block font-semibold mb-2">Age</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Age"
                                                                        className="w-[70px] h-[43px] border-2 border-opacity-20 border-[#BF9853] rounded-lg px-1 focus:outline-none no-spinner placeholder:text-sm pl-4"
                                                                        value={owner.age}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            handleOwnerChange(index, 'age', value);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block font-semibold mb-2">Mobile No</label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Enter Number"
                                                                        className="w-[180px] h-[43px] border-2 border-opacity-20 border-[#BF9853] rounded-lg px-3 focus:outline-none no-spinner placeholder:text-sm pl-4"
                                                                        value={owner.mobile}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            if (/^\d{0,10}$/.test(value)) {
                                                                                handleOwnerChange(index, 'mobile', value);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end gap-3 mt-3 ml-8">
                                                                <div className="ml-2 relative">
                                                                    <label className="block font-semibold mb-2">Owner’s Address</label>
                                                                    <input
                                                                        className="w-[480px] border-2 border-opacity-20 border-[#BF9853] rounded-lg px-3 py-2 focus:outline-none placeholder:text-sm pl-4"
                                                                        placeholder="Enter owner's complete address with pincode"
                                                                        value={owner.ownerAddress}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            handleOwnerChange(index, 'ownerAddress', value);
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOwner(index)}
                                                                        className="absolute top-[2.5rem] -right-10 text-red-600 font-bold text-xl hover:text-red-800"
                                                                        title="Remove Owner"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="mt-5 ml-10">
                                                        <button
                                                            className="w-44 border-dashed border-b-2 text-[#E4572E] font-semibold border-[#BF9853]"
                                                            onClick={addOwner}
                                                        >
                                                            + Add Another Owner
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end mt-64">
                                                    <button className="bg-[#c59d5f] hover:bg-[#b38a47] text-white px-6 py-2 rounded w-[80px]"
                                                        onClick={() => setCurrentStep(2)}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {currentStep === 2 && (
                                            <div className="lg:w-full text-left p-6">
                                                {tenants.map((tenant, tenantIndex) => (
                                                    <div key={tenant.id} className="pb-4 mb-6 overflow-y-auto no-scrollbar">
                                                        <div className="flex  items-center justify-between">
                                                            <h3 className="font-semibold text-[#BF9853] mb-4">
                                                                Tenant - {tenantIndex + 1}
                                                            </h3>
                                                            <div className="flex items-center space-x-4">
                                                                <p onClick={addTenant}
                                                                   className="w-44 border-dashed border-b-2 text-[#E4572E] font-semibold border-[#BF9853] cursor-pointer"
                                                                >
                                                                    + Add another tenant
                                                                </p>
                                                                {tenants.length > 1 && (
                                                                    <button
                                                                        onClick={() => removeTenant(tenant.id)}
                                                                        className="text-red-600 font-bold text-xl"
                                                                        title="Remove tenant"
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="mb-1">
                                                            <label className="block font-semibold mb-2">Tenant Name</label>
                                                            <CreatableSelect
                                                                isClearable
                                                                options={options}
                                                                value={options.find((opt) => opt.value === tenant.tenantName) || null}
                                                                onChange={(newValue) =>
                                                                    handleTenantChange(tenant.id, 'tenantName', newValue?.value || '')
                                                                }
                                                                placeholder="Select or create..."
                                                                styles={{
                                                                    container: (base) => ({
                                                                        ...base,
                                                                        marginTop: 0,
                                                                    }),
                                                                    control: (base) => ({
                                                                        ...base,
                                                                        height: 43,
                                                                        minHeight: 43,
                                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                        borderWidth: 2,
                                                                        borderRadius: 8,
                                                                        paddingLeft: 8,
                                                                        fontSize: '0.875rem',
                                                                        boxShadow: 'none',
                                                                        '&:hover': {
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                        },
                                                                    }),
                                                                    indicatorsContainer: (base) => ({
                                                                        ...base,
                                                                        padding: 4,
                                                                    }),
                                                                }}
                                                            />
                                                        </div>
                                                        {tenant.tenantsList.map((partner, partnerIndex) => (
                                                            <div key={partnerIndex} className="lg:border lg:p-4 rounded mb-4 shadow-sm">
                                                                <div className="flex lg:gap-7 gap-3 items-end">
                                                                    <div>
                                                                        <label className="block font-semibold lg:mb-6 mb-6 lg:ml-0 ml-1">{String.fromCharCode(65 + partnerIndex)})</label>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block font-semibold mb-2">Full Name</label>
                                                                        <CreatableSelect
                                                                            isClearable
                                                                            value={partner.tenantFullName ? { label: partner.tenantFullName, value: partner.tenantFullName } : null}
                                                                            options={tenantFullNameOptions}
                                                                            onChange={(newValue) => {
                                                                                const selectedName = newValue?.value || '';
                                                                                const matchedTenant = tenantList.find(t => 
                                                                                    t.tenantName === tenant.tenantName && 
                                                                                    t.fullName === selectedName
                                                                                );
                                                                                handlePartnerChange(tenant.id, partnerIndex, 'tenantFullName', selectedName);
                                                                                if (matchedTenant) {
                                                                                    handlePartnerChange(tenant.id, partnerIndex, 'tenantFatherName', matchedTenant.tenantFatherName || '');
                                                                                    handlePartnerChange(tenant.id, partnerIndex, 'tenantAge', matchedTenant.age || '');
                                                                                    handlePartnerChange(tenant.id, partnerIndex, 'tenantMobile', matchedTenant.mobileNumber || '');
                                                                                    handlePartnerChange(tenant.id, partnerIndex, 'tenantAddress', matchedTenant.tenantAddress || '');
                                                                                }
                                                                            }}
                                                                            placeholder="Select..."
                                                                            styles={{
                                                                                container: (base) => ({
                                                                                    ...base,
                                                                                    width: 310,
                                                                                    marginBottom: 16,
                                                                                }),
                                                                                control: (base) => ({
                                                                                    ...base,
                                                                                    height: 43,
                                                                                    minHeight: 43,
                                                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                                    borderWidth: 2,
                                                                                    borderRadius: 8,
                                                                                    paddingLeft: 8,
                                                                                    fontSize: '0.875rem',
                                                                                    boxShadow: 'none',
                                                                                    '&:hover': {
                                                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                                    },
                                                                                }),
                                                                                indicatorsContainer: (base) => ({
                                                                                    ...base,
                                                                                    padding: 4,
                                                                                }),
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block font-semibold mb-2">Father Name</label>
                                                                        <input
                                                                            type="text"
                                                                            className="border-2 border-[#BF9853] rounded-md border-opacity-20 placeholder:text-sm pl-4 w-[380px] h-[43px] mb-4 focus:outline-none"
                                                                            placeholder="Enter father name"
                                                                            value={partner.tenantFatherName}
                                                                            onChange={(e) =>
                                                                                handlePartnerChange(tenant.id, partnerIndex, 'tenantFatherName', e.target.value)
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block font-semibold mb-2">Age</label>
                                                                        <input
                                                                            type="number"
                                                                            className="border-2 border-[#BF9853] rounded-md border-opacity-20 placeholder:text-sm pl-4 w-[70px] h-[43px] mb-4 focus:outline-none no-spinner"
                                                                            placeholder="Enter"
                                                                            value={partner.tenantAge}
                                                                            onChange={(e) =>
                                                                                handlePartnerChange(tenant.id, partnerIndex, 'tenantAge', e.target.value)
                                                                            }
                                                                            onWheel={(e) => e.target.blur()}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block font-semibold mb-2">Mobile Number</label>
                                                                        <input
                                                                            type="tel"
                                                                            maxLength={10}
                                                                            className="w-[310px] h-[43px] border-2 border-[#BF9853] border-opacity-20 rounded-md focus:outline-none no-spinner placeholder:text-sm pl-2 mb-4"
                                                                            placeholder="Enter number"
                                                                            value={partner.tenantMobile}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                if (/^\d{0,10}$/.test(val)) {
                                                                                    handlePartnerChange(tenant.id, partnerIndex, 'tenantMobile', val);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {tenant.tenantsList.length > 1 && (
                                                                            <button
                                                                                onClick={() => removePartner(tenant.id, partnerIndex)}
                                                                                className="text-red-600 text-sm font-semibold mb-6"
                                                                                title="Remove partner"
                                                                            >
                                                                                X
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3">
                                                                    <label className="block font-semibold mb-2">Tenant Address</label>
                                                                    <textarea
                                                                        className="border-2 border-[#BF9853] border-opacity-20 rounded-lg placeholder:text-sm pl-4 py-2 w-full max-w-[658px] h-[104px] resize-none focus:outline-none"
                                                                        placeholder="Enter Tenant complete address with pincode"
                                                                        value={partner.tenantAddress}
                                                                        onChange={(e) =>
                                                                            handlePartnerChange(tenant.id, partnerIndex, 'tenantAddress', e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button className="text-[#E4572E] text-base border-[#BF9853] border-dashed border-b-2 font-semibold ml-8"
                                                            onClick={() => addPartner(tenant.id)}
                                                        >
                                                            + Add Partner
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="flex justify-end mt-8 gap-5">
                                                    <button className="border w-[80px] h-[35px] text-[#BF9853] border-[#BF9853] rounded"
                                                        onClick={() => setCurrentStep(currentStep - 1)}
                                                    >
                                                        Back
                                                    </button>
                                                    <button className="bg-yellow-700 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition duration-200"
                                                        onClick={() => setCurrentStep(currentStep + 1)}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {currentStep === 3 && (
                                            <div className="p-6 items-start text-left w-full">
                                                <div className="overflow-y-auto no-scrollbar">
                                                    {ownersProperty.map((owner, index) => (
                                                        <div key={index} className="flex lg:flex-wrap gap-5 mt-6 pb-4">
                                                            <div className="text-lg font-semibold mt-9">
                                                                {index + 1}.
                                                            </div>
                                                            <div >
                                                                <label className="block font-semibold mb-2">Property Type</label>
                                                                <Select
                                                                    className="w-[150px] mb-4"
                                                                    value={propertyTypeOptions.find(option => option.value === owner.propertyType) || null}
                                                                    onChange={(selected) => {
                                                                        const selectedType = selected?.value || '';
                                                                        setOwnersProperty((prev) => {
                                                                            const updatedOwners = prev.map((item, ownerIdx) =>
                                                                                ownerIdx === index ? { ...item } : item
                                                                            );
                                                                            const ownerToUpdate = { ...updatedOwners[index] };
                                                                            ownerToUpdate.propertyType = selectedType;
                                                                            ownerToUpdate.floorOptions = selectedType ? (floorOptionsByType[selectedType] || []) : [];
                                                                            ownerToUpdate.shopNoOptions = selectedType ? (shopOptionsByType[selectedType] || []) : [];
                                                                            if (!selectedType) {
                                                                                ownerToUpdate.shopNos = '';
                                                                                ownerToUpdate.selectFloor = [];
                                                                            } else {
                                                                                const allowedShopValues = new Set(
                                                                                    (ownerToUpdate.shopNoOptions || []).map(option => option.value)
                                                                                );
                                                                                if (!allowedShopValues.has(String(ownerToUpdate.shopNos || ''))) {
                                                                                    ownerToUpdate.shopNos = '';
                                                                                }
                                                                                ownerToUpdate.selectFloor = [];
                                                                            }
                                                                            ownerToUpdate.bedroomsByFloor = {};
                                                                            updatedOwners[index] = ownerToUpdate;
                                                                            return updatedOwners;
                                                                        });
                                                                    }}
                                                                    options={propertyTypeOptions}
                                                                    placeholder="---Select---"
                                                                    isSearchable
                                                                    isClearable
                                                                    styles={{
                                                                        control: (provided) => ({
                                                                            ...provided,
                                                                            borderWidth: '2px',
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            borderRadius: '0.375rem',
                                                                            boxShadow: 'none',
                                                                            '&:hover': {
                                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            },
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-semibold mb-2">Floor</label>
                                                                <CreatableSelect
                                                                    value={owner.selectFloor}
                                                                    onChange={(value) => {
                                                                        const updated = [...ownersProperty];
                                                                        updated[index].selectFloor = value || [];
                                                                        setOwnersProperty(updated);
                                                                    }}
                                                                    className="w-[230px] h-[39px] mb-4 focus:outline-none placeholder:text-sm"
                                                                    options={owner.floorOptions || []}
                                                                    placeholder="Select floor..."
                                                                    isClearable
                                                                    isMulti
                                                                    styles={{
                                                                        ...customStyles,
                                                                        control: (provided) => ({
                                                                            ...provided,
                                                                            borderWidth: '2px',
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            borderRadius: '0.375rem',
                                                                            boxShadow: 'none',
                                                                            '&:hover': {
                                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            },
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-semibold mb-2">Shop No</label>
                                                                <Select
                                                                    className="w-[180px] mb-4"
                                                                    options={
                                                                        (owner.shopNoOptions && owner.shopNoOptions.length > 0)
                                                                            ? owner.shopNoOptions
                                                                            : globalShopOptions
                                                                    }
                                                                    value={
                                                                        ((owner.shopNoOptions && owner.shopNoOptions.length > 0)
                                                                            ? owner.shopNoOptions
                                                                            : globalShopOptions
                                                                        )?.find(option => option.value === owner.shopNos) || null
                                                                    }
                                                                    onChange={(selected) => handleShopSelection(index, selected)}
                                                                    placeholder="Select Shop No"
                                                                    isClearable
                                                                    styles={{
                                                                        control: (provided) => ({
                                                                            ...provided,
                                                                            borderWidth: '2px',
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            borderRadius: '0.375rem',
                                                                            boxShadow: 'none',
                                                                            '&:hover': {
                                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            },
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-semibold mb-2">Door No</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-[100px] h-[39px] border-2 border-[#BF9853] rounded-md border-opacity-20 placeholder:text-sm pl-4 mb-4 focus:outline-none"
                                                                    placeholder="Door No"
                                                                    value={owner.doorNo}
                                                                    onChange={(e) => {
                                                                        const updated = [...ownersProperty];
                                                                        updated[index].doorNo = e.target.value;
                                                                        setOwnersProperty(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-semibold mb-2">Area</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-[120px] h-[39px] placeholder:text-sm pl-4 border-2 border-[#BF9853] no-spinner rounded-md border-opacity-20 py-2 mb-4 focus:outline-none"
                                                                    placeholder="Enter Shop Sqft"
                                                                    value={owner.area}
                                                                    onChange={(e) => {
                                                                        const updated = [...ownersProperty];
                                                                        updated[index].area = e.target.value;
                                                                        setOwnersProperty(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-semibold mb-2">Rent</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-[150px] h-[39px] border-2 border-[#BF9853] rounded-md no-spinner border-opacity-20 placeholder:text-sm pl-4 mb-4 focus:outline-none"
                                                                    placeholder="Enter Amount"
                                                                    value={owner.rent}
                                                                    onChange={(e) => {
                                                                        const rentValue = e.target.value;
                                                                        const numericRent = parseFloat(rentValue);
                                                                        const updated = [...ownersProperty];
                                                                        updated[index].rent = rentValue;
                                                                        // Auto-calculate advance if rent is a valid number
                                                                        if (!isNaN(numericRent)) {
                                                                            updated[index].advance = (numericRent * 6).toFixed(2); // optional: limit to 2 decimal places
                                                                        } else {
                                                                            updated[index].advance = '';
                                                                        }
                                                                        setOwnersProperty(updated);
                                                                    }}
                                                                    onWheel={(e) => e.target.blur()}
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <div className="flex gap-3">
                                                                    <label className="block font-semibold mb-2">Advance</label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={owner.shouldCollectAdvance}
                                                                        onChange={(e) => {
                                                                            const updatedOwners = [...ownersProperty];
                                                                            updatedOwners[index].shouldCollectAdvance = e.target.checked;
                                                                            setOwnersProperty(updatedOwners);
                                                                        }}
                                                                        className="custom-checkbox cursor-pointer appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] mt-1"
                                                                    />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className="w-[150px] h-[39px] border-2 border-[#BF9853] rounded-md border-opacity-20 placeholder:text-sm pl-4 mb-4 focus:outline-none"
                                                                    placeholder="Enter Amount"
                                                                    value={owner.advance}
                                                                    onChange={(e) => {
                                                                        const updated = [...ownersProperty];
                                                                        updated[index].advance = e.target.value;
                                                                        setOwnersProperty(updated);
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedOwners = [...ownersProperty];
                                                                        updatedOwners.splice(index, 1);
                                                                        setOwnersProperty(updatedOwners);
                                                                    }}
                                                                    className="absolute ml-3 mt-1 text-red-500 font-bold text-base"
                                                                    title="Remove this property"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            {owner.propertyType === "House" &&
                                                                owner.selectFloor?.length > 0 &&
                                                                owner.selectFloor.map((floor) => (
                                                                    <div key={floor.label}>
                                                                        <label className="block text-gray-700">
                                                                            No. of bedrooms ({floor.label})
                                                                        </label>
                                                                        <div className="flex items-center border-2 border-[#BF9853] rounded-md border-opacity-20 mt-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updated = [...ownersProperty];
                                                                                    const count = updated[index].bedroomsByFloor[floor.label] || 0;
                                                                                    updated[index].bedroomsByFloor[floor.label] = Math.max(0, count - 1);
                                                                                    setOwnersProperty(updated);
                                                                                }}
                                                                                className="px-4 py-2 border-r-2 border-[#BF9853] rounded-md border-opacity-20"
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span className="px-[70px] py-2">
                                                                                {owner.bedroomsByFloor[floor.label] || 0}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updated = [...ownersProperty];
                                                                                    const count = updated[index].bedroomsByFloor[floor.label] || 0;
                                                                                    updated[index].bedroomsByFloor[floor.label] = count + 1;
                                                                                    setOwnersProperty(updated);
                                                                                }}
                                                                                className="px-4 py-2 border-l-2 border-[#BF9853] rounded-md border-opacity-20"
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ))}
                                                    <div className="">
                                                        <button
                                                            className="w-48 border-dashed border-b-2 text-[#E4572E] font-semibold border-[#BF9853]"
                                                            onClick={() => {
                                                                setOwnersProperty([
                                                                    ...ownersProperty,
                                                                    {
                                                                        propertyType: '',
                                                                        selectFloor: [],
                                                                        floorOptions: [],
                                                                        doorNo: '',
                                                                        shopOrLandDetails: '',
                                                                        bedroomsByFloor: {},
                                                                        rent: '',
                                                                        advance: '',
                                                                        shouldCollectAdvance: true
                                                                    }
                                                                ]);
                                                            }}
                                                        >
                                                            + Add Another Property
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-end mt-80">
                                                        <div className="flex gap-5">
                                                            <button className="border w-[80px] h-[35px] text-[#BF9853] border-[#BF9853] rounded " onClick={() => setCurrentStep(currentStep - 1)}>
                                                                Back
                                                            </button>
                                                            <button className="bg-[#BF9853] w-[80px] h-[35px] text-white rounded " onClick={() => setCurrentStep(4)}>
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {currentStep === 4 && (
                                            <div className="p-6 w-full bg-white">
                                                <div className="overflow-y-auto no-scrollbar">
                                                    <div className="flex flex-row mt-5 gap-10 text-left">
                                                        <div>
                                                            <label className="block font-semibold mb-1">Rent to be paid</label>
                                                            <div className="relative w-[152px] h-[43px]">
                                                                <input
                                                                    type="number"
                                                                    className="w-full h-full border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none appearance-none placeholder:text-sm pl-4 pr-10 no-spinner"
                                                                    placeholder="on or before"
                                                                    value={Renttobepaid}
                                                                    onChange={handlerenttobepaid}
                                                                    onWheel={(e) => e.target.blur()}
                                                                />
                                                                {Renttobepaid && (
                                                                    <span className="absolute ml-[-115px] mt-2.5 text-gray-700 pointer-events-none">
                                                                        {getSuffix(Renttobepaid)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Lock-in period</label>
                                                            <input
                                                                type="number"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none appearance-none placeholder:text-sm pl-4"
                                                                placeholder="(No.of months)"
                                                                value={Lockinperiod}
                                                                onChange={handlelockinperiod}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Notice period</label>
                                                            <input
                                                                type="number"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none appearance-none placeholder:text-sm pl-4"
                                                                placeholder="(No.of months)"
                                                                value={Noticeperiod}
                                                                onChange={handlenoticeperiod}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Created By</label>
                                                            <select
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none"
                                                                value={Createdby}
                                                                onChange={handlecreateby}
                                                            >
                                                                <option>Owner</option>
                                                                <option>Tenant</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row mt-5 gap-10 text-left">
                                                        <div>
                                                            <label className="block font-semibold mb-1">Agreement validity</label>
                                                            <input
                                                                type="number"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none placeholder:text-sm pl-4"
                                                                placeholder="(No.of months)"
                                                                value={Agreementvalidity}
                                                                onChange={handleAgreementValidity}
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Agreement CD</label>
                                                            <input
                                                                type="date"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none placeholder:text-sm pl-4"
                                                                placeholder="Created date"
                                                                value={Agreementcreatedate}
                                                                onChange={handleagreementcreatedate}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Agreement SD</label>
                                                            <input
                                                                type="date"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none placeholder:text-sm pl-4"
                                                                placeholder="Start date"
                                                                value={Agreementstartdate}
                                                                onChange={handleAgreementStartDate}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Agreement ED</label>
                                                            <input
                                                                type="date"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg border-opacity-20 focus:outline-none placeholder:text-sm pl-4"
                                                                placeholder="End date"
                                                                value={Agreementenddate}
                                                                onChange={handleAgreementEndDate}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex mt-5 gap-10 text-left">
                                                        <div>
                                                            <label className="block font-semibold mb-1">Overall Monthly Rent</label>
                                                            <input
                                                                type="text"
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg pl-4 border-opacity-20 focus:outline-none appearance-none"
                                                                value={`₹ ${Number(totals.totalRent).toLocaleString("en-IN")}`}
                                                                readOnly
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Overall Security Deposit</label>
                                                            <input
                                                                type="text"
                                                                className="w-[192px] h-[43px] border-2 border-[#BF9853] rounded-lg pl-4 border-opacity-20 focus:outline-none appearance-none"
                                                                value={`₹ ${Number(totals.totalAdvance).toLocaleString("en-IN")}`}
                                                                readOnly
                                                                onWheel={(e) => e.target.blur()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-semibold mb-1">Enhance Rent</label>
                                                            <select
                                                                value={selectedPercent}
                                                                onChange={(e) => setSelectedPercent(e.target.value)}
                                                                className="w-[152px] h-[43px] border-2 border-[#BF9853] rounded-lg pl-4 border-opacity-20 focus:outline-none appearance-none"
                                                            >
                                                                <option value="">Select %</option>
                                                                {percentageOptions.map((percent) => (
                                                                    <option key={percent} value={percent}>
                                                                        {percent}%
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex lg:justify-end mt-48">
                                                        <div className="flex gap-5">
                                                            <button className="border w-[80px] h-[35px] text-[#BF9853] border-[#BF9853] rounded " onClick={() => setCurrentStep(currentStep - 1)}>
                                                                Back
                                                            </button>
                                                            <button className="bg-[#BF9853] w-[80px] h-[35px] text-white rounded " onClick={() => setCurrentStep(5)}>
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {currentStep === 5 && (
                                            <div className="flex-1 lg:w-full w-[410px] flex flex-col p-6">
                                                <div className="bg-white text-left mt-6">
                                                    <div className=" flex gap-40">
                                                        <label className="font-semibold">Item Name</label>
                                                        <label className="font-semibold">How Many</label>
                                                    </div>
                                                    <div className="mt-4 overflow-y-auto">
                                                        {items.map((item, index) => (
                                                            <div key={index} className="flex gap-5 mb-4 items-center">
                                                                <CreatableSelect
                                                                    className="w-[216px]"
                                                                    isClearable
                                                                    isSearchable
                                                                    options={nameOptions}
                                                                    value={
                                                                        item.name
                                                                            ? nameOptions.find(option => option.value === item.name) || { label: item.name, value: item.name }
                                                                            : null
                                                                    }
                                                                    onChange={(selectedOption) =>
                                                                        handleInputChange(index, "name", selectedOption ? selectedOption.value : "")
                                                                    }
                                                                    placeholder="Select or type "
                                                                    styles={{
                                                                        control: (provided) => ({
                                                                            ...provided,
                                                                            borderWidth: '2px',
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            borderRadius: '0.375rem',
                                                                            boxShadow: 'none',
                                                                            '&:hover': {
                                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                            },
                                                                        }),
                                                                    }}
                                                                />
                                                                <div className="flex items-center border-2 border-[#BF9853] rounded-lg pl-4 border-opacity-20 focus:outline-none w-[216px] h-[43px] justify-between px-2">
                                                                    <button
                                                                        onClick={() => handleQuantityChange(index, -1)}
                                                                        className="w-10 text-lg text-gray-700"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-full text-center font-medium text-gray-700">
                                                                        {String(item.quantity).padStart(2, "0")}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(index, 1)}
                                                                        className="w-10 text-lg text-gray-700"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 flex space-x-4">
                                                        <button onClick={addMoreItems} className="text-[#E4572E] font-semibold text-sm border-dashed border-b-2 border-[#BF9853]">
                                                            + Add more
                                                        </button>
                                                        {items.length > 3 && (
                                                            <button onClick={removeLastItem} className="text-blue-600 text-sm">
                                                                Remove Items
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between mt-52">
                                                        <button
                                                            className="bg-[#007233] text-white py-2 px-6 rounded font-medium"
                                                            onClick={handleSubmitAgreement}
                                                        >
                                                            Generate Agreement
                                                        </button>
                                                        <button
                                                            className="border text-[#BF9853] border-[#BF9853]  py-2 px-6 rounded font-medium"
                                                            onClick={() => setCurrentStep(currentStep - 1)}
                                                        >
                                                            Back
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {currentStep === 4 && (
                                <div className=" mt-5 lg:ml-64 rounded-md lg:w-[850px] w-[410px] overflow-y-auto no-scrollbar">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="bg-[#f7f1e8] text-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left">S.No</th>
                                                <th className="px-4 py-2 text-left">Property Type</th>
                                                <th className="px-4 py-2 text-left">Floor</th>
                                                <th className="px-4 py-2 text-left">Door No</th>
                                                <th className="px-4 py-2 text-left">Area</th>
                                                <th className="px-4 py-2 text-left">Rent</th>
                                                <th className="px-4 py-2 text-left">Advance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ownersProperty.map((item, index) => (
                                                <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                                    <td className="px-2 py-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="px-2 py-2 text-left ">{item.propertyType}</td>
                                                    <td className="px-2 py-2 text-left">
                                                        {Array.isArray(item.selectFloor)
                                                            ? item.selectFloor.map(floor => floor.label || floor.value).join(', ')
                                                            : ''}
                                                    </td>
                                                    <td className="px-2 py-2 text-left ">{item.doorNo}</td>
                                                    <td className="px-2 py-2 text-left ">{item.area}</td>
                                                    <td className="px-2 py-2 ">{parseFloat(item.rent || 0).toFixed(2)}</td>
                                                    <td className="px-2 py-2">{parseFloat(item.advance || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {isRentPopupOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                    <div className="bg-white p-3 rounded-lg shadow-lg text-center">
                                        <div>
                                            <img src={loadingScreen} alt="Loading..." className="w-10 h-10 mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
}
export default RentalAgreement