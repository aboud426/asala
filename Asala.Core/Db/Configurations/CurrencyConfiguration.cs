using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("Currency");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(10);

        builder.Property(e => e.Symbol).IsRequired().HasMaxLength(10);

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);

        builder.Property(e => e.IsDeleted).HasDefaultValue(false);

        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();

        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();

        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Indexes
        builder.HasIndex(e => e.Name).IsUnique();
        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
