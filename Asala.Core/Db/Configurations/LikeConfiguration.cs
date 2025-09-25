using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class LikeConfiguration : IEntityTypeConfiguration<Like>
{
    public void Configure(EntityTypeBuilder<Like> builder)
    {
        builder.ToTable("Likes");
        
        builder.HasKey(x => x.Id);
        
        // Properties
        builder.Property(x => x.BasePostId).IsRequired();
        builder.Property(x => x.UserId).IsRequired();
        
        // Relationships
        builder
            .HasOne(e => e.BasePost)
            .WithMany()
            .HasForeignKey(e => e.BasePostId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder
            .HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Indexes
        builder.HasIndex(x => x.BasePostId);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.CreatedAt);
        
        // Composite index for efficient queries and prevent duplicate likes
        builder.HasIndex(x => new { x.BasePostId, x.UserId })
            .IsUnique()
            .HasDatabaseName("IX_Likes_BasePostId_UserId_Unique");
    }
}
