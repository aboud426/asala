using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class LocalizedRegionConfiguration : IEntityTypeConfiguration<LocalizedRegion>
{
    public void Configure(EntityTypeBuilder<LocalizedRegion> builder)
    {
        builder.ToTable("LocalizedRegion");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RegionId)
            .IsRequired();

        builder.Property(x => x.LanguageId)
            .IsRequired();

        builder.Property(x => x.LocalizedName)
            .IsRequired()
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(x => x.Region)
            .WithMany(x => x.LocalizedRegions)
            .HasForeignKey(x => x.RegionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Language)
            .WithMany()
            .HasForeignKey(x => x.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.RegionId);
        builder.HasIndex(x => x.LanguageId);
        builder.HasIndex(x => new { x.RegionId, x.LanguageId })
            .IsUnique();
    }
}
