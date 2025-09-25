using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Home;

public class GetHomePageInfoQuery : IRequest<Result<HomePageInfoDto>>
{
    public string LanguageCode { get; set; } = "en";
}

public class HomePageInfoDto
{
    public List<HomePagePostDto> TopPosts { get; set; } = [];
    public List<HomePageProductDto> RecentProducts { get; set; } = [];
}

public class HomePagePostDto
{
    public long PostId { get; set; }
    public string PostImageUrl { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PublisherName { get; set; } = string.Empty;
}

public class HomePageProductDto
{
    public int ProductId { get; set; }
    public string ProductImageUrl { get; set; } = string.Empty;
    public string ProductCategory { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string UserWhoPublishProduct { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
