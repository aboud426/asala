using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class PostsPagesConfiguration : IEntityTypeConfiguration<PostsPages>
{
    public void Configure(EntityTypeBuilder<PostsPages> builder)
    {
        builder.ToTable("PostsPages");

        builder.HasKey(x => x.Id);

        // Relationships
        builder
            .HasMany(x => x.IncludedPostTypes)
            .WithOne(x => x.PostsPages)
            .HasForeignKey(x => x.PostsPagesId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(x => x.Localizations)
            .WithOne(x => x.PostsPages)
            .HasForeignKey(x => x.PostsPagesId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PostsPagesLocalizedConfiguration : IEntityTypeConfiguration<PostsPagesLocalized>
{
    public void Configure(EntityTypeBuilder<PostsPagesLocalized> builder)
    {
        builder.ToTable("PostsPagesLocalized");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PostsPagesId).IsRequired();

        builder.Property(x => x.LanguageId).IsRequired();

        builder.Property(x => x.NameLocalized).IsRequired().HasMaxLength(100);

        builder.Property(x => x.DescriptionLocalized).IsRequired().HasMaxLength(500);

        // Relationships
        builder
            .HasOne(x => x.PostsPages)
            .WithMany(x => x.Localizations)
            .HasForeignKey(x => x.PostsPagesId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
