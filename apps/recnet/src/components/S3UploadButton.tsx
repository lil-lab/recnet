// "use client";

// import { trpc } from "@recnet/recnet-web/app/_trpc/client";
// import React from "react";

// import {
//     Button,
//     Flex,
//     Text,
//   } from "@radix-ui/themes";

// interface S3UploadButtonProps extends React.ComponentProps<typeof Button> {
//   formState: {
//     defaultValues?: {
//       photoUrl?: string | null;
//     };
//     errors?: {
//       photoUrl?: {
//         message?: string;
//       };
//     };
//   };
//   setValue: (name: "photoUrl", value: string) => void;
// }

// export function S3UploadButton(props: S3UploadButtonProps) {
//     const { formState, setValue } = props;
//     const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
//     const [isUploading, setIsUploading] = React.useState(false);
//     const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    
//     // get secure url from backend server
//     const { data } = trpc.getS3UploadUrl.useQuery();

//     // Cleanup preview URL when component unmounts or when preview changes
//     React.useEffect(() => {
//         return () => {
//             if (previewUrl) {
//                 URL.revokeObjectURL(previewUrl);
//             }
//         };
//     }, [previewUrl]);

//     const handleUpload = async () => {
//         if (!selectedFile || !data?.url) return;

//         try {
//             setIsUploading(true);
//             // Upload file to S3
//             const response = await fetch(data.url, {
//                 method: 'PUT',
//                 body: selectedFile,
//                 headers: {
//                     'Content-Type': selectedFile.type,
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Upload failed');
//             }

//             // The URL where the file will be accessible
//             const fileUrl = data.url.split('?')[0];
//             setValue('photoUrl', fileUrl);
//             console.log('File uploaded successfully:', fileUrl);
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             // You might want to show an error message to the user here
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     return (
//         <Flex direction="column" gap="2">
//             <label>
//                 <Text as="div" size="2" mb="1" weight="medium">
//                     Profile Photo
//                 </Text>
//                 <input
//                     type="file"
//                     accept="image/*"
//                     onChange={
//                         async (e: React.ChangeEvent<HTMLInputElement>) => {
//                             if (!e.target.files || e.target.files.length === 0) {
//                                 console.log("No file selected");
//                                 return;
//                             }
//                             const file = e.target.files[0];
//                             setSelectedFile(file);
                            
//                             // Cleanup previous preview URL if it exists
//                             if (previewUrl) {
//                                 URL.revokeObjectURL(previewUrl);
//                             }

//                             // Create preview URL for the selected image
//                             const objectUrl = URL.createObjectURL(file);
//                             setPreviewUrl(objectUrl);
//                         }
//                     }
//                 />
//                 {formState.errors?.photoUrl ? (
//                     <Text size="1" color="red">
//                         {formState.errors.photoUrl.message}
//                     </Text>
//                 ) : null}
//             </label>

//             {previewUrl && (
//                 <img
//                     src={previewUrl} 
//                     alt="Profile preview" 
//                     style={{ 
//                         width: '100px',
//                         height: '100px',
//                         objectFit: 'cover',
//                         borderRadius: '50px',
//                         marginTop: '12px',
//                     }} 
//                 />
//             )}
//             {selectedFile && (
//                 <Flex justify="start" style={{ width: '50%' }}>
//                     <Button
//                         onClick={handleUpload} 
//                         disabled={isUploading}
//                     >
//                     {isUploading ? 'Uploading...' : 'Upload Photo'}
//                     </Button>
//                 </Flex>
//             )}
//         </Flex>
//     );
// }