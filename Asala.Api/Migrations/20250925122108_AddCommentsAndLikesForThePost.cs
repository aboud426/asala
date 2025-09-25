using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentsAndLikesForThePost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumberOfComments",
                table: "Post",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfComments",
                table: "BasePosts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BasePostId = table.Column<long>(type: "bigint", nullable: false),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BasePostId1 = table.Column<long>(type: "bigint", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_BasePosts_BasePostId",
                        column: x => x.BasePostId,
                        principalTable: "BasePosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_BasePosts_BasePostId1",
                        column: x => x.BasePostId1,
                        principalTable: "BasePosts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Comments_Comments_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Comments_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Likes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BasePostId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BasePostId1 = table.Column<long>(type: "bigint", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Likes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Likes_BasePosts_BasePostId",
                        column: x => x.BasePostId,
                        principalTable: "BasePosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Likes_BasePosts_BasePostId1",
                        column: x => x.BasePostId1,
                        principalTable: "BasePosts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Likes_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_BasePostId",
                table: "Comments",
                column: "BasePostId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_BasePostId_CreatedAt",
                table: "Comments",
                columns: new[] { "BasePostId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_BasePostId1",
                table: "Comments",
                column: "BasePostId1");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentId",
                table: "Comments",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                table: "Comments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Likes_BasePostId",
                table: "Likes",
                column: "BasePostId");

            migrationBuilder.CreateIndex(
                name: "IX_Likes_BasePostId_UserId_Unique",
                table: "Likes",
                columns: new[] { "BasePostId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Likes_BasePostId1",
                table: "Likes",
                column: "BasePostId1");

            migrationBuilder.CreateIndex(
                name: "IX_Likes_CreatedAt",
                table: "Likes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Likes_UserId",
                table: "Likes",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "Likes");

            migrationBuilder.DropColumn(
                name: "NumberOfComments",
                table: "Post");

            migrationBuilder.DropColumn(
                name: "NumberOfComments",
                table: "BasePosts");
        }
    }
}
