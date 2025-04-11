import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUserOrThrow } from "./users";
import { paginationOptsValidator } from "convex/server";

export const addThreadMessage = mutation({
  args: {
    content: v.string(),
    mediaFiles: v.optional(v.array(v.string())),
    websiteUrl: v.optional(v.string()),
    threadId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const message = await ctx.db.insert("messages", {
      ...args,
      userId: user._id,
      likeCount: 0,
      commentCount: 0,
      retweetCount: 0,
    });

    // Trigger push notification
    if (args.threadId) {
      // TODO: Implement push notification logic
    }
  },
});

export const getThreads = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let threads;

    if (args.userId) {
      threads = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      threads = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("threadId"), undefined))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const messagesWithCreator = await Promise.all(
      threads.page.map(async (thread) => {
        const creator = await getMessageCreator(ctx, thread.userId);
        const mediaUrls = await getMediaUrls(ctx, thread.mediaFiles);
        return {
          ...thread,
          creator,
          mediaFiles: mediaUrls,
        };
      })
    );

    return {
      ...threads,
      page: messagesWithCreator,
    };
  },
});

export const likeThread = mutation({
  args: {
    threadId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const userId = user._id;

    // Check if the user has already liked this thread
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_thread", (q) => 
        q.eq("userId", userId).eq("threadId", args.threadId)
      )
      .unique();

    const message = await ctx.db.get(args.threadId);
    if (!message) throw new Error("Thread not found");

    if (existingLike) {
      // User already liked this thread, so remove the like
      await ctx.db.delete(existingLike._id);
      
      // Decrement the like count
      await ctx.db.patch(args.threadId, {
        likeCount: Math.max(0, (message.likeCount || 0) - 1),
      });
    } else {
      // User hasn't liked this thread yet, so add a like
      await ctx.db.insert("likes", {
        userId,
        threadId: args.threadId,
      });
      
      // Increment the like count
      await ctx.db.patch(args.threadId, {
        likeCount: (message.likeCount || 0) + 1,
      });
    }
  },
});

export const hasUserLikedThread = query({
  args: {
    threadId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);
      
      const like = await ctx.db
        .query("likes")
        .withIndex("by_user_thread", (q) => 
          q.eq("userId", user._id).eq("threadId", args.threadId)
        )
        .unique();
      
      return !!like;
    } catch (error) {
      // User not logged in or other error
      return false;
    }
  },
});

const getMessageCreator = async (ctx: QueryCtx, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);

  if (!user?.imageUrl || user.imageUrl.startsWith("http")) {
    return user;
  }

  const imageUrl = await ctx.storage.getUrl(user.imageUrl as Id<"_storage">);
  return {
    ...user,
    imageUrl,
  };
};

const getMediaUrls = async (
  ctx: QueryCtx,
  mediaFiles: string[] | undefined
) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  const urlPromises = mediaFiles.map((file) =>
    ctx.storage.getUrl(file as Id<"_storage">)
  );
  const results = await Promise.allSettled(urlPromises);
  return results
    .filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);
};

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getCurrentUserOrThrow(ctx);

    return await ctx.storage.generateUploadUrl();
  },
});
