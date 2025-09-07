namespace Asala.Core.Modules.Posts.DTOs;

public class PostTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PostTypeLocalizedDto> Localizations { get; set; } = [];
}

public class PostTypeLocalizedDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int LanguageId { get; set; }
    public string LanguageName { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePostTypeDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public List<CreatePostTypeLocalizedDto> Localizations { get; set; } = [];
}

public class CreatePostTypeLocalizedDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdatePostTypeDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<UpdatePostTypeLocalizedDto> Localizations { get; set; } = [];
}

public class UpdatePostTypeLocalizedDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int LanguageId { get; set; }
    public bool IsActive { get; set; }
}

public class PostTypeDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
}
