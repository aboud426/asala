using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class UserLocatio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_User_Location_LocationId",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_User_LocationId",
                table: "User");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "User");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Location",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Location_UserId",
                table: "Location",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Location_User_UserId",
                table: "Location",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Location_User_UserId",
                table: "Location");

            migrationBuilder.DropIndex(
                name: "IX_Location_UserId",
                table: "Location");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Location");

            migrationBuilder.AddColumn<int>(
                name: "LocationId",
                table: "User",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_LocationId",
                table: "User",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Location_LocationId",
                table: "User",
                column: "LocationId",
                principalTable: "Location",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
