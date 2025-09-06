namespace Asala.Core.Modules.Products.DTOs;

public class CreateProductPostDto
{
    public string? PostDescription { get; set; }
    public List<int> ProductIds { get; set; } = new List<int>();
    public List<string> MediaUrls { get; set; } = new List<string>();
}
