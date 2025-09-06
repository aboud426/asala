using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class RoleLocalizedConfiguration : IEntityTypeConfiguration<RoleLocalized>
{
    public void Configure(EntityTypeBuilder<RoleLocalized> builder)
    {
        builder.ToTable("RoleLocalizations");

        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);

        // Foreign key to Language
        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign key to Role
        builder
            .HasOne(e => e.Role)
            .WithMany(r => r.Localizations)
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => new { e.RoleId, e.LanguageId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
