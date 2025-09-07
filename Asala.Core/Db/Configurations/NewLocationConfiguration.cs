using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class NewLocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("Location");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Latitude)
            .HasColumnType("decimal(9,6)")
            .IsRequired();

        builder.Property(x => x.Longitude)
            .HasColumnType("decimal(9,6)")
            .IsRequired();

        builder.Property(x => x.RegionId)
            .IsRequired(false);

        // Relationships
        builder.HasOne(x => x.Region)
            .WithMany(x => x.Locations)
            .HasForeignKey(x => x.RegionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.LocationLocalizeds)
            .WithOne(x => x.Location)
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Orders)
            .WithOne(x => x.ShippingAddress)
            .HasForeignKey(x => x.ShippingAddressId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Users)
            .WithOne(x => x.Location)
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.RegionId);
        builder.HasIndex(x => new { x.Latitude, x.Longitude });
        builder.HasIndex(x => new { x.RegionId, x.Name });
    }
}
