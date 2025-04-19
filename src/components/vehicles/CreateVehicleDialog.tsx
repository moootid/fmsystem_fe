// src/components/vehicles/CreateVehicleDialog.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CreateVehicleForm } from "./CreateVehicleForm";

interface CreateVehicleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Optional: If extra actions needed after success besides closing
}

export const CreateVehicleDialog: React.FC<CreateVehicleDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog on success
    onSuccess?.(); // Call additional success handler if provided
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Vehicle</DialogTitle>
          <DialogDescription>
            Fill in the details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        {/* Render form only when dialog is open to reset state easily */}
        {isOpen && <CreateVehicleForm onSuccess={handleSuccess} />}
      </DialogContent>
    </Dialog>
  );
};
