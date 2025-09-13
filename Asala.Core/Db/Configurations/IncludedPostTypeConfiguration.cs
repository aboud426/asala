using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class IncludedPostTypeConfiguration : IEntityTypeConfiguration<IncludedPostType>
{
    public void Configure(EntityTypeBuilder<IncludedPostType> builder)
    {
        builder.ToTable("IncludedPostType");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PostsPagesId).IsRequired();

        builder.Property(x => x.PostTypeId).IsRequired();

        // Relationships
        builder
            .HasOne(x => x.PostsPages)
            .WithMany(x => x.IncludedPostTypes)
            .HasForeignKey(x => x.PostsPagesId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(x => x.PostType)
            .WithMany()
            .HasForeignKey(x => x.PostTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.PostsPagesId);
        builder.HasIndex(x => x.PostTypeId);
        builder.HasIndex(x => new { x.PostsPagesId, x.PostTypeId }).IsUnique();
    }
}

