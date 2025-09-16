'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import pb from '../lib/pocketbase';

export default function ProductEditRow({ rowData, onUpdate, onDelete, onSave, categories, isExisting }) {
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === "picture") {
            const file = files[0];
            if (file) {
                setFileName(file.name);
                setPreviewUrl(URL.createObjectURL(file));
                onUpdate(rowData.id, { picture: file });
            }
        } else {
            onUpdate(rowData.id, { [name]: value });
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const getImageUrl = () => {
        if (previewUrl) {
            return previewUrl;
        }
        if (isExisting && rowData.picture) {
            try {
                return pb.files.getUrl(rowData, rowData.picture, { thumb: '100x100' });
            } catch (e) {
                console.error("Error generating image URL:", e);
                return '/images/placeholder.jpg';
            }
        }
        return '/images/placeholder.jpg';
    };

    const displayImageUrl = getImageUrl();
    const uniqueFileId = `file-input-${rowData.id}`;
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '5px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: '100px', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '80px', height: '60px', margin: '0 auto 5px' }}>
                    <Image
                        src={displayImageUrl}
                        alt="Preview"
                        layout="fill"
                        objectFit="cover"
                        style={{ borderRadius: '4px' }}
                    />
                </div>
                <label htmlFor={uniqueFileId} style={{ fontSize: '10px', color: '#007bff', cursor: 'pointer' }}>
                    {isExisting ? 'เปลี่ยนรูป' : 'เลือกรูป'}
                </label>
                <input id={uniqueFileId} type="file" name="picture" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
                {fileName && <div style={{ fontSize: '10px', color: 'grey', marginTop: '4px' }}>{fileName}</div>}
            </div>

            <input type="text" name="name" placeholder="ชื่อสินค้า" value={rowData.name || ''} onChange={handleChange} style={{ flex: 3, padding: '8px' }}/>
            <input type="number" name="price" placeholder="ราคา" value={rowData.price || ''} onChange={handleChange} style={{ flex: 1, padding: '8px' }}/>
            <input type="number" name="stock" placeholder="คงเหลือ" value={rowData.stock || ''} onChange={handleChange} style={{ flex: 1, padding: '8px' }}/>
            <select name="relation" value={rowData.relation || ''} onChange={handleChange} style={{ flex: 2, padding: '8px' }}>
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <div style={{ display: 'flex', gap: '5px', width: '120px', justifyContent: 'flex-end' }}>
                {isExisting && (
                    <button onClick={() => onSave(rowData.id)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                )}
                <button onClick={() => onDelete(rowData.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
            </div>
        </div>
    );
}