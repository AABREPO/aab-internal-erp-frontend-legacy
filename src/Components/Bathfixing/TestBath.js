import React, { useState, useEffect } from 'react';

const BathFixtur = () => {
    const [floorOptions, setFloorOptions] = useState([]);
    const [rows, setRows] = useState([{ id: 1, floor: '', bath: '' }]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuilderDash//api/tile/floorName');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const areas = data.map(item => item.floorName);
                setFloorOptions([...new Set(areas)]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    
    const bathOptions = ['Bath1', 'Bath2', 'Bath3', 'Bath4'];

    const duplicateRow = (index) => {
        const newRow = { ...rows[index], id: rows.length + 1 };
        setRows([...rows, newRow]);
    };

    const duplicateFullSet = () => {
        const newSet = rows.map(row => ({ ...row, id: rows.length + 1 + Math.random() }));
        setRows([...rows, ...newSet]);
    };

    return (
        <div style={{ padding: '20px' }}>
            <table border="1" cellPadding="5" cellSpacing="0">
                <tbody>
                    {rows.map((row, index) => (
                        <React.Fragment key={row.id}>
                            <tr>
                                <td>
                                    <select value={row.floor} onChange={(e) => {
                                        const newRows = [...rows];
                                        newRows[index].floor = e.target.value;
                                        setRows(newRows);
                                    }}>
                                        <option value="">Select Floor</option>
                                        {floorOptions.map((option, idx) => (
                                            <option key={idx} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <select value={row.bath} onChange={(e) => {
                                        const newRows = [...rows];
                                        newRows[index].bath = e.target.value;
                                        setRows(newRows);
                                    }}>
                                        <option value="">Select Bath</option>
                                        {bathOptions.map((option, idx) => (
                                            <option key={idx} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => duplicateRow(index)}>Duplicate Row</button>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <button onClick={duplicateFullSet} style={{ marginTop: '10px' }}>Duplicate Full Set</button>
        </div>
    );
};

export default BathFixtur;
