import { useState, useMemo } from "react";
import GiftCard from "./GiftCard";
import GiftFilters from "./GiftFilters";
import GiftModal from "./GiftModal";
import type { Tables } from "@/integrations/supabase/types";

type GiftItem = Tables<"gifts">;

interface GiftGridProps {
  gifts: GiftItem[];
  onReserved: () => void;
}

const GiftGrid = ({ gifts, onReserved }: GiftGridProps) => {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  const filtered = useMemo(() => {
    let result = [...gifts];

    if (category !== "all") {
      result = result.filter((g) => g.category === category);
    }

    if (sort === "price_asc") {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price_desc") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    // Available first
    result.sort((a, b) => (a.is_available === b.is_available ? 0 : a.is_available ? -1 : 1));

    return result;
  }, [gifts, category, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <GiftFilters
          category={category}
          sort={sort}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          Nenhum presente encontrado nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((gift, i) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onSelect={setSelectedGift}
              index={i}
            />
          ))}
        </div>
      )}

      <GiftModal
        gift={selectedGift}
        open={!!selectedGift}
        onOpenChange={(open) => !open && setSelectedGift(null)}
        onReserved={onReserved}
      />
    </section>
  );
};

export default GiftGrid;
