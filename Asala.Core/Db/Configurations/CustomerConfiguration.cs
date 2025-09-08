using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customer");

        builder.HasKey(e => e.UserId);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(50);

        // Foreign Key Relationship (no navigation properties)
        builder
            .HasOne(e => e.User)
            .WithOne(e => e.Customer)
            .HasForeignKey<Customer>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.Name);
    }
}
