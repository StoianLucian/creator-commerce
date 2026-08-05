"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/lib/actions/products";

interface ProductGalleryProps {
    images: ProductDetail["images"];
    /** Used as the alt text prefix for each slide. */
    productName: string;
    className?: string;
}

/**
 * Read-only gallery for a product's images: a carousel with thumbnail
 * navigation. Falls back to a placeholder when the product has no images.
 */
export function ProductGallery({
    images,
    productName,
    className,
}: ProductGalleryProps) {
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
        return (
            <div
                className={cn(
                    "flex aspect-video w-full items-center justify-center rounded-xl border bg-muted",
                    className,
                )}
            >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">No images yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            <Carousel setApi={setApi} opts={{ loop: images.length > 1 }}>
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={image.id}>
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
                                <Image
                                    src={image.imageUrl}
                                    alt={`${productName} — image ${index + 1}`}
                                    fill
                                    priority={index === 0}
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                    className="object-cover"
                                />
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
                <div className="flex flex-wrap gap-2">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => api?.scrollTo(index)}
                            aria-label={`Show image ${index + 1}`}
                            aria-current={index === current}
                            className={cn(
                                "relative h-16 w-16 overflow-hidden rounded-lg border transition-all",
                                index === current
                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                    : "opacity-70 hover:opacity-100",
                            )}
                        >
                            <Image
                                src={image.imageUrl}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
