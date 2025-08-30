using Asala.Core.Db.Configurations;
using Asala.Core.Modules.Languages;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Db;

public class AsalaDbContext : DbContext
{
    public AsalaDbContext(DbContextOptions<AsalaDbContext> options)
        : base(options) { }

    public DbSet<Language> Languages => Set<Language>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BaseEntityConfiguration).Assembly);
    }
}
