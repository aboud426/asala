namespace Asala.Core.Modules.Products.DTOs;

public class ProductsPostDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int ProductId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductsPostDto
{
    public int PostId { get; set; }
    public int ProductId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductsPostDto
{
    public int PostId { get; set; }
    public int ProductId { get; set; }
    public bool IsActive { get; set; }
}
