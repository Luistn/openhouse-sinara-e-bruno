import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  { value: "all", label: "Todas as Categorias" },
  { value: "cozinha", label: "Cozinha" },
  { value: "decoracao", label: "Decoração" },
  { value: "eletronicos", label: "Eletrônicos" },
  { value: "banheiro", label: "Banheiro" },
  { value: "quarto", label: "Quarto" },
  { value: "sala", label: "Sala" },
  { value: "outros", label: "Outros" },
];

const sortOptions = [
  { value: "default", label: "Ordem padrão" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

interface GiftFiltersProps {
  category: string;
  sort: string;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const GiftFilters = ({ category, sort, onCategoryChange, onSortChange }: GiftFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GiftFilters;
