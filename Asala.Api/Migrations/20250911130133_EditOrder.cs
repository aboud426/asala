using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asala.Api.Migrations
{
    /// <inheritdoc />
    public partial class EditOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderActivity_OrderStatus_OrderStatusId",
                table: "OrderActivity");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItemActivity_OrderItemStatus_OrderItemStatusId",
                table: "OrderItemActivity");

            migrationBuilder.DropTable(
                name: "OrderItemStatus");

            migrationBuilder.DropTable(
                name: "OrderStatus");

            migrationBuilder.DropIndex(
                name: "IX_OrderItemActivity_OrderItemStatusId",
                table: "OrderItemActivity");

            migrationBuilder.DropIndex(
                name: "IX_OrderActivity_OrderStatusId",
                table: "OrderActivity");

            migrationBuilder.RenameColumn(
                name: "OrderItemStatusId",
                table: "OrderItemActivity",
                newName: "OrderItemActivityType");

            migrationBuilder.RenameColumn(
                name: "OrderStatusId",
                table: "OrderActivity",
                newName: "OrderActivityType");

            migrationBuilder.AddColumn<DateTime>(
                name: "ActivityDate",
                table: "OrderItemActivity",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ActivityDate",
                table: "OrderActivity",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantity",
                table: "Order_Item",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "CurrencyId",
                table: "Order_Item",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "Order",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentStatus",
                table: "Order",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Order",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Order_Item_CurrencyId",
                table: "Order_Item",
                column: "CurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Item_Currency_CurrencyId",
                table: "Order_Item",
                column: "CurrencyId",
                principalTable: "Currency",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Order_Item_Currency_CurrencyId",
                table: "Order_Item");

            migrationBuilder.DropIndex(
                name: "IX_Order_Item_CurrencyId",
                table: "Order_Item");

            migrationBuilder.DropColumn(
                name: "ActivityDate",
                table: "OrderItemActivity");

            migrationBuilder.DropColumn(
                name: "ActivityDate",
                table: "OrderActivity");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Order_Item");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Order");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Order");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Order");

            migrationBuilder.RenameColumn(
                name: "OrderItemActivityType",
                table: "OrderItemActivity",
                newName: "OrderItemStatusId");

            migrationBuilder.RenameColumn(
                name: "OrderActivityType",
                table: "OrderActivity",
                newName: "OrderStatusId");

            migrationBuilder.AlterColumn<int>(
                name: "Quantity",
                table: "Order_Item",
                type: "int",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.CreateTable(
                name: "OrderItemStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItemStatus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderStatus", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemActivity_OrderItemStatusId",
                table: "OrderItemActivity",
                column: "OrderItemStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderActivity_OrderStatusId",
                table: "OrderActivity",
                column: "OrderStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemStatus_Name",
                table: "OrderItemStatus",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatus_Name",
                table: "OrderStatus",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderActivity_OrderStatus_OrderStatusId",
                table: "OrderActivity",
                column: "OrderStatusId",
                principalTable: "OrderStatus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItemActivity_OrderItemStatus_OrderItemStatusId",
                table: "OrderItemActivity",
                column: "OrderItemStatusId",
                principalTable: "OrderItemStatus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
