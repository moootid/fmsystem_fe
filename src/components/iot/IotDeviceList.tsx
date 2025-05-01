// src/components/iot/IotDeviceList.tsx
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
import { Eye, Pencil, Trash2, Link as LinkIcon, Link2Off } from "lucide-react"; // Add Link icons
import { IotDevice } from "@/types/iotDevice"; // Import the correct type

interface IotDeviceListProps {
    iotDevices: IotDevice[];
    isLoading: boolean;
    onView: (deviceId: string) => void;
    onEdit: (deviceId: string) => void;
    onDelete: (deviceId: string, macAddress: string) => void; // Pass MAC for confirmation
}

export const IotDeviceList: React.FC<IotDeviceListProps> = ({
    iotDevices,
    isLoading,
    onView,
    onEdit,
    onDelete,
}) => {
    // Ensure iotDevices is always an array, handle potential nesting if api returns { data: [...] }
    const deviceList = Array.isArray(iotDevices)
        ? iotDevices
        : (iotDevices as any)?.data || [];

    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableCaption
                        className={
                            deviceList.length > 0 || isLoading ? "sr-only" : "mt-4 mb-4"
                        }
                    >
                        {isLoading
                            ? "Loading IoT devices..."
                            : deviceList.length === 0
                            ? "No IoT devices found."
                            : "A list of your registered IoT devices."}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MAC Address</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>HW Ver.</TableHead>
                            <TableHead>SW Ver.</TableHead>
                            <TableHead>Linked Vehicle</TableHead>
                            <TableHead>Linked API Key</TableHead>
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
                        ) : deviceList.length > 0 ? (
                            deviceList.map((device:any) => (
                                <TableRow key={device.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{device.mac_address}</TableCell>
                                    <TableCell>{device.model ?? "N/A"}</TableCell>
                                    <TableCell>{device.status ?? "N/A"}</TableCell>
                                    <TableCell>{device.hw_version ?? "N/A"}</TableCell>
                                    <TableCell>{device.sw_version ?? "N/A"}</TableCell>
                                    <TableCell className="text-center">
                                        {device.vehicle_id ? (
                                            <span className="inline-flex items-center gap-1 text-green-600" title={`ID: ${device?.vehicle_id}`}>
                                                <LinkIcon className="h-3 w-3" /> {device.vehicle_id}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Link2Off className="h-3 w-3" /> N/A
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {device.api_auth_id ? (
                                            <span className="inline-flex items-center gap-1 text-blue-600" title={`ID: ${device.api_auth_id}`}>
                                                <LinkIcon className="h-3 w-3" /> {device.api_auth_id}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Link2Off className="h-3 w-3" /> N/A
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onView(device.id)}
                                                aria-label={`View details for device ${device.mac_address}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(device.id)}
                                                aria-label={`Edit device ${device.mac_address}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive/90"
                                                onClick={() => onDelete(device.id, device.mac_address)}
                                                aria-label={`Delete device ${device.mac_address}`}
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
                                    No IoT devices available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};