using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class FollowerConfiguration : IEntityTypeConfiguration<Follower>
{
    public void Configure(EntityTypeBuilder<Follower> builder)
    {
        builder.ToTable("Follower");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.FollowerId)
            .IsRequired();
            
        builder.Property(e => e.FollowingId)
            .IsRequired();
            
        // Base entity properties
        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);
            
        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);
            
        builder.Property(e => e.CreatedAt)
            .HasColumnType("datetime")
            .IsRequired();
            
        builder.Property(e => e.UpdatedAt)
            .HasColumnType("datetime")
            .IsRequired();
            
        builder.Property(e => e.DeletedAt)
            .HasColumnType("datetime")
            .IsRequired(false);
            
        // Foreign Key Relationships
        builder.HasOne(e => e.FollowerUser)
            .WithMany()
            .HasForeignKey(e => e.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.FollowingUser)
            .WithMany()
            .HasForeignKey(e => e.FollowingId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(e => new { e.FollowerId, e.FollowingId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
        builder.HasIndex(e => e.FollowerId);
        builder.HasIndex(e => e.FollowingId);
        
        // Prevent self-following constraint can be added at application level
        // or through a check constraint if needed
    }
}
