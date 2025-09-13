using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddingPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PostsPages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostsPages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductsPages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductsPages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IncludedPostType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PostsPagesId = table.Column<int>(type: "int", nullable: false),
                    PostTypeId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncludedPostType", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IncludedPostType_PostTypes_PostTypeId",
                        column: x => x.PostTypeId,
                        principalTable: "PostTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IncludedPostType_PostsPages_PostsPagesId",
                        column: x => x.PostsPagesId,
                        principalTable: "PostsPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostsPagesLocalized",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PostsPagesId = table.Column<int>(type: "int", nullable: false),
                    NameLocalized = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DescriptionLocalized = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostsPagesLocalized", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostsPagesLocalized_PostsPages_PostsPagesId",
                        column: x => x.PostsPagesId,
                        principalTable: "PostsPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IncludedProductType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductsPagesId = table.Column<int>(type: "int", nullable: false),
                    ProductCategoryId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncludedProductType", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IncludedProductType_ProductCategory_ProductCategoryId",
                        column: x => x.ProductCategoryId,
                        principalTable: "ProductCategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IncludedProductType_ProductsPages_ProductsPagesId",
                        column: x => x.ProductsPagesId,
                        principalTable: "ProductsPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductsPagesLocalized",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductsPagesId = table.Column<int>(type: "int", nullable: false),
                    NameLocalized = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DescriptionLocalized = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductsPagesLocalized", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductsPagesLocalized_ProductsPages_ProductsPagesId",
                        column: x => x.ProductsPagesId,
                        principalTable: "ProductsPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IncludedPostType_PostsPagesId",
                table: "IncludedPostType",
                column: "PostsPagesId");

            migrationBuilder.CreateIndex(
                name: "IX_IncludedPostType_PostsPagesId_PostTypeId",
                table: "IncludedPostType",
                columns: new[] { "PostsPagesId", "PostTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_IncludedPostType_PostTypeId",
                table: "IncludedPostType",
                column: "PostTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_IncludedProductType_ProductCategoryId",
                table: "IncludedProductType",
                column: "ProductCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_IncludedProductType_ProductsPagesId",
                table: "IncludedProductType",
                column: "ProductsPagesId");

            migrationBuilder.CreateIndex(
                name: "IX_IncludedProductType_ProductsPagesId_ProductCategoryId",
                table: "IncludedProductType",
                columns: new[] { "ProductsPagesId", "ProductCategoryId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostsPagesLocalized_PostsPagesId",
                table: "PostsPagesLocalized",
                column: "PostsPagesId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductsPagesLocalized_ProductsPagesId",
                table: "ProductsPagesLocalized",
                column: "ProductsPagesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IncludedPostType");

            migrationBuilder.DropTable(
                name: "IncludedProductType");

            migrationBuilder.DropTable(
                name: "PostsPagesLocalized");

            migrationBuilder.DropTable(
                name: "ProductsPagesLocalized");

            migrationBuilder.DropTable(
                name: "PostsPages");

            migrationBuilder.DropTable(
                name: "ProductsPages");
        }
    }
}
