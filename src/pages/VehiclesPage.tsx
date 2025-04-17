import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../services/apiService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
// import { useToast } from "@/components/ui/use-toast";
// import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { ExclamationTriangleIcon } from "@radix-ui/react-icons"; // Or other icon

// Import Table components if using Shadcn Table
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// Import Map components if using react-leaflet
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'; // For custom icons if needed

// --- Create Vehicle Form Component (Example) ---
// You'd typically put this in a separate file, e.g., src/components/forms/CreateVehicleForm.tsx
// Using react-hook-form is recommended for complex forms
const CreateVehicleForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const queryClient = useQueryClient();
//   const { toast } = useToast();
  const [code, setCode] = useState("");
  const [plate, setPlate] = useState("");
  // Add other form fields state here...

  const mutation = useMutation({
    mutationFn: apiService.createVehicle,
    onSuccess: (data) => {
    //   toast({
    //     title: "Vehicle Created",
    //     description: `Vehicle ${data.code} (${data.plate}) added successfully.`,
    //   });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }); // Refetch vehicles list
      onSuccess(); // Close the dialog
    },
    onError: (error) => {
    //   apiService.handleApiError(error);
    console.error("Error creating vehicle:", error);
      // Potentially set form errors here if using react-hook-form
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation here if not using react-hook-form/zod
    mutation.mutate({ code, plate /*, other fields */ });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {/* Use Label and Input components from Shadcn */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="code" className="text-right">
          Code
        </Label>
        <Input
          id="code"
          value={code}
          onChange={(e:any) => setCode(e.target.value)}
          className="col-span-3"
          disabled={mutation.isPending}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="plate" className="text-right">
          Plate
        </Label>
        <Input
          id="plate"
          value={plate}
          onChange={(e:any) => setPlate(e.target.value)}
          className="col-span-3"
          disabled={mutation.isPending}
          required
        />
      </div>
      {/* Add other form fields here */}
      <DialogFooter>
        {/* Add DialogClose for the Cancel button */}
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Vehicle"}
        </Button>
      </DialogFooter>
    </form>
  );
};

// --- Main Vehicles Page Component ---
export default function VehiclesPage() {

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // Add state for view toggle (table/map) if implementing map view
  // const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const getData = async () => {
    let res = await apiService.getVehicles();
    console.log("res", res);
    return res.data;

  }
  const {
    data: vehicles,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getData,
    // Keep data fresh but avoid excessive refetching
    refetchOnWindowFocus: false
  });

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* <LoadingSpinner /> */}
        Loading ...
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        {/* <ExclamationTriangleIcon className="h-4 w-4" /> */}
        <AlertTitle>Error Fetching Vehicles</AlertTitle>
        <AlertDescription>
          {error?.message || "Could not load vehicle data."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        {/* Add view toggle buttons here if needed */}
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>Add Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details for the new vehicle.
              </DialogDescription>
            </DialogHeader>
            <CreateVehicleForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Conditional Rendering based on viewMode */}
      {/* {viewMode === 'table' ? ( */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IoT Devices</TableHead>
              <TableHead>Last Telemetry</TableHead>
              {/* Add other columns */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles && vehicles?.length > 0 ? (
              vehicles.map((vehicle:any) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.code}</TableCell>
                  <TableCell>{vehicle.plate}</TableCell>
                  <TableCell>
                    {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
                  </TableCell>
                  <TableCell>{vehicle.status}</TableCell>
                  <TableCell>{vehicle.iot_devices_count}</TableCell>
                  <TableCell>
                    {vehicle.latest_telemetry?.timestamp
                      ? new Date(
                          vehicle.latest_telemetry.timestamp
                        ).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  {/* Render other cells */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No vehicles found.
                  len: {vehicles?.length}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* ) : ( */}
      {/* <div className="h-[600px] w-full"> */}
      {/*   <MapContainer center={[DEFAULT_LAT, DEFAULT_LNG]} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}> */}
      {/*     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
      {/*     {vehicles?.filter(v => v.latest_telemetry?.lat && v.latest_telemetry?.long).map(vehicle => ( */}
      {/*       <Marker key={vehicle.id} position={[vehicle.latest_telemetry!.lat!, vehicle.latest_telemetry!.long!]}> */}
      {/*         <Popup> */}
      {/*           <b>{vehicle.code} ({vehicle.plate})</b><br /> */}
      {/*           {vehicle.model} */}
      {/*         </Popup> */}
      {/*       </Marker> */}
      {/*     ))} */}
      {/*   </MapContainer> */}
      {/* </div> */}
      {/* )} */}
    </div>
  );
}
