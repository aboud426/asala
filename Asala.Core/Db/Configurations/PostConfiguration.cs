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
        
        builder.Property(x => x.UserId)
            .IsRequired();
            
        builder.Property(x => x.Description)
            .HasMaxLength(500)
            .IsRequired(false);
            
        builder.Property(x => x.NumberOfReactions)
            .IsRequired(false);
            
        // Indexes
        builder.HasIndex(x => x.UserId);
    }
}
