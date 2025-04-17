// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import apiService, { IotDevice, SelectOption } from "@/services/apiService"; // Assuming types are exported
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// // import { useToast } from "@/components/ui/use-toast";
// import LoadingSpinner from "@/components/shared/LoadingSpinner";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCaption,
// } from "@/components/ui/table";
// // import { ExclamationTriangleIcon, PlusCircledIcon } from "@radix-ui/react-icons";
// import { RxExclamationTriangle, RxPlusCircled } from "react-icons/rx";
// import { Link } from "react-router-dom"; // For linking to vehicle/token pages

// // --- Create IoT Device Form Component ---
// const CreateIotDeviceForm = ({ onSuccess }: { onSuccess: () => void }) => {
//   const queryClient = useQueryClient();
// //   const { toast } = useToast();
//   const [macAddress, setMacAddress] = useState("");
//   const [model, setModel] = useState("");
//   const [hwVersion, setHwVersion] = useState("");
//   const [swVersion, setSwVersion] = useState("");
//   const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
//   const [selectedApiAuthId, setSelectedApiAuthId] = useState<string | undefined>(undefined);

//   // Fetch data for Select dropdowns
//   const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<SelectOption[], Error>({
//     queryKey: ["vehiclesForSelect"],
//     queryFn: apiService.getVehiclesForSelect,
//     staleTime: Infinity, // Cache vehicle list longer as it might not change often
//   });

//   const { data: apiTokens, isLoading: isLoadingTokens } = useQuery<SelectOption[], Error>({
//     queryKey: ["apiAuthForSelect"],
//     queryFn: apiService.getApiAuthForSelect,
//     staleTime: Infinity, // Cache token list longer
//   });

//   const mutation = useMutation({
//     mutationFn: apiService.createIotDevice,
//     onSuccess: (data) => {
//       toast({
//         title: "IoT Device Created",
//         description: `Device ${data.mac_address} created successfully.`,
//       });
//       queryClient.invalidateQueries({ queryKey: ["iotDevices"] });
//       queryClient.invalidateQueries({ queryKey: ["vehicles"] }); // Invalidate vehicles too as count changes
//       queryClient.invalidateQueries({ queryKey: ["apiAuth"] }); // Invalidate tokens too as count changes
//       onSuccess(); // Close the dialog
//     },
//     onError: (error) => {
//       apiService.handleApiError(error, toast);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!macAddress) {
//       toast({ variant: "destructive", title: "Validation Error", description: "MAC Address is required." });
//       return;
//     }
//     // Add more validation as needed

//     mutation.mutate({
//       mac_address: macAddress,
//       model: model || undefined, // Send undefined if empty
//       hw_version: hwVersion || undefined,
//       sw_version: swVersion || undefined,
//       vehicle_id: selectedVehicleId || undefined,
//       api_auth_token_id: selectedApiAuthId || undefined,
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="grid gap-4 py-4">
//       {/* MAC Address */}
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="macAddress" className="text-right">
//           MAC Address*
//         </Label>
//         <Input
//           id="macAddress"
//           value={macAddress}
//           onChange={(e) => setMacAddress(e.target.value)}
//           className="col-span-3"
//           disabled={mutation.isPending}
//           required
//           placeholder="e.g., 00:1A:2B:3C:4D:5E"
//         />
//       </div>

//       {/* Model */}
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="model" className="text-right">
//           Model
//         </Label>
//         <Input
//           id="model"
//           value={model}
//           onChange={(e) => setModel(e.target.value)}
//           className="col-span-3"
//           disabled={mutation.isPending}
//           placeholder="(Optional)"
//         />
//       </div>

//       {/* HW Version */}
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="hwVersion" className="text-right">
//           HW Version
//         </Label>
//         <Input
//           id="hwVersion"
//           value={hwVersion}
//           onChange={(e) => setHwVersion(e.target.value)}
//           className="col-span-3"
//           disabled={mutation.isPending}
//           placeholder="(Optional)"
//         />
//       </div>

//       {/* SW Version */}
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="swVersion" className="text-right">
//           SW Version
//         </Label>
//         <Input
//           id="swVersion"
//           value={swVersion}
//           onChange={(e) => setSwVersion(e.target.value)}
//           className="col-span-3"
//           disabled={mutation.isPending}
//           placeholder="(Optional)"
//         />
//       </div>

