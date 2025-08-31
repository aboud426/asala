using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class updateTheCategoryFeilds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LocalizedName",
                table: "Category_Localized",
                newName: "NameLocalized");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "ProviderCategory",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "ProductCategory",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ProductCategory",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DescriptionLocalized",
                table: "Category_Localized",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Category",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Category",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DescriptionLocalized",
                table: "Category_Localized");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Category");

            migrationBuilder.RenameColumn(
                name: "NameLocalized",
                table: "Category_Localized",
                newName: "LocalizedName");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "ProviderCategory",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "ProductCategory",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "ProductCategory",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Category",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");
        }
    }
}
