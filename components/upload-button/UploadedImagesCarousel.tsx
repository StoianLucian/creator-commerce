"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import type { UploadedImage } from "./UploadThingDropzone";

interface UploadedImagesCarouselProps {
    images: UploadedImage[];
    /** Called with the key of the image the user wants to drop. */
    onRemove?: (key: string) => void;
    className?: string;
}

/**
 * Shows the already-uploaded product images as a carousel with dot
 * indicators and a per-slide remove button.
 */
export function UploadedImagesCarousel({
    images,
    onRemove,
    className,
}: UploadedImagesCarouselProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) return;

        const onSelect = () => setCurrent(api.selectedScrollSnap());

        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);

        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    if (!images.length) {
        return null;
    }

    return (
        <div className={cn("space-y-3", className)}>
            <Carousel setApi={setApi} opts={{ loop: images.length > 1 }}>
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={image.key} className="group relative">
                            <div className="relative h-56 w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
                                <Image
                                    src={image.url}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    className="object-cover"
                                />

                                {onRemove && (
                                    <button
                                        type="button"
                                        onClick={() => onRemove(image.key)}
                                        aria-label={`Remove image ${index + 1}`}
                                        className="absolute right-2 top-2 rounded-lg border bg-background/80 p-1.5 text-foreground opacity-0 backdrop-blur-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                <span className="absolute bottom-2 left-2 rounded-lg border bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm tabular-nums">
                                    {index === 0 ? "Cover" : `${index + 1} / ${images.length}`}
                                </span>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </>
                )}
            </Carousel>

            {images.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {images.map((image, index) => (
                        <button
                            key={image.key}
                            type="button"
                            onClick={() => api?.scrollTo(index)}
                            aria-label={`Go to image ${index + 1}`}
                            aria-current={index === current}
                            className={cn(
                                "h-1.5 rounded-full transition-all",
                                index === current
                                    ? "w-4 bg-primary"
                                    : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground",
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
