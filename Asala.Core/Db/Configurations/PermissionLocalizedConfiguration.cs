using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class PermissionLocalizedConfiguration : IEntityTypeConfiguration<PermissionLocalized>
{
    public void Configure(EntityTypeBuilder<PermissionLocalized> builder)
    {
        builder.ToTable("PermissionLocalizations");

        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);

        // Foreign key to Language
        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign key to Permission
        builder
            .HasOne(e => e.Permission)
            .WithMany(p => p.Localizations)
            .HasForeignKey(e => e.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => new { e.PermissionId, e.LanguageId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
