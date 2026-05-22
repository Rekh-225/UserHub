using Microsoft.EntityFrameworkCore;
using UserManagement.Models;

namespace UserManagement.Data
{
    /// <summary>
    /// Entity Framework Core database context for the application.
    /// Configured to use SQLite.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        /// <summary>Users table.</summary>
        public DbSet<User> Users { get; set; }

        /// <summary>
        /// Seed initial data so the application ships with sample users.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Seed sample users for demonstration
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FullName = "Alice Johnson",
                    Email = "alice.johnson@example.com",
                    BirthDate = new DateTime(1995, 3, 15),
                    RegistrationDate = new DateTime(2025, 1, 10, 9, 0, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 2,
                    FullName = "Bob Smith",
                    Email = "bob.smith@example.com",
                    BirthDate = new DateTime(1990, 7, 22),
                    RegistrationDate = new DateTime(2025, 2, 5, 14, 30, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 3,
                    FullName = "Clara Williams",
                    Email = "clara.williams@example.com",
                    BirthDate = new DateTime(2000, 11, 8),
                    RegistrationDate = new DateTime(2025, 3, 20, 11, 15, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 4,
                    FullName = "David Brown",
                    Email = "david.brown@example.com",
                    BirthDate = new DateTime(1988, 5, 30),
                    RegistrationDate = new DateTime(2025, 4, 1, 8, 45, 0, DateTimeKind.Utc)
                },
                new User
                {
                    Id = 5,
                    FullName = "Eva Martinez",
                    Email = "eva.martinez@example.com",
                    BirthDate = new DateTime(1998, 9, 12),
                    RegistrationDate = new DateTime(2025, 5, 15, 16, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
