using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ReelConfiguration : IEntityTypeConfiguration<Reel>
{
    public void Configure(EntityTypeBuilder<Reel> builder)
    {
        builder.ToTable("Reels");
        builder.HasKey(e => e.PostId);
        builder
            .HasOne(e => e.BasePost)
            .WithOne(e => e.Reel)
            .HasForeignKey<Reel>(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
