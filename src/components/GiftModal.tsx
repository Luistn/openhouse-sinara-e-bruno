import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type GiftItem = Tables<"gifts">;

interface GiftModalProps {
  gift: GiftItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReserved: () => void;
}

const GiftModal = ({ gift, open, onOpenChange, onReserved }: GiftModalProps) => {
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!gift) return null;

  const handleConfirm = async () => {
    if (!guestName.trim()) {
      toast({ title: "Por favor, informe seu nome.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("gifts")
      .update({ is_available: false, guest_name: guestName.trim() })
      .eq("id", gift.id)
      .eq("is_available", true);

    if (error) {
      toast({ title: "Erro ao reservar presente. Tente novamente.", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Presente reservado com sucesso! 🎉" });
    window.open(gift.purchase_url, "_blank");
    setGuestName("");
    setLoading(false);
    onOpenChange(false);
    onReserved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sage-light">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            {gift.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            Você confirma a escolha deste presente? Ele será reservado em seu
            nome e ficará indisponível para outros convidados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="guest-name">Seu nome *</Label>
            <Input
              id="guest-name"
              placeholder="Digite seu nome completo"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={100}
            />
          </div>
          {gift.price && (
            <p className="text-center text-lg font-semibold text-primary">
              R$ {Number(gift.price).toFixed(2).replace(".", ",")}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleConfirm} disabled={loading} className="w-full">
            {loading ? "Reservando..." : "Sim, quero presentear"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiftModal;
