// src/components/vehicles/VehicleList.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean; // Pass loading state for placeholder
  onView: (vehicleId: string) => void;
  onEdit: (vehicleId: string) => void;
  onDelete: (vehicleId: string, vehicleCode: string) => void; // Pass code for confirmation
}

export const VehicleList= ({
  vehicles,
  isLoading,
  onView,
  onEdit,
  onDelete,
}:any) => {
  const vehicleList = vehicles.data || [];
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableCaption
            className={
              vehicleList.length > 0 || isLoading ? "sr-only" : "mt-4 mb-4"
            }
          >
            {isLoading
              ? "Loading vehicles..."
              : vehicleList.length === 0
                ? "No vehicles found."
                : "A list of your registered vehicles."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">IoT Devices</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : vehicleList.length > 0 ? (
              vehicleList.map((vehicle:any) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{vehicle.code}</TableCell>
                  <TableCell>{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.vin ?? "N/A"}</TableCell>
                  <TableCell>
                    {`${vehicle.manufacturer ?? ""} ${vehicle.model ?? ""} ${
                      vehicle.year ? `(${vehicle.year})` : ""
                    }`.trim() || "N/A"}
                  </TableCell>
                  <TableCell>{vehicle.status ?? "N/A"}</TableCell>
                  <TableCell className="text-center">
                    {vehicle.iot_devices_count ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(vehicle.id)}
                        aria-label={`View details for vehicle ${vehicle.code}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(vehicle.id)}
                        aria-label={`Edit vehicle ${vehicle.code}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => onDelete(vehicle.id, vehicle.code)}
                        aria-label={`Delete vehicle ${vehicle.code}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No vehicles available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
