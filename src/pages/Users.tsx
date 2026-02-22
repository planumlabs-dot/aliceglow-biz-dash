import { useEffect, useState } from "react";
import { api, User } from "@/lib/api";
import { DEMO_MODE, demoUsers } from "@/lib/demo-data";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", isAdmin: false });

  const fetchUsers = async () => {
    if (DEMO_MODE) { setUsers(demoUsers); setLoading(false); return; }
    try { setUsers(await api.getUsers()); }
    catch { toast.error("Erro ao carregar usuários"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (DEMO_MODE) { toast.success("Usuário criado (demo)"); setDialogOpen(false); return; }
    try {
      await api.createUser({ name: form.name, email: form.email, password: form.password, perfils: form.isAdmin ? ["ADMIN"] : [] });
      toast.success("Usuário criado"); setDialogOpen(false); setForm({ name: "", email: "", password: "", isAdmin: false }); fetchUsers();
    } catch { toast.error("Erro ao criar usuário"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    if (DEMO_MODE) { toast.success("Usuário excluído (demo)"); return; }
    try { await api.deleteUser(id); toast.success("Usuário excluído"); fetchUsers(); }
    catch { toast.error("Erro ao excluir usuário"); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} usuários cadastrados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Usuário</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Senha</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAdmin" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} className="rounded border-border" />
                <Label htmlFor="isAdmin">Administrador</Label>
              </div>
              <Button type="submit" className="w-full">Criar Usuário</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Perfil</TableHead><TableHead className="w-20">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant={u.perfils?.includes("ADMIN") ? "default" : "secondary"}>{u.perfils?.includes("ADMIN") ? "Admin" : "Usuário"}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum usuário cadastrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersPage;
