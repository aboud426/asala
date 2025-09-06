using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddingCurrencyToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrencyId",
                table: "Product",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Product_CurrencyId",
                table: "Product",
                column: "CurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Currency_CurrencyId",
                table: "Product",
                column: "CurrencyId",
                principalTable: "Currency",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Product_Currency_CurrencyId",
                table: "Product");

            migrationBuilder.DropIndex(
                name: "IX_Product_CurrencyId",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Product");
        }
    }
}
