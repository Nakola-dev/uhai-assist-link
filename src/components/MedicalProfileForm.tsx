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
    blood_type: "",
    allergies: "",
    medications: "",
    chronic_conditions: "",
    additional_notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medical_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setProfile({
          blood_type: data.blood_type || "",
          allergies: data.allergies || "",
          medications: data.medications || "",
          chronic_conditions: data.chronic_conditions || "",
          additional_notes: data.additional_notes || "",
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
        .from("medical_profiles")
        .upsert({
          user_id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      toast({ title: "Saved", description: "Medical profile updated" });
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
          value={profile.allergies}
          onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-right text-muted-foreground">{profile.allergies.length}/500</p>
      </div>

      {/* Medications */}
      <div className="space-y-2">
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          placeholder="List all medications and dosages"
          value={profile.medications}
          onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-right text-muted-foreground">{profile.medications.length}/500</p>
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-2">
        <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
        <Textarea
          id="chronic_conditions"
          placeholder="e.g., diabetes, hypertension, epilepsy"
          value={profile.chronic_conditions}
          onChange={(e) => setProfile({ ...profile, chronic_conditions: e.target.value })}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-right text-muted-foreground">{profile.chronic_conditions.length}/500</p>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="additional_notes">Additional Notes</Label>
        <Textarea
          id="additional_notes"
          placeholder="Implant, pacemaker, organ donor, etc."
          value={profile.additional_notes}
          onChange={(e) => setProfile({ ...profile, additional_notes: e.target.value })}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-right text-muted-foreground">{profile.additional_notes.length}/500</p>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Medical Profile
      </Button>
    </form>
  );
};

export default MedicalProfileForm;