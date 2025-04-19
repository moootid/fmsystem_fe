// src/components/vehicles/CreateVehicleForm.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Keep Footer/Close
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import {
  Vehicle,
  CreateVehiclePayload,
  ApiValidationError,
} from "@/types/vehicle";

interface CreateVehicleFormProps {
  onSuccess: () => void;
}

const getFieldError = (
  errors: ApiValidationError | null,
  field: keyof ApiValidationError,
): string | null => {
  return errors?.[field]?.[0] ?? null;
};


export const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  // State for each form field
  const [code, setCode] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");

  const [validationErrors, setValidationErrors] =
    useState<ApiValidationError | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation<Vehicle, Error, CreateVehiclePayload>({
    mutationFn: (payload) =>
      apiService.vehicles.create(payload).then((response: any) => response.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle Created", {
        description: `Vehicle ${data.code} (${data.plate}) added successfully.`,
      });
      setValidationErrors(null);
      setSubmitError(null);
      onSuccess();
    },
    onError: (error) => {
      const errors = apiService.handleApiError(error, (opts:any) =>
        toast.error(opts),
      );
      if (errors && typeof errors === "object") {
        setValidationErrors(errors as ApiValidationError);
        setSubmitError(null);
      } else {
        setSubmitError("An unexpected error occurred during creation.");
        setValidationErrors(null);
      }
      console.error("Create vehicle error details:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);
    setSubmitError(null);

    if (!code || !plate || !vin) {
      setSubmitError("Code, Plate, and VIN are required fields.");
      return;
    }

    const payload: CreateVehiclePayload = {
      code,
      plate,
      vin,
      manufacturer: manufacturer || undefined,
      model: model || undefined,
      year: year === "" ? undefined : year,
      status: status || undefined,
      type: type || undefined,
      color: color || undefined,
    };

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {submitError && (
        <Alert variant="destructive" className="mb-4 col-span-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* --- Form Fields --- */}
      {/* Code */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="code" className="text-right pt-2"> Code* </Label>
        <div className="col-span-3">
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} disabled={mutation.isPending} required aria-required="true" className={getFieldError(validationErrors, "code") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "code") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "code")} </p> )}
        </div>
      </div>

      {/* Plate */}
       <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="plate" className="text-right pt-2"> Plate* </Label>
        <div className="col-span-3">
          <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} disabled={mutation.isPending} required aria-required="true" className={getFieldError(validationErrors, "plate") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "plate") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "plate")} </p> )}
        </div>
      </div>

      {/* VIN */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="vin" className="text-right pt-2"> VIN* </Label>
        <div className="col-span-3">
          <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} disabled={mutation.isPending} required aria-required="true" className={getFieldError(validationErrors, "vin") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "vin") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "vin")} </p> )}
        </div>
      </div>

       {/* Manufacturer */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="manufacturer" className="text-right pt-2"> Manufacturer </Label>
        <div className="col-span-3">
          <Input id="manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} disabled={mutation.isPending} className={getFieldError(validationErrors, "manufacturer") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "manufacturer") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "manufacturer")} </p> )}
        </div>
      </div>

      {/* Model */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="model" className="text-right pt-2"> Model </Label>
        <div className="col-span-3">
          <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} disabled={mutation.isPending} className={getFieldError(validationErrors, "model") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "model") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "model")} </p> )}
        </div>
      </div>

      {/* Year */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="year" className="text-right pt-2"> Year </Label>
        <div className="col-span-3">
          <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value === "" ? "" : parseInt(e.target.value, 10))} placeholder="e.g., 2023" min="1900" max={new Date().getFullYear() + 1} disabled={mutation.isPending} className={getFieldError(validationErrors, "year") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "year") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "year")} </p> )}
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="status" className="text-right pt-2"> Status </Label>
        <div className="col-span-3">
          <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g., Active, Maintenance" disabled={mutation.isPending} className={getFieldError(validationErrors, "status") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "status") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "status")} </p> )}
        </div>
      </div>

      {/* Type */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="type" className="text-right pt-2"> Type </Label>
        <div className="col-span-3">
          <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Sedan, Truck" disabled={mutation.isPending} className={getFieldError(validationErrors, "type") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "type") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "type")} </p> )}
        </div>
      </div>

      {/* Color */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="color" className="text-right pt-2"> Color </Label>
        <div className="col-span-3">
          <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., Red, Blue" disabled={mutation.isPending} className={getFieldError(validationErrors, "color") ? "border-destructive" : ""} />
          {getFieldError(validationErrors, "color") && ( <p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "color")} </p> )}
        </div>
      </div>
      {/* --- End Form Fields --- */}

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
            "Create Vehicle"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
