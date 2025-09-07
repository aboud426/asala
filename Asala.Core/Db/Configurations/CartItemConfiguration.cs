using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("Cart_Item");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductId)
            .IsRequired();

        builder.Property(x => x.PostId)
            .IsRequired();

        builder.Property(x => x.Quantity)
            .IsRequired();

        builder.Property(x => x.Price)
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(x => x.CartId)
            .IsRequired();

        // Relationships
        builder.HasOne(x => x.Cart)
            .WithMany(x => x.CartItems)
            .HasForeignKey(x => x.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Post)
            .WithMany()
            .HasForeignKey(x => x.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.CartId);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.PostId);
        builder.HasIndex(x => new { x.CartId, x.ProductId, x.PostId });
    }
}
