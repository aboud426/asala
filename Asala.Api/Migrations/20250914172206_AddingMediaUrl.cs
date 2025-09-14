using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddingMediaUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Post_Medias_MediaId",
                table: "Post_Medias");

            migrationBuilder.DropIndex(
                name: "IX_Post_Medias_PostId_MediaId",
                table: "Post_Medias");

            migrationBuilder.DropColumn(
                name: "MediaId",
                table: "Post_Medias");

            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "Post_Medias",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ProductsPagesLocalized_LanguageId",
                table: "ProductsPagesLocalized",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_PostsPagesLocalized_LanguageId",
                table: "PostsPagesLocalized",
                column: "LanguageId");

            migrationBuilder.AddForeignKey(
                name: "FK_PostsPagesLocalized_Language_LanguageId",
                table: "PostsPagesLocalized",
                column: "LanguageId",
                principalTable: "Language",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductsPagesLocalized_Language_LanguageId",
                table: "ProductsPagesLocalized",
                column: "LanguageId",
                principalTable: "Language",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostsPagesLocalized_Language_LanguageId",
                table: "PostsPagesLocalized");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductsPagesLocalized_Language_LanguageId",
                table: "ProductsPagesLocalized");

            migrationBuilder.DropIndex(
                name: "IX_ProductsPagesLocalized_LanguageId",
                table: "ProductsPagesLocalized");

            migrationBuilder.DropIndex(
                name: "IX_PostsPagesLocalized_LanguageId",
                table: "PostsPagesLocalized");

            migrationBuilder.DropColumn(
                name: "Url",
                table: "Post_Medias");

            migrationBuilder.AddColumn<int>(
                name: "MediaId",
                table: "Post_Medias",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Post_Medias_MediaId",
                table: "Post_Medias",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_Post_Medias_PostId_MediaId",
                table: "Post_Medias",
                columns: new[] { "PostId", "MediaId" },
                unique: true);
        }
    }
}
