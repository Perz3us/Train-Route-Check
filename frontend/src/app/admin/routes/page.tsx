"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { 
  Route as RouteIcon,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Clock,
  ArrowRight
} from 'lucide-react';
import { routesApi, stationsApi, trainsApi, type Route, type Station, type Train as TrainType } from '@/lib/api';

// Helper function to extract time from datetime string (HH:MM format)
const extractTime = (datetimeString: string | null): string => {
  if (!datetimeString) return '';
  try {
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(datetimeString)) {
      return datetimeString;
    }
    const date = new Date(datetimeString);
    return date.toTimeString().slice(0, 5);
  } catch (e) {
    return '';
  }
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRoute, setNewRoute] = useState({
    trainNumber: '',
    name: '',
    isActive: true,
    startTime: '',
    endTime: ''
  });
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [availableTrains, setAvailableTrains] = useState<TrainType[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesData, stationsData, trainsData] = await Promise.all([
        routesApi.getAll(),
        stationsApi.getAll(),
        trainsApi.getAll()
      ]);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setStations(Array.isArray(stationsData) ? stationsData : []);
      setAvailableTrains(Array.isArray(trainsData) ? trainsData : []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async () => {
    try {
      const routeToAdd = {
        trainNumber: newRoute.trainNumber,
        name: newRoute.name,
        isActive: newRoute.isActive,
        startTime: newRoute.startTime || null,
        endTime: newRoute.endTime || null
      };

      const data = await routesApi.create(routeToAdd);
      setRoutes([data, ...routes]);
      setNewRoute({
        trainNumber: '',
        name: '',
        isActive: true,
        startTime: '',
        endTime: ''
      });
      setShowAddForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding route:', err);
      setError(`Failed to add route: ${err.message || err}`);
    }
  };

  const handleUpdateRoute = async () => {
    if (!editingRoute) return;

    try {
      const routeToUpdate = {
        trainNumber: editingRoute.trainNumber,
        name: editingRoute.name,
        isActive: editingRoute.isActive,
        startTime: editingRoute.startTime || null,
        endTime: editingRoute.endTime || null
      };

      const data = await routesApi.update(editingRoute.id, routeToUpdate);
      setRoutes(routes.map(route => 
        route.id === editingRoute.id ? data : route
      ));
      setEditingRoute(null);
      setError(null);
    } catch (err: any) {
      console.error('Error updating route:', err);
      setError(`Failed to update route: ${err.message || err}`);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await routesApi.delete(id);
      setRoutes(routes.filter(route => route.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting route:', err);
      setError(`Failed to delete route: ${err.message || err}`);
    }
  };

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.trainNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Gradient matching Landing Page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0 pointer-events-none" />

      <div className="relative z-10 p-6 space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Route <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Management</span>
            </h1>
            <p className="text-xl text-gray-400 mt-2">Manage train schedules and paths</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-12 px-8 text-lg bg-white text-background hover:bg-gray-100 font-semibold shadow-lg shadow-white/10 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Route
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors duration-300 group flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-purple-400">
              <RouteIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Routes</p>
              <p className="text-2xl font-bold text-white">{routes.length}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors duration-300 group flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-cyan-400">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Schedules</p>
              <p className="text-2xl font-bold text-white">
                {routes.filter(r => r.isActive).length}
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors duration-300 group flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-emerald-400">
              <Search className="h-8 w-8" />
            </div>
            <div className="w-full">
              <p className="text-gray-400 text-sm mb-1">Quick Search</p>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search routes..." 
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 pl-8 h-9 text-sm w-full focus:border-primary/50 focus:ring-primary/20"
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
        {(showAddForm || editingRoute) && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-fade-in-up backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRoute(null);
                }}
                className="hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Train Number</Label>
                <SearchableSelect
                  options={availableTrains.map(t => ({
                    value: t.trainNumber,
                    label: `${t.trainNumber} - ${t.name}`
                  }))}
                  value={editingRoute ? editingRoute.trainNumber : newRoute.trainNumber}
                  onChange={(value: string) => editingRoute 
                    ? setEditingRoute({...editingRoute, trainNumber: value})
                    : setNewRoute({...newRoute, trainNumber: value})
                  }
                  placeholder="Select a train..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Route Name</Label>
                <Input
                  value={editingRoute ? editingRoute.name : newRoute.name}
                  onChange={(e) => editingRoute 
                    ? setEditingRoute({...editingRoute, name: e.target.value})
                    : setNewRoute({...newRoute, name: e.target.value})
                  }
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                  placeholder="e.g., Colombo - Kandy Express"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Start Time</Label>
                <Input
                  type="time"
                  value={editingRoute ? extractTime(editingRoute.startTime) : newRoute.startTime}
                  onChange={(e) => editingRoute 
                    ? setEditingRoute({...editingRoute, startTime: e.target.value})
                    : setNewRoute({...newRoute, startTime: e.target.value})
                  }
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">End Time</Label>
                <Input
                  type="time"
                  value={editingRoute ? extractTime(editingRoute.endTime) : newRoute.endTime}
                  onChange={(e) => editingRoute 
                    ? setEditingRoute({...editingRoute, endTime: e.target.value})
                    : setNewRoute({...newRoute, endTime: e.target.value})
                  }
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                 <Switch
                   id="is_active"
                   checked={editingRoute ? editingRoute.isActive : newRoute.isActive}
                   onCheckedChange={(checked: boolean) => editingRoute 
                     ? setEditingRoute({...editingRoute, isActive: checked})
                     : setNewRoute({...newRoute, isActive: checked})
                   }
                 />
                 <Label htmlFor="is_active" className="text-gray-300">Active Route</Label>
               </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRoute(null);
                }}
                className="border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={editingRoute ? handleUpdateRoute : handleAddRoute}
                className="bg-white text-background hover:bg-gray-100 font-semibold shadow-lg shadow-white/10"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingRoute ? 'Update Route' : 'Save Route'}
              </Button>
            </div>
          </div>
        )}

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : filteredRoutes.length > 0 ? (
            filteredRoutes.map((route) => (
              <div 
                key={route.id} 
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <RouteIcon className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingRoute(route)}
                      className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteRoute(route.id)}
                      className="h-8 w-8 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">
                    #{route.trainNumber}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${route.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {route.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">{route.name}</h3>

                <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/5 pt-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                    <span>{extractTime(route.startTime) || '--:--'}</span>
                    <ArrowRight className="h-3 w-3 mx-2 text-gray-600" />
                    <span>{extractTime(route.endTime) || '--:--'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="p-6 rounded-full bg-white/5 mb-4">
                <Search className="h-12 w-12 opacity-50" />
              </div>
              <p className="text-lg">No routes found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
