using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProviderMediaConfiguration : IEntityTypeConfiguration<ProviderMedia>
{
    public void Configure(EntityTypeBuilder<ProviderMedia> builder)
    {
        builder.ToTable("ProviderMedia");

        // Primary key
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).IsRequired().ValueGeneratedOnAdd();

        builder.Property(e => e.ProviderId).IsRequired();

        builder.Property(e => e.Url).IsRequired().HasMaxLength(500);

        builder.Property(e => e.MediaType).IsRequired().HasDefaultValue(MediaType.Image);

        // Foreign Key Relationships
        builder
            .HasOne(e => e.Provider)
            .WithMany(e=>e.ProviderMedias)
            .HasForeignKey(e => e.ProviderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.ProviderId);
        builder.HasIndex(e => e.MediaType);
        builder.HasIndex(e => new { e.ProviderId, e.MediaType });

        // BaseEntity configurations
        builder.Property(e => e.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.Property(e => e.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
