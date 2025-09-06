using Asala.Core.Modules.Media.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class MediaConfiguration : IEntityTypeConfiguration<Media>
{
    public void Configure(EntityTypeBuilder<Media> builder)
    {
        builder.ToTable("Media");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.MediaTypeId)
            .IsRequired();
            
        builder.Property(x => x.Url)
            .IsRequired()
            .HasMaxLength(500);
            
        // Indexes
        builder.HasIndex(x => x.MediaTypeId);
        builder.HasIndex(x => x.Url);
    }
}
