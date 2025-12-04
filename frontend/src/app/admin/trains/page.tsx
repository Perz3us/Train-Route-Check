"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Train, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  AlertCircle,
  X,
  Save,
  Activity,
  Users
} from 'lucide-react';
import { trainsApi, type Train as TrainType } from '@/lib/api';

export default function TrainsPage() {
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTrain, setEditingTrain] = useState<TrainType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    trainNumber: '',
    type: '',
    capacity: '',
    status: 'active'
  });

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const data = await trainsApi.getAll();
      setTrains(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching trains:', err);
      setError('Failed to load trains. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (train: TrainType) => {
    setEditingTrain(train);
    setFormData({
      name: train.name,
      trainNumber: train.trainNumber,
      type: train.type,
      capacity: train.capacity ? train.capacity.toString() : '',
      status: train.status
    });
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditingTrain(null);
    setFormData({
      name: '',
      trainNumber: '',
      type: '',
      capacity: '',
      status: 'active'
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTrain(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const trainData = {
        name: formData.name,
        trainNumber: formData.trainNumber,
        type: formData.type,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        status: formData.status
      };

      if (editingTrain) {
        await trainsApi.update(editingTrain.id, trainData);
      } else {
        await trainsApi.create(trainData);
      }
      
      // Reset form and close dialog
      handleCancel();
      
      // Refresh list
      fetchTrains();
    } catch (err: any) {
      console.error('Error saving train:', err);
      setError('Failed to save train: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this train?')) return;
    try {
      await trainsApi.delete(id);
      setTrains(trains.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting train:', err);
      setError('Failed to delete train: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredTrains = trains.filter(train => 
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
              Train <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Management</span>
            </h1>
            <p className="text-xl text-gray-400 mt-2">Manage your fleet and schedules</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="h-12 px-8 text-lg bg-white text-background hover:bg-gray-100 font-semibold shadow-lg shadow-white/10 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Train
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors duration-300 group flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-purple-400">
              <Train className="h-8 w-8" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Trains</p>
              <p className="text-2xl font-bold text-white">{trains.length}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors duration-300 group flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-cyan-400">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Trains</p>
              <p className="text-2xl font-bold text-white">
                {trains.filter(t => t.status === 'active').length}
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
                  placeholder="Search trains..." 
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
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-fade-in-up backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingTrain ? 'Edit Train' : 'Add New Train'}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Train Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Udarata Menike"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trainNumber" className="text-gray-300">Train Number</Label>
                <Input
                  id="trainNumber"
                  name="trainNumber"
                  placeholder="e.g. 1015"
                  value={formData.trainNumber}
                  onChange={handleInputChange}
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">Type</Label>
                <Input
                  id="type"
                  name="type"
                  placeholder="e.g. Express"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="bg-black/20 border-white/10 text-white focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="active" className="bg-zinc-900">Active</option>
                  <option value="maintenance" className="bg-zinc-900">Maintenance</option>
                  <option value="inactive" className="bg-zinc-900">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-white text-background hover:bg-gray-100 font-semibold shadow-lg shadow-white/10"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : (editingTrain ? 'Update Train' : 'Save Train')}
              </Button>
            </div>
          </div>
        )}

        {/* Trains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : filteredTrains.length > 0 ? (
            filteredTrains.map((train) => (
              <div 
                key={train.id} 
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <Train className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(train)}
                      className="h-8 w-8 hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(train.id)}
                      className="h-8 w-8 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">
                    #{train.trainNumber}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    train.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : train.status === 'maintenance'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {train.status.charAt(0).toUpperCase() + train.status.slice(1)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{train.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{train.type}</p>

                <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/5 pt-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-gray-500" />
                    <span>{train.capacity ? `${train.capacity} Seats` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="p-6 rounded-full bg-white/5 mb-4">
                <Search className="h-12 w-12 opacity-50" />
              </div>
              <p className="text-lg">No trains found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
