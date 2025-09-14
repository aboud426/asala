using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class PostMediaConfiguration : IEntityTypeConfiguration<PostMedia>
{
    public void Configure(EntityTypeBuilder<PostMedia> builder)
    {
        builder.ToTable("Post_Medias");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PostId).IsRequired();

        // Indexes
        builder.HasIndex(x => x.PostId);
    }
}
