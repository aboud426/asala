using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments");
        
        builder.HasKey(x => x.Id);
        
        // Properties
        builder.Property(x => x.BasePostId).IsRequired();
        builder.Property(x => x.ParentId).IsRequired(false);
        builder.Property(x => x.Content).HasMaxLength(1000).IsRequired();
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
            
        builder
            .HasOne(e => e.Parent)
            .WithMany(e => e.Replies)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Indexes
        builder.HasIndex(x => x.BasePostId);
        builder.HasIndex(x => x.ParentId);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.CreatedAt);
        
        // Composite index for efficient queries
        builder.HasIndex(x => new { x.BasePostId, x.CreatedAt });
    }
}
