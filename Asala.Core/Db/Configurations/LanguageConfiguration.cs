using Asala.Core.Modules.Languages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> builder)
    {
        builder.ToTable("Language");
        builder.Property(e => e.Name).HasMaxLength(20);
        builder.Property(e => e.Code).HasMaxLength(20);
        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
