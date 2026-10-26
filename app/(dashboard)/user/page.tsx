"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/features/user/ProfileForm";
import ChangePasswordForm from "@/components/features/user/ChangePasswordForm";
import HouseholdMemberManager from "@/components/features/user/HouseholdMemberManager";
import CategoryManager from "@/components/features/user/CategoryManager";

export default function UserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Account Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage your profile, security, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="household">Household</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="bg-surface rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Profile Information
            </h2>
            <ProfileForm />
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="bg-surface rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Change Password
            </h2>
            <ChangePasswordForm />
          </div>
        </TabsContent>

        <TabsContent value="household">
          <div className="bg-surface rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Household Members
            </h2>
            <HouseholdMemberManager />
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="bg-surface rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Categories
            </h2>
            <CategoryManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
