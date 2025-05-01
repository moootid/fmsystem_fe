// src/components/vehicles/EditVehicleForm.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Assuming sonner's toast
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import {
  Vehicle,
  UpdateVehiclePayload, // Import the type from the central file
  ApiValidationError,
} from "@/types/vehicle"; // Make sure ApiValidationError is also exported from vehicle types or api types

// --- Helper to get error message --- (Can be shared, move to utils?)
const getFieldError = (
  errors: ApiValidationError | null,
  field: keyof ApiValidationError
): string | null => {
  // Ensure errors object exists and the field key exists before accessing
  return errors?.[field]?.[0] ?? null;
};

// --- Remove the inline UpdateVehiclePayload definition ---

export const EditVehicleForm = ({
  vehicle,
  onSuccess,
  onCancel,
}: any) => {
  const queryClient = useQueryClient();

  console.log("EditVehicleForm vehicle:", vehicle);
  // Initialize state with existing vehicle data
  const [code, setCode] = useState(vehicle.code);
  const [plate, setPlate] = useState(vehicle.plate);
  // Keep state as string, handle null/undefined during payload creation
  const [vin, setVin] = useState(vehicle.vin || "");
  const [manufacturer, setManufacturer] = useState(vehicle.manufacturer ?? "");
  const [model, setModel] = useState(vehicle.model ?? "");
  const [year, setYear] = useState<number | "">(vehicle.year ?? "");
  const [status, setStatus] = useState(vehicle.status ?? "");
  const [type, setType] = useState(vehicle.type ?? "");
  const [color, setColor] = useState(vehicle.color ?? "");
  const [description, setDescription] = useState(vehicle.description ?? "");

  const [validationErrors, setValidationErrors] =
    useState<ApiValidationError | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCode(vehicle?.code);
    setPlate(vehicle?.plate);
    setVin(vehicle?.vin ?? "");
    setManufacturer(vehicle?.manufacturer ?? "");
    setModel(vehicle?.model ?? "");
    setYear(vehicle?.make_year ?? "");
    setStatus(vehicle?.status ?? "");
    setType(vehicle?.type ?? "");
    setColor(vehicle?.color ?? "");
    setDescription(vehicle?.description ?? "");
    setValidationErrors(null);
    setSubmitError(null);
  }, [vehicle]);

  const mutation = useMutation<Vehicle, Error, UpdateVehiclePayload>({
    // --- Corrected mutationFn ---
    // The apiService function already returns Promise<Vehicle>
    mutationFn: (payload) => apiService.vehicles.update(vehicle.id, payload),
    // --- End Correction ---
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      // Using queryKey array directly is often preferred
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicle.id] });

      toast.success("Vehicle Updated", {
        description: `Vehicle ${data.code} (${data.plate}) updated successfully.`,
      });
      setValidationErrors(null);
      setSubmitError(null);
      onSuccess(); // Call success callback (e.g., close dialog)
    },
    onError: (error) => {
      // Pass sonner's toast.error directly if its signature matches
      // Or use the refined signature from apiService.handleApiError
      const errors = apiService.handleApiError(error, (title, options) =>
        toast.error(title, options)
      );

      if (errors) {
        // errors is ApiValidationError | null
        setValidationErrors(errors);
        setSubmitError(null); // Clear generic error if validation errors exist
      } else {
        // If handleApiError returned null (e.g., for 401 or non-validation error)
        // A toast was likely already shown by handleApiError
        setSubmitError("An unexpected error occurred during update."); // Keep a generic error state if needed
        setValidationErrors(null);
      }
      console.error("Update vehicle error details:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);
    setSubmitError(null);

    if (!code || !plate || !vin) {
      setSubmitError("Code, Plate, and VIN cannot be empty.");
      // Optionally set specific validation errors
      // setValidationErrors({
      //   code: !code ? ["Code is required"] : [],
      //   plate: !plate ? ["Plate is required"] : [],
      //   vin: !vin ? ["VIN is required"] : [],
      // });
      return;
    }

    // Construct the payload using the imported UpdateVehiclePayload type implicitly
    // Ensure values match the expected type (string | null | undefined for optional fields)
    const payload = {
      code,
      plate,
      // Send null if the field is empty and the API expects null for clearing optional string fields
      // Otherwise, send undefined to omit the field if the API ignores missing fields
      vin: vin || undefined,
      manufacturer: manufacturer || undefined,
      model: model || undefined,
      make_year: year === "" ? undefined : year, // Keep sending undefined for empty number
      status: status || undefined,
      type: type || undefined,
      color: color || undefined,
      description: description || undefined, // Optional field for additional info
    };

    mutation.mutate(payload);
  };

  return (
    // --- Form JSX (remains largely the same) ---
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {submitError && !validationErrors && ( // Show generic error only if no specific validation errors
        <Alert variant="destructive" className="mb-4 col-span-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Code */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-code" className="text-right pt-2"> Code* </Label>
        <div className="col-span-3">
          <Input id="edit-code" value={code} onChange={(e) => setCode(e.target.value)} disabled={mutation.isPending} required aria-required="true" className={getFieldError(validationErrors, "code") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "code") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "code")} </p>)}
        </div>
      </div>

      {/* Plate */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-plate" className="text-right pt-2"> Plate* </Label>
        <div className="col-span-3">
          <Input id="edit-plate" value={plate} onChange={(e) => setPlate(e.target.value)} disabled={mutation.isPending} required aria-required="true" className={getFieldError(validationErrors, "plate") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "plate") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "plate")} </p>)}
        </div>
      </div>

      {/* VIN */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-vin" className="text-right pt-2"> VIN* </Label>
        <div className="col-span-3">
          <Input id="edit-vin" value={vin} onChange={(e) => setVin(e.target.value)} disabled={mutation.isPending} required aria-required="true" className={getFieldError(validationErrors, "vin") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "vin") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "vin")} </p>)}
        </div>
      </div>

      {/* Manufacturer */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-manufacturer" className="text-right pt-2"> Manufacturer </Label>
        <div className="col-span-3">
          <Input id="edit-manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} disabled={mutation.isPending} className={getFieldError(validationErrors, "manufacturer") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "manufacturer") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "manufacturer")} </p>)}
        </div>
      </div>

      {/* Model */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-model" className="text-right pt-2"> Model </Label>
        <div className="col-span-3">
          <Input id="edit-model" value={model} onChange={(e) => setModel(e.target.value)} disabled={mutation.isPending} className={getFieldError(validationErrors, "model") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "model") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "model")} </p>)}
        </div>
      </div>

      {/* Year */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-year" className="text-right pt-2"> Year </Label>
        <div className="col-span-3">
          <Input id="edit-year" type="number" value={year} onChange={(e) => setYear(e.target.value === "" ? "" : parseInt(e.target.value, 10))} placeholder="e.g., 2023" min="1900" max={new Date().getFullYear() + 1} disabled={mutation.isPending} className={getFieldError(validationErrors, "make_year") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "make_year") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "make_year")} </p>)}
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-status" className="text-right pt-2"> Status </Label>
        <div className="col-span-3">
          <Input id="edit-status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g., Active, Maintenance" disabled={mutation.isPending} className={getFieldError(validationErrors, "status") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "status") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "status")} </p>)}
        </div>
      </div>

      {/* Type */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-type" className="text-right pt-2"> Type </Label>
        <div className="col-span-3">
          <Input id="edit-type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Sedan, Truck" disabled={mutation.isPending} className={getFieldError(validationErrors, "type") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "type") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "type")} </p>)}
        </div>
      </div>

      {/* Color */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-color" className="text-right pt-2"> Color </Label>
        <div className="col-span-3">
          <Input id="edit-color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., Red, Blue" disabled={mutation.isPending} className={getFieldError(validationErrors, "color") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "color") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "color")} </p>)}
        </div>
      </div>


      {/* Description */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-description" className="text-right pt-2"> Description </Label>
        <div className="col-span-3">
          <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Additional vehicle information" disabled={mutation.isPending} className={getFieldError(validationErrors, "description") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "description") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "description")} </p>)}
        </div>
      </div>


      {/* --- End Form Fields --- */}

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
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
