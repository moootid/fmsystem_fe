// src/components/iot/EditIotDeviceForm.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import { IotDevice, UpdateIotDevicePayload } from "@/types/iotDevice";
import { ApiValidationError } from "@/types/api";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Vehicle } from "@/types/vehicle";

// Reusable helper (consider moving to lib/utils.ts)
const getFieldError = (
    errors: ApiValidationError | null,
    field: keyof ApiValidationError
): string | null => {
    return errors?.[field]?.[0] ?? null;
};

interface EditIotDeviceFormProps {
    device: IotDevice;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EditIotDeviceForm: React.FC<EditIotDeviceFormProps> = ({
    device,
    onSuccess,
    onCancel,
}) => {
    const queryClient = useQueryClient();

    // Initialize state with existing device data
    const [macAddress] = useState(device.mac_address); // MAC is read-only
    const [model, setModel] = useState(device.model ?? "");
    const [hwVersion, setHwVersion] = useState(device.hw_version ?? "");
    const [swVersion, setSwVersion] = useState(device.sw_version ?? "");
    const [status, setStatus] = useState(device.status ?? "");
    const [note, setNote] = useState(device.note ?? "");
    const [vehicleId, setVehicleId] = useState(device?.vehicle_id ?? ""); // Use linked ID or empty string
    const [apiAuthId, setApiAuthId] = useState(device?.api_auth_id ?? ""); // Use linked ID or empty string

    const [validationErrors, setValidationErrors] = useState<ApiValidationError | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Reset form state if the device prop changes (e.g., editing a different device)
    useEffect(() => {
        setModel(device.model ?? "");
        setHwVersion(device.hw_version ?? "");
        setSwVersion(device.sw_version ?? "");
        setStatus(device.status ?? "");
        setNote(device.note ?? "");
        setVehicleId(device?.vehicle_id ?? "");
        setApiAuthId(device?.api_auth_id ?? "");
        setValidationErrors(null); // Clear errors on device change
        setSubmitError(null);
    }, [device]);
    const {
        data: vehicles,
        isLoading: vehiclesLoading,
        error: vehiclesError,
        isError: vehiclesIsError,
        refetch: refetchVehicles,
    } = useQuery<any, Error>({
        queryKey: ["vehicles"],
        queryFn: () => apiService.vehicles.list(),
        refetchOnWindowFocus: false,
    });

    const {
        data: apiKeys,
        isLoading: apiKeysLoading,
        error: apiKeysError,
        isError: apiKeysIsError,
        refetch: refetchApiKeys,
    } = useQuery<any, Error>({
        queryKey: ["apiKeys"],
        queryFn: () => apiService.apiAuthTokens.list(),
        refetchOnWindowFocus: false,
    }
    );
    const mutation = useMutation<IotDevice, Error, UpdateIotDevicePayload>({
        mutationFn: (payload) => apiService.iotDevices.update(device.id, payload).then((res: any) => res.data), // Adjust if API wraps data
        onSuccess: (data) => {
            // Invalidate queries to refetch lists and specific item
            queryClient.invalidateQueries({ queryKey: ["iotDevices"] });
            queryClient.invalidateQueries({ queryKey: ["iotDevice", device.id] });

            toast.success("IoT Device Updated", {
                description: `Device ${data.mac_address} updated successfully.`,
            });
            setValidationErrors(null);
            setSubmitError(null);
            onSuccess(); // Close dialog etc.
        },
        onError: (error) => {
            const errors = apiService.handleApiError(error, (title, opts) =>
                toast.error(title, opts)
            );
            if (errors) {
                setValidationErrors(errors);
                setSubmitError(null);
            } else {
                setSubmitError("An unexpected error occurred during update.");
                setValidationErrors(null);
            }
            console.error("Update IoT device error:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);
        setSubmitError(null);

        // Construct payload - send null for empty strings to signify unlinking/clearing
        const payload: UpdateIotDevicePayload = {
            model: model || null, // Send null if empty string
            hw_version: hwVersion || null,
            sw_version: swVersion || null,
            status: status || null,
            note: note || null,
            vehicle_id: vehicleId || null, // Send null if empty string
            api_auth_id: apiAuthId || null, // Send null if empty string
        };

        // Optional: Check if payload is actually different from original 'device'
        // to avoid unnecessary API calls if nothing changed.

        mutation.mutate(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {submitError && !validationErrors && (
                <Alert variant="destructive" className="mb-4 col-span-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                </Alert>
            )}

            {/* MAC Address (Read Only) */}
            <div className="grid grid-cols-4 items-center gap-4"> {/* Use items-center for read-only */}
                <Label htmlFor="edit-macAddress" className="text-right"> MAC Address </Label>
                <div className="col-span-3">
                    <Input id="edit-macAddress" value={macAddress} readOnly disabled className="bg-muted/50" />
                     {/* No error display needed for read-only */}
                </div>
            </div>

            {/* Model */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-model" className="text-right pt-2"> Model </Label>
                <div className="col-span-3">
                    <Input id="edit-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="(empty to clear)" disabled={mutation.isPending} className={getFieldError(validationErrors, "model") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "model") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "model")} </p>)}
                </div>
            </div>

             {/* Hardware Version */}
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-hwVersion" className="text-right pt-2"> HW Version </Label>
                <div className="col-span-3">
                    <Input id="edit-hwVersion" value={hwVersion} onChange={(e) => setHwVersion(e.target.value)} placeholder="(empty to clear)" disabled={mutation.isPending} className={getFieldError(validationErrors, "hw_version") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "hw_version") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "hw_version")} </p>)}
                </div>
            </div>

            {/* Software Version */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-swVersion" className="text-right pt-2"> SW Version </Label>
                <div className="col-span-3">
                    <Input id="edit-swVersion" value={swVersion} onChange={(e) => setSwVersion(e.target.value)} placeholder="(empty to clear)" disabled={mutation.isPending} className={getFieldError(validationErrors, "sw_version") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "sw_version") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "sw_version")} </p>)}
                </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-status" className="text-right pt-2"> Status </Label>
                <div className="col-span-3">
                    <Input id="edit-status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="(empty to clear)" disabled={mutation.isPending} className={getFieldError(validationErrors, "status") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "status") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "status")} </p>)}
                </div>
            </div>

