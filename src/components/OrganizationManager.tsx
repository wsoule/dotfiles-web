import { useEffect, useState } from "react";
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
  getOrganizationInvites,
  createOrganizationInvite,
  getCurrentUser,
  type Organization,
  type OrganizationMember,
  type Invitation,
  type User,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDisplayName, setNewOrgDisplayName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgsData, userData] = await Promise.all([
        getOrganizations(),
        getCurrentUser(),
      ]);
      setOrganizations(orgsData);
      setUser(userData);
    } catch (error) {
      toast("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationDetails = async (orgId: string) => {
    try {
      const [orgData, membersData, invitesData] = await Promise.all([
        getOrganization(orgId),
        getOrganizationMembers(orgId),
        getOrganizationInvites(orgId),
      ]);
      setSelectedOrg(orgData);
      setMembers(membersData);
      setInvites(invitesData);
    } catch (error) {
      toast("Failed to load organization details");
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgDisplayName) {
      toast("Please fill in required fields");
      return;
    }

    try {
      const org = await createOrganization({
        name: newOrgName,
        display_name: newOrgDisplayName,
        description: newOrgDescription,
        public: true,
      });
      toast("Organization created successfully");
      setOrganizations([...organizations, org]);
      setShowCreateForm(false);
      setNewOrgName("");
      setNewOrgDisplayName("");
      setNewOrgDescription("");
    } catch (error) {
      toast("Failed to create organization");
    }
  };

  const handleSendInvite = async () => {
    if (!selectedOrg || !inviteEmail) {
      toast("Please enter an email address");
      return;
    }

    try {
      const invite = await createOrganizationInvite(
        selectedOrg.id,
        inviteEmail,
        inviteRole
      );
      toast(`Invitation sent to ${inviteEmail}`);
      setInvites([...invites, invite]);
      setInviteEmail("");
    } catch (error) {
      toast("Failed to send invitation");
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    newRole: "admin" | "member"
  ) => {
    if (!selectedOrg) return;

    try {
      await updateOrganizationMemberRole(selectedOrg.id, memberId, newRole);
      toast("Member role updated");
      await loadOrganizationDetails(selectedOrg.id);
    } catch (error) {
      toast("Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeOrganizationMember(selectedOrg.id, memberId);
      toast("Member removed");
      await loadOrganizationDetails(selectedOrg.id);
    } catch (error) {
      toast("Failed to remove member");
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;

    try {
      await deleteOrganization(orgId);
      toast("Organization deleted");
      setOrganizations(organizations.filter((o) => o.id !== orgId));
      setSelectedOrg(null);
    } catch (error) {
      toast("Failed to delete organization");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Please sign in to manage organizations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Organizations</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create Organization"}
        </Button>
      </div>

      {/* Create Organization Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Organization Name (URL-friendly)
              </label>
              <Input
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="my-organization"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Display Name
              </label>
              <Input
                value={newOrgDisplayName}
                onChange={(e) => setNewOrgDisplayName(e.target.value)}
                placeholder="My Organization"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                value={newOrgDescription}
                onChange={(e) => setNewOrgDescription(e.target.value)}
                placeholder="What does your organization do?"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateOrganization} className="w-full">
              Create Organization
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Organizations List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => loadOrganizationDetails(org.id)}
          >
            <CardHeader>
              <CardTitle>{org.display_name}</CardTitle>
              <CardDescription>{org.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {org.description || "No description"}
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary">
                  {org.members.length} member{org.members.length !== 1 ? "s" : ""}
                </Badge>
                {org.public && <Badge>Public</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Organization Details */}
      {selectedOrg && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedOrg.display_name}</CardTitle>
                <CardDescription>{selectedOrg.name}</CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteOrganization(selectedOrg.id)}
              >
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Members */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Members</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">User {member.user_id}</div>
                      <div className="text-sm text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(role: "admin" | "member") =>
                          handleUpdateMemberRole(member.user_id, role)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invitations */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Pending Invitations</h3>
              {invites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending invitations</p>
              ) : (
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">{invite.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge>{invite.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Invitation */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Send Invitation</h3>
              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1"
                />
                <Select
                  value={inviteRole}
                  onValueChange={(role: "admin" | "member") => setInviteRole(role)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSendInvite}>Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
