import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEMO_MODE, demoProducts, demoSales } from "@/lib/demo-data";
import type { Product, Sale } from "@/lib/api";
import { Package, ShoppingCart, DollarSign } from "lucide-react";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setProducts(demoProducts);
      setSales(demoSales);
      setLoading(false);
      return;
    }
    Promise.all([api.getProducts(), api.getSales()])
      .then(([p, s]) => { setProducts(p); setSales(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const salesToday = sales.filter(
    (s) => s.date?.slice(0, 10) === today && s.status !== "canceled"
  );
  const revenueToday = salesToday.reduce((sum, s) => sum + (s.totalValue || 0), 0);

  const cards = [
    { title: "Total de Produtos", value: products.length, icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { title: "Vendas Hoje", value: salesToday.length, icon: ShoppingCart, color: "text-success", bg: "bg-success/10" },
    { title: "Receita Hoje", value: `R$ ${revenueToday.toFixed(2)}`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do sistema</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div key={card.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{card.title}</span>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold font-display text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
