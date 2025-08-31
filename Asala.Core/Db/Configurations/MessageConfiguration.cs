using Asala.Core.Modules.Messages.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Messages");

        builder.Property(e => e.Key).IsRequired().HasMaxLength(200);

        builder.Property(e => e.DefaultText).IsRequired().HasMaxLength(2000);

        // Indexes
        builder.HasIndex(e => e.Key).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();

        // Navigation properties
        builder
            .HasMany(e => e.Localizations)
            .WithOne(e => e.Message)
            .HasForeignKey(e => e.MessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