            {/* Note */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-note" className="text-right pt-2"> Note </Label>
                <div className="col-span-3">
                    <Textarea id="edit-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="(empty to clear)" disabled={mutation.isPending} className={getFieldError(validationErrors, "note") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "note") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "note")} </p>)}
                </div>
            </div>

            {/* Vehicle ID */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="vehicleId" className="text-right pt-2"> Vehicle ID </Label>
                <div className="col-span-3">
                    {/* <Input id="vehicleId" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} placeholder="(Optional) Link to Vehicle ID" disabled={mutation.isPending} className={getFieldError(validationErrors, "vehicle_id") ? "border-destructive" : ""} /> */}
                    <Select value={vehicleId} onValueChange={(e:any) => {setVehicleId(e);}}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup onClick={() => { }}>
                                <SelectLabel> Vehicles </SelectLabel>
                                {vehiclesLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {(vehicles?.data?.length > 0) && vehicles?.data?.map((vehicle:any) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id} onClick={() => setVehicleId(vehicle.id)}>
                                        {vehicle.code} ({vehicle.plate})
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {getFieldError(validationErrors, "vehicle_id") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "vehicle_id")} </p>)}
                    {/* TODO: Consider replacing with a Select dropdown fetching vehicles */}
                </div>
            </div>

            {/* API Auth ID */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="apiAuthId" className="text-right pt-2"> API Key ID </Label>
                <div className="col-span-3">
                    {/* <Input id="apiAuthId" value={apiAuthId} onChange={(e) => setApiAuthId(e.target.value)} placeholder="(Optional) Link to API Key ID" disabled={mutation.isPending} className={getFieldError(validationErrors, "api_auth_id") ? "border-destructive" : ""} /> */}
                    <Select value={apiAuthId} onValueChange={(e:any) => {setApiAuthId(e);}}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an API Key" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup >
                                <SelectLabel> API Keys </SelectLabel>
                                {apiKeysLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {(apiKeys?.data?.length > 0) && apiKeys?.data?.map((key:any) => (
                                    <SelectItem key={key.id} value={key.id} onClick={() => setApiAuthId(key.id)}>
                                        {key.title} ({key.id})
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {getFieldError(validationErrors, "api_auth_id") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "api_auth_id")} </p>)}
                    {/* TODO: Consider replacing with a Select dropdown fetching API keys */}
                </div>
            </div>

            <DialogFooter className="mt-4">
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    disabled={mutation.isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
};