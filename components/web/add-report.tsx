"use client";

import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LocationSearch from "./location-search";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

type UploadedMedia = {
  url: string;
  type: string; //image/jpeg or video/mp4
  name: string;
};
type UploadResponse = { url: string; contentType: string; error?: string };

const MAX_FILES = 4;

const AddReport = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cordinates, setCordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationMode, setLocationMode] = useState<"gps" | "search">("gps");
  const [locationName,setLocationName]=useState('')
  const [neighborhood,setNeighbourhood]=useState("")
  const [accessibility, setAccessibility] = useState(false);

  const handleCordinates = () => {
    if (!navigator.geolocation) {
      setLocationError("Gelocation isn't supported on this device");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
     async (position) => {

       const lat= position.coords.latitude
       const lng= position.coords.longitude
        
        setCordinates({
            lat,lng
        });
                // We have coordinates but no human-readable name yet — ask the same
        // /api/geocode route to reverse-geocode them, same as the search flow does forward.
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          setLocationName(data.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          setNeighbourhood(data.neighborhood ?? "");
        } catch (error) {
          console.error("Reverse geocode failed:", error);
          // Fall back to raw coordinates so submission still has a valid `location` string
          setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocationError(err.message || "Couldn't get your location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (media.length + files.length > MAX_FILES) {
      setUploadError(`You can attach up to ${MAX_FILES} files per report.`);
      e.target.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = (await res.json()) as UploadResponse;

          if (!res.ok) throw new Error(data.error || "upload failed");

          return {
            url: data.url,
            type: data.contentType,
            name: file.name,
          } as UploadedMedia;
        }),
      );

      setMedia((prev) => [...prev, ...uploads]);
    } catch (error) {
      console.error("Upload failed : ", error);
      setUploadError("One or more files failed to upload, try again");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeMedia = (url: string) => {
    setMedia((prev) => prev.filter((m) => m.url !== url));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cordinates || !locationName) {
      toast.error("Add a location first — use your current location or search for an address");
      return;
    }

    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      issueType: formData.get("issueType"),
      title: formData.get("attention"),
      details: formData.get("details"),
      accessibilityFlag: accessibility,
      media: media.map(({ url, type }) => ({ url, type })),
      lat: cordinates?.lat,
      lng: cordinates?.lng,
      location : locationName,
      neighborhood
    };

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit report");
      }

      // Success: wipe every field, close the dialog and send the user back to the map
      form.reset();
      setAccessibility(false);
      setMedia([]);
      setCordinates(null);
      setLocationName("");
      setNeighbourhood("");
      setLocationMode("gps");
      setLocationError("");
      setUploadError("");
      setLocating(false);
      setOpen(false);
      toast.success("Report submitted — we'll notify you when its status changes");
      router.push("/");
    } catch (error) {
      // Keep the form as-is on failure so the user doesn't lose what they typed
      console.log("Submit failed : ", error);
      toast.error(error instanceof Error ? error.message : "Could not submit your report, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <DialogTrigger render={<Button className="h-9 gap-1.5 px-3.5" />}>
        <PlusIcon size={16} aria-hidden="true" />
        Report an issue
      </DialogTrigger>
      <DialogContent className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:max-w-lg">
        <DialogHeader className="space-y-1.5 p-6 pb-0 text-left">
          <DialogDescription className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            New Report
          </DialogDescription>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Help improve your neighborhood
          </DialogTitle>
        </DialogHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="issue-type">Issue type</Label>
              <select
                id="issue-type"
                name="issueType"
                required
                className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-ring dark:ring-offset-zinc-900"
              >
                <option value="">Choose a category</option>
                <option value="Roads">Roads</option>
                <option value="Lighting">Lighting</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Parks">Parks</option>
              </select>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label>Location</Label>
                <div className="flex gap-2 rounded-xl bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationMode("gps");
                      setLocationError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      locationMode === "gps"
                        ? "bg-card text-foreground shadow-sm  "
                        : "text-muted-foreground "
                    }`}
                  >
                    Use my location
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationMode("search");
                      setLocationError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      locationMode === "search"
                        ? "bg-card text-foreground shadow-sm  "
                        : "text-muted-foreground "
                    }`}
                  >
                    Search address
                  </button>
                </div>

                {locationMode === "gps" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCordinates}
                    disabled={locating}
                    className="w-full justify-start gap-2 rounded-xl border border-border bg-card px-3 text-sm font-normal text-muted-foreground hover:bg-muted"
                  >
                    {locating
                      ? "Locating…"
                      : cordinates
                        ? "Location set ✓"
                        : "Use My Location"}
                  </Button>
                ) : (
                  <LocationSearch
                    setTitle={(title)=>{
                      setLocationName(title)
                    }}
                    onSelect={(loc) =>
                      setCordinates({ lat: loc.lat, lng: loc.lng })
                    }
                    setNeighbourhoods={(neigh: string)=>{
                      setNeighbourhood(neigh)
                    }}
                  />
                )}

                {locationError && (
                  <span role="alert" className="text-xs text-destructive">{locationError}</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="attention">What needs attention?</Label>
            <Input
              id="attention"
              name="attention"
              placeholder="e.g. Large pothole at crosswalk"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Tell us more</Label>
            <textarea
              id="details"
              name="details"
              rows={3}
              placeholder="Share details that can help the city find and fix it."
              className="flex w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-ring dark:ring-offset-zinc-900"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="photo">Add a photo (optional)</Label>
            <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">
                {uploading
                  ? "Uploading.."
                  : media.length > 0
                    ? `${media.length} file${media.length > 1 ? "s" : ""} attached`
                    : "No file chosen"}
              </span>
              <label
                htmlFor="photo"
                className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Choose file
              </label>

              <input
                type="file"
                id="photo"
                className="sr-only"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                disabled={uploading || media.length >= MAX_FILES}
              />
            </div>

            {uploadError && (
              <span role="alert" className="text-xs text-destructive">{uploadError}</span>
            )}

            {media.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-1">
                {media.map((m) => (
                  <div key={m.url} className="relative">
                    {m.type.startsWith("video") ? (
                      <video
                        src={m.url}
                        className="rounded-lg h-20 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt={m.name}
                        className="rounded-lg h-20 w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(m.url)}
                      aria-label={`Remove ${m.name}`}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/80 text-background"
                    >
                      <XIcon size={12} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <Checkbox
              id="accessibility"
              checked={accessibility}
              onCheckedChange={(checked) => setAccessibility(checked === true)}
              className="mt-0.5 focus-visible:ring-ring data-[state=checked]:border-primary/20 data-[state=checked]:bg-primary"
            />
            <div className="flex flex-col gap-0.5">
              <Label
                htmlFor="accessibility"
                className="text-sm font-medium text-foreground"
              >
                Accessibility assistance needed
              </Label>
              <span className="text-xs text-muted-foreground">
                Mark this if the issue creates an urgent access barrier.
              </span>
            </div>
          </div>
          </div>
          <DialogFooter className="m-0 flex-col gap-3 border-t border-border bg-card p-4 sm:flex-col">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              You’ll be notified whenever the status of your report changes.
            </div>
            <Button
              type="submit"
              disabled={uploading || submitting}
              className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white shadow-md transition-all hover:bg-primary/90 focus-visible:ring-ring"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReport;
