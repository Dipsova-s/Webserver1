using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IFacetService
    {
        IEnumerable<FacetViewModel> Get(string facetQuery);
    }
}
