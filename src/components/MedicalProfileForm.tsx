// src/components/MedicalProfileForm.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";

interface MedicalProfileFormProps {
  userId: string;
}

const MedicalProfileForm = ({ userId }: MedicalProfileFormProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

  /* --------------------------------------------------------------
   * 1. Load Profile (RLS-safe, .maybeSingle())
   * ------------------------------------------------------------ */
  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          full_name,
          phone,
          blood_type,
          allergies,
          medications,
          chronic_conditions,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship
        `)
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          blood_type: data.blood_type ?? "",
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          medications: Array.isArray(data.medications) ? data.medications : [],
          chronic_conditions: Array.isArray(data.chronic_conditions) ? data.chronic_conditions : [],
          emergency_contact_name: data.emergency_contact_name ?? "",
          emergency_contact_phone: data.emergency_contact_phone ?? "",
          emergency_contact_relationship: data.emergency_contact_relationship ?? "",
        });
      }
    } catch (err: any) {
      console.error("Unexpected error loading profile:", err);
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: err.message || "Could not load medical profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------
   * 2. Save Profile (upsert → safe with trigger)
   * ------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            ...profile,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your medical profile has been updated.",
      });
    } catch (err: any) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Could not save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------------------------------------
   * 3. Helper: Update array field from comma input
   * ------------------------------------------------------------ */
  const updateArrayField = (
    field: "allergies" | "medications" | "chronic_conditions",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setProfile((p) => ({ ...p, [field]: items }));
  };

  /* --------------------------------------------------------------
   * 4. Loading State
   * ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your medical profile...</p>
      </div>
    );
  }

  /* --------------------------------------------------------------
   * 5. Form UI
   * ------------------------------------------------------------ */
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Personal Info ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+254 712 345 678"
            required
          />
        </div>
      </div>

      {/* ── Blood Type ── */}
      <div className="space-y-2">
        <Label htmlFor="blood_type">Blood Type</Label>
        <Select
          value={profile.blood_type}
          onValueChange={(v) => setProfile((p) => ({ ...p, blood_type: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select blood type" />
          </SelectTrigger>
          <SelectContent>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Critical: Allergies ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <Label htmlFor="allergies" className="text-destructive font-semibold">
            Allergies (Critical)
          </Label>
        </div>
        <Textarea
          id="allergies"
          placeholder="e.g., penicillin, peanuts, latex"
          value={profile.allergies.join(", ")}
          onChange={(e) => updateArrayField("allergies", e.target.value)}
          rows={2}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple items with commas
        </p>
      </div>

      {/* ── Medications ── */}
      <div className="space-y-2">
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          placeholder="e.g., Insulin 10 units daily, Metformin 500mg"
          value={profile.medications.join(", ")}
          onChange={(e) => updateArrayField("medications", e.target.value)}
          rows={2}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Include dosage and frequency if possible
        </p>
      </div>

      {/* ── Chronic Conditions ── */}
      <div className="space-y-2">
        <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
        <Textarea
          id="chronic_conditions"
          placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma"
          value={profile.chronic_conditions.join(", ")}
          onChange={(e) => updateArrayField("chronic_conditions", e.target.value)}
          rows={2}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          List all ongoing conditions
        </p>
      </div>

      {/* ── Emergency Contact ── */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={profile.emergency_contact_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, emergency_contact_name: e.target.value }))
              }
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={profile.emergency_contact_phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, emergency_contact_phone: e.target.value }))
              }
              placeholder="+254 798 765 432"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Input
              id="emergency_contact_relationship"
              value={profile.emergency_contact_relationship}
              onChange={(e) =>
                setProfile((p) => ({ ...p, emergency_contact_relationship: e.target.value }))
              }
              placeholder="e.g., Spouse, Parent"
            />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={saving || !profile.full_name || !profile.phone}
          className="w-full"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Medical Profile"
          )}
        </Button>
      </div>
    </form>
  );
};

export default MedicalProfileForm;