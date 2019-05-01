using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class FacetService : BaseService, IFacetService
    {
        #region Constant

        private const string FACET_URI = "items?offset=0&limit=0&viewmode=basic&fq={0}&export=true";

        #endregion

        public IEnumerable<FacetViewModel> Get(string facetQuery)
        {
            string uri = string.Format(FACET_URI, facetQuery);
            IEnumerable<FacetViewModel> viewModel = GetItems<FacetViewModel>(uri, "facets");
            return viewModel;
        }
    }
}
