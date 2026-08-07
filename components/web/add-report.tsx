import { useId, useState } from "react";
import type React from "react";
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
import { Label } from "@/components/ui/label";

type UploadedMedia = {
  url: string;
  type: string; //image/jpeg or video/mp4
  name: string;
};
type UploadResponse = { url: string; contentType: string; error?: string };

const MAX_FILES = 4;

const AddReport = () => {
  const id = useId();

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

  const handleCordinates = () => {
    if (!navigator.geolocation) {
      setLocationError("Gelocation isn't supported on this device");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
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
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      issueType: formData.get("issueType"),
      title: formData.get("attention"),
      details: formData.get("details"),
      accessibilityFlag: formData.get("accessibility") === "on",
      media: media.map(({ url, type }) => ({ url, type })),
      lat: cordinates?.lat,
      lng: cordinates?.lng,
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
      e.currentTarget.reset();
      setMedia([]);
    } catch (error) {
      console.log("Submit failed : ", error);
    } finally {
      setMedia([]);
      setLocating(false);
      setUploadError("");
      setCordinates(null);
      setUploading(false);
      setSubmitting(false);
      setLocationError("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="rounded-xl border border-teal-200 bg-teal-50 px-6 py-2 font-medium text-teal-800 transition-all hover:bg-teal-100 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-100 dark:hover:bg-cyan-900"
          />
        }
      >
        Report an issue
      </DialogTrigger>
      <DialogContent className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-900">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogDescription className="text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            New Report
          </DialogDescription>
          <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Help improve your neighborhood
          </DialogTitle>
        </DialogHeader>
        <form className="mt-2 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="issue-type">Issue type</Label>
              <select
                id="issue-type"
                name="issueType"
                required
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus-visible:ring-teal-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-offset-zinc-900 dark:placeholder:text-zinc-500 dark:focus-visible:ring-cyan-500"
              >
                <option value="">Choose a category</option>
                <option value="roads">Roads</option>
                <option value="lighting">Lighting</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="parks">Parks</option>
              </select>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label>Location</Label>
                <div className="flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationMode("gps");
                      setLocationError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      locationMode === "gps"
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 dark:text-zinc-400"
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
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 dark:text-zinc-400"
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
                    className="w-full justify-start gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {locating
                      ? "Locating…"
                      : cordinates
                        ? "Location set ✓"
                        : "Use My Location"}
                  </Button>
                ) : (
                  <LocationSearch
                    onSelect={(loc) =>
                      setCordinates({ lat: loc.lat, lng: loc.lng })
                    }
                  />
                )}

                {locationError && (
                  <span className="text-xs text-red-500">{locationError}</span>
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
              className="flex w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus-visible:ring-teal-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-offset-zinc-900 dark:placeholder:text-zinc-500 dark:focus-visible:ring-cyan-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="photo">Add a photo (optional)</Label>
            <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {uploading
                  ? "Uploading.."
                  : media.length > 0
                    ? `${media.length} file${media.length > 1 ? "s" : ""} attached`
                    : "No file chosen"}
              </span>
              <label
                htmlFor="photo"
                className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Choose file
              </label>

              <input
                type="file"
                id="photo"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                disabled={uploading || media.length >= MAX_FILES}
              />
            </div>

            {uploadError && (
              <span className="text-xs text-red-500">{uploadError}</span>
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
                      className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-black/70 text-white text-xs w-5 h-5"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/30">
            <Checkbox
              id="accessibility"
              className="mt-0.5 focus-visible:ring-teal-600/20 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 dark:focus-visible:ring-cyan-500/40 dark:data-[state=checked]:border-cyan-500 dark:data-[state=checked]:bg-cyan-500"
            />
            <div className="flex flex-col gap-0.5">
              <Label
                htmlFor="accessibility"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Accessibility assistance needed
              </Label>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Mark this if the issue creates an urgent access barrier.
              </span>
            </div>
          </div>
          <DialogFooter className="m-0 mt-2 flex-col gap-3 border-none bg-transparent p-0 pt-4 sm:flex-col">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
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
              You will be asked to sign in to track updates.
            </div>
            <Button
              type="submit"
              disabled={uploading || submitting}
              className="w-full rounded-xl bg-teal-800 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-teal-900 focus-visible:ring-teal-800 dark:bg-teal-700 dark:hover:bg-teal-800 dark:focus-visible:ring-teal-600"
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
