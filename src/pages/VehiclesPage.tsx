// src/pages/VehiclesPage.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { AlertCircle, List, Map as MapIcon } from "lucide-react"; // Import icons

// Import your components
import { VehicleList } from "@/components/vehicles/VehicleList";
import { CreateVehicleDialog } from "@/components/vehicles/CreateVehicleDialog";
import { ViewVehicleDialog } from "@/components/vehicles/ViewVehicleDialog";
import { EditVehicleDialog } from "@/components/vehicles/EditVehicleDialog";
import { DeleteVehicleDialog } from "@/components/vehicles/DeleteVehicleDialog";
import { VehicleMap } from "@/components/vehicles/VehicleMap"; // Import the new map component

// Import types and services
import apiService from "@/services/apiService";
import { Vehicle } from "@/types/vehicle";

// --- Main Vehicles Page Component ---
export default function VehiclesPage() {
  // State for controlling dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingVehicleId, setViewingVehicleId] = useState<string | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<{ id: string; code: string } | null>(null);

  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const isViewOpen = !!viewingVehicleId;
  const isEditOpen = !!editingVehicleId;
  const isDeleteOpen = !!deletingVehicle;

  // Fetch vehicle list data
  const {
    data: vehicles,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery<Vehicle[], Error>({
    queryKey: ["vehicles"],
    queryFn: () => apiService.vehicles.list(),
    refetchOnWindowFocus: false,
  });

  // --- Action Handlers (Dialogs) ---
  const handleView = (vehicleId: string) => setViewingVehicleId(vehicleId);
  const handleEdit = (vehicleId: string) => setEditingVehicleId(vehicleId);
  const handleDelete = (vehicleId: string, vehicleCode: string) => setDeletingVehicle({ id: vehicleId, code: vehicleCode });
  // --- End Action Handlers ---

  // --- Render Logic ---
  if (isError) {
    // Toast is likely already shown by the query's onError or apiService handler
    console.error("Error fetching vehicles:", error);
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Vehicles</AlertTitle>
          <AlertDescription>
            Could not load vehicle data. Please try again later or contact support.
            <div className="mt-4">
              <Button onClick={() => refetch()} variant="secondary"> Try Again </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Vehicles</h1>
        <div className="flex gap-2 items-center">
           {/* --- View Mode Toggle Buttons --- */}
           <Button
             variant={viewMode === 'table' ? 'secondary' : 'outline'}
             size="icon"
             onClick={() => setViewMode('table')}
             aria-label="Switch to table view"
           >
             <List className="h-4 w-4" />
           </Button>
           <Button
             variant={viewMode === 'map' ? 'secondary' : 'outline'}
             size="icon"
             onClick={() => setViewMode('map')}
             aria-label="Switch to map view"
           >
             <MapIcon className="h-4 w-4" />
           </Button>
           {/* --- End View Mode Toggle Buttons --- */}

          {/* Create Dialog Trigger */}
          <CreateVehicleDialog
            isOpen={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        </div>
      </div>

      {/* Show loading spinner overlaying the content area */}
      {isLoading && (
         <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
         </div>
      )}

      {/* Conditionally render Table or Map View (only when not loading) */}
      {!isLoading && viewMode === 'table' && (
        <VehicleList
          vehicles={vehicles || []}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {!isLoading && viewMode === 'map' && (
        <VehicleMap vehicles={vehicles || []} />
      )}

      {/* Render Modals/Dialogs (remain unchanged) */}
      <ViewVehicleDialog
        vehicleId={viewingVehicleId}
        isOpen={isViewOpen}
        onOpenChange={(open:any) => !open && setViewingVehicleId(null)}
      />
      <EditVehicleDialog
        vehicleId={editingVehicleId}
        isOpen={isEditOpen}
        onOpenChange={(open:any) => !open && setEditingVehicleId(null)}
      />
      <DeleteVehicleDialog
        vehicleId={deletingVehicle?.id ?? null}
        vehicleCode={deletingVehicle?.code ?? null}
        isOpen={isDeleteOpen}
        onOpenChange={(open:any) => !open && setDeletingVehicle(null)}
      />
    </div>
  );
}
