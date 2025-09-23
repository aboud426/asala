using System.Security.Cryptography;
using System.Text;
using Asala.Core;

namespace Asala.UseCases.CustomersApp.Identity;

public class SHA256PasswordHasher
{
    public static string Hash(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}

public static class OTPGenerator
{
    public static string GenerateOtpCode()
    {
        var randomNumber = new byte[4];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        var numericCode = (BitConverter.ToUInt32(randomNumber, 0) % 900000) + 100000;
        return numericCode.ToString();
    }
}

public static class OtpVerifier
{
    public static bool VerifyOtpCode(string otpCode, string realOtpCode)
    {
        if (SystemSettings.IsGlobalOtpEnabled)
        {
            return otpCode == SystemSettings.GlobalOtpCode || otpCode == realOtpCode;
        }
        return otpCode == realOtpCode;
    }
}
