using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("Post");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).IsRequired();

        builder.Property(x => x.Description).HasMaxLength(500).IsRequired(false);

        builder.Property(x => x.NumberOfReactions).IsRequired(true).HasDefaultValue(0);

        builder.Property(x => x.NumberOfComments).IsRequired(true).HasDefaultValue(0);

        builder
            .HasMany(e => e.PostLocalizeds)
            .WithOne(e => e.Post)
            .HasForeignKey(e => e.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.UserId);
    }
}
