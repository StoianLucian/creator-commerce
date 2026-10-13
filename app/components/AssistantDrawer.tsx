"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Package, Send, Sparkles, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { priceFormatter } from "@/lib/format";
import type { ProductCard } from "@/lib/assistant/types";
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { useAssistant, type ChatMessage } from "@/hooks/useAssistant";

/** Render assistant text, handling markdown links `[label](/path)`. A link that
 *  has a product card below it becomes plain bold text (the card carries the
 *  link, so we don't show it twice); any other link stays clickable. Everything
 *  else is plain text (the container keeps whitespace, so newlines survive). */
function renderContent(text: string, cardUrls: Set<string>) {
    const pattern = /\[([^\]]+)\]\((\S+?)\)/g;
    const nodes: React.ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) nodes.push(text.slice(last, match.index));
        const [, label, href] = match;
        nodes.push(
            cardUrls.has(href) ? (
                <strong key={match.index} className="font-medium">
                    {label}
                </strong>
            ) : (
                <Link
                    key={match.index}
                    href={href}
                    className="font-medium text-primary underline underline-offset-2"
                >
                    {label}
                </Link>
            )
        );
        last = pattern.lastIndex;
    }
    if (last < text.length) nodes.push(text.slice(last));

    return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}

/** Styled, clickable recommendation cards. */
function ProductCards({ products }: { products: ProductCard[] }) {
    if (products.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            {products.map((p) => (
                <Link
                    key={p.url}
                    href={p.url}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-background p-2 transition-colors hover:bg-muted"
                >
                    {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium group-hover:underline">
                            {p.name}
                        </span>
                        {p.category && (
                            <span className="truncate text-xs text-muted-foreground">
                                {p.category}
                            </span>
                        )}
                        <span className="text-sm font-semibold tabular-nums">
                            {priceFormatter.format(p.priceLei)}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

/** The steps the model took this turn. Shown live (expanded, with a spinner on
 *  the step in progress) while answering, then collapsed into a toggle once the
 *  answer is in. */
function Steps({ steps, active }: { steps: string[]; active: boolean }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(active);

    // Keep it open while working; let it collapse itself once finished.
    useEffect(() => {
        if (active) setOpen(true);
    }, [active]);

    if (steps.length === 0) return null;

    const label = (tool: string) =>
        t(`assistant.steps.${tool}`, { defaultValue: tool });

    const list = (
        <ul className="flex flex-col gap-1">
            {steps.map((tool, i) => {
                const inProgress = active && i === steps.length - 1;
                return (
                    <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                        {inProgress ? (
                            <Spinner className="size-3" />
                        ) : (
                            <Check className="size-3 text-primary" />
                        )}
                        {label(tool)}
                    </li>
                );
            })}
        </ul>
    );

    if (active) {
        return <div className="rounded-lg bg-muted/50 px-3 py-2">{list}</div>;
    }

    return (
        <div className="rounded-lg bg-muted/50 px-3 py-2">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-1.5 text-xs font-medium text-muted-foreground"
                aria-expanded={open}
            >
                <ChevronDown
                    className={`size-3 transition-transform ${open ? "" : "-rotate-90"}`}
                />
                {t("assistant.stepsSummary", { count: steps.length })}
            </button>
            {open && <div className="mt-2">{list}</div>}
        </div>
    );
}

/** Opener for the sales assistant: a button by the profile that slides a chat
 *  panel in from the right. The model answers from the creator's own sales and
 *  catalog, and can recommend products from the whole store (see lib/assistant). */
export function AssistantDrawer() {
    const { t } = useTranslation();
    const { messages, isStreaming, error, send, stop } = useAssistant();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [models, setModels] = useState<string[]>([]);
    const [model, setModel] = useState<string>("");
    const endRef = useRef<HTMLDivElement>(null);

    // Keep the latest message in view as it streams in.
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load the installed models the first time the drawer is opened.
    useEffect(() => {
        if (!open || models.length > 0) return;
        fetch("/api/assistant/models")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data?.models?.length) return;
                setModels(data.models);
                setModel(data.default ?? data.models[0]);
            })
            .catch(() => {});
    }, [open, models.length]);

    const submit = () => {
        if (!input.trim() || isStreaming) return;
        send(input, messages, model || undefined);
        setInput("");
    };

    const suggestions: string[] = t("assistant.suggestions", {
        returnObjects: true,
        defaultValue: [],
    }) as string[];

    return (
        <Drawer swipeDirection="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("assistant.open")}
                    />
                }
            >
                <Sparkles className="h-4 w-4" />
            </DrawerTrigger>

            <DrawerContent className="sm:[--drawer-content-width:28rem]">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {t("assistant.title")}
                    </DrawerTitle>
                    <DrawerDescription>{t("assistant.subtitle")}</DrawerDescription>

                    {models.length > 0 && (
                        <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            {t("assistant.model")}
                            <NativeSelect
                                size="sm"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={isStreaming}
                                className="w-auto"
                            >
                                {models.map((m) => (
                                    <NativeSelectOption key={m} value={m}>
                                        {m}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </label>
                    )}
                </DrawerHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">
                                {t("assistant.emptyHint")}
                            </p>
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => send(s, messages, model || undefined)}
                                    className="rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <AssistantTurn
                                key={i}
                                message={m}
                                streaming={isStreaming && i === messages.length - 1}
                            />
                        ))
                    )}

                    {error && (
                        <p className="rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <div ref={endRef} />
                </div>

                <div className="flex items-end gap-2 border-t p-4">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                        placeholder={t("assistant.placeholder")}
                        rows={1}
                        className="min-h-10 flex-1 resize-none"
                    />
                    {isStreaming ? (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={stop}
                            aria-label={t("assistant.stop")}
                        >
                            <Square className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            onClick={submit}
                            disabled={!input.trim()}
                            aria-label={t("assistant.sendLabel")}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

/** One message row: user bubble, or an assistant turn with its steps + answer. */
function AssistantTurn({
    message,
    streaming,
}: {
    message: ChatMessage;
    streaming: boolean;
}) {
    const { t } = useTranslation();

    if (message.role === "user") {
        return (
            <Message align="end">
                <MessageContent>
                    <Bubble variant="default" align="end">
                        <BubbleContent className="whitespace-pre-wrap">
                            {message.content}
                        </BubbleContent>
                    </Bubble>
                </MessageContent>
            </Message>
        );
    }

    const hasAnswer = message.content.length > 0;

    const allProducts = message.products ?? [];
    // Cards only appear once the suggestion is finished — never mid-stream.
    // Prefer the products the answer links to; if it linked none, fall back to
    // a small sample so the turn isn't empty-handed.
    const referenced = allProducts.filter((p) => message.content.includes(p.url));
    const cards = streaming
        ? []
        : referenced.length > 0
          ? referenced
          : allProducts.slice(0, 5);
    const cardUrls = new Set(cards.map((p) => p.url));

    return (
        <Message align="start">
            <MessageContent className="gap-2">
                {message.steps && message.steps.length > 0 && (
                    <Steps steps={message.steps} active={streaming && !hasAnswer} />
                )}
                {(hasAnswer || !streaming) && (
                    <Bubble variant="muted" align="start">
                        <BubbleContent className="whitespace-pre-wrap">
                            {renderContent(message.content, cardUrls)}
                        </BubbleContent>
                    </Bubble>
                )}
                {cards.length > 0 && <ProductCards products={cards} />}
                {streaming && !hasAnswer && (!message.steps || message.steps.length === 0) && (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner className="size-3" />
                        {t("assistant.thinking")}
                    </span>
                )}
            </MessageContent>
        </Message>
    );
}
