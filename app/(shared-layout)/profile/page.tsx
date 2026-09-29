"use client";

import { ProfilePanel } from "@/components/web/profile-panel";
import { PageHeading, pageContainer } from "@/components/web/admin/primitives";

export default function ProfilePage() {
  return (
    <div className={`${pageContainer} px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12`}>
      <PageHeading
        eyebrow="Your account"
        title="Profile"
        description="Manage how you show up across the app, keep your contact details current, and rotate your password."
      />
      <ProfilePanel />
    </div>
  );
}
