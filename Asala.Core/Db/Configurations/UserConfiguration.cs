using Asala.Core.Modules.Locations.Models;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("User");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Email).IsRequired().HasMaxLength(100).IsUnicode(false);

        builder.Property(e => e.PhoneNumber).IsRequired(false).HasMaxLength(20).IsUnicode(false);

        builder
            .Property(e => e.PasswordHash)
            .IsRequired(false) // Optional - only for Employee users
            .HasMaxLength(200)
            .IsUnicode(false);

        builder.Property(e => e.CoverPhotoUrl)
            .IsRequired(false)
            .HasMaxLength(1024);

        builder.Property(e => e.FollowersCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.FollowingCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.NumberOfPosts)
            .IsRequired()
            .HasDefaultValue(0);

        // builder.Property(e => e.LocationId)
        //     .IsRequired(false);

        // // Relationships
        // builder.HasOne(e => e.Location)
        //     .WithMany(l => l.Users)
        //     .HasForeignKey(e => e.LocationId)
        //     .OnDelete(DeleteBehavior.Restrict);

        // Base entity properties
        builder.Property(e => e.IsActive).HasDefaultValue(true);

        builder.Property(e => e.IsDeleted).HasDefaultValue(false);

        builder.Property(e => e.CreatedAt).HasColumnType("datetime").IsRequired();

        builder.Property(e => e.UpdatedAt).HasColumnType("datetime").IsRequired();

        builder.Property(e => e.DeletedAt).HasColumnType("datetime").IsRequired(false);

        // Indexes
        builder.HasIndex(e => e.Email).IsUnique();
        builder.HasIndex(e => e.PhoneNumber).IsUnique();
        builder.HasIndex(e => new { e.IsActive, e.IsDeleted });
        builder.HasIndex(e => e.Id).IsUnique();
    }
}

public class UserOtpsConfiguration : IEntityTypeConfiguration<UserOtps>
{
    public void Configure(EntityTypeBuilder<UserOtps> builder)
    {
        builder.ToTable("UserOtps");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.UserId).IsRequired();
        builder.Property(e => e.Otp).IsRequired();
        builder.Property(e => e.ExpirationTime).IsRequired();
        builder.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
    }
}

public class UserFailedLoginAttemptsConfiguration
    : IEntityTypeConfiguration<UserFailedLoginAttempts>
{
    public void Configure(EntityTypeBuilder<UserFailedLoginAttempts> builder)
    {
        builder.ToTable("UserFailedLoginAttempts");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.UserId).IsRequired();
        builder.Property(e => e.AttemptTime).IsRequired();
        builder.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
    }
}
