using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class ArticleConfiguration : IEntityTypeConfiguration<Article>
{
    public void Configure(EntityTypeBuilder<Article> builder)
    {
        builder.ToTable("Articles");
        builder.HasKey(e => e.PostId);
        builder
            .HasOne(e => e.BasePost)
            .WithOne()
            .HasForeignKey<Article>(e => e.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
