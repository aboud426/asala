using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ProviderConfiguration : IEntityTypeConfiguration<Provider>
{
    public void Configure(EntityTypeBuilder<Provider> builder)
    {
        builder.ToTable("Provider");

        // UserId is the primary key
        builder.HasKey(e => e.UserId);

        builder.Property(e => e.UserId).IsRequired();

        builder.Property(e => e.BusinessName).IsRequired().HasMaxLength(100);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(1000);

        builder.Property(e => e.Rating).IsRequired();

        builder.Property(e => e.ParentId).IsRequired(false);

        // Foreign Key Relationships (no navigation properties)
        builder
            .HasOne(e => e.User)
            .WithOne(e => e.Provider)
            .HasForeignKey<Provider>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(e => e.Parent)
            .WithMany(e => e.ChildrenProviders)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasMany(e => e.ProviderLocalizeds)
            .WithOne(e => e.Provider)
            .HasForeignKey(e => e.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);
        // Indexes
        builder.HasIndex(e => e.BusinessName);
        builder.HasIndex(e => e.ParentId);
    }
}
