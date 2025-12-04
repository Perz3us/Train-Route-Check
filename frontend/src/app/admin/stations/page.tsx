"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Train
} from 'lucide-react';
import { stationsApi, type Station } from '@/lib/api';

export default function StationManagement() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStation, setNewStation] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    city: '',
    province: ''
  });
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stationsApi.getAll();
      setStations(data);
    } catch (err: any) {
      console.error('Error fetching stations:', err);
      setError(`Failed to load stations: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = async () => {
    try {
      const stationToAdd = {
        name: newStation.name,
        code: newStation.code,
        latitude: parseFloat(newStation.latitude),
        longitude: parseFloat(newStation.longitude),
        city: newStation.city,
        province: newStation.province
      };

      const data = await stationsApi.create(stationToAdd);
      setStations([data, ...stations]);
      setNewStation({
        name: '',
        code: '',
        latitude: '',
        longitude: '',
        city: '',
        province: ''
      });
      setShowAddForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding station:', err);
      setError(`Failed to add station: ${err.message || err}`);
    }
  };

  const handleUpdateStation = async () => {
    if (!editingStation) return;

    try {
      const stationToUpdate = {
        name: editingStation.name,
        code: editingStation.code,
        latitude: editingStation.latitude,
        longitude: editingStation.longitude,
        city: editingStation.city,
        province: editingStation.province
      };

      const data = await stationsApi.update(editingStation.id, stationToUpdate);
      setStations(stations.map(station => 
        station.id === editingStation.id ? data : station
      ));
      setEditingStation(null);
      setError(null);
    } catch (err: any) {
      console.error('Error updating station:', err);
      setError(`Failed to update station: ${err.message || err}`);
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    try {
      await stationsApi.delete(id);
      setStations(stations.filter(station => station.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting station:', err);
      setError(`Failed to delete station: ${err.message || err}`);
    }
  };

  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-white p-6 space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Station Management
          </h1>
          <p className="text-gray-400 mt-2">Manage your railway network infrastructure</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Station
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
            <Train className="h-8 w-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Stations</p>
            <p className="text-2xl font-bold text-white">{stations.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
            <MapPin className="h-8 w-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Active Regions</p>
            <p className="text-2xl font-bold text-white">
              {new Set(stations.map(s => s.province)).size}
            </p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-500/20 text-green-400">
            <Search className="h-8 w-8" />
          </div>
          <div className="w-full">
            <p className="text-gray-400 text-sm mb-1">Quick Search</p>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search stations..." 
                className="glass-input pl-8 h-9 text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200 flex items-center animate-pulse">
          <X className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingStation) && (
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {editingStation ? 'Edit Station' : 'Add New Station'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowAddForm(false);
                setEditingStation(null);
              }}
              className="hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Station Name</Label>
              <Input
                value={editingStation ? editingStation.name : newStation.name}
                onChange={(e) => editingStation 
                  ? setEditingStation({...editingStation, name: e.target.value})
                  : setNewStation({...newStation, name: e.target.value})
                }
                className="glass-input text-white"
                placeholder="e.g., Colombo Fort"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Station Code</Label>
              <Input
                value={editingStation ? editingStation.code : newStation.code}
                onChange={(e) => editingStation 
                  ? setEditingStation({...editingStation, code: e.target.value})
                  : setNewStation({...newStation, code: e.target.value})
                }
                className="glass-input text-white"
                placeholder="e.g., FOT"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">City</Label>
              <Input
                value={editingStation ? editingStation.city : newStation.city}
                onChange={(e) => editingStation 
                  ? setEditingStation({...editingStation, city: e.target.value})
                  : setNewStation({...newStation, city: e.target.value})
                }
                className="glass-input text-white"
                placeholder="e.g., Colombo"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Province</Label>
              <Input
                value={editingStation ? editingStation.province : newStation.province}
                onChange={(e) => editingStation 
                  ? setEditingStation({...editingStation, province: e.target.value})
                  : setNewStation({...newStation, province: e.target.value})
                }
                className="glass-input text-white"
                placeholder="e.g., Western"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Latitude</Label>
              <Input
                type="number"
                step="any"
                value={editingStation ? editingStation.latitude : newStation.latitude}
                onChange={(e) => editingStation 
                  ? setEditingStation({...editingStation, latitude: parseFloat(e.target.value) || 0})
                  : setNewStation({...newStation, latitude: e.target.value})
                }
                className="glass-input text-white"
                placeholder="6.9333"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Longitude</Label>
              <Input
                type="number"
                step="any"
                value={editingStation ? editingStation.longitude : newStation.longitude}
                onChange={(e) => editingStation 
                  ? setEditingStation({...editingStation, longitude: parseFloat(e.target.value) || 0})
                  : setNewStation({...newStation, longitude: e.target.value})
                }
                className="glass-input text-white"
                placeholder="79.8500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false);
                setEditingStation(null);
              }}
              className="border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={editingStation ? handleUpdateStation : handleAddStation}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingStation ? 'Update Station' : 'Save Station'}
            </Button>
          </div>
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />
          ))
        ) : filteredStations.length > 0 ? (
          filteredStations.map((station) => (
            <div 
              key={station.id} 
              className="glass-card p-5 group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <Train className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingStation(station)}
                    className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteStation(station.id)}
                    className="h-8 w-8 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{station.name}</h3>
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs mr-2">{station.code}</span>
                <span>{station.city}</span>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Province</span>
                  <span className="text-gray-300">{station.province}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Coordinates</span>
                  <span className="text-gray-300 text-xs">
                    {Number(station.latitude).toFixed(4)}, {Number(station.longitude).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="p-6 rounded-full bg-white/5 mb-4">
              <Search className="h-12 w-12 opacity-50" />
            </div>
            <p className="text-lg">No stations found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}