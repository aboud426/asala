using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class addTheCategoryProviderRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_ProviderCategory_Category_CategoryId",
                table: "ProviderCategory",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProviderCategory_Provider_ProviderId",
                table: "ProviderCategory",
                column: "ProviderId",
                principalTable: "Provider",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProviderCategory_Category_CategoryId",
                table: "ProviderCategory");

            migrationBuilder.DropForeignKey(
                name: "FK_ProviderCategory_Provider_ProviderId",
                table: "ProviderCategory");
        }
    }
}
