using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Asala.Core.Db.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employee");

        // UserId is the primary key
        builder.HasKey(e => e.UserId);

        builder.Property(e => e.EmployeeName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.UserId).IsRequired();

        // Foreign Key Relationship (no navigation properties)
        builder
            .HasOne(e => e.User)
            .WithOne(e => e.Employee)
            .HasForeignKey<Employee>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.EmployeeName);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
