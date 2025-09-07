using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class LocationLocalizedConfiguration : IEntityTypeConfiguration<LocationLocalized>
{
    public void Configure(EntityTypeBuilder<LocationLocalized> builder)
    {
        builder.ToTable("Location_Localized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LocationId)
            .IsRequired();

        builder.Property(x => x.LocalizedName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.LanguageId)
            .IsRequired();

        // Relationships
        builder.HasOne(x => x.Location)
            .WithMany(x => x.LocationLocalizeds)
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Language)
            .WithMany()
            .HasForeignKey(x => x.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.LocationId);
        builder.HasIndex(x => x.LanguageId);
        builder.HasIndex(x => new { x.LocationId, x.LanguageId })
            .IsUnique();
    }
}
