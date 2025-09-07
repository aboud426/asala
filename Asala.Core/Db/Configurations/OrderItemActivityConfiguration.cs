using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class OrderItemActivityConfiguration : IEntityTypeConfiguration<OrderItemActivity>
{
    public void Configure(EntityTypeBuilder<OrderItemActivity> builder)
    {
        builder.ToTable("OrderItemActivity");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderItemStatusId)
            .IsRequired();

        builder.Property(x => x.OrderItemId)
            .IsRequired();

        // Relationships
        builder.HasOne(x => x.OrderItem)
            .WithMany(x => x.OrderItemActivities)
            .HasForeignKey(x => x.OrderItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.OrderItemStatus)
            .WithMany(x => x.OrderItemActivities)
            .HasForeignKey(x => x.OrderItemStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.OrderItemId);
        builder.HasIndex(x => x.OrderItemStatusId);
        builder.HasIndex(x => new { x.OrderItemId, x.CreatedAt });
    }
}
