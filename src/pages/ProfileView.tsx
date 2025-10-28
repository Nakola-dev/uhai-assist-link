import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Phone, AlertTriangle, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";

interface MedicalProfile {
  blood_type: string | null;
  allergies: string | null;
  medications: string | null;
  chronic_conditions: string | null;
  additional_notes: string | null;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

const ProfileView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Get user_id from token
      const { data: tokenData, error: tokenError } = await supabase
        .from("qr_access_tokens")
        .select("user_id")
        .eq("access_token", token)
        .eq("is_active", true)
        .single();

      if (tokenError || !tokenData) {
        setError("Invalid or expired QR code");
        return;
      }

      // Fetch medical profile
      const { data: medicalData, error: medicalError } = await supabase
        .from("medical_profiles")
        .select("*")
        .eq("user_id", tokenData.user_id)
        .single();

      if (medicalError) throw medicalError;
      setProfile(medicalData);

      // Fetch emergency contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", tokenData.user_id)
        .order("is_primary", { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">{error || "Unable to load medical profile"}</p>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      <header className="border-b bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Emergency Medical Profile</h1>
              <p className="text-sm opacity-90">UhaiLink - Responder View</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card className="border-primary shadow-emergency">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5" />
              Critical Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {profile.blood_type && (
              <div className="grid grid-cols-3 gap-2 p-4 bg-accent-light rounded-lg border border-accent">
                <span className="font-semibold">Blood Type:</span>
                <span className="col-span-2 text-lg font-bold text-accent">{profile.blood_type}</span>
              </div>
            )}

            {profile.allergies && (
              <div>
                <h3 className="font-semibold text-destructive mb-2">⚠️ Allergies</h3>
                <p className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  {profile.allergies}
                </p>
              </div>
            )}

            {profile.medications && (
              <div>
                <h3 className="font-semibold mb-2">Current Medications</h3>
                <p className="p-3 bg-muted rounded-lg">{profile.medications}</p>
              </div>
            )}

            {profile.chronic_conditions && (
              <div>
                <h3 className="font-semibold mb-2">Chronic Conditions</h3>
                <p className="p-3 bg-muted rounded-lg">{profile.chronic_conditions}</p>
              </div>
            )}

            {profile.additional_notes && (
              <div>
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <p className="p-3 bg-muted rounded-lg">{profile.additional_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No emergency contacts available
              </p>
            ) : (
              contacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{contact.name}</h4>
                      {contact.is_primary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-accent-light/20 border-accent">
          <CardContent className="pt-6">
            <p className="text-sm text-center">
              This information is provided via UhaiLink emergency medical system. For questions about this profile, contact the emergency contacts listed above.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfileView;
