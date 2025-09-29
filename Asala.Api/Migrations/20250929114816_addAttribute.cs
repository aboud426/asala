using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class addAttribute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverPhotoUrl",
                table: "User",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FollowersCount",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FollowingCount",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfPosts",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Follower",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FollowerId = table.Column<int>(type: "int", nullable: false),
                    FollowingId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Follower", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Follower_User_FollowerId",
                        column: x => x.FollowerId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Follower_User_FollowingId",
                        column: x => x.FollowingId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttribute",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttribute", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeLocalized",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductAttributeId = table.Column<int>(type: "int", nullable: false),
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeLocalized", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeLocalized_Language_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Language",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductAttributeLocalized_ProductAttribute_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalTable: "ProductAttribute",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeValue",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductAttributeId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeValue", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValue_ProductAttribute_ProductAttributeId",
                        column: x => x.ProductAttributeId,
                        principalTable: "ProductAttribute",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeAssignment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ProductAttributeValueId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeAssignment_ProductAttributeValue_ProductAttributeValueId",
                        column: x => x.ProductAttributeValueId,
                        principalTable: "ProductAttributeValue",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductAttributeAssignment_Product_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductAttributeValueLocalized",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductAttributeValueId = table.Column<int>(type: "int", nullable: false),
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAttributeValueLocalized", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValueLocalized_Language_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Language",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductAttributeValueLocalized_ProductAttributeValue_ProductAttributeValueId",
                        column: x => x.ProductAttributeValueId,
                        principalTable: "ProductAttributeValue",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Follower_FollowerId",
                table: "Follower",
                column: "FollowerId");

            migrationBuilder.CreateIndex(
                name: "IX_Follower_FollowerId_FollowingId",
                table: "Follower",
                columns: new[] { "FollowerId", "FollowingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Follower_FollowingId",
                table: "Follower",
                column: "FollowingId");

            migrationBuilder.CreateIndex(
                name: "IX_Follower_Id",
                table: "Follower",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Follower_IsActive_IsDeleted",
                table: "Follower",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttribute_Id",
                table: "ProductAttribute",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttribute_IsActive_IsDeleted",
                table: "ProductAttribute",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttribute_Name",
                table: "ProductAttribute",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeAssignment_Id",
                table: "ProductAttributeAssignment",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeAssignment_IsActive_IsDeleted",
                table: "ProductAttributeAssignment",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeAssignment_ProductAttributeValueId",
                table: "ProductAttributeAssignment",
                column: "ProductAttributeValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeAssignment_ProductId",
                table: "ProductAttributeAssignment",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeAssignment_ProductId_ProductAttributeValueId",
                table: "ProductAttributeAssignment",
                columns: new[] { "ProductId", "ProductAttributeValueId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeLocalized_Id",
                table: "ProductAttributeLocalized",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeLocalized_IsActive_IsDeleted",
                table: "ProductAttributeLocalized",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeLocalized_LanguageId",
                table: "ProductAttributeLocalized",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeLocalized_ProductAttributeId",
                table: "ProductAttributeLocalized",
                column: "ProductAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeLocalized_ProductAttributeId_LanguageId",
                table: "ProductAttributeLocalized",
                columns: new[] { "ProductAttributeId", "LanguageId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValue_Id",
                table: "ProductAttributeValue",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValue_IsActive_IsDeleted",
                table: "ProductAttributeValue",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValue_ProductAttributeId",
                table: "ProductAttributeValue",
                column: "ProductAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValue_ProductAttributeId_Value",
                table: "ProductAttributeValue",
                columns: new[] { "ProductAttributeId", "Value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValue_Value",
                table: "ProductAttributeValue",
                column: "Value");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValueLocalized_Id",
                table: "ProductAttributeValueLocalized",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValueLocalized_IsActive_IsDeleted",
                table: "ProductAttributeValueLocalized",
                columns: new[] { "IsActive", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValueLocalized_LanguageId",
                table: "ProductAttributeValueLocalized",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValueLocalized_ProductAttributeValueId",
                table: "ProductAttributeValueLocalized",
                column: "ProductAttributeValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValueLocalized_ProductAttributeValueId_LanguageId",
                table: "ProductAttributeValueLocalized",
                columns: new[] { "ProductAttributeValueId", "LanguageId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Follower");

            migrationBuilder.DropTable(
                name: "ProductAttributeAssignment");

            migrationBuilder.DropTable(
                name: "ProductAttributeLocalized");

            migrationBuilder.DropTable(
                name: "ProductAttributeValueLocalized");

            migrationBuilder.DropTable(
                name: "ProductAttributeValue");

            migrationBuilder.DropTable(
                name: "ProductAttribute");

            migrationBuilder.DropColumn(
                name: "CoverPhotoUrl",
                table: "User");

            migrationBuilder.DropColumn(
                name: "FollowersCount",
                table: "User");

            migrationBuilder.DropColumn(
                name: "FollowingCount",
                table: "User");

            migrationBuilder.DropColumn(
                name: "NumberOfPosts",
                table: "User");
        }
    }
}
