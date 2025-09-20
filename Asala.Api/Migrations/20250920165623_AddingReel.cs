using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddingReel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ReelPostId1",
                table: "BasePosts",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "BasePostId",
                table: "BasePostLocalized",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Reels",
                columns: table => new
                {
                    PostId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reels", x => x.PostId);
                    table.ForeignKey(
                        name: "FK_Reels_BasePosts_PostId",
                        column: x => x.PostId,
                        principalTable: "BasePosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BasePosts_ReelPostId1",
                table: "BasePosts",
                column: "ReelPostId1");

            migrationBuilder.CreateIndex(
                name: "IX_BasePostLocalized_BasePostId",
                table: "BasePostLocalized",
                column: "BasePostId");

            migrationBuilder.AddForeignKey(
                name: "FK_BasePostLocalized_BasePosts_BasePostId",
                table: "BasePostLocalized",
                column: "BasePostId",
                principalTable: "BasePosts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BasePosts_Reels_ReelPostId1",
                table: "BasePosts",
                column: "ReelPostId1",
                principalTable: "Reels",
                principalColumn: "PostId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BasePostLocalized_BasePosts_BasePostId",
                table: "BasePostLocalized");

            migrationBuilder.DropForeignKey(
                name: "FK_BasePosts_Reels_ReelPostId1",
                table: "BasePosts");

            migrationBuilder.DropTable(
                name: "Reels");

            migrationBuilder.DropIndex(
                name: "IX_BasePosts_ReelPostId1",
                table: "BasePosts");

            migrationBuilder.DropIndex(
                name: "IX_BasePostLocalized_BasePostId",
                table: "BasePostLocalized");

            migrationBuilder.DropColumn(
                name: "ReelPostId1",
                table: "BasePosts");

            migrationBuilder.DropColumn(
                name: "BasePostId",
                table: "BasePostLocalized");
        }
    }
}
