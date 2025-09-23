namespace Asala.Core;

public static class SystemSettings
{
    public static int OtpExpiryMinutes { get; set; } = 10;
    public static int JwtExpiryMinutes { get; set; } = 60 * 24 * 30;
    public static bool IsGlobalOtpEnabled { get; set; } = false;
    public static string GlobalOtpCode { get; set; } = "111111";
    public static int MaxFailedLoginAttemptsInTheLastFiveMinutes { get; set; } = 3;
}
