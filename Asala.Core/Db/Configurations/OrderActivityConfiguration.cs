using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class OrderActivityConfiguration : IEntityTypeConfiguration<OrderActivity>
{
    public void Configure(EntityTypeBuilder<OrderActivity> builder)
    {
        builder.ToTable("OrderActivity");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderId).IsRequired();

        // Relationships
        builder
            .HasOne(x => x.Order)
            .WithMany(x => x.OrderActivities)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.OrderId);
        builder.HasIndex(x => new { x.OrderId, x.CreatedAt });
    }
}
