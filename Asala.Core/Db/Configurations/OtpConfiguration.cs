using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class OtpConfiguration : IEntityTypeConfiguration<Otp>
{
    public void Configure(EntityTypeBuilder<Otp> builder)
    {
        builder.ToTable("Otp");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20)
            .IsUnicode(false);
            
        builder.Property(e => e.Code)
            .IsRequired()
            .HasMaxLength(6)
            .IsUnicode(false);
            
        builder.Property(e => e.ExpiresAt)
            .HasColumnType("datetime")
            .IsRequired();
            
        builder.Property(e => e.IsUsed)
            .HasDefaultValue(false);
            
        builder.Property(e => e.Purpose)
            .IsRequired()
            .HasMaxLength(50)
            .IsUnicode(false);
            
        builder.Property(e => e.AttemptsCount)
            .HasDefaultValue(0);
            
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
        builder.HasIndex(e => e.PhoneNumber);
        builder.HasIndex(e => new { e.PhoneNumber, e.Purpose, e.IsUsed });
        builder.HasIndex(e => e.ExpiresAt);
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
    }
}
