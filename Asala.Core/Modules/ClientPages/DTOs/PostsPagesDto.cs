namespace Asala.Core.Modules.ClientPages.DTOs;

public class PostsPagesDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PostsPagesLocalizedDto> Localizations { get; set; } =
        new List<PostsPagesLocalizedDto>();
}

public class CreatePostsPagesDto
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<CreatePostsPagesLocalizedDto> Localizations { get; set; } =
        new List<CreatePostsPagesLocalizedDto>();
}

public class UpdatePostsPagesDto
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<UpdatePostsPagesLocalizedDto> Localizations { get; set; } =
        new List<UpdatePostsPagesLocalizedDto>();
}

public class PostsPagesDropdownDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class PostsPagesLocalizedDto
{
    public int Id { get; set; }
    public int PostsPagesId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePostsPagesLocalizedDto
{
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
}

public class UpdatePostsPagesLocalizedDto
{
    public int? Id { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; }
}
