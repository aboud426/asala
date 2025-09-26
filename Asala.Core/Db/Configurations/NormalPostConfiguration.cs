using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class NormalPostConfiguration : IEntityTypeConfiguration<NormalPost>
{
    public void Configure(EntityTypeBuilder<NormalPost> builder)
    {
        builder.ToTable("NormalPosts");
        builder.HasKey(e => e.PostId);
        builder
            .HasOne(e => e.BasePost)
            .WithOne(e => e.NormalPost)
            .HasForeignKey<NormalPost>(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
