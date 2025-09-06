using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProviderLocalizedConfiguration : IEntityTypeConfiguration<ProviderLocalized>
{
    public void Configure(EntityTypeBuilder<ProviderLocalized> builder)
    {
        builder.ToTable("Provider_Localized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProviderId).IsRequired();

        builder.Property(x => x.BusinessNameLocalized).IsRequired().HasMaxLength(100);

        builder.Property(x => x.DescriptionLocalized).IsRequired().HasMaxLength(1000);

        builder.Property(x => x.LanguageId).IsRequired();

        // Base entity properties
        builder.Property(x => x.IsActive).HasDefaultValue(true);

        builder.Property(x => x.IsDeleted).HasDefaultValue(false);

        builder.Property(x => x.CreatedAt).HasColumnType("datetime").IsRequired();

        builder.Property(x => x.UpdatedAt).HasColumnType("datetime").IsRequired();

        builder.Property(x => x.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Foreign key relationships without navigation properties
        builder.HasIndex(x => x.ProviderId);
        builder.HasIndex(x => x.LanguageId);
        builder.HasIndex(x => new { x.IsActive, x.IsDeleted });
        builder
            .HasOne(x => x.Language)
            .WithMany()
            .HasForeignKey(x => x.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(x => x.Provider)
            .WithMany(x => x.ProviderLocalizeds)
            .HasForeignKey(x => x.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Composite unique constraint for ProviderId + LanguageId
        builder.HasIndex(x => new { x.ProviderId, x.LanguageId }).IsUnique();
    }
}