//       {/* Assign Vehicle Select */}
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="vehicle" className="text-right">
//           Assign Vehicle
//         </Label>
//         <Select
//           value={selectedVehicleId}
//           onValueChange={setSelectedVehicleId}
//           disabled={isLoadingVehicles || mutation.isPending}
//         >
//           <SelectTrigger className="col-span-3">
//             <SelectValue placeholder={isLoadingVehicles ? "Loading vehicles..." : "Select vehicle (Optional)"} />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="none">-- None --</SelectItem> {/* Option to unassign/not assign */}
//             {vehicles?.map((vehicle) => (
//               <SelectItem key={vehicle.value} value={vehicle.value}>
//                 {vehicle.label}
//               </SelectItem>
//             ))}
//             {!isLoadingVehicles && (!vehicles || vehicles.length === 0) && (
//                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No vehicles available</div>
//             )}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Assign API Token Select */}
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="apiToken" className="text-right">
//           Assign Token
//         </Label>
//         <Select
//           value={selectedApiAuthId}
//           onValueChange={setSelectedApiAuthId}
//           disabled={isLoadingTokens || mutation.isPending}
//         >
//           <SelectTrigger className="col-span-3">
//             <SelectValue placeholder={isLoadingTokens ? "Loading tokens..." : "Select API token (Optional)"} />
//           </SelectTrigger>
//           <SelectContent>
//              <SelectItem value="none">-- None --</SelectItem> {/* Option to unassign/not assign */}
//             {apiTokens?.map((token) => (
//               <SelectItem key={token.value} value={token.value}>
//                 {token.label}
//               </SelectItem>
//             ))}
//              {!isLoadingTokens && (!apiTokens || apiTokens.length === 0) && (
//                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No API tokens available</div>
//             )}
//           </SelectContent>
//         </Select>
//       </div>


//       <DialogFooter>
//         <DialogClose asChild>
//           <Button variant="outline" type="button">
//             Cancel
//           </Button>
//         </DialogClose>
//         <Button type="submit" disabled={mutation.isPending || isLoadingVehicles || isLoadingTokens}>
//           {mutation.isPending ? (
//             <>
//               <LoadingSpinner size="sm" /> <span className="ml-2">Creating...</span>
//             </>
//           ) : (
//             "Create Device"
//           )}
//         </Button>
//       </DialogFooter>
//     </form>
//   );
// };


// // --- Main IoT Page Component ---
// export default function IotPage() {
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

//   const {
//     data: iotDevices,
//     isLoading,
//     error,
//     isError,
//   } = useQuery<IotDevice[], Error>({ // Add explicit types
//     queryKey: ["iotDevices"],
//     queryFn: apiService.getIotDevices,
//     staleTime: 1000 * 60 * 1, // 1 minute
//   });

//   // --- Render Logic ---
//   const renderContent = () => {
//      if (isLoading) {
//       return (
//         <div className="flex justify-center items-center h-64">
//           <LoadingSpinner />
//         </div>
//       );
//     }

//     if (isError) {
//       return (
//         <Alert variant="destructive" className="mt-4">
//           <RxExclamationTriangle className="h-4 w-4" />
//           <AlertTitle>Error Fetching IoT Devices</AlertTitle>
//           <AlertDescription>
//             {error?.message || "Could not load IoT device data."}
//           </AlertDescription>
//         </Alert>
//       );
//     }

//     return (
//        <div className="rounded-md border mt-4">
//         <Table>
//            <TableCaption>
//             {(!iotDevices || iotDevices.length === 0) && "No IoT devices found."}
//           </TableCaption>
//           <TableHeader>
//             <TableRow>
//               <TableHead>MAC Address</TableHead>
//               <TableHead>Model</TableHead>
//               <TableHead>HW Ver.</TableHead>
//               <TableHead>SW Ver.</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Assigned Vehicle</TableHead>
//               <TableHead>Assigned API Token</TableHead>
//                {/* Add Actions column if needed */}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {iotDevices && iotDevices.length > 0 ? (
//               iotDevices.map((device) => (
//                 <TableRow key={device.id}>
//                   <TableCell className="font-mono">{device.mac_address}</TableCell>
//                   <TableCell>{device.model || "-"}</TableCell>
//                   <TableCell>{device.hw_version || "-"}</TableCell>
//                   <TableCell>{device.sw_version || "-"}</TableCell>
//                   <TableCell>{device.status}</TableCell>
//                   <TableCell>
//                     {device.vehicle ? (
//                       <Link to={`/vehicles/${device.vehicle.id}`} className="text-primary hover:underline">
//                          {device.vehicle.code} ({device.vehicle.plate})
//                       </Link>
//                     ) : (
//                       "-"
//                     )}
//                   </TableCell>
//                    <TableCell>
//                     {device.api_auth_token ? (
//                       <Link to={`/api-auth#${device.api_auth_token.id}`} className="text-primary hover:underline"> {/* Simple anchor link */}
//                          {device.api_auth_token.title}
//                       </Link>
//                     ) : (
//                       "-"
//                     )}
//                   </TableCell>
//                    {/* Add TableCell for actions */}
//                 </TableRow>
//               ))
//             ) : (
//                <TableRow>
//                 <TableCell colSpan={7} className="h-24 text-center">
//                   No IoT devices registered yet.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto py-10">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">IoT Devices</h1>
//         <Dialog
//           open={isCreateDialogOpen}
//           onOpenChange={setIsCreateDialogOpen}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <RxPlusCircled className="mr-2 h-4 w-4" /> Add Device
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[550px]"> {/* Slightly wider dialog */}
//             <DialogHeader>
//               <DialogTitle>Register New IoT Device</DialogTitle>
//               <DialogDescription>
//                 Enter the details for the new IoT device and optionally assign it.
//               </DialogDescription>
//             </DialogHeader>
//             <CreateIotDeviceForm onSuccess={() => setIsCreateDialogOpen(false)} />
//           </DialogContent>
//         </Dialog>
//       </div>

//       {renderContent()}

//     </div>
//   );
// }
