import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

interface EmergencyContactsFormProps {
  userId: string;
}

const EmergencyContactsForm = ({ userId }: EmergencyContactsFormProps) => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phone: "",
    is_primary: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", userId)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all fields" });
      return;
    }

    try {
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: userId,
        ...newContact,
      });

      if (error) throw error;
      toast({ title: "Success", description: "Emergency contact added" });
      setNewContact({ name: "", relationship: "", phone: "", is_primary: false });
      fetchContacts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Contact removed" });
      fetchContacts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddContact} className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <h3 className="font-semibold text-lg">Add New Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              placeholder="e.g., Spouse, Parent, Friend"
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254 712 345 678"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Your Emergency Contacts</h3>
        {contacts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No emergency contacts added yet
          </p>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{contact.name}</h4>
                    {contact.is_primary && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="text-sm font-mono">{contact.phone}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteContact(contact.id!)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsForm;
