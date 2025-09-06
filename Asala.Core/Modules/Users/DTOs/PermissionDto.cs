namespace Asala.Core.Modules.Users.DTOs;

public class PermissionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PermissionLocalizedDto> Localizations { get; set; } = [];
}

public class PermissionLocalizedDto
{
    public int Id { get; set; }
    public int PermissionId { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Include language info without circular reference
    public LanguageDto? Language { get; set; }
}

// public class LanguageDto
// {
//     public int Id { get; set; }
//     public string Code { get; set; } = string.Empty;
//     public string Name { get; set; } = string.Empty;
// }

public class CreatePermissionDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;

    public List<CreatePermissionLocalizedDto> Localizations { get; set; } = [];
}

public class CreatePermissionLocalizedDto
{
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
}

public class UpdatePermissionDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;

    public bool IsActive { get; set; }
    public List<UpdatePermissionLocalizedDto> Localizations { get; set; } = [];
}

public class UpdatePermissionLocalizedDto
{
    public int Id { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
}

public class PermissionDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string Page { get; set; } = string.Empty;
}
