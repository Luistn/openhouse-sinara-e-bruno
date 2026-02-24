import { motion } from "framer-motion";
import { Gift, Check } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type GiftItem = Tables<"gifts">;

interface GiftCardProps {
  gift: GiftItem;
  onSelect: (gift: GiftItem) => void;
  index: number;
}

const categoryLabels: Record<string, string> = {
  cozinha: "Cozinha",
  decoracao: "Decoração",
  eletronicos: "Eletrônicos",
  banheiro: "Banheiro",
  quarto: "Quarto",
  sala: "Sala",
  outros: "Outros",
};

const GiftCard = ({ gift, onSelect, index }: GiftCardProps) => {
  const isAvailable = gift.is_available;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 ${
        isAvailable
          ? "cursor-pointer hover:shadow-lg hover:-translate-y-1"
          : "opacity-75"
      }`}
      onClick={() => isAvailable && onSelect(gift)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {gift.image_url ? (
          <img
            src={gift.image_url}
            alt={gift.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isAvailable ? "group-hover:scale-105" : "grayscale"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gift className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Gifted overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/70">
            <Check className="mb-1 h-8 w-8 text-primary-foreground" />
            <span className="font-display text-lg font-semibold text-primary-foreground">
              Presenteado
            </span>
            {gift.guest_name && (
              <span className="mt-1 text-xs text-primary-foreground/80">
                por {gift.guest_name}
              </span>
            )}
          </div>
        )}

        {/* Category badge */}
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
          {categoryLabels[gift.category] || gift.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-base font-semibold leading-tight text-card-foreground line-clamp-2">
          {gift.title}
        </h3>
        {gift.price && (
          <p className="mt-1.5 text-lg font-semibold text-primary">
            R$ {Number(gift.price).toFixed(2).replace(".", ",")}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default GiftCard;
