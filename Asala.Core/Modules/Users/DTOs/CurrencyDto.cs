namespace Asala.Core.Modules.Users.DTOs;

public class CurrencyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<CurrencyLocalizedDto> Localizations { get; set; } = [];
}

public class CurrencyLocalizedDto
{
    public int Id { get; set; }
    public int CurrencyId { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Include language info without circular reference
    public LanguageDto? Language { get; set; }
}

public class CreateCurrencyDto
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
    public List<CreateCurrencyLocalizedDto> Localizations { get; set; } = [];
}

public class CreateCurrencyLocalizedDto
{
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
}

public class UpdateCurrencyDto
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
    public bool IsActive { get; set; }
    public List<UpdateCurrencyLocalizedDto> Localizations { get; set; } = [];
}

public class UpdateCurrencyLocalizedDto
{
    public int Id { get; set; }
    public int LanguageId { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
}

public class CurrencyDropdownDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Symbol { get; set; } = null!;
}
