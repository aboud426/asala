namespace Asala.Core.Modules.Users.DTOs;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<RoleLocalizedDto> Localizations { get; set; } = [];
}

public class RoleLocalizedDto
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Include language info without circular reference
    public LanguageDto? Language { get; set; }
}

public class LanguageDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class CreateRoleDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public List<CreateRoleLocalizedDto> Localizations { get; set; } = [];
}

public class CreateRoleLocalizedDto
{
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
}

public class UpdateRoleDto
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<UpdateRoleLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateRoleLocalizedDto
{
    public int Id { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
}

public class RoleDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}
