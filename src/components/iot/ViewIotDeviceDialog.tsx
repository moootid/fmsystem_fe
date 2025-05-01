// src/components/iot/ViewIotDeviceDialog.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import apiService from "@/services/apiService";
import { IotDevice } from "@/types/iotDevice";

interface ViewIotDeviceDialogProps {
    deviceId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Helper component (consider moving to shared location)
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-1">
        <dt className="font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2">{value ?? <span className="text-muted-foreground italic">N/A</span>}</dd>
    </div>
);

export const ViewIotDeviceDialog: React.FC<ViewIotDeviceDialogProps> = ({
    deviceId,
    isOpen,
    onOpenChange,
}) => {

    const fetchDevice = (id: string | null) => {
        if (!id) return Promise.resolve(null);
        console.log("Fetching IoT device with ID:", id);
        // Adjust if API response wraps data: .then(res => res.data)
        return apiService.iotDevices.getById(id).then((res:any) => res.data);
    }

    const {
        data: device,
        isLoading,
        isError,
        error,
    } = useQuery<IotDevice | null, Error>({ // Allow null response
        queryKey: ["iotDevice", deviceId],
        queryFn: () => fetchDevice(deviceId),
        enabled: !!deviceId && isOpen, // Fetch only when ID is present and dialog is open
        refetchOnWindowFocus: false,
        retry: 1,
    });

    // Helper to display linked item info
    const renderLinkedItem = (item: string | null) => {
        if (!item) return <span className="text-muted-foreground italic">N/A</span>;
        const display = item ? `${item}` : item;
        return (
            <span>
                {display} 
            </span>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>IoT Device Details</DialogTitle>
                    <DialogDescription>
                        Viewing details for device {device?.mac_address ?? '...'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoading && (
                        <div className="flex justify-center items-center h-40">
                            <LoadingSpinner />
                        </div>
                    )}
                    {isError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Loading Device Data</AlertTitle>
                            <AlertDescription>
                                Could not load device details. {error?.message}
                            </AlertDescription>
                        </Alert>
                    )}
                    {!isLoading && !isError && device && (
                        <dl className="space-y-2">
                            <DetailItem label="ID" value={device.id} />
                            <DetailItem label="MAC Address" value={device.mac_address} />
                            <DetailItem label="Model" value={device.model} />
                            <DetailItem label="Status" value={device.status} />
                            <DetailItem label="HW Version" value={device.hw_version} />
                            <DetailItem label="SW Version" value={device.sw_version} />
                            <DetailItem label="Linked Vehicle" value={renderLinkedItem(device?.vehicle_id)} />
                            <DetailItem label="Linked API Key" value={renderLinkedItem(device?.api_auth_id)} />
                            <DetailItem label="Note" value={device.note || <span className="text-muted-foreground italic">N/A</span>} />
                            {/* Add created_at/updated_at if available from API */}
                            {/* <DetailItem label="Created At" value={formatDateTime(device.created_at)} /> */}
                            {/* <DetailItem label="Updated At" value={formatDateTime(device.updated_at)} /> */}
                        </dl>
                    )}
                     {!isLoading && !isError && !device && deviceId && (
                         <p className="text-center text-muted-foreground">Device not found.</p>
                     )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};