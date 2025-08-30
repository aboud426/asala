using Asala.Core.Modules.Messages.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class MessageLocalizedConfiguration : IEntityTypeConfiguration<MessageLocalized>
{
    public void Configure(EntityTypeBuilder<MessageLocalized> builder)
    {
        builder.ToTable("MessageLocalizations");

        builder.Property(e => e.Key).IsRequired().HasMaxLength(200);

        builder.Property(e => e.Text).IsRequired().HasMaxLength(2000);

        // Foreign key to Language
        builder
            .HasOne(e => e.Language)
            .WithMany()
            .HasForeignKey(e => e.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(e => new { e.Key, e.LanguageId }).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}
