
"use client"

import { useState } from "react"
import { Save, Package, Upload } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateProductInput, createProductSchema } from "@/form-validations/products"
import { useCreateProduct } from "@/hooks/useCreateProduct"
import { useCategories } from "@/hooks/useCategories"

export default function CreateProductPage() {
    const [featured, setFeatured] = useState(false)

    const form = useForm<CreateProductInput>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: 0,
            status: "draft",
            price: 0,
        },
    });

    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = form;

    console.log(errors)

    const { data: categories = [] } = useCategories()


    const { mutateAsync: createProduct, isPending } = useCreateProduct()

    async function submitHandler(data: CreateProductInput) {

        // console.log(data)
        await createProduct(data)
    }



    return (
        <form onSubmit={handleSubmit(submitHandler)} className="container mx-auto max-w-5xl space-y-6 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Create Product</h1>
                    <p className="text-muted-foreground">
                        Add a new product to your catalog.
                    </p>
                </div>

                <Button type="submit">
                    {isPending ? "loading" : "nmot"}
                    <Save className="mr-2 h-4 w-4" />
                    Save Product
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>
                                Basic details about your product.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <Controller
                                control={control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name</Label>

                                        <Input
                                            id="name"
                                            placeholder="Wireless Mechanical Keyboard"
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
                                            <Label htmlFor="description">Description</Label>

                                            <Textarea
                                                id="description"
                                                rows={6}
                                                placeholder="Describe your product..."
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
                                            <Select
                                                value={categories[field.value].name}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={String(category.id)}
                                                        >
                                                            {category.name}
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
                            <CardTitle>Pricing</CardTitle>
                            <CardDescription>
                                Configure pricing and inventory.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Controller
                                        control={control}
                                        name="price"
                                        render={({ field, fieldState: { error } }) => (
                                            <div className="space-y-2">
                                                <Label>Price</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="99"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />

                                                {error && (
                                                    <p className="text-sm text-destructive">
                                                        {error.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Compare At</Label>
                                    <Input
                                        type="number"
                                        placeholder="129.99"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        placeholder="150"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Image</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <button
                                type="button"
                                className="flex h-56 w-full flex-col items-center justify-center rounded-lg border border-dashed transition-colors hover:bg-muted"
                            >
                                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />

                                <p className="font-medium">
                                    Upload Product Image
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    PNG, JPG up to 5MB
                                </p>
                            </button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visibility</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        Featured Product
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Display on homepage
                                    </p>
                                </div>

                                <Switch
                                    checked={featured}
                                    onCheckedChange={setFeatured}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Status</Label>

                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Draft" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>

                                        <SelectItem value="published">
                                            Published
                                        </SelectItem>

                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Category
                                </span>

                                <span>-</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Price
                                </span>

                                <span>-</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Stock
                                </span>

                                <span>-</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form >
    )
}

