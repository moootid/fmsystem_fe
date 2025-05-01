// src/components/iot/CreateIotDeviceForm.tsx
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for notes
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import { IotDevice, CreateIotDevicePayload } from "@/types/iotDevice";
import { ApiValidationError } from "@/types/api"; // Import shared type
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Vehicle } from "@/types/vehicle";

interface CreateIotDeviceFormProps {
    onSuccess: () => void;
}

// Reusable helper (consider moving to lib/utils.ts)
const getFieldError = (
    errors: ApiValidationError | null,
    field: keyof ApiValidationError
): string | null => {
    return errors?.[field]?.[0] ?? null;
};

export const CreateIotDeviceForm: React.FC<CreateIotDeviceFormProps> = ({
    onSuccess,
}) => {
    const queryClient = useQueryClient();

    const [macAddress, setMacAddress] = useState("");
    const [model, setModel] = useState("");
    const [hwVersion, setHwVersion] = useState("");
    const [swVersion, setSwVersion] = useState("");
    const [status, setStatus] = useState("");
    const [note, setNote] = useState("");
    const [vehicleId, setVehicleId] = useState(""); // Keep as string, send null if empty
    const [apiAuthId, setApiAuthId] = useState(""); // Keep as string, send null if empty

    const [validationErrors, setValidationErrors] = useState<ApiValidationError | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

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

    const mutation = useMutation<IotDevice, Error, CreateIotDevicePayload>({
        mutationFn: (payload) => apiService.iotDevices.create(payload).then((res: any) => res.data), // Adjust if API returns data wrapper
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["iotDevices"] });
            toast.success("IoT Device Created", {
                description: `Device ${data.mac_address} added successfully.`,
            });
            setValidationErrors(null);
            setSubmitError(null);
            onSuccess();
        },
        onError: (error) => {
            const errors = apiService.handleApiError(error, (title, opts) =>
                toast.error(title, opts)
            );
            if (errors) {
                setValidationErrors(errors);
                setSubmitError(null);
            } else {
                setSubmitError("An unexpected error occurred during creation.");
                setValidationErrors(null);
            }
            console.error("Create IoT device error:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);
        setSubmitError(null);

        if (!macAddress) {
            setSubmitError("MAC Address is a required field.");
            return;
        }

        const payload: CreateIotDevicePayload = {
            mac_address: macAddress,
            model: model || undefined,
            hw_version: hwVersion || undefined,
            sw_version: swVersion || undefined,
            status: status || undefined,
            note: note || undefined,
            vehicle_id: vehicleId || null, // Send null if empty
            api_auth_id: apiAuthId || null, // Send null if empty
        };

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

            {/* MAC Address */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="macAddress" className="text-right pt-2"> MAC Address* </Label>
                <div className="col-span-3">
                    <Input id="macAddress" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} placeholder="e.g., 00:1A:2B:..." disabled={mutation.isPending} required className={getFieldError(validationErrors, "mac_address") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "mac_address") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "mac_address")} </p>)}
                </div>
            </div>

            {/* Model */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="model" className="text-right pt-2"> Model </Label>
                <div className="col-span-3">
                    <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g., ESP32-WROOM" disabled={mutation.isPending} className={getFieldError(validationErrors, "model") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "model") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "model")} </p>)}
                </div>
            </div>

            {/* Hardware Version */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="hwVersion" className="text-right pt-2"> HW Version </Label>
                <div className="col-span-3">
                    <Input id="hwVersion" value={hwVersion} onChange={(e) => setHwVersion(e.target.value)} placeholder="e.g., v1.2" disabled={mutation.isPending} className={getFieldError(validationErrors, "hw_version") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "hw_version") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "hw_version")} </p>)}
                </div>
            </div>

            {/* Software Version */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="swVersion" className="text-right pt-2"> SW Version </Label>
                <div className="col-span-3">
                    <Input id="swVersion" value={swVersion} onChange={(e) => setSwVersion(e.target.value)} placeholder="e.g., v0.1.0" disabled={mutation.isPending} className={getFieldError(validationErrors, "sw_version") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "sw_version") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "sw_version")} </p>)}
                </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="status" className="text-right pt-2"> Status </Label>
                <div className="col-span-3">
                    <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g., Online, Provisioning" disabled={mutation.isPending} className={getFieldError(validationErrors, "status") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "status") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "status")} </p>)}
                </div>
            </div>

            {/* Note */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="note" className="text-right pt-2"> Note </Label>
                <div className="col-span-3">
                    <Textarea id="note" value={note} onChange={(e: any) => setNote(e.target.value)} placeholder="Optional notes about the device" disabled={mutation.isPending} className={getFieldError(validationErrors, "note") ? "border-destructive" : ""} />
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
                <DialogClose asChild>
                    <Button variant="outline" type="button" disabled={mutation.isPending}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating... </>
                    ) : (
                        "Create Device"
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
};