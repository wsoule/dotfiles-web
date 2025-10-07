import { useEffect, useState } from "react";
import {
  downloadTemplate,
  getTemplates,
  getCurrentUser,
  addFavorite,
  removeFavorite,
  type Template,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function TemplatesBrowser() {
  const [templates, setTemplates] = useState<StoredTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadTemplates();
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, [showFeaturedOnly]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates({
        public: true,
        featured: showFeaturedOnly ? true : undefined,
        limit: 100,
      });
      console.log("templates =", data);
      setTemplates(data);
    } catch (error) {
      toast("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (template: StoredTemplate) => {
    try {
      const data = await downloadTemplate(template.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        template.metadata.name.replace(/\s+/g, "-").toLowerCase()
      }.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast("Template downloaded successfully");
    } catch (error) {
      toast("Failed to download template");
    }
  };

  const allTags = Array.from(
    new Set(templates.flatMap((t) => t?.metadata.tags)),
  ).sort();

  const filteredTemplates = templates.filter((storedTemplate) => {
    const template = storedTemplate;
    const matchesSearch = template.metadata.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      template.metadata.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      template.metadata.author
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === "all" ||
      template.metadata.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFeaturedOnly ? "default" : "outline"}
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
          >
            {showFeaturedOnly ? "⭐ Featured" : "Show Featured"}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredTemplates.length} template
        {filteredTemplates.length !== 1 ? "s" : ""}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0
        ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No templates found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters
            </p>
          </div>
        )
        : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((storedTemplate) => {
              const template = storedTemplate;
              return (
                <Card key={storedTemplate.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        {template.metadata.name}
                      </CardTitle>
                      {template.featured && (
                        <Badge variant="default" className="shrink-0">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {template.metadata.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted p-2">
                        <div className="text-sm font-medium">
                          {template.brews.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Brews</div>
                      </div>
                      <div className="rounded-lg bg-muted p-2">
                        <div className="text-sm font-medium">
                          {template.casks.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Casks</div>
                      </div>
                      <div className="rounded-lg bg-muted p-2">
                        <div className="text-sm font-medium">
                          {storedTemplate.downloads}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Downloads
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {template.metadata.tags && template.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Author */}
                    <div className="text-xs text-muted-foreground">
                      by {template.metadata.author} • v{template.metadata.version}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => window.location.href = `/templates/${storedTemplate.id}`}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleDownload(storedTemplate)}
                    >
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
