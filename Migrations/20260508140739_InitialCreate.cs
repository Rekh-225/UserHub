using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace UserManagement.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "BirthDate", "Email", "FullName", "RegistrationDate" },
                values: new object[,]
                {
                    { 1, new DateTime(1995, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "alice.johnson@example.com", "Alice Johnson", new DateTime(2025, 1, 10, 9, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(1990, 7, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), "bob.smith@example.com", "Bob Smith", new DateTime(2025, 2, 5, 14, 30, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2000, 11, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), "clara.williams@example.com", "Clara Williams", new DateTime(2025, 3, 20, 11, 15, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(1988, 5, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "david.brown@example.com", "David Brown", new DateTime(2025, 4, 1, 8, 45, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(1998, 9, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "eva.martinez@example.com", "Eva Martinez", new DateTime(2025, 5, 15, 16, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
