using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class RegionConfiguration : IEntityTypeConfiguration<Region>
{
    public void Configure(EntityTypeBuilder<Region> builder)
    {
        builder.ToTable("Region");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.ParentId)
            .IsRequired(false);

        // Self-referencing relationship
        builder.HasOne(x => x.Parent)
            .WithMany(x => x.InverseParent)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasMany(x => x.LocalizedRegions)
            .WithOne(x => x.Region)
            .HasForeignKey(x => x.RegionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Locations)
            .WithOne(x => x.Region)
            .HasForeignKey(x => x.RegionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.ParentId);
        builder.HasIndex(x => new { x.ParentId, x.Name });
    }
}
