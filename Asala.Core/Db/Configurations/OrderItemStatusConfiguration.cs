using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class OrderItemStatusConfiguration : IEntityTypeConfiguration<OrderItemStatus>
{
    public void Configure(EntityTypeBuilder<OrderItemStatus> builder)
    {
        builder.ToTable("OrderItemStatus");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(20);

        // Relationships
        builder.HasMany(x => x.OrderItemActivities)
            .WithOne(x => x.OrderItemStatus)
            .HasForeignKey(x => x.OrderItemStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.Name)
            .IsUnique();
    }
}
