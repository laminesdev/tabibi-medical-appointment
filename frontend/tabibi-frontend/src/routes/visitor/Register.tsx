import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/types/auth.types";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const [role, setRole] = useState<Role>("PATIENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    specialty: "",
    location: "",
    bio: "",
    consultationFee: "",
    experienceYears: "",
    education: "",
  });

  const passwordStrength = () => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setIsLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender as "MALE" | "FEMALE",
        dateOfBirth: formData.dateOfBirth || undefined,
        role,
          ...(role === "DOCTOR" && {
            specialty: formData.specialty,
            location: formData.location,
            bio: formData.bio || undefined,
            consultationFee: formData.consultationFee || undefined,
            experienceYears: formData.experienceYears || undefined,
            education: formData.education || undefined,
          }),
      };

      await register(payload);
      navigate("/login");
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string; errors?: Record<string, string[]> };
      if (apiErr.errors) {
        setErrors(apiErr.errors);
      } else if (apiErr.status === 409) {
        setError(apiErr.message || "Email or phone already in use");
      } else {
        setError(apiErr.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Tabibi as a patient or doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  role === "PATIENT" ? "bg-white shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setRole("PATIENT")}
              >
                Patient
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  role === "DOCTOR" ? "bg-white shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setRole("DOCTOR")}
              >
                Doctor
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  required
                  minLength={2}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  required
                  minLength={2}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i <= strength ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                placeholder="+213XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => updateField("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender[0]}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth (optional)</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                />
              </div>
            </div>

            {role === "DOCTOR" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Professional Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specialty</label>
                    <Input
                      placeholder="e.g. Cardiology"
                      value={formData.specialty}
                      onChange={(e) => updateField("specialty", e.target.value)}
                      required={role === "DOCTOR"}
                    />
                    {errors.specialty && (
                      <p className="text-xs text-destructive">{errors.specialty[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="e.g. Algiers"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      required={role === "DOCTOR"}
                    />
                    {errors.location && (
                      <p className="text-xs text-destructive">{errors.location[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio (optional)</label>
                  <Textarea
                    placeholder="Tell patients about yourself..."
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fee (DZD)</label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={formData.consultationFee}
                      onChange={(e) => updateField("consultationFee", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience (years)</label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.experienceYears}
                      onChange={(e) => updateField("experienceYears", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Education</label>
                    <Input
                      placeholder="Degree"
                      value={formData.education}
                      onChange={(e) => updateField("education", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
