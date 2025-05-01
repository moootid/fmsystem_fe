// src/components/iot/CreateIotDeviceDialog.tsx
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
import { CreateIotDeviceForm } from "./CreateIotDeviceForm"; // Import the form

interface CreateIotDeviceDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void; // Optional callback on success
}

export const CreateIotDeviceDialog: React.FC<CreateIotDeviceDialogProps> = ({
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const handleSuccess = () => {
        onOpenChange(false); // Close dialog on success
        onSuccess?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add IoT Device
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New IoT Device</DialogTitle>
                    <DialogDescription>
                        Fill in the details below. MAC Address is required.
                    </DialogDescription>
                </DialogHeader>
                {/* Render form only when dialog is open to reset state easily */}
                {isOpen && <CreateIotDeviceForm onSuccess={handleSuccess} />}
            </DialogContent>
        </Dialog>
    );
};