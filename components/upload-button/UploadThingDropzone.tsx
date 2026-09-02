"use client";

import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

import { UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

export interface UploadedImage {
    url: string;
    key: string;
}

interface UploadThingDropzoneProps {
    /** Called once the selected files have finished uploading. */
    onUploaded: (images: UploadedImage[]) => void;
    /** How many more files the user is still allowed to upload. */
    remaining?: number;
    /** Shorter dropzone, used when images are already shown above it. */
    compact?: boolean;
    className?: string;
    disabled?: boolean;
}

/**
 * Drag & drop uploader for product images, styled with the project's
 * design tokens and wired to sonner for feedback.
 */
export function UploadThingDropzone({
    onUploaded,
    remaining,
    compact,
    className,
    disabled,
}: UploadThingDropzoneProps) {
    return (
        <UploadDropzone
            endpoint="productImage"
            disabled={disabled}
            config={{ mode: "auto" }}
            className={cn(
                "mt-0 w-full cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/50 p-4 transition-colors",
                compact ? "h-auto gap-2 py-4" : "h-56",
                "hover:border-primary hover:bg-accent ut-uploading:cursor-not-allowed",
                "ut-label:text-base ut-label:font-medium ut-label:text-foreground ut-label:hover:text-foreground",
                "ut-upload-icon:hidden",
                "ut-allowed-content:text-sm ut-allowed-content:text-muted-foreground",
                "ut-button:h-9 ut-button:w-auto ut-button:rounded-md ut-button:bg-primary ut-button:px-4 ut-button:text-sm ut-button:font-medium ut-button:text-primary-foreground",
                "ut-button:transition-colors ut-button:hover:bg-primary/90 ut-button:after:bg-primary/60",
                className,
            )}
            content={{
                label: ({ isDragActive }) => (
                    <span
                        className={cn(
                            "flex items-center gap-2",
                            compact ? "flex-row text-sm" : "flex-col",
                        )}
                    >
                        {isDragActive ? (
                            <ImageIcon
                                className={cn("text-primary", compact ? "h-4 w-4" : "h-8 w-8")}
                            />
                        ) : (
                            <Upload
                                className={cn(
                                    "text-muted-foreground",
                                    compact ? "h-4 w-4" : "h-8 w-8",
                                )}
                            />
                        )}
                        {isDragActive
                            ? "Drop to upload"
                            : compact
                                ? "Add more images"
                                : "Drag & drop your product images"}
                    </span>
                ),
                allowedContent:
                    remaining === undefined
                        ? "PNG, JPG up to 4MB"
                        : `PNG, JPG up to 4MB · ${remaining} left`,
                button: ({ isUploading, uploadProgress }) =>
                    isUploading ? `Uploading ${uploadProgress}%` : "Choose files",
            }}
            /** Guard against selecting more files than the remaining slots allow. */
            onBeforeUploadBegin={(files) => {
                if (remaining === undefined || files.length <= remaining) {
                    return files;
                }

                toast.warning(
                    `Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added — the rest were skipped.`,
                );

                return files.slice(0, remaining);
            }}
            onClientUploadComplete={(res) => {
                const images =
                    res?.map((file) => ({ url: file.ufsUrl, key: file.key })) ?? [];

                if (!images.length) {
                    toast.error("Upload finished but no file was returned.");
                    return;
                }

                onUploaded(images);
                toast.success(
                    images.length === 1
                        ? "Image uploaded!"
                        : `${images.length} images uploaded!`,
                );
            }}
            onUploadError={(error) => {
                toast.error(error.message || "Failed to upload the image.");
            }}
        />
    );
}
