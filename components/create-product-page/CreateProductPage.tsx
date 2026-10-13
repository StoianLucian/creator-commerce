"use client"

import { Save, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    CreateProductInput,
    createProductSchema,
    MAX_PRODUCT_IMAGES,
} from "@/form-validations/products"
import { useCreateProduct } from "@/hooks/useCreateProduct"
import { useUpdateProduct } from "@/hooks/useUpdateProduct"
import { useCategories } from "@/hooks/useCategories"
import { categoryLabel } from "@/lib/i18n/category"
import { UploadThingDropzone } from "../upload-button/UploadThingDropzone"
import { UploadedImagesCarousel } from "../upload-button/UploadedImagesCarousel"

interface CreateProductPageProps {
    productId?: number
    initialValues?: CreateProductInput
}

const emptyProduct: CreateProductInput = {
    name: "",
    description: "",
    categoryId: 0,
    status: "draft",
    price: 0,
    images: [],
}

export default function CreateProductPage({
    productId,
    initialValues,
}: CreateProductPageProps) {
    const isEdit = productId != null
    const { t } = useTranslation()

    const form = useForm<CreateProductInput>({
        resolver: zodResolver(createProductSchema),
        defaultValues: initialValues ?? emptyProduct,
    });

    const {
        handleSubmit,
        control,
    } = form;

    const { data: categories = [] } = useCategories()

    const create = useCreateProduct()
    const update = useUpdateProduct(productId ?? 0)
    const isPending = isEdit ? update.isPending : create.isPending

    function submitHandler(data: CreateProductInput) {
        if (isEdit) {
            update.mutate(data)
        } else {
            create.mutate(data)
        }
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="container mx-auto max-w-5xl space-y-6 py-8">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {isEdit ? t("productForm.editTitle") : t("productForm.createTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEdit
                            ? t("productForm.editSubtitle")
                            : t("productForm.createSubtitle")}
                    </p>
                </div>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("productForm.saving")}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEdit ? t("productForm.saveChanges") : t("productForm.saveProduct")}
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("productForm.generalInfo")}</CardTitle>
                            <CardDescription>
                                {t("productForm.generalInfoDesc")}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <Controller
                                control={control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("productForm.name")}</Label>

                                        <Input
                                            id="name"
                                            placeholder={t("productForm.namePlaceholder")}
                                            {...field}
                                        />

                                        {fieldState.error && (
                                            <p className="text-sm text-destructive">
                                                {fieldState.error.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            <div className="space-y-2">
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="description">{t("productForm.description")}</Label>

                                            <Textarea
                                                id="description"
                                                rows={6}
                                                placeholder={t("productForm.descriptionPlaceholder")}
                                                {...field}
                                            />

                                            {fieldState.error && (
                                                <p className="text-sm text-destructive">
                                                    {fieldState.error.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">

                                <Controller
                                    control={control}
                                    name="categoryId"
                                    render={({ field, fieldState: { error } }) => (
                                        <div className="space-y-2">
                                            <Label>{t("productForm.category")}</Label>
                                            <Select
                                                items={categories.map((category) => ({
                                                    value: String(category.id),
                                                    label: categoryLabel(t, category.name),
                                                }))}
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t("productForm.selectCategory")} />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={String(category.id)}
                                                        >
                                                            {categoryLabel(t, category.name)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {error && (
                                                <p className="text-sm text-destructive">
                                                    {error.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>


                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("productForm.pricing")}</CardTitle>
                            <CardDescription>
                                {t("productForm.pricingDesc")}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <Controller
                                control={control}
                                name="price"
                                render={({ field, fieldState: { error } }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="price">{t("productForm.price")}</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            placeholder={t("productForm.pricePlaceholder")}
                                            value={field.value ? field.value : ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === "" ? 0 : Number(value));
                                            }}
                                        />

                                        {error && (
                                            <p className="text-sm text-destructive">
                                                {error.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("productForm.image")}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <Controller
                                control={control}
                                name="images"
                                render={({ field, fieldState: { error } }) => {
                                    const images = field.value ?? []
                                    const remaining = MAX_PRODUCT_IMAGES - images.length

                                    return (
                                        <div className="space-y-3">
                                            <UploadedImagesCarousel
                                                images={images}
                                                onRemove={(key) =>
                                                    field.onChange(
                                                        images.filter((image) => image.key !== key),
                                                    )
                                                }
                                            />

                                            {remaining > 0 && (
                                                <UploadThingDropzone
                                                    remaining={remaining}
                                                    compact={images.length > 0}
                                                    onUploaded={(uploaded) =>
                                                        field.onChange([...images, ...uploaded])
                                                    }
                                                />
                                            )}

                                            {error && (
                                                <p className="text-sm text-destructive">
                                                    {error.message ?? error.root?.message}
                                                </p>
                                            )}
                                        </div>
                                    )
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("productForm.visibility")}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Controller
                                control={control}
                                name="status"
                                render={({ field, fieldState: { error } }) => (
                                    <div className="space-y-2">
                                        <Label>{t("productForm.status")}</Label>

                                        <Select
                                            items={[
                                                { value: "draft", label: t("filters.statuses.draft") },
                                                { value: "active", label: t("filters.statuses.active") },
                                                { value: "sold", label: t("filters.statuses.sold") },
                                            ]}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t("filters.statuses.draft")} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="draft">
                                                    {t("filters.statuses.draft")}
                                                </SelectItem>

                                                <SelectItem value="active">
                                                    {t("filters.statuses.active")}
                                                </SelectItem>

                                                <SelectItem value="sold">
                                                    {t("filters.statuses.sold")}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {error && (
                                            <p className="text-sm text-destructive">
                                                {error.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </CardContent>
                    </Card>

                </div>
            </div>
        </form>
    )
}

