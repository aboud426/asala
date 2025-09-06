using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class PostLocalizedConfiguration : IEntityTypeConfiguration<PostLocalized>
{
    public void Configure(EntityTypeBuilder<PostLocalized> builder)
    {
        builder.ToTable("Post_Localized");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.PostId)
            .IsRequired();
            
        builder.Property(x => x.LanguageId)
            .IsRequired();
            
        builder.Property(x => x.DescriptionLocalized)
            .IsRequired()
            .HasMaxLength(500);
            
        // Indexes
        builder.HasIndex(x => x.PostId);
        builder.HasIndex(x => x.LanguageId);
        
        // Composite unique constraint for PostId + LanguageId
        builder.HasIndex(x => new { x.PostId, x.LanguageId })
            .IsUnique();
    }
}
