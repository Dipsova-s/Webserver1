using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Item;
using System.Collections.Generic;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class ItemService : BaseService, IItemService
    {
        #region Constant

        private const string ITEM_URI = "items?{0}";

        #endregion

        public IEnumerable<ItemViewModel> Get(string query)
        {
            string uri = string.Format(ITEM_URI, query);
            IEnumerable<ItemViewModel> viewModel = GetItems<ItemViewModel>(uri, "items");
            return viewModel;
        }
    }
}
