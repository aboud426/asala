using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class BasePostConfiguration : IEntityTypeConfiguration<BasePost>
{
    public void Configure(EntityTypeBuilder<BasePost> builder)
    {
        builder.ToTable("BasePosts");
        builder.Property(e => e.Description).HasMaxLength(5000);
        builder.Property(e => e.NumberOfReactions).HasDefaultValue(0);
        builder.Property(e => e.NumberOfComments).HasDefaultValue(0);

        // Relationships
        builder
            .HasOne(e => e.PostType)
            .WithMany()
            .HasForeignKey(e => e.PostTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasMany(e => e.PostMedias)
            .WithOne(e => e.BasePost)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.PostComments)
            .WithOne(e => e.BasePost)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.Comments)
            .WithOne(e => e.BasePost)
            .HasForeignKey(e => e.BasePostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.Likes)
            .WithOne(e => e.BasePost)
            .HasForeignKey(e => e.BasePostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(e => e.Localizations)
            .WithOne(e => e.Post)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.PostTypeId);
    }
}

public class BasePostLocalizedConfiguration : IEntityTypeConfiguration<BasePostLocalized>
{
    public void Configure(EntityTypeBuilder<BasePostLocalized> builder)
    {
        builder.ToTable("BasePostLocalized");
        builder.Property(e => e.Description).HasMaxLength(500);

        // Relationships
        builder
            .HasOne(e => e.Post)
            .WithMany()
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Composite unique index for PostId + LanguageId
        builder.HasIndex(e => new { e.PostId, e.LanguageId }).IsUnique();
        builder.HasIndex(e => e.PostId);
        builder.HasIndex(e => e.LanguageId);
    }
}

public class BasePostMediaConfiguration : IEntityTypeConfiguration<BasePostMedia>
{
    public void Configure(EntityTypeBuilder<BasePostMedia> builder)
    {
        builder.ToTable("BasePostMedias");
        builder.Property(e => e.Url).HasMaxLength(500);
        builder.Property(e => e.MediaType);

        // Relationships
        builder
            .HasOne(e => e.BasePost)
            .WithMany(e => e.PostMedias)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.PostId);
        builder.HasIndex(e => e.MediaType);
    }
}

public class PostCommentConfiguration : IEntityTypeConfiguration<PostComment>
{
    public void Configure(EntityTypeBuilder<PostComment> builder)
    {
        builder.ToTable("PostComments");
        builder.Property(e => e.Content).HasMaxLength(1000);

        // Relationships
        builder
            .HasOne(e => e.BasePost)
            .WithMany(e => e.PostComments)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(e => e.ParentPostComment)
            .WithMany()
            .HasForeignKey(e => e.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.PostId);
        builder.HasIndex(e => e.ParentCommentId);
    }
}
