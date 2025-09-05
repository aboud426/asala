using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class updateUsersTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Provider_Provider_ParentId",
                table: "Provider");

            migrationBuilder.DropForeignKey(
                name: "FK_ProviderCategory_Provider_ProviderId",
                table: "ProviderCategory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Provider",
                table: "Provider");

            migrationBuilder.AlterColumn<string>(
                name: "BusinessName",
                table: "Provider",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Provider",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Provider",
                type: "datetime",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Provider",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Provider",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Provider",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Provider",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Provider",
                type: "datetime",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Employee",
                type: "datetime",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Employee",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Employee",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Employee",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Employee",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Employee",
                type: "datetime",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Provider",
                table: "Provider",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Provider_Localized",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProviderId = table.Column<int>(type: "int", nullable: false),
                    BusinessNameLocalized = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DescriptionLocalized = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Provider_Localized", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Provider_Id",
                table: "Provider",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Provider_IsActive_IsDeleted",
                table: "Provider",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Provider_Localized_IsActive_IsDeleted",
                table: "Provider_Localized",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_Provider_Localized_LanguageId",
                table: "Provider_Localized",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_Provider_Localized_ProviderId",
                table: "Provider_Localized",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_Provider_Localized_ProviderId_LanguageId",
                table: "Provider_Localized",
                columns: new[] { "ProviderId", "LanguageId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Provider_Provider_ParentId",
                table: "Provider",
                column: "ParentId",
                principalTable: "Provider",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProviderCategory_Provider_ProviderId",
                table: "ProviderCategory",
                column: "ProviderId",
                principalTable: "Provider",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Provider_Provider_ParentId",
                table: "Provider");

            migrationBuilder.DropForeignKey(
                name: "FK_ProviderCategory_Provider_ProviderId",
                table: "ProviderCategory");

            migrationBuilder.DropTable(
                name: "Provider_Localized");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Provider",
                table: "Provider");

            migrationBuilder.DropIndex(
                name: "IX_Provider_Id",
                table: "Provider");

            migrationBuilder.DropIndex(
                name: "IX_Provider_IsActive_IsDeleted",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Provider");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Employee");

            migrationBuilder.AlterColumn<string>(
                name: "BusinessName",
                table: "Provider",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Provider",
                table: "Provider",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Provider_Provider_ParentId",
                table: "Provider",
                column: "ParentId",
                principalTable: "Provider",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProviderCategory_Provider_ProviderId",
                table: "ProviderCategory",
                column: "ProviderId",
                principalTable: "Provider",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
