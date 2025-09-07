using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Shopping.Models;

public class Cart : BaseEntity<int>
{
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public List<CartItem> CartItems { get; set; } = [];
}
