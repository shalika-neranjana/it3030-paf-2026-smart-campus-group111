import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, Edit, Plus, X, Save, Box, Users, MapPin, Activity } from 'lucide-react';
import './ManageFacilities.css';

const ManageFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFacility, setCurrentFacility] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        description: '',
        availabilityWindows: ''
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/facilities');
            setFacilities(response.data);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (facility = null) => {
        if (facility) {
            setCurrentFacility(facility);
            setFormData({
                ...facility,
                availabilityWindows: facility.availabilityWindows?.join(', ') || ''
            });
        } else {
            setCurrentFacility(null);
            setFormData({
                name: '',
                type: 'LECTURE_HALL',
                capacity: '',
                location: '',
                status: 'ACTIVE',
                description: '',
                availabilityWindows: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            availabilityWindows: formData.availabilityWindows.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            if (currentFacility) {
                await api.put(`/api/facilities/${currentFacility.id}`, data);
            } else {
                await api.post('/api/facilities', data);
            }
            setIsModalOpen(false);
            fetchFacilities();
        } catch (error) {
            console.error('Error saving facility:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await api.delete(`/api/facilities/${id}`);
            fetchFacilities();
        } catch (error) {
            console.error('Error deleting facility:', error);
        }
    };

    return (
        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Resource Management</h2>
                    <p className="text-slate-500 font-medium">Control campus assets and availability windows.</p>
                </div>
                <button 
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-95"
                    onClick={() => handleOpenModal()}
                >
                    <Plus size={20} /> Add New Asset
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Accessing Repository...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                                <th className="px-6 py-4">Resource Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Metrics</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities.map(f => (
                                <tr key={f.id} className="group bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 rounded-2xl">
                                    <td className="px-6 py-5 first:rounded-l-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                                <Box size={20} />
                                            </div>
                                            <span className="font-bold text-slate-800">{f.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                                            {f.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                            <Users size={14} className="text-slate-300" />
                                            {f.capacity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                            <MapPin size={14} className="text-slate-300" />
                                            {f.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            f.status === 'ACTIVE' 
                                            ? 'bg-emerald-50 text-emerald-600' 
                                            : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {f.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right last:rounded-r-2xl">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                onClick={() => handleOpenModal(f)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                onClick={() => handleDelete(f.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">{currentFacility ? 'Modify Asset' : 'New Resource'}</h3>
                                <p className="text-slate-400 text-sm font-medium">Define property details and availability.</p>
                            </div>
                            <button 
                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-500 hover:border-rose-100 transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={20}/>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select 
                                        name="type" 
                                        value={formData.type} 
                                        onChange={handleInputChange}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold cursor-pointer"
                                    >
                                        <option value="LECTURE_HALL">Lecture Hall</option>
                                        <option value="LAB">Laboratory</option>
                                        <option value="MEETING_ROOM">Meeting Room</option>
                                        <option value="EQUIPMENT">Equipment</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Max Capacity</label>
                                    <input 
                                        type="number" 
                                        name="capacity" 
                                        value={formData.capacity} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Map Location</label>
                                    <input 
                                        name="location" 
                                        value={formData.location} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Operational Status</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleInputChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold cursor-pointer"
                                >
                                    <option value="ACTIVE">Operational (Active)</option>
                                    <option value="OUT_OF_SERVICE">Under Maintenance (Out of Service)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Resource Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    rows="3"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold resize-none"
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Availability Windows (CSV)</label>
                                <input 
                                    name="availabilityWindows" 
                                    value={formData.availabilityWindows} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. 08:00-12:00, 14:00-18:00" 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button" 
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Discard
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> {currentFacility ? 'Commit Changes' : 'Initialize Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFacilities;
