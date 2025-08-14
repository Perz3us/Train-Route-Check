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
  X
} from 'lucide-react';
import { stationsApi, type Station } from '@/lib/api';

export default function StationManagement() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      console.log('Fetching stations from:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/stations`);
      setLoading(true);
      setError(null);
      const data = await stationsApi.getAll();
      console.log('Received stations:', data);
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

      console.log('Adding station:', stationToAdd);
      const data = await stationsApi.create(stationToAdd);
      console.log('Station added:', data);
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

      console.log('Updating station:', editingStation.id, stationToUpdate);
      const data = await stationsApi.update(editingStation.id, stationToUpdate);
      console.log('Station updated:', data);
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
    try {
      console.log('Deleting station:', id);
      await stationsApi.delete(id);
      console.log('Station deleted:', id);
      setStations(stations.filter(station => station.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting station:', err);
      setError(`Failed to delete station: ${err.message || err}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gray-900 border-b border-gray-800">
            <div className="flex h-16 items-center px-6 justify-between">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-xl font-bold">Stations</h1>
              </div>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 bg-gray-900">
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {showAddForm && (
              <Card className="mb-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add New Station</CardTitle>
                  <CardDescription className="text-gray-400">Create a new train station</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Station Name</Label>
                      <Input
                        id="name"
                        value={newStation.name}
                        onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., Colombo Fort"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-gray-300">Station Code</Label>
                      <Input
                        id="code"
                        value={newStation.code}
                        onChange={(e) => setNewStation({...newStation, code: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., CMB"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-300">City</Label>
                      <Input
                        id="city"
                        value={newStation.city}
                        onChange={(e) => setNewStation({...newStation, city: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., Colombo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-gray-300">Province</Label>
                      <Input
                        id="province"
                        value={newStation.province}
                        onChange={(e) => setNewStation({...newStation, province: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., Western"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-gray-300">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={newStation.latitude}
                        onChange={(e) => setNewStation({...newStation, latitude: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., 6.9333"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-gray-300">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={newStation.longitude}
                        onChange={(e) => setNewStation({...newStation, longitude: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., 79.8500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-600 text-white hover:bg-gray-700">
                      Cancel
                    </Button>
                    <Button onClick={handleAddStation} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Save Station
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {editingStation && (
              <Card className="mb-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Edit Station</CardTitle>
                  <CardDescription className="text-gray-400">Modify station details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_name" className="text-gray-300">Station Name</Label>
                      <Input
                        id="edit_name"
                        value={editingStation.name}
                        onChange={(e) => setEditingStation({...editingStation, name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_code" className="text-gray-300">Station Code</Label>
                      <Input
                        id="edit_code"
                        value={editingStation.code}
                        onChange={(e) => setEditingStation({...editingStation, code: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_city" className="text-gray-300">City</Label>
                      <Input
                        id="edit_city"
                        value={editingStation.city}
                        onChange={(e) => setEditingStation({...editingStation, city: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_province" className="text-gray-300">Province</Label>
                      <Input
                        id="edit_province"
                        value={editingStation.province}
                        onChange={(e) => setEditingStation({...editingStation, province: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_latitude" className="text-gray-300">Latitude</Label>
                      <Input
                        id="edit_latitude"
                        type="number"
                        step="any"
                        value={editingStation.latitude}
                        onChange={(e) => setEditingStation({...editingStation, latitude: parseFloat(e.target.value) || 0})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_longitude" className="text-gray-300">Longitude</Label>
                      <Input
                        id="edit_longitude"
                        type="number"
                        step="any"
                        value={editingStation.longitude}
                        onChange={(e) => setEditingStation({...editingStation, longitude: parseFloat(e.target.value) || 0})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setEditingStation(null)} className="border-gray-600 text-white hover:bg-gray-700">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateStation} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Update Station
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Stations</CardTitle>
                <CardDescription className="text-gray-400">Manage all train stations</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <p>Loading stations...</p>
                  </div>
                ) : stations.length > 0 ? (
                  <div className="space-y-4">
                    {stations.map((station) => (
                      <div key={station.id} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{station.name}</h3>
                            <p className="text-sm text-gray-400">Code: {station.code}</p>
                            <p className="text-sm text-gray-400">{station.city}, {station.province}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {Number(station.latitude).toFixed(4)}, {Number(station.longitude).toFixed(4)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingStation(station)}
                              className="border-gray-600 text-white hover:bg-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteStation(station.id)}
                              className="border-gray-600 text-white hover:bg-gray-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">No stations found</p>
                      <p className="text-gray-500 text-sm mt-1">Create your first station to get started</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}