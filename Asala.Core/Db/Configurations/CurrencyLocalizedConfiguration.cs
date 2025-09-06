using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CurrencyLocalizedConfiguration : IEntityTypeConfiguration<CurrencyLocalized>
{
    public void Configure(EntityTypeBuilder<CurrencyLocalized> builder)
    {
        builder.ToTable("CurrencyLocalizations");

        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(10);

        builder.Property(e => e.Symbol).IsRequired().HasMaxLength(10);

        // Foreign key to Language
        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign key to Currency
        builder
            .HasOne(e => e.Currency)
            .WithMany(c => c.Localizations)
            .HasForeignKey(e => e.CurrencyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => new { e.CurrencyId, e.LanguageId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
