import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import GiftGrid from "@/components/GiftGrid";
import { Settings } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type GiftItem = Tables<"gifts">;

const Index = () => {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGifts = async () => {
    const { data } = await supabase.from("gifts").select("*").order("created_at", { ascending: true });
    setGifts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGifts();

    const channel = supabase
      .channel("gifts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "gifts" }, () => {
        fetchGifts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <GiftGrid gifts={gifts} onReserved={fetchGifts} />
      )}

      {/* Admin link */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          to="/admin"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg border text-muted-foreground hover:text-foreground transition-colors"
          title="Área Administrativa"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default Index;
