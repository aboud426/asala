namespace Asala.Core.Modules.Products.DTOs;

public class ProductMediaDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int MediaId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductMediaDto
{
    public int ProductId { get; set; }
    public int MediaId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductMediaDto
{
    public int MediaId { get; set; }
    public bool IsActive { get; set; }
}
