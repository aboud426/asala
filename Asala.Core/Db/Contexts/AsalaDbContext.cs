using Asala.Core.Db.Configurations;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Messages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Db;

public class AsalaDbContext : DbContext
{
    public AsalaDbContext(DbContextOptions<AsalaDbContext> options)
        : base(options) { }

    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageLocalized> MessageLocalizations => Set<MessageLocalized>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BaseEntityConfiguration).Assembly);
    }
}
