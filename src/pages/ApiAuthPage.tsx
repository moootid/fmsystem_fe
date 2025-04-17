// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import apiService, { ApiAuthToken } from "@/services/apiService"; // Assuming ApiAuthToken type is exported
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
// import { useToast } from "@/components/ui/use-toast";
// import LoadingSpinner from "@/components/shared/LoadingSpinner";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCaption, // Added for empty state
// } from "@/components/ui/table";
// import { ExclamationTriangleIcon, PlusCircledIcon } from "@radix-ui/react-icons"; // Icons

// // --- Create Token Form Component ---
// const CreateApiAuthTokenForm = ({ onSuccess }: { onSuccess: () => void }) => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");

//   const mutation = useMutation({
//     mutationFn: apiService.createApiAuthToken,
//     onSuccess: (data) => {
//       toast({
//         title: "API Token Created",
//         description: `Token "${data.title}" created successfully.`,
//       });
//       queryClient.invalidateQueries({ queryKey: ["apiAuth"] });
//       onSuccess(); // Close the dialog
//     },
//     onError: (error) => {
//       apiService.handleApiError(error, toast);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!title) {
//       // Basic validation
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Title is required.",
//       });
//       return;
//     }
//     mutation.mutate({ title, description });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="grid gap-4 py-4">
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="title" className="text-right">
//           Title*
//         </Label>
//         <Input
//           id="title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="col-span-3"
//           disabled={mutation.isPending}
//           required
//           placeholder="e.g., My App Integration"
//         />
//       </div>
//       <div className="grid grid-cols-4 items-center gap-4">
//         <Label htmlFor="description" className="text-right">
//           Description
//         </Label>
//         <Input
//           id="description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="col-span-3"
//           disabled={mutation.isPending}
//           placeholder="(Optional) Describe the token's purpose"
//         />
//       </div>
//       <DialogFooter>
//         <DialogClose asChild>
//           <Button variant="outline" type="button">
//             Cancel
//           </Button>
//         </DialogClose>
//         <Button type="submit" disabled={mutation.isPending}>
//           {mutation.isPending ? (
//             <>
//               <LoadingSpinner size="sm" /> <span className="ml-2">Creating...</span>
//             </>
//           ) : (
//             "Create Token"
//           )}
//         </Button>
//       </DialogFooter>
//     </form>
//   );
// };

// // --- Main API Auth Page Component ---
// export default function ApiAuthPage() {
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

//   const {
//     data: apiTokens,
//     isLoading,
//     error,
//     isError,
//   } = useQuery<ApiAuthToken[], Error>({ // Add explicit types
//     queryKey: ["apiAuth"],
//     queryFn: apiService.getApiAuthTokens,
//     staleTime: 1000 * 60 * 2, // 2 minutes
//   });

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleString();
//     } catch (e) {
//       return "Invalid Date";
//     }
//   };

//   // --- Render Logic ---
//   const renderContent = () => {
//     if (isLoading) {
//       return (
//         <div className="flex justify-center items-center h-64">
//           <LoadingSpinner />
//         </div>
//       );
//     }

//     if (isError) {
//       return (
//         <Alert variant="destructive" className="mt-4">
//           <ExclamationTriangleIcon className="h-4 w-4" />
//           <AlertTitle>Error Fetching API Tokens</AlertTitle>
//           <AlertDescription>
//             {error?.message || "Could not load API token data."}
//           </AlertDescription>
//         </Alert>
//       );
//     }

//     return (
//       <div className="rounded-md border mt-4">
//         <Table>
//           <TableCaption>
//             {(!apiTokens || apiTokens.length === 0) && "No API tokens found."}
//           </TableCaption>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Title</TableHead>
//               <TableHead>Description</TableHead>
//               <TableHead>Token Prefix</TableHead>
//               <TableHead>IoT Devices</TableHead>
//               <TableHead>Last Accessed</TableHead>
//               <TableHead>Created At</TableHead>
//               {/* Add Actions column if needed (e.g., Revoke) */}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {apiTokens && apiTokens.length > 0 ? (
//               apiTokens.map((token) => (
//                 <TableRow key={token.id}>
//                   <TableCell className="font-medium">{token.title}</TableCell>
//                   <TableCell>{token.description || "-"}</TableCell>
//                   <TableCell>
//                     <code>{token.token_prefix}...</code> {/* Display prefix only */}
//                   </TableCell>
//                   <TableCell className="text-center">{token.iot_devices_count}</TableCell>
//                   <TableCell>{formatDate(token.last_accessed_at)}</TableCell>
//                   <TableCell>{formatDate(token.created_at)}</TableCell>
//                   {/* Add TableCell for actions */}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={6} className="h-24 text-center">
//                   No API tokens created yet.
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
//         <h1 className="text-3xl font-bold">API Auth Tokens</h1>
//         <Dialog
//           open={isCreateDialogOpen}
//           onOpenChange={setIsCreateDialogOpen}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Token
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle>Create New API Auth Token</DialogTitle>
//               <DialogDescription>
//                 Generate a new token for authenticating external applications or devices.
//               </DialogDescription>
//             </DialogHeader>
//             <CreateApiAuthTokenForm onSuccess={() => setIsCreateDialogOpen(false)} />
//           </DialogContent>
//         </Dialog>
//       </div>

//       {renderContent()}

//     </div>
//   );
// }
