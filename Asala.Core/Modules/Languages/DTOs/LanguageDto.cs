namespace Asala.Core.Modules.Languages.DTOs;

public class LanguageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateLanguageDto
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
}

public class UpdateLanguageDto
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public bool IsActive { get; set; }
}

public class LanguageDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
}