"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Route as RouteIcon,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search
} from 'lucide-react';
import { routesApi, stationsApi, type Route, type Station } from '@/lib/api';
import { StationSelectorModal } from '@/components/StationSelectorModal';

// Helper function to extract time from datetime string (HH:MM format)
const extractTime = (datetimeString: string | null): string => {
  if (!datetimeString) return '';
  try {
    // If it's already in HH:MM format, return as is
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(datetimeString)) {
      return datetimeString;
    }
    // Otherwise, extract time from full datetime string
    const date = new Date(datetimeString);
    return date.toTimeString().slice(0, 5); // Extract HH:MM
  } catch (e) {
    return '';
  }
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState({
    trainNumber: '',
    name: '',
    isActive: true,
    startTime: '',
    endTime: ''
  });
  const [newRouteStations, setNewRouteStations] = useState<any[]>([]); // For managing stations in new route form
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingStations, setEditingStations] = useState<any[]>([]); // For managing stations in edit form
  const [showAddForm, setShowAddForm] = useState(false);
  const [isStationSelectorOpen, setIsStationSelectorOpen] = useState(false);
  const [isNewRouteStationSelectorOpen, setIsNewRouteStationSelectorOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchRoutes(), fetchStations()]);
  }, []);

  const fetchRoutes = async () => {
    try {
      console.log('Fetching routes from:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/routes`);
      setLoading(true);
      setError(null);
      const data = await routesApi.getAll();
      console.log('Received routes:', data);
      // Ensure we're setting an array of routes
      const routesArray = Array.isArray(data) ? data : [];
      setRoutes(routesArray);
    } catch (err: any) {
      console.error('Error fetching routes:', err);
      setError(`Failed to load routes: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const data = await stationsApi.getAll();
      const stationsArray = Array.isArray(data) ? data : [];
      console.log('Fetched stations:', stationsArray);
      setStations(stationsArray);
    } catch (err: any) {
      console.error('Error fetching stations:', err);
      setError(`Failed to load stations: ${err.message || err}`);
    }
  };

  const handleAddRoute = async () => {
    try {
      const routeToAdd = {
        trainNumber: newRoute.trainNumber,
        name: newRoute.name,
        isActive: newRoute.isActive,
        startTime: newRoute.startTime || null,
        endTime: newRoute.endTime || null,
        // Include stations for new route
        stations: newRouteStations.map((station, index) => ({
          stationId: station.stationId || station.station.id,
          sequence: index + 1,
          distanceFromStart: station.distanceFromStart || 0,
          estimatedDuration: station.estimatedDuration || 0,
          stopDuration: station.stopDuration || 2
        }))
      };

      console.log('Adding route:', routeToAdd);
      const data = await routesApi.create(routeToAdd);
      console.log('Route added:', data);
      setRoutes([data, ...routes]);
      setNewRoute({
        trainNumber: '',
        name: '',
        isActive: true,
        startTime: '',
        endTime: ''
      });
      setNewRouteStations([]); // Clear stations
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
        endTime: editingRoute.endTime || null,
        // Include stations if they've been modified
        stations: editingStations.map((station, index) => ({
          stationId: station.stationId || station.station.id,
          sequence: index + 1,
          distanceFromStart: station.distanceFromStart || 0,
          estimatedDuration: station.estimatedDuration || 0,
          stopDuration: station.stopDuration || 2
        }))
      };

      console.log('Updating route:', editingRoute.id, routeToUpdate);
      const data = await routesApi.update(editingRoute.id, routeToUpdate);
      console.log('Route updated:', data);
      setRoutes(routes.map(route => 
        route.id === editingRoute.id ? data : route
      ));
      setEditingRoute(null);
      setEditingStations([]);
      setError(null);
    } catch (err: any) {
      console.error('Error updating route:', err);
      setError(`Failed to update route: ${err.message || err}`);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    try {
      console.log('Deleting route:', id);
      await routesApi.delete(id);
      console.log('Route deleted:', id);
      setRoutes(routes.filter(route => route.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('Error deleting route:', err);
      setError(`Failed to delete route: ${err.message || err}`);
    }
  };

  // Function to add a station to the editing stations list
  const addEditingStation = (station: Station) => {
    const newStation = {
      stationId: station.id,
      station: station,
      sequence: editingStations.length + 1,
      distanceFromStart: 0,
      estimatedDuration: 0,
      stopDuration: 2
    };
    setEditingStations([...editingStations, newStation]);
  };

  // Function to remove a station from the editing stations list
  const removeEditingStation = (index: number) => {
    const updatedStations = [...editingStations];
    updatedStations.splice(index, 1);
    // Update sequence numbers
    updatedStations.forEach((station, i) => {
      station.sequence = i + 1;
    });
    setEditingStations(updatedStations);
  };

  // Function to update station properties in editing form
  const updateEditingStation = (index: number, field: string, value: any) => {
    const updatedStations = [...editingStations];
    updatedStations[index] = { ...updatedStations[index], [field]: value };
    setEditingStations(updatedStations);
  };

  // Function to add a station to the new route stations list
  const addNewRouteStation = (station: Station) => {
    const newStation = {
      stationId: station.id,
      station: station,
      sequence: newRouteStations.length + 1,
      distanceFromStart: 0,
      estimatedDuration: 0,
      stopDuration: 2
    };
    setNewRouteStations([...newRouteStations, newStation]);
  };

  // Function to remove a station from the new route stations list
  const removeNewRouteStation = (index: number) => {
    const updatedStations = [...newRouteStations];
    updatedStations.splice(index, 1);
    // Update sequence numbers
    updatedStations.forEach((station, i) => {
      station.sequence = i + 1;
    });
    setNewRouteStations(updatedStations);
  };

  // Function to update station properties in new route form
  const updateNewRouteStation = (index: number, field: string, value: any) => {
    const updatedStations = [...newRouteStations];
    updatedStations[index] = { ...updatedStations[index], [field]: value };
    setNewRouteStations(updatedStations);
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
                <RouteIcon className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-xl font-bold">Routes</h1>
              </div>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Route
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
                  <CardTitle className="text-white">Add New Route</CardTitle>
                  <CardDescription className="text-gray-400">Create a new train route</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="train_number" className="text-gray-300">Train Number</Label>
                      <Input
                        id="train_number"
                        value={newRoute.trainNumber}
                        onChange={(e) => setNewRoute({...newRoute, trainNumber: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., SLR_001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Route Name</Label>
                      <Input
                        id="name"
                        value={newRoute.name}
                        onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., Colombo to Kandy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_time" className="text-gray-300">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={newRoute.startTime}
                        onChange={(e) => setNewRoute({...newRoute, startTime: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time" className="text-gray-300">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={newRoute.endTime}
                        onChange={(e) => setNewRoute({...newRoute, endTime: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Station Management for New Route */}
                  <div className="mt-4">
                    <Label className="text-gray-300 mb-2 block">Stations</Label>
                    {newRouteStations.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {newRouteStations.map((routeStation, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs text-gray-400">Station</Label>
                                <p className="text-sm">{routeStation.station.name}</p>
                              </div>
                              <div>
                                <Label htmlFor={`new-distance-${index}`} className="text-xs text-gray-400">Distance (km)</Label>
                                <Input
                                  id={`new-distance-${index}`}
                                  type="number"
                                  value={routeStation.distanceFromStart}
                                  onChange={(e) => updateNewRouteStation(index, 'distanceFromStart', parseFloat(e.target.value) || 0)}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`new-duration-${index}`} className="text-xs text-gray-400">Est. Duration (min)</Label>
                                <Input
                                  id={`new-duration-${index}`}
                                  type="number"
                                  value={routeStation.estimatedDuration}
                                  onChange={(e) => updateNewRouteStation(index, 'estimatedDuration', parseInt(e.target.value) || 0)}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`new-stop-${index}`} className="text-xs text-gray-400">Stop Duration (min)</Label>
                                <Input
                                  id={`new-stop-${index}`}
                                  type="number"
                                  value={routeStation.stopDuration}
                                  onChange={(e) => updateNewRouteStation(index, 'stopDuration', parseInt(e.target.value) || 2)}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeNewRouteStation(index)}
                              className="border-gray-600 text-white hover:bg-gray-600 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Station Button for New Route */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewRouteStationSelectorOpen(true)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Station
                    </Button>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-600 text-white hover:bg-gray-700">
                      Cancel
                    </Button>
                    <Button onClick={handleAddRoute} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Save Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {editingRoute && (
              <Card className="mb-6 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Edit Route</CardTitle>
                  <CardDescription className="text-gray-400">Modify route details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_train_number" className="text-gray-300">Train Number</Label>
                      <Input
                        id="edit_train_number"
                        value={editingRoute.trainNumber}
                        onChange={(e) => setEditingRoute({...editingRoute, trainNumber: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_name" className="text-gray-300">Route Name</Label>
                      <Input
                        id="edit_name"
                        value={editingRoute.name}
                        onChange={(e) => setEditingRoute({...editingRoute, name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_start_time" className="text-gray-300">Start Time</Label>
                      <Input
                        id="edit_start_time"
                        type="time"
                        value={extractTime(editingRoute.startTime)}
                        onChange={(e) => setEditingRoute({...editingRoute, startTime: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_end_time" className="text-gray-300">End Time</Label>
                      <Input
                        id="edit_end_time"
                        type="time"
                        value={extractTime(editingRoute.endTime)}
                        onChange={(e) => setEditingRoute({...editingRoute, endTime: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id="edit_is_active"
                      checked={editingRoute.isActive}
                      onChange={(e) => setEditingRoute({...editingRoute, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary rounded"
                    />
                    <Label htmlFor="edit_is_active" className="text-gray-300">Active Route</Label>
                  </div>
                  
                  {/* Station Management */}
                  <div className="mt-4">
                    <Label className="text-gray-300 mb-2 block">Stations</Label>
                    {editingStations.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {editingStations.map((routeStation, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs text-gray-400">Station</Label>
                                <p className="text-sm">{routeStation.station.name}</p>
                              </div>
                              <div>
                                <Label htmlFor={`distance-${index}`} className="text-xs text-gray-400">Distance (km)</Label>
                                <Input
                                  id={`distance-${index}`}
                                  type="number"
                                  value={routeStation.distanceFromStart}
                                  onChange={(e) => updateEditingStation(index, 'distanceFromStart', parseFloat(e.target.value) || 0)}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`duration-${index}`} className="text-xs text-gray-400">Est. Duration (min)</Label>
                                <Input
                                  id={`duration-${index}`}
                                  type="number"
                                  value={routeStation.estimatedDuration}
                                  onChange={(e) => updateEditingStation(index, 'estimatedDuration', parseInt(e.target.value) || 0)}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`stop-${index}`} className="text-xs text-gray-400">Stop Duration (min)</Label>
                                <Input
                                  id={`stop-${index}`}
                                  type="number"
                                  value={routeStation.stopDuration}
                                  onChange={(e) => updateEditingStation(index, 'stopDuration', parseInt(e.target.value) || 2)}
                                  className="bg-gray-600 border-gray-500 text-white text-sm"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEditingStation(index)}
                              className="border-gray-600 text-white hover:bg-gray-600 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add Station Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsStationSelectorOpen(true)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Station
                    </Button>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => {
                      setEditingRoute(null);
                      setEditingStations([]);
                    }} className="border-gray-600 text-white hover:bg-gray-700">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateRoute} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Update Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Routes</CardTitle>
                <CardDescription className="text-gray-400">Manage all train routes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <p>Loading routes...</p>
                  </div>
                ) : routes.length > 0 ? (
                  <div className="space-y-4">
                    {routes.map((route) => (
                      <div key={route.id} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{route.name}</h3>
                            <p className="text-sm text-gray-400">Train: {route.trainNumber}</p>
                            <div className="flex items-center mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                route.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {route.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {route.startTime && (
                                <span className="ml-2 text-xs text-gray-400">
                                  Starts: {extractTime(route.startTime)}
                                </span>
                              )}
                              {route.endTime && (
                                <span className="ml-2 text-xs text-gray-400">
                                  Ends: {extractTime(route.endTime)}
                                </span>
                              )}
                            </div>
                            {/* Display stations if they exist */}
                            {route.routeStations && route.routeStations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">Stations:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {route.routeStations
                                    .sort((a, b) => a.sequence - b.sequence)
                                    .map((routeStation) => (
                                      <span 
                                        key={routeStation.id} 
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {routeStation.station.name}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Create a copy with extracted time values for editing
                                const routeForEditing = {
                                  ...route,
                                  startTime: extractTime(route.startTime),
                                  endTime: extractTime(route.endTime)
                                };
                                setEditingRoute(routeForEditing);
                                // Initialize editing stations with current route stations
                                const initialStations = route.routeStations ? [...route.routeStations].sort((a, b) => a.sequence - b.sequence) : [];
                                console.log('Initializing editing stations with:', initialStations);
                                setEditingStations(initialStations);
                              }}
                              className="border-gray-600 text-white hover:bg-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteRoute(route.id)}
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
                      <RouteIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">No routes found</p>
                      <p className="text-gray-500 text-sm mt-1">Create your first route to get started</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      <StationSelectorModal
        isOpen={isStationSelectorOpen}
        onClose={() => setIsStationSelectorOpen(false)}
        stations={stations}
        editingStations={editingStations}
        onAddStation={addEditingStation}
      />
      
      <StationSelectorModal
        isOpen={isNewRouteStationSelectorOpen}
        onClose={() => setIsNewRouteStationSelectorOpen(false)}
        stations={stations}
        editingStations={newRouteStations}
        onAddStation={addNewRouteStation}
      />
    </div>
  );
}
