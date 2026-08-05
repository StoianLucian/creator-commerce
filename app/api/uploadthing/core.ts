import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "@/lib/auth";
import { MAX_PRODUCT_IMAGES } from "@/form-validations/products";

const f = createUploadthing();

export const ourFileRouter = {
    productImage: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: MAX_PRODUCT_IMAGES,
        },
    })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({
                headers: req.headers,
            });

            if (!session?.user?.id) {
                throw new UploadThingError("Unauthorized");
            }

            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                uploadedBy: metadata.userId,
                url: file.ufsUrl,
                key: file.key,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
