"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

interface ReviewModalProps {
  productId: string;
  orderId: string;
  productName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReviewModal({
  productId,
  orderId,
  productName,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to review");
        setIsSubmitting(false);
        return;
      }

      let imageUrl: string | null = null;
      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { data, error } = await supabase.storage
          .from("review-images")
          .upload(fileName, imageFile);

        if (error) {
          toast.error("Failed to upload image");
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("review-images")
          .getPublicUrl(data.path);

        if (urlData?.publicUrl) {
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        product_id: productId,
        order_id: orderId,
        rating,
        comment: comment || null,
        is_verified_purchase: true,
      });

      if (error) {
        toast.error("Failed to submit review");
        setIsSubmitting(false);
        return;
      }

      toast.success("Review submitted!");
      onSubmit();
      onClose();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Review: {productName}
        </h3>
        <p className="text-sm text-gray-500 mb-4">How was your experience?</p>

        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent outline-none transition resize-none mb-4"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add a photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8FBC8F] file:text-white hover:file:bg-[#7daa7d] cursor-pointer"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 px-4 py-2 bg-[#F0E68C] text-[#5C4033] text-sm font-medium rounded-lg hover:bg-[#e6db7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
