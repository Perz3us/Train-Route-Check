"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Station } from '@/lib/api';

interface StationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  editingStations: any[];
  onAddStation: (station: Station) => void;
}

export function StationSelectorModal({
  isOpen,
  onClose,
  stations,
  editingStations,
  onAddStation
}: StationSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter stations that are not already added and match search term
  const filteredStations = stations.filter(station => {
    const isAlreadyAdded = editingStations.some(rs => (rs.stationId === station.id) || (rs.station?.id === station.id));
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         station.code.toLowerCase().includes(searchTerm.toLowerCase());
    return !isAlreadyAdded && matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Select Station</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-1">
          <div className="mb-4">
            <Input
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredStations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'No stations match your search' : 'No stations available'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredStations.map((station) => (
                  <div 
                    key={station.id} 
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors border border-gray-600"
                    onClick={() => {
                      onAddStation(station);
                      onClose();
                    }}
                  >
                    <div className="font-medium text-white">{station.name}</div>
                    <div className="text-sm text-gray-300">Code: {station.code}</div>
                    <div className="text-xs text-gray-400">{station.city}, {station.province}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-white hover:bg-gray-700">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}