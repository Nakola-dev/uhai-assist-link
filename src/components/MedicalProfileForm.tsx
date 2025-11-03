// src/components/MedicalProfileForm.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MedicalProfileFormProps {
  userId: string;
}

const MedicalProfileForm = ({ userId }: MedicalProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    blood_type: "",
    allergies: [] as string[],
    medications: [] as string[],
    chronic_conditions: [] as string[],
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          blood_type: data.blood_type || "",
          allergies: data.allergies || [],
          medications: data.medications || [],
          chronic_conditions: data.chronic_conditions || [],
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          emergency_contact_relationship: data.emergency_contact_relationship || "",
        });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;
      toast({ title: "Saved", description: "Medical profile updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Your full name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+254 712 345 678"
          />
        </div>
      </div>

      {/* Blood Type */}
      <div className="space-y-2">
        <Label htmlFor="blood_type">Blood Type</Label>
        <Select value={profile.blood_type} onValueChange={(v) => setProfile({ ...profile, blood_type: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select blood type" />
          </SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Allergies - HIGHLIGHTED */}
      <div className="space-y-2">
        <Label htmlFor="allergies" className="text-destructive font-semibold">
          Allergies (Critical)
        </Label>
        <Textarea
          id="allergies"
          placeholder="e.g., penicillin, peanuts, latex"
          value={Array.isArray(profile.allergies) ? profile.allergies.join(", ") : profile.allergies}
          onChange={(e) => setProfile({ ...profile, allergies: e.target.value.split(",").map(s => s.trim()) })}
          rows={2}
        />
      </div>

      {/* Medications */}
      <div className="space-y-2">
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          placeholder="List all medications and dosages"
          value={Array.isArray(profile.medications) ? profile.medications.join(", ") : profile.medications}
          onChange={(e) => setProfile({ ...profile, medications: e.target.value.split(",").map(s => s.trim()) })}
          rows={2}
        />
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-2">
        <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
        <Textarea
          id="chronic_conditions"
          placeholder="e.g., diabetes, hypertension, epilepsy"
          value={Array.isArray(profile.chronic_conditions) ? profile.chronic_conditions.join(", ") : profile.chronic_conditions}
          onChange={(e) => setProfile({ ...profile, chronic_conditions: e.target.value.split(",").map(s => s.trim()) })}
          rows={2}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={profile.emergency_contact_name}
              onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              value={profile.emergency_contact_phone}
              onChange={(e) => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
              placeholder="+254 712 345 678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Input
              id="emergency_contact_relationship"
              value={profile.emergency_contact_relationship}
              onChange={(e) => setProfile({ ...profile, emergency_contact_relationship: e.target.value })}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Medical Profile
      </Button>
    </form>
  );
};

export default MedicalProfileForm;