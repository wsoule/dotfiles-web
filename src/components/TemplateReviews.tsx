import { useEffect, useState } from "react";
import {
  getTemplateReviews,
  getTemplateRating,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getCurrentUser,
  type Review,
  type TemplateRating,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface TemplateReviewsProps {
  templateId: string;
}

export default function TemplateReviews({ templateId }: TemplateReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<TemplateRating | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, ratingData, userData] = await Promise.all([
        getTemplateReviews(templateId),
        getTemplateRating(templateId),
        getCurrentUser(),
      ]);
      setReviews(reviewsData);
      setRating(ratingData);
      setUser(userData);
    } catch (error) {
      toast("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast("Please sign in to leave a review");
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview({
        template_id: templateId,
        rating: newRating,
        comment: newComment,
      });
      toast("Review submitted successfully");
      setNewRating(5);
      setNewComment("");
      await loadData(); // Reload reviews
    } catch (error) {
      toast("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      toast("Please sign in to mark reviews as helpful");
      return;
    }

    try {
      await markReviewHelpful(reviewId);
      toast("Marked as helpful");
      await loadData(); // Reload to show updated count
    } catch (error) {
      toast("Failed to mark review as helpful");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview(reviewId);
      toast("Review deleted");
      await loadData();
    } catch (error) {
      toast("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {rating && (
        <Card>
          <CardHeader>
            <CardTitle>Rating & Reviews</CardTitle>
            <CardDescription>
              {rating.total_ratings} review{rating.total_ratings !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{rating.average_rating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">out of 5</div>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-12 text-sm">{stars} stars</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${
                            rating.total_ratings > 0
                              ? ((rating.distribution[stars.toString()] || 0) / rating.total_ratings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-sm text-muted-foreground">
                      {rating.distribution[stars.toString()] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="text-2xl transition-colors hover:scale-110"
                  >
                    {star <= newRating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Comment (optional)</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this template..."
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Reviews</h3>
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://github.com/${review.user_id}.png`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">User {review.user_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {"⭐".repeat(review.rating)}
                    </Badge>
                    {user?.id === review.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {review.comment && (
                <CardContent>
                  <p className="text-sm">{review.comment}</p>
                </CardContent>
              )}
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkHelpful(review.id)}
                  disabled={!user}
                >
                  👍 Helpful ({review.helpful})
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
