import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import './FacilitiesPage.css';

const FacilitiesPage = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState({
        type: '',
        minCapacity: '',
        location: ''
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (params.type) queryParams.append('type', params.type);
            if (params.minCapacity) queryParams.append('minCapacity', params.minCapacity);
            if (params.location) queryParams.append('location', params.location);

            const response = await api.get(`/api/facilities?${queryParams.toString()}`);
            setFacilities(response.data);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchFacilities(search);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 font-sans text-slate-800">
            <header className="text-center mb-16">
                <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                    Facilities & Assets Catalogue
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Explore and book premium campus resources tailored for your next academic or professional session.
                </p>
            </header>

            <section className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-16">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-600 ml-1">Resource Type</label>
                        <select 
                            name="type" 
                            value={search.type} 
                            onChange={handleSearchChange}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="">All Types</option>
                            <option value="LECTURE_HALL">Lecture Hall</option>
                            <option value="LAB">Laboratory</option>
                            <option value="MEETING_ROOM">Meeting Room</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-600 ml-1">Min Capacity</label>
                        <input 
                            type="number" 
                            name="minCapacity" 
                            placeholder="e.g. 50" 
                            value={search.minCapacity} 
                            onChange={handleSearchChange} 
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-600 ml-1">Location</label>
                        <input 
                            type="text" 
                            name="location" 
                            placeholder="e.g. Block A" 
                            value={search.location} 
                            onChange={handleSearchChange} 
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all transform active:scale-95"
                    >
                        Search Now
                    </button>
                </form>
            </section>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    <div className="col-span-full text-center py-20">
                        <div className="animate-pulse text-slate-400 text-xl font-medium">Synchronizing resources...</div>
                    </div>
                ) : facilities.length > 0 ? (
                    facilities.map(facility => (
                        <div key={facility.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-slate-100 transition-all duration-500">
                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={facility.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'} 
                                    alt={facility.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                                    facility.status === 'ACTIVE' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                } shadow-sm`}>
                                    {facility.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{facility.name}</h3>
                                <div className="flex flex-col gap-3 mb-6">
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-bold text-slate-400 uppercase tracking-tighter">Type</span>
                                        <span className="text-slate-600 font-semibold">{facility.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-bold text-slate-400 uppercase tracking-tighter">Capacity</span>
                                        <span className="text-slate-600 font-semibold">{facility.capacity} People</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-bold text-slate-400 uppercase tracking-tighter">Location</span>
                                        <span className="text-slate-600 font-semibold">{facility.location}</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 italic">
                                    "{facility.description}"
                                </p>
                                <div className="mb-8">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Available Slots</span>
                                    <div className="flex flex-wrap gap-2">
                                        {facility.availabilityWindows && facility.availabilityWindows.map((win, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-lg border border-indigo-100">
                                                {win}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                        facility.status === 'ACTIVE' 
                                        ? 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 cursor-pointer' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                    disabled={facility.status === 'OUT_OF_SERVICE'}
                                >
                                    {facility.status === 'ACTIVE' ? 'Reserve Resource' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center">
                        <div className="text-slate-300 text-6xl mb-6">∅</div>
                        <h3 className="text-xl font-bold text-slate-400">No matches found for your criteria.</h3>
                        <p className="text-slate-400">Try adjusting your filters or location search.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FacilitiesPage;
