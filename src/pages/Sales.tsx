import { useEffect, useState } from "react";
import { api, Sale, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SaleItem {
  productId: number;
  quantity: number;
}

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [client, setClient] = useState("");
  const [items, setItems] = useState<SaleItem[]>([{ productId: 0, quantity: 1 }]);

  const fetchSales = async () => {
    try {
      const [s, p] = await Promise.all([api.getSales(), api.getProducts()]);
      setSales(s);
      setProducts(p);
    } catch {
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const addItem = () => setItems([...items, { productId: 0, quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof SaleItem, value: number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.productId > 0 && i.quantity > 0);
    if (!validItems.length) {
      toast.error("Adicione pelo menos um item");
      return;
    }
    try {
      await api.createSale({ client, items: validItems });
      toast.success("Venda criada");
      setDialogOpen(false);
      setClient("");
      setItems([{ productId: 0, quantity: 1 }]);
      fetchSales();
    } catch {
      toast.error("Erro ao criar venda");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancelar esta venda?")) return;
    try {
      await api.cancelSale(id);
      toast.success("Venda cancelada");
      fetchSales();
    } catch {
      toast.error("Erro ao cancelar venda");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">{sales.length} vendas registradas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Venda</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" required />
              </div>

              <div className="space-y-3">
                <Label>Itens</Label>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={item.productId ? String(item.productId) : ""}
                        onValueChange={(v) => updateItem(i, "productId", parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} — R$ {p.costPrice.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar item
                </Button>
              </div>

              <Button type="submit" className="w-full">Criar Venda</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.client}</TableCell>
                <TableCell>{new Date(s.date).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>R$ {(s.totalValue || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={s.status === "canceled" ? "destructive" : "default"}>
                    {s.status === "canceled" ? "Cancelada" : "Ativa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {s.status !== "canceled" && (
                    <Button variant="ghost" size="icon" onClick={() => handleCancel(s.id)} title="Cancelar venda">
                      <XCircle className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma venda registrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Sales;
