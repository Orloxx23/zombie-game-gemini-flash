"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHOP_ITEMS, SHOP_CATEGORIES } from "@/lib/shop-items";
import type { GameState, ShopItem, ShopCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GameShopProps {
  gameState: GameState;
  onBuyItem: (item: ShopItem) => boolean;
  onClose: () => void;
  isLocked?: boolean;
}

type FilterKey = "all" | ShopCategory;

const CATEGORY_ORDER: ShopCategory[] = ["charm", "desire", "recovery", "gear"];

export function GameShop({
  gameState,
  onBuyItem,
  onClose,
  isLocked,
}: GameShopProps) {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const groupedItems = useMemo(() => {
    const filtered =
      filter === "all"
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter((item) => item.category === filter);
    const groups: Record<ShopCategory, ShopItem[]> = {
      charm: [],
      desire: [],
      recovery: [],
      gear: [],
    };
    filtered.forEach((item) => groups[item.category].push(item));
    return groups;
  }, [filter]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tienda"
      className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-lg font-bold">Tienda</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                <span>🪙</span>
                <span className="tabular-nums">{gameState.coins}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Cerrar tienda"
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {isLocked && (
            <div className="px-4 pb-3">
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-md px-3 py-2 text-xs text-amber-300 text-center">
                ⏳ Esperando que termine la escena para poder comprar...
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              icon="🛒"
              label="Todo"
            />
            {CATEGORY_ORDER.map((cat) => (
              <FilterChip
                key={cat}
                active={filter === cat}
                onClick={() => setFilter(cat)}
                icon={SHOP_CATEGORIES[cat].icon}
                label={SHOP_CATEGORIES[cat].label}
              />
            ))}
          </div>
        </div>

        {/* Inventory chip strip (if any) */}
        {gameState.inventory.length > 0 && (
          <div className="border-b px-4 py-3 bg-muted/20">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
              🎒 En tu inventario
            </p>
            <div className="flex flex-wrap gap-1.5">
              {gameState.inventory.map((item, i) => (
                <span
                  key={`${item.id}-${i}`}
                  className="inline-flex items-center gap-1 bg-background border rounded-full px-2 py-0.5 text-xs"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable items list grouped by category */}
        <div className="flex-1 overflow-y-auto">
          {CATEGORY_ORDER.map((category) => {
            const items = groupedItems[category];
            if (items.length === 0) return null;
            const meta = SHOP_CATEGORIES[category];

            return (
              <section key={category} className="border-b last:border-b-0">
                <header className="sticky top-0 z-[5] bg-background/95 backdrop-blur-md border-b px-4 py-2.5 flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <h3 className="text-sm font-semibold">{meta.label}</h3>
                  <span className="text-[10px] text-muted-foreground">
                    {meta.description}
                  </span>
                </header>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      gameState={gameState}
                      onBuy={onBuyItem}
                      disabled={!!isLocked}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

function FilterChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-foreground/70 hover:text-foreground border-border hover:bg-muted/40"
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ShopItemCard({
  item,
  gameState,
  onBuy,
  disabled,
}: {
  item: ShopItem;
  gameState: GameState;
  onBuy: (item: ShopItem) => boolean;
  disabled: boolean;
}) {
  const owned =
    !item.consumable && gameState.inventory.some((inv) => inv.id === item.id);
  const cooldown = gameState.itemCooldowns[item.id] ?? 0;
  const canAfford = gameState.coins >= item.price;
  const blocked = disabled || cooldown > 0 || owned || !canAfford;

  const handleBuy = () => {
    if (blocked) return;
    onBuy(item);
  };

  let buttonLabel = "Comprar";
  let buttonVariant: "default" | "outline" | "ghost" = "default";
  if (owned) {
    buttonLabel = "✓ Adquirido";
    buttonVariant = "outline";
  } else if (cooldown > 0) {
    buttonLabel = `⏱ ${cooldown} ${cooldown === 1 ? "turno" : "turnos"}`;
    buttonVariant = "outline";
  } else if (disabled) {
    buttonLabel = "En pausa...";
    buttonVariant = "outline";
  } else if (!canAfford) {
    buttonLabel = "Sin monedas";
    buttonVariant = "outline";
  }

  return (
    <div
      className={cn(
        "border rounded-lg p-3 flex flex-col gap-2 transition-opacity",
        (cooldown > 0 || owned) && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0" aria-hidden>
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.name}</p>
            {!item.consumable && (
              <p className="text-[9px] uppercase tracking-wide text-blue-400">
                Permanente
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-xs font-medium text-yellow-300 shrink-0">
          <span>🪙</span>
          <span className="tabular-nums">{item.price}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-tight">
        {item.description}
      </p>

      <p className="text-[11px] text-emerald-400 leading-tight">
        {item.effect}
      </p>

      <Button
        size="sm"
        onClick={handleBuy}
        disabled={blocked}
        variant={buttonVariant}
        className="w-full h-8 text-xs"
        aria-label={`Comprar ${item.name} por ${item.price} monedas`}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
