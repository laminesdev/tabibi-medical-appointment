import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, CalendarCheck, UserCheck, ArrowRight } from "lucide-react";
import { searchService } from "@/services/search.service";
import type { DoctorSummary } from "@/types/doctor.types";
import { useAuthStore } from "@/stores/authStore";

const specialties = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Ophthalmology",
  "ENT",
  "Dentistry",
  "Psychiatry",
  "Radiology",
  "General Practice",
  "Internal Medicine",
];

export default function Landing() {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [featuredDoctors, setFeaturedDoctors] = useState<DoctorSummary[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadFeaturedDoctors();
  }, []);

  const loadFeaturedDoctors = async () => {
    setIsLoadingFeatured(true);
    setFeaturedError(false);
    try {
      const doctors = await searchService.getFeaturedDoctors();
      setFeaturedDoctors(doctors);
    } catch {
      setFeaturedError(true);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const doSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (location) params.set("location", location);
    navigate(`/doctors?${params.toString()}`);
  }, [specialty, location, navigate]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            Your Health,{" "}
            <span className="text-primary">Simplified</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Find the right doctor, book appointments instantly, and manage your healthcare journey — all in one place.
          </p>

          <div className="max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-lg border">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <Button className="w-full md:w-auto gap-2" onClick={doSearch}>
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Doctors</h3>
              <p className="text-muted-foreground">
                Search by specialty or location to find the perfect doctor for your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Book Online</h3>
              <p className="text-muted-foreground">
                Choose a convenient time slot and book your appointment instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Appointments</h3>
              <p className="text-muted-foreground">
                View, reschedule, or cancel appointments with ease from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Doctors</h2>
            <Link
              to="/doctors"
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Could not load featured doctors.</p>
              <Link to="/doctors">
                <Button variant="outline">Search for doctors</Button>
              </Link>
            </div>
          ) : featuredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured doctors available at the moment.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
              {featuredDoctors.map((doctor) => (
                <Link
                  key={doctor.id}
                  to={`/doctors/${doctor.id}`}
                  className="flex-shrink-0 w-80 snap-start"
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {doctor.user.firstName.charAt(0)}{doctor.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        {doctor.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({doctor.totalReviews})
                          </span>
                        </div>
                        {doctor.consultationFee && (
                          <span className="text-sm font-medium text-primary">
                            {doctor.consultationFee} DZD
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join Tabibi today and take control of your healthcare journey.
          </p>
          {isAuthenticated ? (
            <Link to="/doctors">
              <Button size="lg" className="gap-2">
                Find a Doctor <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
