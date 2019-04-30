using EveryAngle.Core.ViewModels.Item;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IItemService
    {
        IEnumerable<ItemViewModel> Get(string query);
    }
}
