using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("User");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);
            
        builder.Property(e => e.PasswordHash)
            .IsRequired()
            .HasMaxLength(200)
            .IsUnicode(false);
            
        builder.Property(e => e.LocationId)
            .IsRequired(false);
            
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
            
        // Indexes
        builder.HasIndex(e => e.Email).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
